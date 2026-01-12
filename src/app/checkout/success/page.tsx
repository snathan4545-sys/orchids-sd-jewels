"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!sessionId || !orderId) {
      router.push('/');
      return;
    }
    setLoading(false);
  }, [sessionId, orderId, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Confirming your payment...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 animate-pulse" />
          </div>
          <CheckCircle2 className="relative h-20 w-20 mx-auto text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Thank you for your purchase
        </p>
        
        <div className="bg-muted rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-medium">Order Confirmed</span>
          </div>
          {orderId && (
            <p className="text-sm text-muted-foreground mb-2">
              Order ID: <span className="font-mono font-semibold text-foreground">{orderId}</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            We&apos;ll send you an update when your order ships. You can also check your order status anytime.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Payment confirmed and processed</span>
          </div>
          <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Order details sent to your email</span>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/products">
            <Button size="lg" className="gap-2">
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
