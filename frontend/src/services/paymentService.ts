import { API_BASE_URL } from '@/config';

declare global {
  interface Window {
    Cashfree: any;
  }
}

let cashfreeSdkPromise: Promise<any> | null = null;

/**
 * Dynamically loads the Cashfree JS SDK script (v3)
 */
export const loadCashfreeSDK = (): Promise<any> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cashfree SDK can only be loaded in browser environment'));
  }

  if (window.Cashfree) {
    return Promise.resolve(window.Cashfree);
  }

  if (cashfreeSdkPromise) {
    return cashfreeSdkPromise;
  }

  cashfreeSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
      } else {
        reject(new Error('Cashfree SDK loaded but Cashfree object not found on window.'));
      }
    };
    script.onerror = () => {
      cashfreeSdkPromise = null;
      reject(new Error('Failed to load Cashfree Payment SDK from CDN.'));
    };
    document.body.appendChild(script);
  });

  return cashfreeSdkPromise;
};

export interface CreatePaymentOrderResponse {
  payment_session_id: string;
  cashfree_order_id: string;
  order_id: number;
  environment: 'SANDBOX' | 'PRODUCTION';
}

/**
 * Creates a Cashfree payment order on the backend and initiates Cashfree Web Checkout.
 */
export const initiateCashfreeCheckout = async (orderId: number): Promise<void> => {
  // Step 1: Create payment order on backend (never trust frontend amount)
  const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ order_id: orderId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Payment order creation failed (${response.status})`);
  }

  const data: CreatePaymentOrderResponse = await response.json();

  if (!data.payment_session_id) {
    throw new Error('Invalid response from payment server: missing payment_session_id');
  }

  // Step 2: Load Cashfree SDK
  const Cashfree = await loadCashfreeSDK();

  // Step 3: Initialize Cashfree JS instance based on environment mode
  const mode = data.environment === 'PRODUCTION' ? 'production' : 'sandbox';
  const cashfree = Cashfree({ mode });

  // Step 4: Launch Web Checkout
  cashfree.checkout({
    paymentSessionId: data.payment_session_id,
    redirectTarget: '_self', // Redirects user back to return_url upon completion
  });
};

/**
 * Checks backend payment status for a specific internal order ID.
 */
export const getPaymentStatus = async (orderId: number | string) => {
  const response = await fetch(`${API_BASE_URL}/payments/${orderId}/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch payment status from backend');
  }
  return await response.json();
};
