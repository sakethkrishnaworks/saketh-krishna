import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { CURRENCY, evaluatePromo, MIN_PAISE, rupeesToPaise } from '../../../src/lib/promo';
import { hasServiceRole } from '../../../src/lib/serverAuth';
import { createServerClient } from '../../../src/lib/serverSupabase';

export const runtime = 'nodejs';

interface RequestItem {
  id: string;
  quantity?: number;
}

interface CreateOrderBody {
  items?: RequestItem[];
  promo?: string;
}

interface ResolvedItem {
  id: string;
  title: string;
  image: string | null;
  pdf_url: string | null;
  price: number;
  quantity: number;
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Creates a Razorpay order.
 *
 * The amount is computed SERVER-SIDE from live Supabase prices — the client
 * only sends cookbook ids, a quantity, and (optionally) a promo code. This
 * means a tampered client can never under-pay.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderBody;
    const rawItems = Array.isArray(body.items) ? body.items : [];

    const items = rawItems
      .filter((item) => item && typeof item.id === 'string')
      .map((item) => ({ id: item.id, quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)) }))
      .filter((item) => item.quantity > 0);

    if (items.length === 0) {
      return badRequest('No valid items provided.');
    }

    // ---- Resolve live prices from Supabase (public read is allowed by RLS) ----
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
    }
    const { data: books, error: priceError } = await supabase
      .from('cookbooks')
      .select('id, title, price, image, pdfurl')
      .in(
        'id',
        items.map((item) => item.id)
      );

    if (priceError) {
      console.error('create-order: price lookup failed:', priceError.message);
      return NextResponse.json({ error: 'Failed to look up product prices.' }, { status: 500 });
    }

    const bookMap = new Map((books ?? []).map((book) => [book.id, book]));
    let subtotal = 0;
    const resolved: ResolvedItem[] = [];

    for (const item of items) {
      const book = bookMap.get(item.id);
      if (!book) {
        return badRequest(`"${item.id}" is no longer available.`);
      }

      const price = Number(book.price);
      if (!Number.isFinite(price) || price < 0) {
        return badRequest(`"${item.id}" has an invalid price.`);
      }

      subtotal += price * item.quantity;
      resolved.push({
        id: book.id,
        title: book.title,
        image: book.image ?? null,
        pdf_url: book.pdfurl ?? null,
        price,
        quantity: item.quantity,
      });
    }

    // ---- Apply promo server-side ----
    const promo = evaluatePromo(body.promo);
    const discount = Math.round(subtotal * promo.rate * 100) / 100;
    const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
    const amountPaise = rupeesToPaise(total);

    if (amountPaise < MIN_PAISE) {
      return badRequest('Order amount must be at least ₹1.00.');
    }

    // ---- Create the Razorpay order ----
    // The key ID is public-safe (it is exposed to the browser anyway), so it may
    // be stored under either name. The secret must stay server-only.
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('create-order: Razorpay keys missing.');
      return NextResponse.json({ error: 'Razorpay is not configured.' }, { status: 503 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const receipt = `sk_order_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: CURRENCY,
      receipt,
      notes: {
        cart: JSON.stringify(resolved),
        subtotal: String(subtotal),
        discount: String(discount),
        promo: promo.valid ? body.promo!.toUpperCase() : '',
        total: String(total),
        environment: process.env.NODE_ENV ?? 'development',
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      items: resolved,
      subtotal,
      discount,
      total,
      promo: { valid: promo.valid, rate: promo.rate, label: promo.label },
      server_recorded: false,
      service_role_available: hasServiceRole(),
    });
  } catch (error) {
    const status = (error as { statusCode?: number })?.statusCode;
    const message = error instanceof Error ? error.message : 'Failed to create order.';

    // Razorpay rejects bad credentials with 401.
    if (status === 401) {
      console.error('create-order: Razorpay authentication failed.');
      return NextResponse.json({ error: 'Payment gateway authentication failed.' }, { status: 401 });
    }

    console.error('create-order failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
