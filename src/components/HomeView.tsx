'use client';

import { ArrowRight } from 'lucide-react';
import SK from '../../assets/sk.jpg';

interface HomeViewProps {
  onNavigate: (tab: 'home' | 'cookbooks' | 'coaching' | 'library' | 'admin') => void;
  onReadStory: () => void;
}

export default function HomeView({ onNavigate, onReadStory }: HomeViewProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0c0b]">
      {/* Hero Image - Full width with fade mask like Linktree */}
      <div className="relative w-full" style={{ height: 'calc(100vw - 80px)', maxHeight: '500px' }}>
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: '#0c0c0b',
            mask: 'radial-gradient(110.26% 96% at 50% 0%, #000 50%, rgba(0,0,0,0.99) 54.68%, rgba(0,0,0,0.97) 58.79%, rgba(0,0,0,0.94) 62.4%, rgba(0,0,0,0.90) 65.61%, rgba(0,0,0,0.85) 68.52%, rgba(0,0,0,0.79) 71.2%, rgba(0,0,0,0.72) 73.75%, rgba(0,0,0,0.65) 76.25%, rgba(0,0,0,0.57) 78.8%, rgba(0,0,0,0.48) 81.48%, rgba(0,0,0,0.39) 84.39%, rgba(0,0,0,0.30) 87.6%, rgba(0,0,0,0.20) 91.21%, rgba(0,0,0,0.10) 95.32%, rgba(0,0,0,0.00) 100%)',
            WebkitMask: 'radial-gradient(110.26% 96% at 50% 0%, #000 50%, rgba(0,0,0,0.99) 54.68%, rgba(0,0,0,0.97) 58.79%, rgba(0,0,0,0.94) 62.4%, rgba(0,0,0,0.90) 65.61%, rgba(0,0,0,0.85) 68.52%, rgba(0,0,0,0.79) 71.2%, rgba(0,0,0,0.72) 73.75%, rgba(0,0,0,0.65) 76.25%, rgba(0,0,0,0.57) 78.8%, rgba(0,0,0,0.48) 81.48%, rgba(0,0,0,0.39) 84.39%, rgba(0,0,0,0.30) 87.6%, rgba(0,0,0,0.20) 91.21%, rgba(0,0,0,0.10) 95.32%, rgba(0,0,0,0.00) 100%)'
          }}
        >
          <img
            src={SK.src}
            alt="Saketh Krishna"
            className="absolute inset-0 z-[-2] w-full h-full object-cover"
          />
          {/* Blur overlay fade */}
          <div
            className="absolute inset-0 z-[-1]"
            style={{
              mask: 'radial-gradient(110.26% 96% at 50% 0%, rgba(0,0,0,0.00) 60%, rgba(0,0,0,0.01) 64.72%, rgba(0,0,0,0.03) 68.55%, rgba(0,0,0,0.07) 71.65%, rgba(0,0,0,0.12) 74.13%, rgba(0,0,0,0.18) 76.15%, rgba(0,0,0,0.25) 77.82%, rgba(0,0,0,0.33) 79.3%, rgba(0,0,0,0.41) 80.7%, rgba(0,0,0,0.50) 82.18%, rgba(0,0,0,0.59) 83.85%, rgba(0,0,0,0.67) 85.87%, rgba(0,0,0,0.76) 88.35%, rgba(0,0,0,0.85) 91.45%, rgba(0,0,0,0.93) 95.28%, #000 100%)',
              WebkitMask: 'radial-gradient(110.26% 96% at 50% 0%, rgba(0,0,0,0.00) 60%, rgba(0,0,0,0.01) 64.72%, rgba(0,0,0,0.03) 68.55%, rgba(0,0,0,0.07) 71.65%, rgba(0,0,0,0.12) 74.13%, rgba(0,0,0,0.18) 76.15%, rgba(0,0,0,0.25) 77.82%, rgba(0,0,0,0.33) 79.3%, rgba(0,0,0,0.41) 80.7%, rgba(0,0,0,0.50) 82.18%, rgba(0,0,0,0.59) 83.85%, rgba(0,0,0,0.67) 85.87%, rgba(0,0,0,0.76) 88.35%, rgba(0,0,0,0.85) 91.45%, rgba(0,0,0,0.93) 95.28%, #000 100%)',
            }}
          />
        </div>
      </div>

      {/* Content below hero */}
      <div className="flex flex-col items-center px-5 pb-8" style={{ marginTop: '-20px' }}>
        {/* Name */}
        <h1 className="font-sans text-xl font-semibold text-white mb-1.5" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700 }}>
          Saketh Krishna
        </h1>

        {/* Bio - single line */}
        <p className="font-sans text-sm text-white/80 text-center max-w-xs leading-normal mb-6" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
          Healthy Food. Sustainable Fat Loss. Elevated Living.
        </p>

        {/* CTA Buttons */}
        <div className="w-full max-w-sm flex flex-col gap-3.5">
          <button
            onClick={() => onNavigate('cookbooks')}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white font-sans font-medium text-sm transition-all active:scale-[0.98] hover:border-[#D2B48C]/30 hover:text-white"
          >
            <span>Buy Cookbooks</span>
            <ArrowRight className="w-5 h-5 text-[#D2B48C]" />
          </button>

          <button
            onClick={() => onNavigate('coaching')}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white font-sans font-medium text-sm transition-all active:scale-[0.98] hover:border-[#D2B48C]/30 hover:text-white"
          >
            <span>Start Coaching</span>
            <ArrowRight className="w-5 h-5 text-[#D2B48C]" />
          </button>

          <button
            onClick={() => onNavigate('library')}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white font-sans font-medium text-sm transition-all active:scale-[0.98] hover:border-[#D2B48C]/30 hover:text-white"
          >
            <span>My Library</span>
            <ArrowRight className="w-5 h-5 text-[#D2B48C]" />
          </button>

          <button
            onClick={onReadStory}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white font-sans font-medium text-sm transition-all active:scale-[0.98] hover:border-[#D2B48C]/30 hover:text-white"
          >
            <span>Read My Story</span>
            <ArrowRight className="w-5 h-5 text-[#D2B48C]" />
          </button>
        </div>

        {/* Social Links Row */}
        <div className="flex items-center gap-5 mt-10 mb-6">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors">
            <svg fill="currentColor" width="28" height="28" viewBox="0 0 24 24"><title>Instagram</title><path d="M12 2C9.2912 2 8.94131 2 7.86907 2.05643C7.03985 2.07241 6.21934 2.22888 5.44244 2.51919C4.78781 2.77878 4.23476 3.11738 3.67043 3.68172C3.11738 4.23476 2.76749 4.78781 2.51919 5.45372C2.27088 6.08578 2.10158 6.80813 2.05643 7.88036C2.01129 8.94131 2 9.27991 2 12C2 14.7088 2 15.0474 2.05643 16.1196C2.10158 17.1919 2.28217 17.9255 2.51919 18.5576C2.77878 19.2122 3.11738 19.7652 3.67043 20.3296C4.23476 20.8826 4.78781 21.2325 5.44244 21.4808C6.08578 21.7291 6.80813 21.8984 7.86907 21.9436C8.94131 21.9887 9.27991 22 12 22C14.7088 22 15.0474 22 16.1196 21.9436C17.1806 21.8984 17.9142 21.7178 18.5463 21.4808C19.2137 21.2306 19.8184 20.8377 20.3183 20.3296C20.8826 19.7652 21.2212 19.2009 21.4695 18.5576C21.7178 17.9142 21.8871 17.1919 21.9436 16.1196C21.9887 15.0587 22 14.7201 22 12C22 9.2912 21.9887 8.9526 21.9436 7.88036C21.9225 7.05065 21.7622 6.23037 21.4695 5.45372C21.2189 4.78649 20.8261 4.18182 20.3183 3.68172C19.754 3.11738 19.2122 2.77878 18.5463 2.51919C17.7686 2.23315 16.9482 2.08051 16.1196 2.06772C15.0474 2.01129 14.7088 2 12 2ZM12 4C14.654 4 15.0007 4.00453 16.0582 4.05829C17.0454 4.10833 17.5722 4.27416 17.9241 4.41328C18.3894 4.59642 18.726 4.81459 19.058 5.14676C19.3897 5.4781 19.6079 5.81521 19.7908 6.28098C19.9299 6.63288 20.0957 7.15916 20.1458 8.14638C20.1995 9.20482 20.204 9.75534 20.204 12C20.204 14.2446 20.1995 14.7952 20.1458 15.8536C20.0957 16.8409 19.9299 17.3671 19.7908 17.719C19.6079 18.1848 19.3897 18.5215 19.058 18.8532C18.726 19.1854 18.3894 19.4036 17.9241 19.5867C17.5722 19.7258 17.0454 19.8916 16.0582 19.9417C15.0007 19.9955 14.654 20 12 20C9.346 20 8.99935 19.9955 7.94183 19.9417C6.9546 19.8916 6.4278 19.7258 6.07588 19.5867C5.61055 19.4036 5.27399 19.1854 4.942 18.8532C4.61037 18.5215 4.39212 18.1848 4.20919 17.719C4.07007 17.3671 3.90423 16.8409 3.8542 15.8536C3.80045 14.7952 3.796 14.2446 3.796 12C3.796 9.75534 3.80045 9.20482 3.8542 8.14638C3.90423 7.15916 4.07007 6.63288 4.20919 6.28098C4.39212 5.81521 4.61037 5.4781 4.942 5.14676C5.27399 4.81459 5.61055 4.59642 6.07588 4.41328C6.4278 4.27416 6.9546 4.10833 7.94183 4.05829C8.99935 4.00453 9.346 4 12 4ZM12 6.4C8.9184 6.4 6.4 8.9184 6.4 12C6.4 15.0816 8.9184 17.6 12 17.6C15.0816 17.6 17.6 15.0816 17.6 12C17.6 8.9184 15.0816 6.4 12 6.4ZM12 8.8C13.7674 8.8 15.2 10.2326 15.2 12C15.2 13.7674 13.7674 15.2 12 15.2C10.2326 15.2 8.8 13.7674 8.8 12C8.8 10.2326 10.2326 8.8 12 8.8ZM17.6 5.5C16.7402 5.5 16 6.24016 16 7.1C16 7.95984 16.7402 8.7 17.6 8.7C18.4598 8.7 19.2 7.95984 19.2 7.1C19.2 6.24016 18.4598 5.5 17.6 5.5Z" /></svg>
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors">
            <svg fill="currentColor" width="28" height="28" viewBox="0 0 24 24"><title>TikTok</title><path d="M15.9453 8.68918V15.6727C15.9453 19.1598 13.1048 22.0004 9.6177 22.0004C8.27369 22.0004 7.01685 21.5717 5.99251 20.8525C4.35796 19.7047 3.29004 17.8085 3.29004 15.6727C3.29004 12.1783 6.12333 9.34505 9.6104 9.34505C9.90101 9.34505 10.1843 9.36685 10.4676 9.40318V12.9121H10.4386C10.3151 12.8758 10.1843 12.8394 10.0536 12.8177H9.9954C9.86466 12.8032 9.74114 12.7813 9.60309 12.7813C8.00491 12.7813 6.70448 14.0817 6.70448 15.6799C6.70448 17.2782 8.00491 18.5786 9.60309 18.5786C11.2014 18.5786 12.5018 17.2782 12.5018 15.6799V2.00037H15.938C15.938 2.29822 15.9671 2.58881 16.0179 2.87213C16.2649 4.1798 17.035 5.30584 18.1175 6.01053C18.873 6.50452 19.7593 6.78785 20.7182 6.78785V10.2241C18.9416 10.2241 17.288 9.65222 15.9453 8.68918Z" /></svg>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors">
            <svg fill="currentColor" width="28" height="28" viewBox="0 0 24 24"><title>YouTube</title><path fillRule="evenodd" clipRule="evenodd" d="M19.8142 5.41679C20.6763 5.64906 21.3541 6.32675 21.5832 7.18581C22 8.74483 22 11.9997 22 11.9997C22 11.9997 22 15.2545 21.5832 16.8136C21.3509 17.6757 20.6733 18.3535 19.8142 18.5825C18.2551 18.9993 12 18.9993 12 18.9993C12 18.9993 5.74801 18.9993 4.18581 18.5825C3.32358 18.3502 2.64588 17.6726 2.4168 16.8136C2 15.2545 2 11.9997 2 11.9997C2 11.9997 2 8.74483 2.4168 7.18581C2.64907 6.32358 3.32676 5.64588 4.18581 5.41679C5.74801 5 12 5 12 5C12 5 18.2551 5 19.8142 5.41679ZM15.1961 11.9992L10.0004 14.9994V8.99883L15.1961 11.9992Z" /></svg>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white transition-colors">
            <svg fill="currentColor" width="28" height="28" viewBox="0 0 24 24"><title>Facebook</title><path d="M23 12C23 5.92487 18.0751 0.999996 12 0.999996C5.92488 0.999996 1 5.92487 1 12C1 17.1588 4.55146 21.4874 9.34266 22.6761V15.3614H7.07438V12H9.34266V10.5516C9.34266 6.80751 11.037 5.07215 14.7128 5.07215C15.4096 5.07215 16.6121 5.20877 17.104 5.34544V8.39261C16.8444 8.36529 16.3935 8.3516 15.8332 8.3516C14.0295 8.3516 13.3326 9.03484 13.3326 10.8112V12H16.9256L16.3084 15.3614H13.3326V22.9194C18.7792 22.2616 23 17.624 23 12Z" /></svg>
          </a>
        </div>

        {/* Footer watermark */}
        <p className="font-sans text-xs text-white/30 mt-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          @sakethkrishna
        </p>
      </div>
    </div>
  );
}