import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { orders, products } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import Stripe from 'stripe';
import { sendOrderNotification } from '@/lib/whatsapp-notifier';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.error('No orderId in session metadata');
          break;
        }

        await db.update(orders)
          .set({
            paymentStatus: 'paid',
            status: 'confirmed',
            stripeSessionId: session.id,
            stripePaymentIntentId: typeof session.payment_intent === 'string' 
              ? session.payment_intent 
              : session.payment_intent?.id || null,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(orders.id, orderId));

        const order = await db.query.orders.findFirst({
          where: eq(orders.id, orderId),
        });

        if (order && order.items) {
          const items = typeof order.items === 'string' 
            ? JSON.parse(order.items) 
            : order.items;
          
          for (const item of items) {
            if (item.id) {
              await db.update(products)
                .set({
                  inStock: sql`MAX(${products.inStock} - ${item.quantity}, 0)`,
                })
                .where(eq(products.id, Number(item.id)));
            }
          }
        }

          console.log(`Order ${orderId} marked as paid`);

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
          break;

      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await db.update(orders)
            .set({
              paymentStatus: 'expired',
              status: 'cancelled',
              updatedAt: new Date().toISOString(),
            })
            .where(eq(orders.id, orderId));

          console.log(`Order ${orderId} expired`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed for intent: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
