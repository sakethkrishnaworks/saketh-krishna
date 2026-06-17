'use client';

import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, CreditCard, Sparkles, BookOpen, CheckCircle } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  isSignedIn: boolean;
  onLogin: () => void;
  onPurchaseComplete: (items: CartItem[]) => void;
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
  onLogin,
  onPurchaseComplete,
  onOpenLibrary,
}: CartDrawerProps) {
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string>('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState<boolean>(false);
  const [downloadLinkCount, setDownloadLinkCount] = useState<number>(0);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.cookbook.price * item.quantity, 0);
  const appliedDiscount = subtotal * discountAmount;
  const total = Math.max(0, subtotal - appliedDiscount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (code === 'SAKETH20' || code === 'WELCOME20') {
      setDiscountAmount(0.2);
      setPromoApplied(true);
    } else if (code === 'HEALTHY10') {
      setDiscountAmount(0.1);
      setPromoApplied(true);
    } else {
      setPromoError('Invalid code. Try SAKETH20');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    if (!isSignedIn) {
      onLogin();
      return;
    }
    setIsProcessingCheckout(true);
    setTimeout(() => {
      setIsProcessingCheckout(false);
      onPurchaseComplete(cartItems);
      setIsCheckoutSuccess(true);
      setDownloadLinkCount(cartItems.length);
    }, 2000);
  };

  const handleCloseSuccess = () => {
    setIsCheckoutSuccess(false);
    onClearCart();
    onClose();
    setPromoCode('');
    setPromoApplied(false);
    setDiscountAmount(0);
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
                <h3 className="font-serif text-xl text-white font-semibold mb-1">Purchase Successful</h3>
                <p className="font-sans text-xs text-[#a0a0a0]">Your cookbooks are ready to read.</p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3 text-left">
                <span className="font-sans text-[9px] tracking-wider text-[#D2B48C] font-semibold uppercase">Your Items ({downloadLinkCount})</span>
                {cartItems.map((item) => (
                  <div key={item.cookbook.id} className="flex justify-between items-center text-xs pb-2 border-b border-[#2a2a2a] last:border-none last:pb-0">
                    <span className="text-white font-medium truncate max-w-[70%]">{item.cookbook.title}</span>
                    <button onClick={() => { handleCloseSuccess(); onOpenLibrary(); }}
                      className="flex items-center gap-1 text-[#D2B48C] hover:text-[#feddb3] font-bold text-[9px] tracking-wider uppercase">
                      <BookOpen className="w-3 h-3" /> Read
                    </button>
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
              <p className="font-sans text-xs text-[#a0a0a0]">Add some cookbooks to get started.</p>
              <button onClick={onClose}
                className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#242424] text-white text-[10px] font-bold tracking-wider uppercase rounded-lg border border-[#2a2a2a] transition-all">
                Browse Cookbooks
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.cookbook.id}
                  className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 hover:border-[#D2B48C]/20 transition-all">
                  <div className="w-16 h-16 rounded-lg bg-[#2a2a2a] overflow-hidden flex-shrink-0">
                    <img src={item.cookbook.image} alt={item.cookbook.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-serif text-sm font-semibold text-white leading-tight line-clamp-2">{item.cookbook.title}</h4>
                      <button onClick={() => onRemoveItem(item.cookbook.id)}
                        className="text-[#a0a0a0] hover:text-red-400 transition-colors flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center bg-[#0c0c0b] rounded-lg border border-[#2a2a2a]">
                        <button onClick={() => onUpdateQuantity(item.cookbook.id, -1)}
                          className="px-2 py-1 text-[#a0a0a0] hover:text-white transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-sans text-xs font-bold text-white px-2.5">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.cookbook.id, 1)}
                          className="px-2 py-1 text-[#a0a0a0] hover:text-white transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-serif text-sm font-bold text-white">
                        ₹{(item.cookbook.price * item.quantity).toLocaleString('en-IN')}
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
                      <Sparkles className="w-3.5 h-3.5" /> 20% Off Applied
                    </div>
                    <button onClick={() => { setPromoApplied(false); setDiscountAmount(0); }}
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
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between text-[#a0a0a0]">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount (20%)</span>
                  <span>-₹{appliedDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-white border-t border-[#2a2a2a] pt-2.5 mt-2.5">
                <span>Total</span>
                <span className="text-[#D2B48C]">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button onClick={handleCheckout} disabled={isProcessingCheckout}
              className="w-full py-3.5 bg-[#D2B48C] hover:bg-[#feddb3] disabled:opacity-40 text-[#0c0c0b] font-sans font-bold text-xs tracking-wider rounded-lg transition-all uppercase">
              {isProcessingCheckout ? 'Processing...' : isSignedIn ? 'Checkout' : 'Sign In to Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}