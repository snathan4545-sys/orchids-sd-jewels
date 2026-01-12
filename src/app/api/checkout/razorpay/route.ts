import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { nanoid } from '@/lib/utils';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images?: string[];
  selectedColor?: string;
  selectedSize?: string;
}

interface RazorpayCheckoutRequest {
  items: CartItem[];
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  address?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RazorpayCheckoutRequest = await request.json();
    const { items, customerEmail, customerName, customerPhone, address } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.03);
    const shipping = subtotal >= 999 ? 0 : 50;
    const total = subtotal + tax + shipping;

    const orderId = `ORD-${nanoid(10)}`;

    // 1. Create Razorpay order first to get the ID
    const options = {
      amount: total * 100, // amount in smallest currency unit (paise for INR)
      currency: 'INR',
      receipt: orderId,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 2. Create database order with Razorpay ID
    await db.insert(orders).values({
      id: orderId,
      customerName: customerName || '',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      address: address || '',
      items: JSON.stringify(items),
      subtotal,
      tax,
      shipping,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      orderId: orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: total * 100,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Razorpay checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
