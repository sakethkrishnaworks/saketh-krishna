// Shared promo-code logic. Imported by BOTH the server (create-order) and the
// client (CartDrawer) so the rules can never drift. The server result is
// authoritative — the client preview only mirrors it.

export interface PromoResult {
  valid: boolean;
  rate: number; // 0..1
  label: string;
}

const PROMO_CODES: Record<string, PromoResult> = {
  SAKETH20: { valid: true, rate: 0.2, label: '20% Off' },
  WELCOME20: { valid: true, rate: 0.2, label: '20% Off' },
  HEALTHY10: { valid: true, rate: 0.1, label: '10% Off' },
};

export function evaluatePromo(code?: string | null): PromoResult {
  if (!code) return { valid: false, rate: 0, label: '' };
  const normalized = code.trim().toUpperCase();
  return PROMO_CODES[normalized] ?? { valid: false, rate: 0, label: '' };
}

// Razorpay expects amounts in the smallest currency unit (paise for INR).
export const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);
export const paiseToRupees = (paise: number): number => Math.round(paise) / 100;

// Razorpay minimum for INR is 100 paise (₹1).
export const MIN_PAISE = 100;

export const CURRENCY = 'INR';
