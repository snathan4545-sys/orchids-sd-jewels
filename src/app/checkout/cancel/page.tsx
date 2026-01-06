"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function CancelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get('order_id');

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30" />
          </div>
          <XCircle className="relative h-20 w-20 mx-auto text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Your payment was not completed
        </p>
        
        <div className="bg-muted rounded-lg p-6 mb-8">
          <p className="text-sm text-muted-foreground mb-4">
            Don&apos;t worry — your cart items are still saved. You can try again when you&apos;re ready, or continue browsing our collection.
          </p>
          {orderId && (
            <p className="text-xs text-muted-foreground">
              Reference: <span className="font-mono">{orderId}</span>
            </p>
          )}
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your payment information was not charged</span>
          </div>
          <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
            <ShoppingCart className="h-4 w-4" />
            <span>Your cart items are still saved</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => router.push('/cart')}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/products">
            <Button variant="outline" size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    }>
      <CancelContent />
    </Suspense>
  );
}
