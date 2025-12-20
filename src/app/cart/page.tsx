"use client";

import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { ensureArray } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  const handlePlaceOrder = () => {
    // Calculate totals
    const shipping = 55;
    const total = cartTotal + shipping;

    // Format order details for WhatsApp
    let message = `*New Order Request*\n\n`;
    message += `*Order Details:*\n`;
    
    cart.forEach((item, index) => {
      message += `\n${index + 1}. *${item.name}*\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: ₹${item.price} each\n`;
      if (item.selectedColor) message += `   Color: ${item.selectedColor}\n`;
      if (item.selectedSize) message += `   Size: ${item.selectedSize}\n`;
      message += `   Subtotal: ₹${item.price * item.quantity}\n`;
    });

    message += `\n─────────────────\n`;
    message += `*Subtotal:* ₹${cartTotal}\n`;
    message += `*Shipping:* ₹${shipping}\n`;
    message += `*Total Amount:* ₹${total}\n`;
    message += `\nPlease confirm this order.`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp number (India country code + number)
    const whatsappNumber = '919894464215';
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Clear cart
    clearCart();
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Redirect to products page
    router.push('/products');
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto p-8 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet
          </p>
          <Link href="/products">
            <Button size="lg" className="gap-2">
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const images = ensureArray<string>(item.images);
              return (
                <Card key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted shrink-0">
                      <Image
                        src={images[0] || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>


                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.id}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                        {item.selectedColor && (
                          <span>Color: {item.selectedColor}</span>
                        )}
                        {item.selectedSize && (
                          <span>Size: {item.selectedSize}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold">₹{item.price * item.quantity}</p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <Button
            variant="outline"
            className="w-full"
            onClick={clearCart}
          >
            Clear Cart
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">₹55</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between mb-6">
              <span className="text-lg font-bold">Total</span>
              <span className="text-lg font-bold">
                ₹{cartTotal + 55}
              </span>
            </div>

            <Button 
              size="lg" 
              className="w-full mb-3 gap-2"
              onClick={handlePlaceOrder}
            >
              Place Order via WhatsApp <ArrowRight className="h-4 w-4" />
            </Button>

            <Link href="/products">
              <Button variant="outline" size="lg" className="w-full">
                Continue Shopping
              </Button>
            </Link>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure via WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>7-day return policy</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}