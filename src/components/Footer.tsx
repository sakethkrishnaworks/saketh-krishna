import React from 'react';
import { ActiveTab } from '../types';

interface FooterProps {
  onNavigate: (tab: ActiveTab) => void;
  onSubscribe: (email: string) => void;
}

export default function Footer({ onNavigate, onSubscribe }: FooterProps) {
  const [email, setEmail] = React.useState('');
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubscribe(email.trim());
      setIsSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setIsSubscribed(false);
      }, 3000);
    }
  };
  return (
    <footer className="bg-[#0c0c0b] text-[#e5e2e1] border-t border-[#e5e2e1]/10 py-16 md:py-24 px-6 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">

        {/* Left Side branding logo specs */}
        <div className="md:col-span-5 space-y-6">
          <h2 className="font-serif text-2xl md:text-3.5xl tracking-[0.25em] text-white font-bold select-none uppercase">
            SAKETH KRISHNA
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#c4c7c7]/60 leading-relaxed font-light max-w-sm">
            Bridging gourmet South Indian flavor profiles with modern physical conditioning math. Re-modeling how we fuel our bodies.
          </p>
        </div>

        {/* Center column navigation mapping links */}
        <div className="col-span-1 md:col-span-3 space-y-4">
          <span className="font-sans text-[10px] tracking-widest text-[#D2B48C] font-semibold block uppercase">
            EXPLORE PLATFORM
          </span>
          <nav className="flex flex-col gap-2.5 font-sans text-xs text-[#c4c7c7] font-semibold uppercase tracking-wider">
            <button
              onClick={() => {
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left hover:text-[#D2B48C] transition-colors cursor-pointer"
            >
              Home Index
            </button>
            <button
              onClick={() => {
                onNavigate('cookbooks');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left hover:text-[#D2B48C] transition-colors cursor-pointer"
            >
              Cookbooks Store
            </button>
            <button
              onClick={() => {
                onNavigate('coaching');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left hover:text-[#D2B48C] transition-colors cursor-pointer"
            >
              1:1 Coaching Plans
            </button>
          </nav>
        </div>

        {/* Right column newsletter & social links */}
        <div className="col-span-1 md:col-span-4 space-y-6">
          <div className="space-y-4">
            <span className="font-sans text-[10px] tracking-widest text-[#D2B48C] font-semibold block uppercase">
              STRATEGY NEWSLETTER
            </span>
            {isSubscribed ? (
              <p className="text-xs text-emerald-400 font-sans">Strategic updates are on their way. Welcome to the collective.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL@DOMAIN.COM"
                  className="bg-[#131313] border border-white/10 rounded px-4 py-2 text-[10px] tracking-widest text-white focus:outline-none focus:border-[#D2B48C] flex-grow"
                  required
                />
                <button type="submit" className="bg-[#D2B48C] text-[#402d10] px-4 py-2 rounded font-sans text-[10px] font-bold tracking-widest uppercase hover:bg-[#feddb3] transition-colors">
                  JOIN
                </button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <span className="font-sans text-[10px] tracking-widest text-[#D2B48C] font-semibold block uppercase">
              SOCIAL CHANNELS
            </span>
            <div className="flex gap-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#e5e2e1]/80 hover:text-[#D2B48C] border border-[#e5e2e1]/10 px-3.5 py-1.5 rounded-full hover:bg-white/5 transition-all uppercase"
              >
                Instagram
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#e5e2e1]/80 hover:text-[#D2B48C] border border-[#e5e2e1]/10 px-3.5 py-1.5 rounded-full hover:bg-white/5 transition-all uppercase"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom copyrights stamp logs */}
      <div className="max-w-7xl mx-auto border-t border-[#e5e2e1]/5 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-[#c4c7c7]/40 tracking-wider uppercase">
        <p>© 2026 SAKETH KRISHNA CO. ALL RIGHTS RESERVED.</p>
        <p className="font-mono">CRAFTED FOR CINEMATIC WELLNESS &amp; NUTRITION</p>
        <a href="https://aptenox.com" target="_blank" rel="noreferrer" className="font-mono">
          Aptenox Technology Product
        </a>
      </div>
    </footer>
  );
}
