"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { ensureArray } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    email: '',
    address: '',
  });

  const tax = Math.round(cartTotal * 0.18);
  const shipping = cartTotal >= 999 ? 0 : 50;
  const grandTotal = cartTotal + tax + shipping;

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add items to your cart before checking out
          </p>
          <Link href="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    if (!/^\+?[1-9]\d{9,14}$/.test(formData.customerPhone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          email: formData.email,
          address: formData.address,
          items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrderId(data.orderId);
        setOrderPlaced(true);
        clearCart();
        toast.success('Order placed successfully!', {
          description: 'You will receive a confirmation on WhatsApp shortly.',
        });
      } else {
        throw new Error(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <CheckCircle2 className="h-20 w-20 mx-auto text-green-600 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Order ID: <span className="font-semibold text-foreground">{orderId}</span>
          </p>
          
          <div className="bg-muted rounded-lg p-6 mb-6">
            <p className="text-sm mb-2">
              Thank you for your order! We've sent the order details to our WhatsApp.
            </p>
            <p className="text-sm text-muted-foreground">
              We will contact you shortly at <span className="font-medium text-foreground">{formData.customerPhone}</span> to confirm your order and arrange delivery.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/products">
              <Button size="lg" variant="outline">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cart
      </Button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Enter your full name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="+91 98944 64215"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We'll contact you on this number to confirm your order
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="address">Delivery Address *</Label>
                <textarea
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your complete delivery address"
                  className="w-full mt-2 min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cart.map((item) => {
                const images = ensureArray<string>(item.images);
                return (
                  <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                      <Image
                        src={images[0] || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      {item.selectedColor && (
                        <p className="text-xs text-muted-foreground">Color: {item.selectedColor}</p>
                      )}
                      {item.selectedSize && (
                        <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (18%)</span>
                <span className="font-medium">₹{tax}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-green-600">
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between mb-6">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold">₹{grandTotal}</span>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cash on Delivery available</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>7-day return policy</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>100% secure checkout</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
