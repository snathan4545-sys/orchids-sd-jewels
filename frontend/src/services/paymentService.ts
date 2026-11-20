import { API_BASE_URL } from '@/config';

export interface RazorpayOrderData {
  order_id: number;
  razorpay_order_id: string;
  amount: number; // in paise (e.g. 10000 = ₹100.00)
  amount_inr: number;
  currency: string;
  key_id: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  business_name?: string;
  description?: string;
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id?: string;
    };
  };
}

export interface InitiateCheckoutOptions {
  orderId: number;
  onDismiss?: () => void;
  onError?: (error: Error) => void;
  onSuccess?: (verifyData: any) => void;
}

/**
 * Dynamically loads the official Razorpay Checkout SDK script into document.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    // Check if script is already in the document
    const existingScript = document.getElementById('razorpay-checkout-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Creates a Razorpay payment order for an existing internal order.
 */
export const createRazorpayOrder = async (orderId: number): Promise<RazorpayOrderData> => {
  const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ order_id: orderId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create payment order (${response.status})`);
  }

  return await response.json();
};

/**
 * Verifies Razorpay payment signature on backend.
 */
export const verifyRazorpayPayment = async (payload: {
  order_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Payment signature verification failed');
  }

  return data;
};

/**
 * Initiates Razorpay Hosted Checkout popup modal.
 * Opens Razorpay standard checkout supporting UPI (GPay, PhonePe, Paytm, BHIM),
 * Credit/Debit Cards, NetBanking, and Wallets.
 */
export const initiateRazorpayCheckout = async (options: InitiateCheckoutOptions): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('Razorpay checkout can only be initiated in browser environment');
  }

  const { orderId, onDismiss, onError, onSuccess } = options;

  // 1. Ensure Razorpay script is loaded
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    const err = new Error('Razorpay payment gateway script could not be loaded. Please check your internet connection.');
    if (onError) onError(err);
    throw err;
  }

  // 2. Fetch order parameters securely from backend
  const orderData = await createRazorpayOrder(orderId);

  if (!orderData.key_id) {
    const err = new Error('Razorpay is not configured on the server. Please provide RAZORPAY_KEY_ID.');
    if (onError) onError(err);
    throw err;
  }

  if (!orderData.razorpay_order_id) {
    const err = new Error('No Razorpay order ID returned from server.');
    if (onError) onError(err);
    throw err;
  }

  // 3. Configure Razorpay modal options
  const rzpConfig = {
    key: orderData.key_id,
    amount: orderData.amount, // in paise
    currency: orderData.currency || 'INR',
    name: orderData.business_name || 'SD Jewels',
    description: orderData.description || `Order #${orderId}`,
    order_id: orderData.razorpay_order_id,
    image: '/logo.png',
    prefill: {
      name: orderData.customer?.name || '',
      email: orderData.customer?.email || '',
      contact: orderData.customer?.phone || '',
    },
    theme: {
      color: '#ce967e', // SD Jewels rose-gold brand color
    },
    handler: async function (response: RazorpaySuccessResponse) {
      try {
        const verifyData = await verifyRazorpayPayment({
          order_id: orderId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (onSuccess) {
          onSuccess(verifyData);
        } else {
          window.location.href = `/checkout/status?order_id=${orderId}&status=success`;
        }
      } catch (verifyErr: any) {
        console.error('Payment verification error:', verifyErr);
        if (onError) {
          onError(verifyErr);
        } else {
          window.location.href = `/checkout/status?order_id=${orderId}&status=failed&error=${encodeURIComponent(verifyErr.message || 'Signature verification failed')}`;
        }
      }
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) {
          onDismiss();
        }
      },
    },
  };

  const razorpayInstance = new (window as any).Razorpay(rzpConfig);

  razorpayInstance.on('payment.failed', function (failureResponse: RazorpayFailureResponse) {
    const desc = failureResponse?.error?.description || 'Payment was declined or cancelled.';
    console.warn('Razorpay payment failed:', failureResponse);
    if (onError) {
      onError(new Error(desc));
    }
  });

  razorpayInstance.open();
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
