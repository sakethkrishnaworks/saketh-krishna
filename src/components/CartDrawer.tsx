import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, CreditCard, Sparkles, Download, CheckCircle } from 'lucide-react';
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
}: CartDrawerProps) {
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [promoError, setPromoError] = useState<string>('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState<boolean>(false);
  const [downloadLinkCount, setDownloadLinkCount] = useState<number>(0);

  if (!isOpen) return null;

  // Compute Prices
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
      setPromoError('Invalid coupon code. Try SAKETH20');
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
      setIsCheckoutSuccess(true);
      setDownloadLinkCount(cartItems.length);
    }, 2000);
  };

  const handleCloseSuccess = () => {
    setIsCheckoutSuccess(false);
    onClearCart();
    onClose();
    // Reset values
    setPromoCode('');
    setPromoApplied(false);
    setDiscountAmount(0);
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Absolute overlay backdrop blur trigger */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Slide-out Sidebar container */}
      <div className="relative w-full max-w-md bg-[#121212] border-l border-[#e5e2e1]/10 h-full flex flex-col justify-between shadow-2xl z-10 transition-all duration-500">
        
        {/* Header Action row */}
        <div className="flex justify-between items-center px-6 md:px-8 py-6 border-b border-[#e5e2e1]/10 uppercase bg-[#0e0e0e]">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg text-white font-semibold tracking-wider">YOUR CULINARY BAG</span>
            <span className="font-mono text-xs text-[#D2B48C]">({cartItems.length})</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#e5e2e1] hover:text-[#D2B48C] transition-colors p-1.5 rounded-full hover:bg-white/5 cursor-pointer"
            aria-label="Close cart tray"
            id="close-cart-tray"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Contents viewport */}
        <div className="flex-grow overflow-y-auto px-6 md:px-8 py-6 space-y-6">
          {isCheckoutSuccess ? (
            /* Checkout Success screen display content */
            <div className="text-center py-8 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-bounce shadow-xl">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-white font-semibold">Purchase Successful</h3>
                <p className="font-sans text-xs text-[#c4c7c7] font-light leading-relaxed">
                  Excellent! We sent a purchase invoice &amp; secure download credentials straight to your registered mailbox.
                </p>
              </div>

              {/* PDF instant downloads array mockup */}
              <div className="bg-[#1b1b1b] border border-[#e5e2e1]/10 p-5 rounded-xl space-y-4 text-left">
                <span className="font-sans text-[9px] tracking-widest text-[#D2B48C] font-semibold block uppercase">
                  INSTANT DIGITAL ACCESS ({downloadLinkCount})
                </span>
                
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.cookbook.id} className="flex justify-between items-center text-xs pb-2 border-b border-white/5 last:border-none last:pb-0 font-sans">
                      <span className="text-[#e5e2e1] font-medium max-w-[70%] truncate">{item.cookbook.title}</span>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Simulating downloaded: ${item.cookbook.title}.pdf`);
                        }}
                        className="inline-flex items-center gap-1.5 text-[#D2B48C] hover:text-[#feddb3] font-bold text-[10px] tracking-widest uppercase focus:outline-none"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>DOWNLOAD PDF</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#2a2a29]/30 p-4 rounded text-[10px] text-[#c4c7c7]/50 font-mono flex justify-between uppercase">
                <span>TX_RECEIPT:</span>
                <span>SK_{Math.floor(Math.random() * 900000) + 100000}_SEC</span>
              </div>

              <button
                onClick={handleCloseSuccess}
                className="w-full py-3.5 cursor-pointer bg-[#D2B48C] hover:bg-[#feddb3] text-[#402d10] font-sans font-bold tracking-widest text-[10px] uppercase rounded"
              >
                Clear Cart &amp; Return Shop
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty state display */
            <div className="text-center py-20 space-y-4">
              <span className="font-sans text-[#c4c7c7]/30 text-6xl">∅</span>
              <div className="space-y-1">
                <p className="font-serif text-lg text-white font-medium">Your tray is empty</p>
                <p className="font-sans text-xs text-[#c4c7c7]/60 font-light max-w-xs mx-auto">
                  Explore our curated selections of digital South Indian &amp; macro textbooks to populate your luxury fitness lifestyle.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-sans text-[10px] font-bold tracking-widest uppercase rounded border border-white/10"
              >
                Continue Exploring Menu
              </button>
            </div>
          ) : (
            /* Items list rendered */
            <div className="space-y-5">
              {cartItems.map((item) => (
                <div
                  key={item.cookbook.id}
                  className="flex items-center gap-4 bg-[#1b1b1b] border border-white/5 rounded-xl p-4 hover:border-[#D2B48C]/15 transition-all"
                >
                  {/* Thumbnail cover thumbnail */}
                  <div className="w-20 h-20 bg-zinc-900 rounded overflow-hidden flex-shrink-0 relative">
                    <img src={item.cookbook.image} alt={item.cookbook.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Title & Quantity adjustments */}
                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-serif text-sm font-semibold text-white leading-tight line-clamp-1">{item.cookbook.title}</h4>
                      <button
                        onClick={() => onRemoveItem(item.cookbook.id)}
                        className="text-white/40 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                        aria-label={`Remove ${item.cookbook.title} from cart`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      {/* Plus / Minus click buttons row */}
                      <div className="flex items-center bg-[#282827] rounded border border-white/5">
                        <button
                          onClick={() => onUpdateQuantity(item.cookbook.id, -1)}
                          className="px-2 py-1 text-white/50 hover:text-white transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold text-white px-2.5">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.cookbook.id, 1)}
                          className="px-2 py-1 text-white/50 hover:text-white transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Prices total */}
                      <span className="font-serif text-sm font-bold text-white">
                        ₹{(item.cookbook.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                </div>
              ))}

              {/* Promo input code coupon form */}
              <div className="pt-6 border-t border-white/5">
                {promoApplied ? (
                  <div className="bg-[#556B2F]/15 border border-[#556B2F]/30 px-4 py-3 rounded text-xs text-[#9bc15f] flex justify-between items-center font-sans tracking-wide">
                    <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>COUPON APPLIED SUCCESSFULLY (20% OFF)</span>
                    </div>
                    <button
                      onClick={() => {
                        setPromoApplied(false);
                        setDiscountAmount(0);
                      }}
                      className="text-[#D2B48C] underline cursor-pointer text-[10px] font-bold"
                    >
                      REMOVE
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2 font-sans">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="ENTER PROMO CODE (SAKETH20)"
                      className="flex-grow bg-[#1b1b1b] border border-white/10 text-white rounded px-4 py-2 text-xs focus:outline-none uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-sans font-bold tracking-widest px-4 py-2 border border-white/15 rounded cursor-pointer uppercase transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {promoError && (
                  <p className="text-[10px] text-red-400 font-medium mt-1.5 font-sans uppercase">
                    {promoError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pricing Subtotals & Check Out Button drawer bottom (only shown if not success) */}
        {!isCheckoutSuccess && cartItems.length > 0 && (
          <div className="bg-[#0e0e0e] border-t border-[#e5e2e1]/10 p-6 md:p-8 space-y-6">
            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between text-[#c4c7c7]/60">
                <span>SUBTOTAL:</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              
              {promoApplied && (
                <div className="flex justify-between text-emerald-400">
                  <span>PROMO DISCOUNT (20%):</span>
                  <span className="font-mono">-₹{appliedDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-[#c4c7c7]/60">
                <span>DIGITAL DELIVERY:</span>
                <span className="font-mono text-[#D2B48C]">FREE INSTANT</span>
              </div>

              <div className="flex justify-between text-base font-bold text-white border-t border-white/5 pt-3">
                <span className="font-serif">TOTAL AMOUNT DUE:</span>
                <span className="font-mono text-[#D2B48C]">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessingCheckout}
              className="w-full bg-[#D2B48C] hover:bg-[#feddb3] disabled:opacity-40 text-[#402d10] font-sans font-bold py-4 rounded tracking-widest text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer uppercase"
              id="checkout-btn"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isProcessingCheckout ? 'PROCESSING TRANSACTIONS...' : isSignedIn ? 'PROCEED SECURE CHECKOUT' : 'SIGN IN TO CHECKOUT'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
