'use client';

import { useCallback, useState } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Cookbook, PurchaseRecord } from '../types';
import { BUNDLE_CONTENTS, kindLabel } from '../lib/products';
import ReaderModal from './ReaderModal';

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
  const [readerTarget, setReaderTarget] = useState<{ purchase: PurchaseRecord; cookbookId: string; title: string } | null>(null);
  const closeReader = useCallback(() => setReaderTarget(null), []);
  const activeTarget = readerTarget && purchases.some((purchase) => purchase.id === readerTarget.purchase.id)
    ? readerTarget
    : null;

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
              const productId = purchase.product_id ?? purchase.cookbook_id;
              const kind = purchase.product_kind ?? 'cookbook';
              const latestCookbook = kind === 'cookbook' && purchase.cookbook_id
                ? cookbooks.find((book) => book.id === purchase.cookbook_id)
                : undefined;
              const pdfUrl = latestCookbook?.pdfUrl ?? purchase.pdf_url ?? undefined;
              const includedBooks = kind === 'cookbook' && productId
                ? (BUNDLE_CONTENTS[productId] ?? [])
                    .map((id) => cookbooks.find((book) => book.id === id))
                    .filter((book): book is Cookbook => Boolean(book))
                : [];

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
                        <span className="text-[8px] font-sans font-bold tracking-wider text-[#D2B48C] uppercase">{kindLabel(kind)}</span>
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
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        {pdfUrl && purchase.cookbook_id ? (
                          <button
                            type="button"
                            onClick={() => setReaderTarget({ purchase, cookbookId: purchase.cookbook_id as string, title: purchase.title })}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D2B48C] text-[#0c0c0b] rounded-lg font-sans text-[10px] font-bold tracking-wider uppercase hover:bg-[#feddb3] transition-all"
                          >
                            <BookOpen className="w-3 h-3" aria-hidden="true" /> Read Book
                          </button>
                        ) : includedBooks.length > 0 ? (
                          includedBooks.map((book) => (
                            <button
                              key={book.id}
                              type="button"
                              onClick={() => setReaderTarget({ purchase, cookbookId: book.id, title: book.title })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] border border-[#D2B48C]/40 text-[#D2B48C] rounded-lg font-sans text-[9px] font-bold tracking-wider uppercase hover:bg-[#D2B48C]/10 transition-all"
                            >
                              <BookOpen className="w-3 h-3" aria-hidden="true" /> {book.title}
                            </button>
                          ))
                        ) : (
                          <span className="text-[10px] font-sans text-[#a0a0a0] italic">
                            {kind === 'cookbook' ? 'PDF coming soon' : 'Show this entry at your session'}
                          </span>
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
      {activeTarget && (
        <ReaderModal
          key={`${activeTarget.purchase.id}:${activeTarget.cookbookId}`}
          cookbookId={activeTarget.cookbookId}
          title={activeTarget.title}
          userLabel={activeTarget.purchase.user_id ? `Reader ${activeTarget.purchase.user_id.slice(0, 8)}` : 'Personal reader'}
          onClose={closeReader}
        />
      )}
    </div>
  );
}
