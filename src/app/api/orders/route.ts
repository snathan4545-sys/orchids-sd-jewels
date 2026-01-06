import { NextRequest, NextResponse } from 'next/server';
import { sendOrderNotification } from '@/lib/whatsapp-notifier';
import { db } from '@/db';
import { products } from '@/db/schema';
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
    const total = orderData.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const tax = Math.round(total * 0.03);
    const shipping = total >= 999 ? 0 : 50;
    const grandTotal = total + tax + shipping;

    // Update product quantities
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
      return NextResponse.json(
        { error: 'Failed to update inventory' },
        { status: 500 }
      );
    }

      // Send WhatsApp notification to business number
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
        // Don't fail the order if WhatsApp fails
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
