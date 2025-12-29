import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, and, gte, lte, like } from 'drizzle-orm';

const VALID_CATEGORIES = ['necklaces', 'earrings', 'bracelets', 'rings', 'impon', 'guarantee-chains'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single product by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const product = await db.select()
        .from(products)
        .where(eq(products.id, parseInt(id)))
        .limit(1);

        if (product.length === 0) {
          return NextResponse.json({ 
            error: 'Product not found',
            code: 'PRODUCT_NOT_FOUND' 
          }, { status: 404 });
        }

        // Parse colors and sizes if they are strings
        const productData = product[0];
        if (typeof productData.colors === 'string') {
          try {
            productData.colors = JSON.parse(productData.colors);
          } catch {
            productData.colors = null;
          }
        }
        if (typeof productData.sizes === 'string') {
          try {
            productData.sizes = JSON.parse(productData.sizes);
          } catch {
            productData.sizes = null;
          }
        }

        return NextResponse.json(productData, { status: 200 });
    }

    // List with filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const inStock = searchParams.get('inStock');

    const conditions = [];

    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return NextResponse.json({ 
          error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
          code: 'INVALID_CATEGORY' 
        }, { status: 400 });
      }
      conditions.push(eq(products.category, category));
    }

    if (featured !== null && featured !== undefined) {
      const featuredBool = featured === 'true';
      conditions.push(eq(products.featured, featuredBool));
    }

    if (inStock !== null && inStock !== undefined) {
      const inStockBool = inStock === 'true';
      conditions.push(eq(products.inStock, inStockBool));
    }

    if (priceMin) {
      const minPrice = parseInt(priceMin);
      if (!isNaN(minPrice)) {
        conditions.push(gte(products.price, minPrice));
      }
    }

    if (priceMax) {
      const maxPrice = parseInt(priceMax);
      if (!isNaN(maxPrice)) {
        conditions.push(lte(products.price, maxPrice));
      }
    }

    let query = db.select().from(products);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

      const results = await query.limit(limit).offset(offset);

      // Parse colors and sizes for all products
      const parsedResults = results.map(product => {
        const productData = { ...product };
        if (typeof productData.colors === 'string') {
          try {
            productData.colors = JSON.parse(productData.colors);
          } catch {
            productData.colors = null;
          }
        }
        if (typeof productData.sizes === 'string') {
          try {
            productData.sizes = JSON.parse(productData.sizes);
          } catch {
            productData.sizes = null;
          }
        }
        return productData;
      });

      return NextResponse.json(parsedResults, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json({ 
        error: "Name is required and must be a non-empty string",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!body.description || typeof body.description !== 'string' || body.description.trim() === '') {
      return NextResponse.json({ 
        error: "Description is required and must be a non-empty string",
        code: "MISSING_DESCRIPTION" 
      }, { status: 400 });
    }

    if (!body.price || typeof body.price !== 'number' || body.price <= 0) {
      return NextResponse.json({ 
        error: "Price is required and must be a positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    if (body.originalPrice !== undefined && body.originalPrice !== null) {
      if (typeof body.originalPrice !== 'number' || body.originalPrice <= 0) {
        return NextResponse.json({ 
          error: "Original price must be a positive number",
          code: "INVALID_ORIGINAL_PRICE" 
        }, { status: 400 });
      }
    }

    if (!body.category || !VALID_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ 
        error: `Category is required and must be one of: ${VALID_CATEGORIES.join(', ')}`,
        code: "INVALID_CATEGORY" 
      }, { status: 400 });
    }

    if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json({ 
        error: "Images is required and must be a non-empty array",
        code: "MISSING_IMAGES" 
      }, { status: 400 });
    }

    if (body.colors !== undefined && body.colors !== null && !Array.isArray(body.colors)) {
      return NextResponse.json({ 
        error: "Colors must be an array",
        code: "INVALID_COLORS" 
      }, { status: 400 });
    }

    if (body.sizes !== undefined && body.sizes !== null && !Array.isArray(body.sizes)) {
      return NextResponse.json({ 
        error: "Sizes must be an array",
        code: "INVALID_SIZES" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    
    const newProduct = await db.insert(products)
      .values({
        name: body.name.trim(),
        description: body.description.trim(),
        price: body.price,
        originalPrice: body.originalPrice ?? null,
        category: body.category,
        images: body.images,
        colors: body.colors ?? null,
        sizes: body.sizes ?? null,
        inStock: body.inStock !== undefined ? body.inStock : true,
        featured: body.featured !== undefined ? body.featured : false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();

    // Check if product exists
    const existing = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND' 
      }, { status: 404 });
    }

    // Validate provided fields
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return NextResponse.json({ 
          error: "Name must be a non-empty string",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string' || body.description.trim() === '') {
        return NextResponse.json({ 
          error: "Description must be a non-empty string",
          code: "INVALID_DESCRIPTION" 
        }, { status: 400 });
      }
    }

    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || body.price <= 0) {
        return NextResponse.json({ 
          error: "Price must be a positive number",
          code: "INVALID_PRICE" 
        }, { status: 400 });
      }
    }

    if (body.originalPrice !== undefined && body.originalPrice !== null) {
      if (typeof body.originalPrice !== 'number' || body.originalPrice <= 0) {
        return NextResponse.json({ 
          error: "Original price must be a positive number",
          code: "INVALID_ORIGINAL_PRICE" 
        }, { status: 400 });
      }
    }

    if (body.category !== undefined) {
      if (!VALID_CATEGORIES.includes(body.category)) {
        return NextResponse.json({ 
          error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
          code: "INVALID_CATEGORY" 
        }, { status: 400 });
      }
    }

    if (body.images !== undefined) {
      if (!Array.isArray(body.images) || body.images.length === 0) {
        return NextResponse.json({ 
          error: "Images must be a non-empty array",
          code: "INVALID_IMAGES" 
        }, { status: 400 });
      }
    }

    if (body.colors !== undefined && body.colors !== null && !Array.isArray(body.colors)) {
      return NextResponse.json({ 
        error: "Colors must be an array",
        code: "INVALID_COLORS" 
      }, { status: 400 });
    }

    if (body.sizes !== undefined && body.sizes !== null && !Array.isArray(body.sizes)) {
      return NextResponse.json({ 
        error: "Sizes must be an array",
        code: "INVALID_SIZES" 
      }, { status: 400 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.description !== undefined) updates.description = body.description.trim();
    if (body.price !== undefined) updates.price = body.price;
    if (body.originalPrice !== undefined) updates.originalPrice = body.originalPrice;
    if (body.category !== undefined) updates.category = body.category;
    if (body.images !== undefined) updates.images = body.images;
    if (body.colors !== undefined) updates.colors = body.colors;
    if (body.sizes !== undefined) updates.sizes = body.sizes;
    if (body.inStock !== undefined) updates.inStock = body.inStock;
    if (body.featured !== undefined) updates.featured = body.featured;

    const updated = await db.update(products)
      .set(updates)
      .where(eq(products.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if product exists
    const existing = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: "Product deleted successfully",
      product: deleted[0] 
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}