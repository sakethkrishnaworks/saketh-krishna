'use client';

import React, { useState } from 'react';
import { Sparkles, ShoppingCart, Check, BookOpen, Mail, ArrowRight, ChevronLeft, Search } from 'lucide-react';
import { ASSET_IMAGES } from '../data';
import { Cookbook } from '../types';
import { ActiveTab } from '../types';

interface CookbooksViewProps {
  cookbooks: Cookbook[];
  onAddToCart: (cookbook: Cookbook) => void;
  onSubscribe: (email: string) => void;
  isSignedIn: boolean;
  onLogin: () => void;
}

export default function CookbooksView({ cookbooks, onAddToCart, onSubscribe, isSignedIn, onLogin }: CookbooksViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [subscribedEmail, setSubscribedEmail] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [successAnimationItem, setSuccessAnimationItem] = useState<string | null>(null);
  const [authPrompt, setAuthPrompt] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'high-protein', label: 'High Protein' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'air-fryer', label: 'Air Fryer' },
  ];

  const filteredCookbooks = selectedCategory === 'all'
    ? cookbooks
    : cookbooks.filter(book => book.category === selectedCategory);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail.trim()) {
      onSubscribe(subscribedEmail.trim());
      setIsSubscribed(true);
      setTimeout(() => {
        setSubscribedEmail('');
      }, 3000);
    }
  };

  const triggerAddToCart = (book: Cookbook) => {
    if (!isSignedIn) {
      setAuthPrompt('Please sign in to purchase cookbooks.');
      onLogin();
      return;
    }

    onAddToCart(book);
    setSuccessAnimationItem(book.id);
    setTimeout(() => {
      setSuccessAnimationItem(null);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0b] pt-14 pb-10 px-5 safe-bottom">
      <div className="max-w-md mx-auto">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-tight mb-2">
            Cookbooks
          </h1>
          <p className="font-sans text-xs text-[#a0a0a0]">
            Premium digital cookbooks & macro guides
          </p>
        </div>

        {/* Auth Prompt */}
        {authPrompt && (
          <div className="mb-6 rounded-xl border border-[#D2B48C]/20 bg-[#D2B48C]/10 px-5 py-3 text-xs font-sans text-[#D2B48C] text-center">
            {authPrompt}
          </div>
        )}

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-sans text-[10px] font-semibold tracking-wider transition-all cursor-pointer uppercase border ${selectedCategory === cat.id
                ? 'bg-[#D2B48C] text-[#0c0c0b] border-[#D2B48C]'
                : 'bg-[#1a1a1a] text-[#a0a0a0] border-[#2a2a2a] hover:border-[#D2B48C]/30 hover:text-white'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cookbooks List */}
        <div className="flex flex-col gap-3.5">
          {filteredCookbooks.map((book) => (
            <div
              key={book.id}
              className="w-full bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] hover:border-[#D2B48C]/30 rounded-xl transition-all duration-200 overflow-hidden"
            >
              <div className="flex items-stretch">
                {/* Thumbnail */}
                <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 bg-[#2a2a2a] overflow-hidden">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 p-3.5 md:p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-sm md:text-base text-white font-semibold leading-tight line-clamp-1">
                        {book.title}
                      </h3>
                      {book.tag && (
                        <span className="flex-shrink-0 text-[8px] font-sans font-bold tracking-wider text-[#D2B48C] bg-[#D2B48C]/10 px-2 py-0.5 rounded-full uppercase border border-[#D2B48C]/20">
                          {book.tag}
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-[10px] text-[#a0a0a0] mt-1 line-clamp-1 leading-relaxed">
                      {book.description}
                    </p>
                    {book.features && book.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {book.features.slice(0, 2).map((feat, idx) => (
                          <span key={idx} className="text-[8px] font-sans text-[#a0a0a0] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
                            {feat}
                          </span>
                        ))}
                        {book.features.length > 2 && (
                          <span className="text-[8px] font-sans text-[#a0a0a0]">+{book.features.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif text-lg md:text-xl text-white font-bold">
                        ₹{book.price.toLocaleString('en-IN')}
                      </span>
                      {book.oldPrice && (
                        <span className="font-sans text-[10px] text-[#a0a0a0] line-through">
                          ₹{book.oldPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => triggerAddToCart(book)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-sans text-[10px] font-bold tracking-wider uppercase transition-all ${successAnimationItem === book.id
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#D2B48C] text-[#0c0c0b] hover:bg-[#feddb3]'
                        }`}
                    >
                      {successAnimationItem === book.id ? (
                        <><Check className="w-3 h-3" /> Added</>
                      ) : (
                        <><ShoppingCart className="w-3 h-3" /> {isSignedIn ? 'Add' : 'Buy'}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Card */}
        <div className="mt-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-[#D2B48C]" />
            <div>
              <h3 className="font-serif text-base text-white font-semibold">Get weekly recipes</h3>
              <p className="font-sans text-[10px] text-[#a0a0a0]">Sunday newsletter with premium strategies</p>
            </div>
          </div>
          {isSubscribed ? (
            <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg text-emerald-400 text-xs font-sans flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Subscribed! Welcome to the collective.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={subscribedEmail}
                onChange={(e) => setSubscribedEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-[#0c0c0b] border border-[#2a2a2a] text-white rounded-lg px-4 py-2.5 font-sans text-xs focus:outline-none focus:border-[#D2B48C]"
              />
              <button
                type="submit"
                className="bg-[#D2B48C] hover:bg-[#feddb3] text-[#0c0c0b] font-sans font-bold text-[10px] tracking-wider px-5 py-2.5 rounded-lg transition-colors uppercase"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}