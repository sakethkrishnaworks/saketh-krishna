import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { CURRENCY, MIN_PAISE, rupeesToPaise } from '../../../src/lib/promo';
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

function failure(message: string, status = 400) {
  return NextResponse.json(
    { error: message, verified: false, recorded: false },
    { status, headers: { 'Cache-Control': 'private, no-store' } }
  );
}

function isResolvedItem(value: unknown): value is ResolvedItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as ResolvedItem;
  return (
    typeof item.id === 'string' && Boolean(item.id.trim()) && item.id.length <= 200 &&
    typeof item.title === 'string' && Boolean(item.title.trim()) &&
    (item.image === null || typeof item.image === 'string') &&
    (item.pdf_url === null || typeof item.pdf_url === 'string') &&
    typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0 &&
    Number.isSafeInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 100
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(true);
    if (!supabase) {
      return failure('Payment verification is temporarily unavailable. Please contact support if you were charged.', 503);
    }

    const token = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];
    if (!token) return failure('Please sign in to verify your payment.', 401);

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    const userId = userData?.user?.id;
    if (userError || !userId) return failure('Please sign in again to verify your payment.', 401);

    const body = (await request.json().catch(() => null)) as VerifyBody | null;
    const orderId = typeof body?.razorpay_order_id === 'string' ? body.razorpay_order_id.trim() : '';
    const paymentId = typeof body?.razorpay_payment_id === 'string' ? body.razorpay_payment_id.trim() : '';
    const signature = typeof body?.razorpay_signature === 'string' ? body.razorpay_signature.trim() : '';
    if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId) || !/^[a-fA-F0-9]{64}$/.test(signature)) {
      return failure('Invalid payment verification details.');
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keySecret || !keyId) return failure('Payment verification is temporarily unavailable.', 503);

    const expected = createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest();
    if (!timingSafeEqual(expected, Buffer.from(signature, 'hex'))) {
      return failure('Payment signature verification failed. Please contact support if you were charged.');
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.fetch(orderId);
    if (order.id !== orderId) return failure('Unable to verify this order. Please contact support.', 409);
    if (typeof order.notes?.user_id !== 'string' || !order.notes.user_id.trim()) {
      return failure('This older order is not linked to a buyer account. Please contact support with your order and payment IDs; do not pay again.', 409);
    }
    if (order.notes.user_id !== userId) {
      return failure('This order does not belong to the signed-in account.', 403);
    }

    let cart: unknown;
    try {
      cart = JSON.parse(typeof order.notes.cart === 'string' ? order.notes.cart : 'null');
    } catch {
      return failure('Order details are unavailable. Please contact support; do not pay again.', 409);
    }
    if (
      !Array.isArray(cart) || cart.length === 0 || cart.length > 100 || !cart.every(isResolvedItem) ||
      new Set(cart.map((item) => item.id)).size !== cart.length
    ) {
      return failure('Order details are invalid. Please contact support; do not pay again.', 409);
    }
    const items: ResolvedItem[] = cart;
    const amount = Number(order.amount);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = typeof order.notes.discount === 'string' && order.notes.discount.trim()
      ? Number(order.notes.discount) : NaN;
    const total = typeof order.notes.total === 'string' && order.notes.total.trim()
      ? Number(order.notes.total) : NaN;
    if (
      !Number.isSafeInteger(amount) || amount < MIN_PAISE || order.currency !== CURRENCY ||
      !Number.isFinite(subtotal) || !Number.isFinite(discount) || discount < 0 || discount > subtotal ||
      !Number.isFinite(total) || total < 0 || rupeesToPaise(total) !== amount ||
      rupeesToPaise(subtotal - discount) !== amount
    ) {
      return failure('Order amount could not be verified. Please contact support; do not pay again.', 409);
    }

    const payment = await razorpay.payments.fetch(paymentId);
    if (
      payment.id !== paymentId || payment.order_id !== orderId ||
      Number(payment.amount) !== amount || payment.currency !== order.currency
    ) {
      return failure('Payment does not match this order. Please contact support if you were charged.', 409);
    }
    if (
      payment.status !== 'captured' || payment.captured !== true ||
      Number(payment.amount_refunded) !== 0 || order.status !== 'paid' ||
      Number(order.amount_paid) !== amount || Number(order.amount_due) !== 0
    ) {
      return failure('Payment is not confirmed as captured and paid. Please retry verification later or contact support; do not pay again.', 409);
    }

    const rows = items.map((item) => ({
      id: `pur_${userId}_${item.id}_${orderId}`,
      user_id: userId,
      cookbook_id: item.id,
      title: item.title,
      image: item.image,
      pdf_url: item.pdf_url,
      price: item.price,
      quantity: item.quantity,
      amount_paid: amount / 100,
      currency: order.currency,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      status: 'paid',
      purchased_at: new Date(payment.created_at * 1000).toISOString(),
    }));

    const { data: recordedRows, error: insertError } = await supabase
      .from('purchases')
      .upsert(rows, { onConflict: 'id' })
      .select('id');

    const recordedIds = new Set((recordedRows ?? []).map((row) => row.id));
    if (insertError || rows.some((row) => !recordedIds.has(row.id))) {
      return failure('Payment was confirmed but your purchase could not be recorded. Please retry verification or contact support; do not pay again.', 503);
    }

    return NextResponse.json({
      verified: true,
      order_id: orderId,
      payment_id: paymentId,
      amount: order.amount,
      currency: order.currency,
      items,
      recorded: true,
      service_role_available: true,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return failure('Payment verification could not be completed. Please retry verification or contact support if you were charged; do not pay again.', 500);
  }
}
