"use client";

import { useState, useEffect } from 'react';
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
import { authClient } from '@/lib/auth-client';
import { ReturnPolicyDialog } from '@/components/ReturnPolicyDialog';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { data: session } = authClient.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'online'>('online');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        customerName: session.user.name || prev.customerName,
        customerPhone: (session.user as any).phoneNumber || prev.customerPhone,
        email: session.user.email || prev.email,
      }));
    }
  }, [session]);


    useEffect(() => {
      if (cart.length > 0 && !orderPlaced) {
        setShowReturnPolicy(true);
      }
    }, [cart.length, orderPlaced]);

    const tax = Math.round(cartTotal * 0.03);
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
          // Handle Razorpay Checkout
          const response = await fetch('/api/checkout/razorpay', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              items: cart,
              customerEmail: formData.email,
              customerName: formData.customerName,
              customerPhone: formData.customerPhone,
              address: formData.address,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to create checkout order');
          }

          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: data.amount,
            currency: data.currency,
            name: 'SD Trends',
            description: 'Purchase from SD Trends',
            order_id: data.razorpayOrderId,
            handler: async function (response: any) {
              try {
                const verifyRes = await fetch('/api/checkout/razorpay/verify', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    orderId: data.orderId,
                  }),
                });

                const verifyData = await verifyRes.json();

                  if (verifyData.success) {
                    setOrderId(data.orderId);
                    setOrderPlaced(true);
                    clearCart();
                    toast.success('Payment successful! Order placed.');

                    // Prepare WhatsApp message
                    const adminPhone = '919894464215';
                    const itemsText = cart.map(item => `• ${item.name} x${item.quantity}`).join('%0A');
                    const message = `🎉 *New Order Received!*%0A%0A*Order ID:* ${data.orderId}%0A*Customer:* ${formData.customerName}%0A*Phone:* ${formData.customerPhone}%0A%0A*Address:*%0A${encodeURIComponent(formData.address)}%0A%0A*Items:*%0A${itemsText}%0A%0A*Total:* ₹${grandTotal}%0A%0A---%0ASD Trends`;
                    
                    const whatsappUrl = `https://wa.me/${adminPhone}?text=${message}`;
                    
                    // Store URL for manual button if needed
                    (window as any).whatsappUrl = whatsappUrl;
                    
                    // Open WhatsApp automatically
                    window.open(whatsappUrl, '_blank');
                  } else {
                  toast.error('Payment verification failed');
                }
              } catch (err) {
                console.error('Verification error:', err);
                toast.error('Failed to verify payment');
              }
            },
            prefill: {
              name: formData.customerName,
              email: formData.email,
              contact: formData.customerPhone,
            },
            theme: {
              color: '#000000',
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } catch (error) {

        console.error('Order error:', error);
        toast.error('Failed to process order', {
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
              <p className="text-sm mb-4">
                Thank you for your order! Please share your order details with us on WhatsApp to ensure faster processing.
              </p>
              <Button 
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
                onClick={() => {
                  const url = (window as any).whatsappUrl || `https://wa.me/919894464215?text=${encodeURIComponent(`Order ${orderId} placed successfully.`)}`;
                  window.open(url, '_blank');
                }}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .01 5.437.01 12.045c0 2.112.553 4.174 1.602 6.006L0 24l6.149-1.613a11.77 11.77 0 005.9 1.594h.005c6.605 0 12.04-5.437 12.04-12.045a11.811 11.811 0 00-3.492-8.517z"/>
                </svg>
                Send Order to WhatsApp
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
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
      <>
        <ReturnPolicyDialog open={showReturnPolicy} onOpenChange={setShowReturnPolicy} />
        
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

                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-medium">Payment Method</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div
                        className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-primary bg-primary/5 transition-all"
                      >
                          <div className="flex gap-2 mb-3">
                            <span className="text-sm font-bold px-2 py-0.5 rounded bg-blue-600 text-white">UPI ID</span>
                            <span className="text-sm font-bold px-2 py-0.5 rounded bg-green-600 text-white">GPay</span>
                            <span className="text-sm font-bold px-2 py-0.5 rounded bg-purple-600 text-white">PhonePe</span>
                          </div>
                            <span className="font-semibold text-base">Online Payment</span>
                            <span className="text-sm text-muted-foreground text-center mt-2">
                              Securely pay with UPI ID, GPay, PhonePe or Cards
                            </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                        Redirecting to Payment...
                      </>
                    ) : (
                      'Pay Now & Place Order'
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
                  <span className="text-muted-foreground">Tax (3%)</span>
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
                  <span>Online Payment only</span>
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
    </>
  );
}
