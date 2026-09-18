import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { CURRENCY, evaluatePromo, MIN_PAISE, rupeesToPaise } from '../../../src/lib/promo';
import { createServerClient } from '../../../src/lib/serverSupabase';

export const runtime = 'nodejs';

interface RequestItem {
  id: string;
  kind?: string;
  quantity?: number;
}

interface CreateOrderBody {
  items?: RequestItem[];
  promo?: string;
}

const KIND_TABLES: Record<string, string> = {
  cookbook: 'cookbooks',
  diet: 'dietplans',
  coaching: 'coaching_plans',
  consultation: 'consultations',
  course: 'courses',
};

interface ResolvedItem {
  id: string;
  kind: string;
  title: string;
  image: string | null;
  pdf_url: string | null;
  price: number;
  quantity: number;
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(true);
    if (!supabase) {
      return NextResponse.json({ error: 'Checkout is temporarily unavailable.' }, { status: 503 });
    }

    const token = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
    if (!token) {
      return NextResponse.json({ error: 'Please sign in before checkout.' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      return NextResponse.json({ error: 'Please sign in again before checkout.' }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as CreateOrderBody | null;
    if (!body || !Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
      return badRequest('No valid cart provided.');
    }
    if (body.promo !== undefined && typeof body.promo !== 'string') {
      return badRequest('Invalid promo code.');
    }

    const items: Array<{ id: string; kind: string; quantity: number }> = [];
    const seen = new Set<string>();
    for (const item of body.items) {
      const quantity = item?.quantity ?? 1;
      const kind = typeof item?.kind === 'string' ? item.kind : 'cookbook';
      if (
        !item || typeof item.id !== 'string' || !item.id.trim() || item.id.length > 200 ||
        !KIND_TABLES[kind] || seen.has(`${kind}:${item.id}`) ||
        !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100
      ) {
        return badRequest('Invalid cart item or quantity.');
      }
      seen.add(`${kind}:${item.id}`);
      items.push({ id: item.id, kind, quantity });
    }

    const rowsByKind = new Map<string, Map<string, { id: string; title: string; price: unknown; image: unknown; pdfurl?: unknown }>>();
    for (const item of items) {
      if (rowsByKind.has(item.kind)) continue;
      const { data: rows, error: priceError } = await supabase
        .from(KIND_TABLES[item.kind])
        .select('id, title, price, image, pdfurl')
        .in('id', items.filter((entry) => entry.kind === item.kind).map((entry) => entry.id));

      if (priceError) {
        return NextResponse.json({ error: 'Failed to look up product prices.' }, { status: 500 });
      }
      rowsByKind.set(item.kind, new Map((rows ?? []).map((row) => [row.id, row])));
    }

    let subtotal = 0;
    const resolved: ResolvedItem[] = [];

    for (const item of items) {
      const row = rowsByKind.get(item.kind)?.get(item.id);
      if (!row) {
        return badRequest('A product in your cart is no longer available.');
      }

      const price = Number(row.price);
      if (!Number.isFinite(price) || price < 0 || typeof row.title !== 'string' || !row.title.trim()) {
        return badRequest('A product has invalid details.');
      }

      subtotal += price * item.quantity;
      resolved.push({
        id: row.id,
        kind: item.kind,
        title: row.title,
        image: typeof row.image === 'string' ? row.image : null,
        pdf_url: typeof row.pdfurl === 'string' ? row.pdfurl : null,
        price,
        quantity: item.quantity,
      });
    }

    const promo = evaluatePromo(body.promo);
    const discount = Math.round(subtotal * promo.rate * 100) / 100;
    const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
    const amountPaise = rupeesToPaise(total);

    if (!Number.isSafeInteger(amountPaise) || amountPaise < MIN_PAISE) {
      return badRequest('Order amount must be valid and at least ₹1.00.');
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Checkout is temporarily unavailable.' }, { status: 503 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const receipt = `sk_order_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: CURRENCY,
      receipt,
      notes: {
        user_id: userData.user.id,
        cart: JSON.stringify(resolved),
        subtotal: String(subtotal),
        discount: String(discount),
        promo: promo.valid ? body.promo!.trim().toUpperCase() : '',
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
      service_role_available: true,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Failed to create order. Please try again.' }, { status: 500 });
  }
}
