'use client';

import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, Sparkles, BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { CartItem, PurchasePayload } from '../types';
import { kindLabel } from '../lib/products';
import { authedFetch } from '../lib/api';
import { evaluatePromo, paiseToRupees } from '../lib/promo';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (kind: string, id: string, delta: number) => void;
  onRemoveItem: (kind: string, id: string) => void;
  onClearCart: () => void;
  isSignedIn: boolean;
  userName: string;
  userEmail: string;
  onLogin: () => void;
  onPurchaseComplete: (payload: PurchasePayload) => Promise<void>;
  onOpenLibrary: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  isSignedIn,
  userName,
  userEmail,
  onLogin,
  onPurchaseComplete,
  onOpenLibrary,
}: CartDrawerProps) {
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string>('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string>('');
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState<boolean>(false);
  const [downloadLinkCount, setDownloadLinkCount] = useState<number>(0);
  const [successItems, setSuccessItems] = useState<CartItem[]>([]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const promo = evaluatePromo(promoApplied ? promoCode : null);
  const appliedDiscount = subtotal * promo.rate;
  const total = Math.max(0, subtotal - appliedDiscount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');

    const result = evaluatePromo(promoCode);
    if (result.valid) {
      setPromoApplied(true);
    } else {
      setPromoApplied(false);
      setPromoError('Invalid code. Try SAKETH20');
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (!isSignedIn) {
      onLogin();
      return;
    }

    if (typeof window === 'undefined' || !window.Razorpay) {
      setCheckoutError('Payment gateway is still loading. Please try again in a moment.');
      return;
    }

    setIsProcessingCheckout(true);
    setCheckoutError('');

    try {
      // 1. Create the order. The server computes the final amount from live
      //    prices + the promo code, so it is authoritative.
      const createResponse = await authedFetch('/api/create-order', {
        method: 'POST',
        body: JSON.stringify({
          items: cartItems.map((item) => ({ id: item.product.id, kind: item.product.kind, quantity: item.quantity })),
          promo: promoApplied ? promoCode.trim().toUpperCase() : undefined,
        }),
      });

      const order = await createResponse.json();
      if (!createResponse.ok || !order.order_id) {
        throw new Error(order.error || 'Failed to create your order. Please try again.');
      }

      // 2. Open the Razorpay Standard Checkout modal.
      await new Promise<void>((resolve, reject) => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          order_id: order.order_id,
          name: 'Saketh Krishna',
          description: `${cartItems.length} item${cartItems.length > 1 ? 's' : ''}`,
          prefill: { name: userName, email: userEmail },
          theme: { color: '#D2B48C' },
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            try {
              // 3. Verify the signature server-side.
              const verifyResponse = await authedFetch('/api/verify-payment', {
                method: 'POST',
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verified = await verifyResponse.json();
              if (!verifyResponse.ok || !verified.verified) {
                throw new Error(verified.error || 'We could not confirm your payment. Contact support if you were charged.');
              }

              // 4. Record the library entries (server may already have done it).
              await onPurchaseComplete({
                orderId: verified.order_id,
                paymentId: verified.payment_id,
                amount: paiseToRupees(verified.amount),
                currency: verified.currency,
                items: verified.items ?? [],
                recorded: Boolean(verified.recorded),
              });

              setDownloadLinkCount(order.items?.length ?? cartItems.length);
              setSuccessItems(cartItems);
              setIsCheckoutSuccess(true);
              resolve();
            } catch (verifyError) {
              reject(verifyError);
            }
          },
          modal: {
            ondismiss: () => {
              setCheckoutError('Payment cancelled. Your cart is saved.');
              resolve();
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (failure: { error: { description?: string } }) => {
          setCheckoutError(failure.error?.description || 'Payment failed. Please try another method.');
          resolve();
        });
        razorpay.open();
      });
    } catch (error) {
      console.error('Checkout failed:', error);
      setCheckoutError(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleCloseSuccess = () => {
    setIsCheckoutSuccess(false);
    onClearCart();
    onClose();
    setPromoCode('');
    setPromoApplied(false);
    setCheckoutError('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#0c0c0b] border-l border-[#2a2a2a] h-dvh flex flex-col justify-between shadow-2xl z-10">
        {/* Header */}
        <div className="flex justify-between items-center px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <span className="font-serif text-base text-white font-semibold">Cart</span>
            <span className="font-sans text-xs text-[#a0a0a0]">({cartItems.length})</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#a0a0a0] hover:text-white transition-colors p-1 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto px-5 py-6 space-y-4">
          {isCheckoutSuccess ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-white font-semibold mb-1">Payment Successful</h3>
                <p className="font-sans text-xs text-[#a0a0a0]">Your items are now in your library.</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3 text-left">
                <span className="font-sans text-[9px] tracking-wider text-[#D2B48C] font-semibold uppercase">Your Items ({downloadLinkCount})</span>
                {successItems.map((item) => (
                  <div key={`${item.product.kind}:${item.product.id}`} className="flex justify-between items-center text-xs pb-2 border-b border-[#2a2a2a] last:border-none last:pb-0">
                    <span className="text-white font-medium truncate max-w-[70%]">{item.product.title}</span>
                    {item.product.pdf_url ? (
                      <button onClick={() => { handleCloseSuccess(); onOpenLibrary(); }}
                        className="flex items-center gap-1 text-[#D2B48C] hover:text-[#feddb3] font-bold text-[9px] tracking-wider uppercase">
                        <BookOpen className="w-3 h-3" /> Read
                      </button>
                    ) : (
                      <span className="text-[#a0a0a0] font-bold text-[9px] tracking-wider uppercase">{kindLabel(item.product.kind)}</span>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={handleCloseSuccess}
                className="w-full py-3 bg-[#D2B48C] hover:bg-[#feddb3] text-[#0c0c0b] font-sans font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all">
                Continue Shopping
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="text-4xl text-[#2a2a2a]">∅</div>
              <p className="font-serif text-base text-white">Your cart is empty</p>
              <p className="font-sans text-xs text-[#a0a0a0]">Add some cookbooks, plans, or sessions to get started.</p>
              <button onClick={onClose}
                className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#242424] text-white text-[10px] font-bold tracking-wider uppercase rounded-lg border border-[#2a2a2a] transition-all">
                Browse Cookbooks
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.product.kind}:${item.product.id}`}
                  className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 hover:border-[#D2B48C]/20 transition-all">
                  <div className="w-16 h-16 rounded-lg bg-[#2a2a2a] overflow-hidden flex-shrink-0">
                    <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-[8px] font-sans font-bold tracking-wider text-[#D2B48C] uppercase">{kindLabel(item.product.kind)}</span>
                        <h4 className="font-serif text-sm font-semibold text-white leading-tight line-clamp-2">{item.product.title}</h4>
                      </div>
                      <button onClick={() => onRemoveItem(item.product.kind, item.product.id)}
                        className="text-[#a0a0a0] hover:text-red-400 transition-colors flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center bg-[#0c0c0b] rounded-lg border border-[#2a2a2a]">
                        <button onClick={() => onUpdateQuantity(item.product.kind, item.product.id, -1)}
                          className="px-2 py-1 text-[#a0a0a0] hover:text-white transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-sans text-xs font-bold text-white px-2.5">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.product.kind, item.product.id, 1)}
                          className="px-2 py-1 text-[#a0a0a0] hover:text-white transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-serif text-sm font-bold text-white">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Promo Code */}
              <div className="pt-4 border-t border-[#2a2a2a]">
                {promoApplied ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-lg text-xs text-emerald-400 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase">
                      <Sparkles className="w-3.5 h-3.5" /> {promo.label} Applied
                    </div>
                    <button onClick={() => { setPromoApplied(false); setPromoCode(''); }}
                      className="text-[#D2B48C] underline text-[10px]">Remove</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code"
                      className="flex-1 bg-[#0c0c0b] border border-[#2a2a2a] text-white rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-[#D2B48C]" />
                    <button type="submit"
                      className="bg-[#1a1a1a] hover:bg-[#242424] text-white text-[10px] font-bold tracking-wider px-4 py-2.5 rounded-lg border border-[#2a2a2a] transition-all uppercase">
                      Apply
                    </button>
                  </form>
                )}
                {promoError && <p className="text-[10px] text-red-400 mt-1.5">{promoError}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Totals */}
        {!isCheckoutSuccess && cartItems.length > 0 && (
          <div className="border-t border-[#2a2a2a] px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-4 bg-[#0c0c0b]">
            {checkoutError && (
              <div className="rounded-lg border border-red-500/30 bg-red-950/40 px-4 py-3 text-[11px] text-red-300 leading-relaxed">
                {checkoutError}
              </div>
            )}
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between text-[#a0a0a0]">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({promo.label})</span>
                  <span>-₹{appliedDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white border-t border-[#2a2a2a] pt-2.5 mt-2.5">
                <span>Total</span>
                <span className="text-[#D2B48C]">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button onClick={handleCheckout} disabled={isProcessingCheckout}
              className="w-full py-3.5 bg-[#D2B48C] hover:bg-[#feddb3] disabled:opacity-40 text-[#0c0c0b] font-sans font-bold text-xs tracking-wider rounded-lg transition-all uppercase flex items-center justify-center gap-2">
              {isProcessingCheckout ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : isSignedIn ? (
                `Pay ₹${total.toLocaleString('en-IN')}`
              ) : (
                'Sign In to Checkout'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
