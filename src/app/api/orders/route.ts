import { NextRequest, NextResponse } from 'next/server';
import { sendOrderNotification } from '@/lib/whatsapp-notifier';
import { db } from '@/db';
import { products, orders } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Validate required fields
    if (!orderData.customerName || !orderData.customerPhone || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = `ORD-${Date.now()}`;

    // Calculate total
    const subtotal = orderData.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const tax = Math.round(subtotal * 0.03); // 3% GST as per other routes
    const shipping = subtotal >= 999 ? 0 : 50;
    const grandTotal = subtotal + tax + shipping;

    // 1. Create order in database
    try {
      await db.insert(orders).values({
        id: orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail || '',
        customerPhone: orderData.customerPhone,
        address: orderData.address || 'Cash on Delivery / Direct Order',
        items: JSON.stringify(orderData.items),
        subtotal,
        tax,
        shipping,
        total: grandTotal,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (dbError) {
      console.error('Failed to create order in database:', dbError);
      return NextResponse.json(
        { error: 'Failed to save order' },
        { status: 500 }
      );
    }

    // 2. Update product quantities
    try {
      for (const item of orderData.items) {
        await db.update(products)
          .set({
            inStock: sql`${products.inStock} - ${item.quantity}`
          })
          .where(eq(products.id, item.id));
      }
    } catch (dbError) {
      console.error('Failed to update product quantities:', dbError);
      // Non-blocking for the user, but we should log it
    }

    // 3. Send WhatsApp notification
    try {
      await sendOrderNotification(
        '+919363475021', // Your WhatsApp number
        {
          orderId,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          totalPrice: grandTotal,
          items: orderData.items,
        }
      );
    } catch (whatsappError) {
      console.error('WhatsApp notification failed (non-blocking):', whatsappError);
    }

    return NextResponse.json({
      success: true,
      orderId,
      total: grandTotal,
    });
  } catch (error) {
    console.error('Order processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
