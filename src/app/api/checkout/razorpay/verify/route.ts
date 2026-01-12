import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
          updatedAt: new Date().toISOString(),
        })
        .where(eq(orders.id, orderId))
        .returning();

      return NextResponse.json({ 
        success: true, 
        order: updatedOrder[0] 
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
