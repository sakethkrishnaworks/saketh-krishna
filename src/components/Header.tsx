'use client';

import { LogOut, LogIn, ShoppingBag, ChevronLeft } from 'lucide-react';
import { ActiveTab } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  cartCount: number;
  onOpenCart: () => void;
  user: SupabaseUser | null | undefined;
  onLogin: () => void;
  onLogout: () => void;
  isAdmin: boolean;
}

export default function Header({ activeTab, setActiveTab, cartCount, onOpenCart, user, onLogin, onLogout, isAdmin }: HeaderProps) {
  const isHome = activeTab === 'home';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200 safe-top bg-[#0c0c0b]/98 backdrop-blur-lg border-b border-[#2a2a2a]/30 shadow-sm shadow-black/20"
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        {/* Left: Back or Brand */}
        <div className="flex items-center gap-1 min-w-0">
          {!isHome ? (
            <button
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1 text-[#a0a0a0] hover:text-white transition-colors min-h-[44px] min-w-[44px] active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs font-medium">Back</span>
            </button>
          ) : (
            <span className="font-serif text-lg tracking-wider text-white font-bold select-none pl-1">
              Saketh Krishna
            </span>
          )}
        </div>

        {/* Right: Auth + Cart */}
        <div className="flex items-center gap-1.5">
          {user ? (
            <>
              <button
                onClick={onLogout}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#a0a0a0] active:text-red-400 active:border-red-400/30 transition-colors active:scale-90"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 h-9 px-3.5 bg-[#D2B48C] text-[#0c0c0b] rounded-lg font-sans text-[11px] font-bold tracking-wider uppercase active:bg-[#feddb3] active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {!isHome && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#a0a0a0] active:text-[#D2B48C] active:border-[#D2B48C]/30 active:scale-90 transition-all"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#D2B48C] text-[#0c0c0b] font-bold text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-[#0c0c0b] font-mono">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}