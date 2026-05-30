import { useState, useEffect } from 'react';
import { Menu, ShoppingBag, X, LogOut, User, LogIn, Shield } from 'lucide-react';
import { ActiveTab } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  cartCount: number;
  onOpenCart: () => void;
  user: FirebaseUser | null | undefined;
  onLogin: () => void;
  onLogout: () => void;
  isAdmin: boolean;
}

export default function Header({ activeTab, setActiveTab, cartCount, onOpenCart, user, onLogin, onLogout, isAdmin }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'cookbooks', label: 'Cookbooks' },
    { id: 'coaching', label: 'Coaching' },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin' });
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${
          isScrolled
            ? 'bg-[#121212]/95 backdrop-blur-xl py-4 border-[#e5e2e1]/10 shadow-lg'
            : 'bg-transparent py-6 border-transparent'
        }`}
      >
        <div className="flex justify-between items-center w-full px-6 md:px-16 max-w-7xl mx-auto">
          {/* Menu Button / Mobile Toggle & Brand */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-[#c8c6c5] hover:text-[#D2B48C] transition-colors focus:outline-none min-h-11 min-w-11 flex items-center justify-center -ml-2"
              aria-label="Open navigation menu"
              id="menu-toggle-btn"
            >
              <Menu className="w-6 h-6 transition-transform hover:scale-110" />
            </button>
            <h1
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="font-serif text-sm sm:text-lg md:text-xl tracking-[0.16em] sm:tracking-[0.25em] text-[#e5e2e1] hover:text-[#D2B48C] cursor-pointer selection:bg-none transition-colors select-none uppercase font-bold truncate"
              id="brand-logo"
            >
              SAKETH KRISHNA
            </h1>
          </div>

          {/* Desktop Navigation Link items */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`font-sans font-semibold tracking-widest text-[#e5e2e1] transition-all text-xs uppercase cursor-pointer hover:text-[#D2B48C] relative py-1 ${
                  activeTab === item.id
                    ? 'text-[#D2B48C] after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-[#D2B48C]'
                    : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Auth & Shopping Cart Indicator */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold tracking-widest text-[#D2B48C] uppercase">
                      {isAdmin ? 'EXECUTIVE' : 'MEMBER'}
                    </span>
                    <span className="text-[10px] text-white/40 truncate max-w-[120px]">{user.email}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="p-2 bg-white/5 rounded-full hover:bg-red-500/10 hover:text-red-400 transition-all group"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4 group-hover:scale-110" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onLogin}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded font-sans text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  SIGN IN
                </button>
              )}
            </div>

            <button
              onClick={onOpenCart}
              className="relative text-[#c8c6c5] hover:text-[#D2B48C] transition-all p-1 group focus:outline-none min-h-11 min-w-11 flex items-center justify-center"
              aria-label="View shopping cart"
              id="cart-trigger-btn"
            >
              <ShoppingBag className="w-6 h-6 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#D2B48C] text-[#121212] font-semibold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#121212] font-mono shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full screen slide navigation drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop blur overlay */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sliding Content Container */}
          <div className="relative w-full max-w-md bg-[#121212] border-r border-[#e5e2e1]/10 h-dvh overflow-y-auto p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] md:p-12 flex flex-col justify-between z-10 shadow-2xl transition-transform duration-500 ease-out">
            <div className="space-y-12">
              <div className="flex justify-between items-center">
                <span className="font-serif text-sm tracking-[0.2em] text-[#D2B48C]">NAVIGATION MENU</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#e5e2e1] hover:text-[#D2B48C] transition-colors p-2 rounded-full hover:bg-white/5"
                  id="close-menu-btn"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Items in Column */}
              <nav className="flex flex-col gap-6">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`font-serif text-3xl text-left border-l-4 py-2 pl-4 transition-all uppercase ${
                      activeTab === item.id
                        ? 'text-[#D2B48C] border-[#D2B48C] bg-white/5 font-semibold'
                        : 'text-[#e5e2e1]/70 border-transparent hover:text-white hover:border-white/30 hover:pl-6'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="md:hidden pt-8 space-y-4">
                 <p className="font-sans text-[10px] tracking-widest text-[#e5e2e1]/40 uppercase">Account Status</p>
                 {user ? (
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 bg-white/5 p-4 rounded border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-[#D2B48C]/10 flex items-center justify-center">
                          {isAdmin ? <Shield className="w-5 h-5 text-[#D2B48C]" /> : <User className="w-5 h-5 text-[#D2B48C]" />}
                        </div>
                        <div>
                          <p className="font-serif text-lg text-white">{isAdmin ? 'Executive Access' : 'Loyalty Member'}</p>
                          <p className="font-sans text-xs text-white/40 break-all">{user.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-red-500/10 text-red-400 rounded font-sans text-xs font-bold tracking-widest uppercase border border-red-500/20"
                      >
                        <LogOut className="w-4 h-4" />
                        TERMINATE SESSION
                      </button>
                   </div>
                 ) : (
                   <button 
                     onClick={() => { onLogin(); setIsMobileMenuOpen(false); }}
                     className="flex items-center justify-center gap-2 w-full py-4 bg-[#D2B48C] text-[#402d10] rounded font-sans text-xs font-bold tracking-widest uppercase"
                   >
                     <LogIn className="w-4 h-4" />
                     ESTABLISH IDENTITY
                   </button>
                 )}
              </div>
            </div>

            {/* Social Channels inside Mobile Drawer */}
            <div className="border-t border-[#e5e2e1]/10 pt-8 space-y-4">
              <p className="font-sans text-xs tracking-widest text-[#e5e2e1]/40 uppercase">FOLLOW SAKETH</p>
              <div className="flex flex-wrap gap-6">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-[#e5e2e1]/70 hover:text-[#D2B48C]"
                >
                  Instagram
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-[#e5e2e1]/70 hover:text-[#D2B48C]"
                >
                  YouTube
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-[#e5e2e1]/70 hover:text-[#D2B48C]"
                >
                  TikTok
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
