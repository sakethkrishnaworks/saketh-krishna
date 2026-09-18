import { Cookbook, EventSession, PurchaseRecord } from '../types';

/**
 * Supabase columns are lower-case (e.g. `pdfurl`, `tagcolor`, `pdf_url`).
 * This is the single place that maps a raw row onto the app's camelCase
 * types, so the fetch path and the realtime path can never drift apart.
 */

type RawRow = Record<string, any>;

function getString(row: RawRow, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

function getNumber(row: RawRow, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

export function normalizeCookbook(row: RawRow): Cookbook {
  return {
    ...(row as Cookbook),
    pdfUrl: getString(row, 'pdfUrl', 'pdfurl', 'pdf_url'),
    oldPrice: getNumber(row, 'oldPrice', 'oldprice', 'old_price'),
  } as Cookbook;
}

export function normalizeEvent(row: RawRow): EventSession {
  return row as EventSession;
}

export function normalizePurchase(row: RawRow): PurchaseRecord {
  return {
    id: String(row.id),
    user_id: typeof row.user_id === 'string' ? row.user_id : undefined,
    cookbook_id: typeof row.cookbook_id === 'string' ? row.cookbook_id : null,
    product_kind: typeof row.product_kind === 'string' ? row.product_kind : 'cookbook',
    product_id: typeof row.product_id === 'string' ? row.product_id : null,
    title: String(row.title ?? ''),
    image: (row.image as string | null) ?? null,
    pdf_url: (row.pdf_url as string | null) ?? null,
    price: getNumber(row, 'price'),
    quantity: typeof row.quantity === 'number' ? row.quantity : 1,
    amount_paid: getNumber(row, 'amount_paid', 'amountPaid'),
    currency: typeof row.currency === 'string' ? row.currency : 'INR',
    razorpay_order_id: (row.razorpay_order_id as string | null) ?? null,
    razorpay_payment_id: (row.razorpay_payment_id as string | null) ?? null,
    status: typeof row.status === 'string' ? row.status : 'paid',
    purchased_at: typeof row.purchased_at === 'string' ? row.purchased_at : new Date().toISOString(),
  };
}
