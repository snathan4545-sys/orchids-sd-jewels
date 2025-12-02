import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_CATEGORIES = ['necklaces', 'earrings', 'bracelets', 'rings', 'impon', 'guarantee-chains'];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const product = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { 
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(product[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { 
          error: "Invalid JSON in request body",
          code: "INVALID_JSON" 
        },
        { status: 400 }
      );
    }

    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { 
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const updates: Record<string, any> = {};

    if (body.name !== undefined) {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (!name) {
        return NextResponse.json(
          { 
            error: "Name must be a non-empty string",
            code: "INVALID_NAME" 
          },
          { status: 400 }
        );
      }
      updates.name = name;
    }

    if (body.description !== undefined) {
      const description = typeof body.description === 'string' ? body.description.trim() : '';
      if (!description) {
        return NextResponse.json(
          { 
            error: "Description must be a non-empty string",
            code: "INVALID_DESCRIPTION" 
          },
          { status: 400 }
        );
      }
      updates.description = description;
    }

    if (body.price !== undefined) {
      const price = typeof body.price === 'number' ? body.price : parseInt(body.price);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          { 
            error: "Price must be a positive integer",
            code: "INVALID_PRICE" 
          },
          { status: 400 }
        );
      }
      updates.price = price;
    }

    if (body.originalPrice !== undefined) {
      if (body.originalPrice !== null) {
        const originalPrice = typeof body.originalPrice === 'number' ? body.originalPrice : parseInt(body.originalPrice);
        if (isNaN(originalPrice) || originalPrice <= 0) {
          return NextResponse.json(
            { 
              error: "Original price must be a positive integer",
              code: "INVALID_ORIGINAL_PRICE" 
            },
            { status: 400 }
          );
        }
        updates.originalPrice = originalPrice;
      } else {
        updates.originalPrice = null;
      }
    }

    if (body.category !== undefined) {
      const category = typeof body.category === 'string' ? body.category.trim().toLowerCase() : '';
      if (!VALID_CATEGORIES.includes(category)) {
        return NextResponse.json(
          { 
            error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
            code: "INVALID_CATEGORY" 
          },
          { status: 400 }
        );
      }
      updates.category = category;
    }

    if (body.images !== undefined) {
      if (!Array.isArray(body.images) || body.images.length === 0) {
        return NextResponse.json(
          { 
            error: "Images must be a non-empty array",
            code: "INVALID_IMAGES" 
          },
          { status: 400 }
        );
      }
      updates.images = body.images;
    }

    if (body.colors !== undefined) {
      if (body.colors !== null && !Array.isArray(body.colors)) {
        return NextResponse.json(
          { 
            error: "Colors must be an array or null",
            code: "INVALID_COLORS" 
          },
          { status: 400 }
        );
      }
      updates.colors = body.colors;
    }

    if (body.sizes !== undefined) {
      if (body.sizes !== null && !Array.isArray(body.sizes)) {
        return NextResponse.json(
          { 
            error: "Sizes must be an array or null",
            code: "INVALID_SIZES" 
          },
          { status: 400 }
        );
      }
      updates.sizes = body.sizes;
    }

    if (body.inStock !== undefined) {
      updates.inStock = Boolean(body.inStock);
    }

    if (body.featured !== undefined) {
      updates.featured = Boolean(body.featured);
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db.update(products)
      .set(updates)
      .where(eq(products.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { 
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const deleted = await db.delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: "Product deleted successfully",
        product: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}