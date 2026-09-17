import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { CURRENCY } from '../../../src/lib/promo';
import { hasServiceRole } from '../../../src/lib/serverAuth';
import { createServerClient } from '../../../src/lib/serverSupabase';

export const runtime = 'nodejs';

interface VerifyBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
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
  return NextResponse.json({ error: message, verified: false }, { status: 400 });
}

/**
 * Verifies a Razorpay payment signature.
 *
 * Signature = HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET), hex encoded.
 * The client must never receive KEY_SECRET; it only forwards the three fields
 * the checkout modal returned.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VerifyBody;
    const orderId = body.razorpay_order_id?.trim();
    const paymentId = body.razorpay_payment_id?.trim();
    const signature = body.razorpay_signature?.trim();

    if (!orderId || !paymentId || !signature) {
      return badRequest('Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature.');
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!keySecret || !keyId) {
      console.error('verify-payment: Razorpay keys missing.');
      return NextResponse.json({ error: 'Razorpay is not configured.', verified: false }, { status: 503 });
    }

    // ---- Verify the signature ----
    const expected = createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const signatureMatches =
      expected.length === signature.length &&
      timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'));

    if (!signatureMatches) {
      // Do NOT mark anything as paid.
      console.error('verify-payment: signature mismatch for order', orderId);
      return badRequest('Payment signature verification failed. Your card was not charged for this order.');
    }

    // ---- Fetch the order to recover the authoritative cart ----
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.fetch(orderId);

    let items: ResolvedItem[] = [];
    try {
      const cartNote = order.notes?.cart;
      items = JSON.parse(typeof cartNote === 'string' ? cartNote : '[]') as ResolvedItem[];
    } catch {
      items = [];
    }

    // ---- Record the purchase server-side when we can trust the identity ----
    let recorded = false;
    const serviceSupabase = createServerClient(true);

    if (serviceSupabase) {
      const header = request.headers.get('authorization') ?? '';
      const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';

      if (token) {
        const { data: userData, error: userError } = await serviceSupabase.auth.getUser(token);
        const userId = userData?.user?.id;

        if (!userError && userId && items.length > 0) {
          const rows = items.map((item) => ({
            id: `pur_${userId}_${item.id}_${orderId}`,
            user_id: userId,
            cookbook_id: item.id,
            title: item.title,
            image: item.image,
            pdf_url: item.pdf_url,
            price: item.price,
            quantity: item.quantity,
            amount_paid: Number(order.amount) / 100,
            currency: order.currency ?? CURRENCY,
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            status: 'paid',
            purchased_at: new Date().toISOString(),
          }));

          const { error: insertError } = await serviceSupabase
            .from('purchases')
            .upsert(rows, { onConflict: 'id' });

          if (insertError) {
            console.error('verify-payment: server purchase insert failed:', insertError.message);
          } else {
            recorded = true;
          }
        }
      }
    }

    return NextResponse.json({
      verified: true,
      order_id: orderId,
      payment_id: paymentId,
      amount: order.amount,
      currency: order.currency ?? CURRENCY,
      items,
      recorded,
      service_role_available: hasServiceRole(),
    });
  } catch (error) {
    const status = (error as { statusCode?: number })?.statusCode;
    const message = error instanceof Error ? error.message : 'Payment verification failed.';

    if (status === 401) {
      return NextResponse.json({ error: 'Payment gateway authentication failed.', verified: false }, { status: 401 });
    }

    console.error('verify-payment failed:', message);
    return NextResponse.json({ error: message, verified: false }, { status: 500 });
  }
}
