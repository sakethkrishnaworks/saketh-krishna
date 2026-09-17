'use client';

import { BookOpen, ArrowRight, ExternalLink } from 'lucide-react';
import { Cookbook, PurchaseRecord } from '../types';

interface PurchaseLibraryViewProps {
  purchases: PurchaseRecord[];
  cookbooks: Cookbook[];
  isSignedIn: boolean;
  onLogin: () => void;
  onBrowseCookbooks: () => void;
}

export default function PurchaseLibraryView({
  purchases,
  cookbooks,
  isSignedIn,
  onLogin,
  onBrowseCookbooks,
}: PurchaseLibraryViewProps) {
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0c0c0b] pt-14 pb-10 px-5 safe-bottom">
        <div className="max-w-md mx-auto">
          <div className="mb-8 text-center">
            <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-tight mb-2">
              My Library
            </h1>
            <p className="font-sans text-xs text-[#a0a0a0]">Access your purchased cookbooks</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 text-center">
            <BookOpen className="w-12 h-12 text-[#D2B48C] mx-auto mb-4 opacity-50" />
            <h3 className="font-serif text-lg text-white font-semibold mb-2">Sign in to view your library</h3>
            <p className="font-sans text-xs text-[#a0a0a0] mb-6">
              Access all your purchased cookbooks in one place.
            </p>
            <button
              onClick={onLogin}
              className="bg-[#D2B48C] text-[#0c0c0b] px-6 py-3 rounded-lg font-sans text-xs font-bold tracking-wider uppercase hover:bg-[#feddb3] transition-all"
            >
              Sign In With Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0b] pt-14 pb-10 px-5 safe-bottom">
      <div className="max-w-md mx-auto">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-tight mb-2">
            My Library
          </h1>
          <p className="font-sans text-xs text-[#a0a0a0]">Access your purchased cookbooks</p>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 text-center">
            <BookOpen className="w-12 h-12 text-[#D2B48C] mx-auto mb-4 opacity-50" />
            <h3 className="font-serif text-lg text-white font-semibold mb-2">Your library is empty</h3>
            <p className="font-sans text-xs text-[#a0a0a0] mb-6">Purchase a cookbook to get started.</p>
            <button
              onClick={onBrowseCookbooks}
              className="bg-[#D2B48C] text-[#0c0c0b] px-6 py-3 rounded-lg font-sans text-xs font-bold tracking-wider uppercase hover:bg-[#feddb3] transition-all inline-flex items-center gap-2"
            >
              Browse Cookbooks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {purchases.map((purchase) => {
              // Prefer the catalog's live PDF link, fall back to the snapshot
              // taken at purchase time so deleted products still open.
              const latestCookbook = cookbooks.find((book) => book.id === purchase.cookbook_id);
              const pdfUrl = latestCookbook?.pdfUrl ?? purchase.pdf_url ?? undefined;

              return (
                <div
                  key={purchase.id}
                  className="bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] hover:border-[#D2B48C]/30 rounded-xl transition-all duration-200 overflow-hidden"
                >
                  <div className="flex items-stretch">
                    <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 bg-[#2a2a2a] overflow-hidden">
                      <img
                        src={latestCookbook?.image ?? purchase.image ?? ''}
                        alt={purchase.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-sm md:text-base text-white font-semibold leading-tight line-clamp-1">
                          {purchase.title}
                        </h3>
                        <span className="text-[8px] font-sans text-[#a0a0a0] mt-1 block">
                          Purchased{' '}
                          {new Date(purchase.purchased_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        {pdfUrl ? (
                          <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D2B48C] text-[#0c0c0b] rounded-lg font-sans text-[10px] font-bold tracking-wider uppercase hover:bg-[#feddb3] transition-all"
                          >
                            <ExternalLink className="w-3 h-3" /> Open PDF
                          </a>
                        ) : (
                          <span className="text-[10px] font-sans text-[#a0a0a0] italic">PDF coming soon</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
