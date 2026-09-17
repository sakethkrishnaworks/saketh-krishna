// Minimal typing for the Razorpay Standard Checkout script loaded in
// app/layout.tsx (https://checkout.razorpay.com/v1/checkout.js).

export interface RazorpayPaymentSuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayPaymentFailure {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: Record<string, unknown>;
  };
}

interface RazorpayHandler {
  (response: RazorpayPaymentSuccess): void;
}

interface RazorpayOptions {
  key: string;
  amount: number; // paise
  currency: string;
  order_id: string;
  name?: string;
  description?: string;
  image?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: RazorpayHandler;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

export interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', handler: (resp: RazorpayPaymentFailure) => void): void;
}

interface RazorpayStatic {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayStatic;
  }
}
