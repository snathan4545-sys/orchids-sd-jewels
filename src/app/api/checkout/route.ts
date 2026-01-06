import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
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

interface CheckoutRequest {
  items: CartItem[];
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  address?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { items, customerEmail, customerName, customerPhone, address } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal >= 999 ? 0 : 50;
    const total = subtotal + tax + shipping;

    const orderId = `ORD-${nanoid(10)}`;

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name,
          images: item.images?.filter(Boolean).slice(0, 8) || [],
          metadata: {
            productId: item.id,
            selectedColor: item.selectedColor || '',
            selectedSize: item.selectedSize || '',
          },
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Tax (18% GST)',
            images: [],
            metadata: {},
          },
          unit_amount: tax * 100,
        },
        quantity: 1,
      });
    }

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Shipping',
            images: [],
            metadata: {},
          },
          unit_amount: shipping * 100,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: customerEmail || undefined,
      metadata: {
        orderId,
      },
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${origin}/checkout/cancel?order_id=${orderId}`,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      orderId,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
