import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendOrderNotification } from '@/lib/whatsapp-notifier';

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json();

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(text)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment successful
      const updatedOrder = await db
        .update(orders)
        .set({
          status: 'confirmed',
          paymentStatus: 'paid',
          razorpayPaymentId: razorpay_payment_id,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(orders.id, orderId))
        .returning();

      const order = updatedOrder[0];

      // Send WhatsApp notification to owner
      if (order) {
        try {
          const items = typeof order.items === 'string' 
            ? JSON.parse(order.items) 
            : order.items;

          await sendOrderNotification(
            '+919363475021', // Owner's WhatsApp number
            {
              orderId: order.id,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              customerEmail: order.customerEmail || undefined,
              address: order.address,
              totalPrice: order.total,
              items: items,
            }
          );
          console.log(`WhatsApp notification sent for order ${orderId}`);
        } catch (whatsappError) {
          console.error('WhatsApp notification failed (non-blocking):', whatsappError);
        }
      }

      return NextResponse.json({ 
        success: true, 
        order: order 
      });
    } else {
      // Payment failed verification
      await db
        .update(orders)
        .set({
          paymentStatus: 'failed',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(orders.id, orderId));

      return NextResponse.json({ success: false, error: 'Signature verification failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
