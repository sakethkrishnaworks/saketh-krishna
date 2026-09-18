import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { CURRENCY, evaluatePromo, MIN_PAISE, rupeesToPaise } from '../../../src/lib/promo';
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

    const items: Array<{ id: string; quantity: number }> = [];
    const seen = new Set<string>();
    for (const item of body.items) {
      const quantity = item?.quantity ?? 1;
      if (
        !item || typeof item.id !== 'string' || !item.id.trim() || item.id.length > 200 ||
        seen.has(item.id) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100
      ) {
        return badRequest('Invalid cart item or quantity.');
      }
      seen.add(item.id);
      items.push({ id: item.id, quantity });
    }

    const { data: books, error: priceError } = await supabase
      .from('cookbooks')
      .select('id, title, price, image, pdfurl')
      .in('id', items.map((item) => item.id));

    if (priceError) {
      return NextResponse.json({ error: 'Failed to look up product prices.' }, { status: 500 });
    }

    const bookMap = new Map((books ?? []).map((book) => [book.id, book]));
    let subtotal = 0;
    const resolved: ResolvedItem[] = [];

    for (const item of items) {
      const book = bookMap.get(item.id);
      if (!book) {
        return badRequest('A cookbook is no longer available.');
      }

      const price = Number(book.price);
      if (!Number.isFinite(price) || price < 0 || typeof book.title !== 'string' || !book.title.trim()) {
        return badRequest('A cookbook has invalid product details.');
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
