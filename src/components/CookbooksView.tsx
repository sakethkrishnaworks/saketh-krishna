import React, { useState } from 'react';
import { Sparkles, ShoppingCart, ArrowRight, Quote, BookOpen, Check } from 'lucide-react';
import { COOKBOOKS_DATA, ASSET_IMAGES } from '../data';
import { Cookbook } from '../types';

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
    { id: 'all', label: 'All Collections' },
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
      setAuthPrompt('Please sign in with Google to buy cookbooks.');
      onLogin();
      return;
    }

    onAddToCart(book);
    setSuccessAnimationItem(book.id);
    setTimeout(() => {
      setSuccessAnimationItem(null);
    }, 1800);
  };

  // Find specific books by ID to showcase their exact bespoke card designs
  const teluguKitchenBook = cookbooks.find(b => b.id === 'telugu-kitchen');
  const airFryerBook = cookbooks.find(b => b.id === 'air-fryer');
  const mealPrepBook = cookbooks.find(b => b.id === 'meal-prep');

  return (
    <div className="relative pt-[70px]">
      {/* Immersive Shop Hero */}
      <section className="relative h-[550px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={ASSET_IMAGES.cookbookHeroBg}
            alt="Hand preparing gourmet healthy organic meal"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-16 max-w-7xl mx-auto">
          <div className="max-w-2xl space-y-4">
            <span className="font-sans text-xs tracking-[0.35em] text-[#D2B48C] font-semibold block uppercase">
              DIGITAL SHOP
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6.5xl leading-[1.1] text-white font-bold tracking-tight">
              Culinary Artistry <br />&amp; Functional Nutrition
            </h2>
            <p className="font-sans text-base md:text-lg text-[#c4c7c7] font-light max-w-lg leading-relaxed">
              Elevated digital cookbooks and macro guides designed for the modern high-performer. Experience the quiet luxury of high-protein performance cooking.
            </p>
            {!isSignedIn && (
              <p className="font-sans text-xs text-[#D2B48C] tracking-widest uppercase">
                Sign in with Google to purchase cookbooks.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Grid Filtering Controls */}
      <section className="py-16 md:py-24 px-6 md:px-16 max-w-7xl mx-auto space-y-16">
        <div className="flex flex-wrap items-center gap-3 overflow-x-auto pb-4 scrollbar-thin">
          {authPrompt && (
            <div className="w-full rounded-lg border border-[#D2B48C]/25 bg-[#D2B48C]/10 px-5 py-3 text-xs font-sans text-[#D2B48C] uppercase tracking-wider">
              {authPrompt}
            </div>
          )}

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2.5 rounded-full font-sans text-xs font-semibold tracking-wider transition-all cursor-pointer whitespace-nowrap uppercase border ${
                selectedCategory === cat.id
                  ? 'bg-[#D2B48C] text-[#402d10] border-[#D2B48C] shadow-lg shadow-[#D2B48C]/15'
                  : 'bg-[#20201f] text-[#c8c6c5] border-[#e5e2e1]/10 hover:border-[#D2B48C]/50 hover:text-[#e5e2e1]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dynamic Responsive Grid Layout tailored to exact screenshots */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Cookbook 1: Bespoke Large Card (Masterpiece Telugu Kitchen) */}
          {teluguKitchenBook && (selectedCategory === 'all' || selectedCategory === 'high-protein') && (
            <div className="md:col-span-12 lg:col-span-8 group" id="telugu-kitchen-card">
              <div className="glass-panel rounded-xl overflow-hidden flex flex-col md:flex-row h-full transition-transform duration-500 hover:-translate-y-1 hover:shadow-2xl hover:border-[#D2B48C]/30">
                
                {/* Horizontal Left Side with Image Cover */}
                <div className="md:w-[55%] relative overflow-hidden h-[300px] md:h-auto min-h-[350px]">
                  <img
                    src={teluguKitchenBook.image}
                    alt={teluguKitchenBook.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-yellow-500/20 text-[#D2B48C] text-[9px] font-bold tracking-widest uppercase">
                    {teluguKitchenBook.tag || 'Best Seller'}
                  </div>
                </div>

                {/* Horizontal Right Side with Rich Metadata specs */}
                <div className="md:w-[45%] p-8 md:p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="font-serif text-2xl md:text-3.5xl text-white font-semibold leading-tight leading-none">
                      {teluguKitchenBook.title}
                    </h3>
                    <p className="font-sans text-sm text-[#c4c7c7] font-light leading-relaxed">
                      {teluguKitchenBook.description}
                    </p>

                    <div className="flex items-center gap-2.5 text-[#D2B48C] bg-[#D2B48C]/10 px-4 py-2 rounded-lg border border-[#D2B48C]/20 w-fit">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-sans text-xs font-bold tracking-widest uppercase">
                        60+ MAP BLUEPRINTS
                      </span>
                    </div>

                    {/* Features list */}
                    <ul className="text-xs text-[#c4c7c7]/80 space-y-1.5 pt-3 font-light">
                      {teluguKitchenBook.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D2B48C]" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Add action price drawer */}
                  <div className="flex items-end justify-between pt-8 border-t border-[#e5e2e1]/10 mt-6">
                    <div className="flex flex-col">
                      <span className="font-sans text-xs text-[#c4c7c7]/50 line-through">
                        ₹{teluguKitchenBook.oldPrice?.toLocaleString('en-IN')}
                      </span>
                      <span className="font-serif text-2xl md:text-3xl text-white font-bold leading-none">
                        ₹{teluguKitchenBook.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={() => triggerAddToCart(teluguKitchenBook)}
                      className={`w-12 h-12 rounded-full cursor-pointer flex items-center justify-center transition-all shadow-xl ${
                        successAnimationItem === teluguKitchenBook.id
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-[#D2B48C] text-[#402d10] hover:bg-[#feddb3] hover:scale-110'
                      }`}
                      aria-label="Add The High-Protein Telugu Kitchen to cart"
                    >
                      {successAnimationItem === teluguKitchenBook.id ? (
                        <Check className="w-5 h-5 animate-bounce" />
                      ) : (
                        <ShoppingCart className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Cookbook 2: Air Fryer Slim Card (Col span 4) */}
          {airFryerBook && (selectedCategory === 'all' || selectedCategory === 'air-fryer') && (
            <div className="md:col-span-12 lg:col-span-4 group" id="airfryer-slim-card">
              <div className="glass-panel overflow-hidden rounded-xl h-full flex flex-col justify-between min-h-[480px] transition-transform duration-500 hover:-translate-y-1 hover:shadow-2xl hover:border-[#D2B48C]/30 relative">
                
                {/* Full-bleed card styled precisely like image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={airFryerBook.image}
                    alt={airFryerBook.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                {/* Cover Contents */}
                <div className="relative z-10 p-8 h-full flex flex-col justify-end gap-5 mt-auto">
                  <span className="text-xs font-sans tracking-[0.2em] text-[#D2B48C] font-semibold uppercase">
                    EASY PREP Blueprints
                  </span>
                  <div>
                    <h3 className="font-serif text-3xl text-white font-semibold leading-tight mb-2">
                      {airFryerBook.title}
                    </h3>
                    <p className="font-sans text-xs text-[#c4c7c7] font-light leading-relaxed opacity-90 line-clamp-2">
                      Perfect crispy roasted bites and calorie minimized treats in ultra high speed.
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="font-serif text-2xl text-white font-bold">
                      ₹{airFryerBook.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => triggerAddToCart(airFryerBook)}
                      className={`px-5 py-2 rounded font-sans text-[10px] font-bold tracking-widest uppercase border cursor-pointer transition-all ${
                        successAnimationItem === airFryerBook.id
                          ? 'bg-emerald-500 text-white border-emerald-500 animate-pulse'
                          : 'bg-[#121212]/80 text-[#e5e2e1] border-[#e5e2e1]/20 hover:bg-[#D2B48C] hover:text-[#402d10] hover:border-[#D2B48C]'
                      }`}
                    >
                      {successAnimationItem === airFryerBook.id ? 'ADDED ✓' : isSignedIn ? 'ADD TO CART' : 'SIGN IN TO BUY'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Cookbook 3: Medium Horizontal/Vertical Prep Bento (Col span 5 on desktop) */}
          {mealPrepBook && (selectedCategory === 'all' || selectedCategory === 'high-protein') && (
            <div className="md:col-span-12 lg:col-span-5 group" id="meal-prep-card">
              <div className="glass-panel overflow-hidden rounded-xl h-full flex flex-col justify-between transition-transform duration-500 hover:-translate-y-1 hover:shadow-2xl hover:border-[#D2B48C]/30">
                <div className="p-8 pb-4 space-y-3">
                  <span className="font-sans text-[10px] tracking-widest text-[#D2B48C] font-bold uppercase">
                    7-DAY SCIENTIFIC SYSTEM
                  </span>
                  <h3 className="font-serif text-2.5xl text-white font-semibold leading-tight">
                    {mealPrepBook.title}
                  </h3>
                  <p className="font-sans text-sm text-[#c4c7c7] font-light leading-relaxed">
                    {mealPrepBook.description}
                  </p>
                  
                  <div className="flex gap-2.5 pt-2">
                    <span className="bg-[#20201f] text-[#c8c6c5] px-3 py-1 rounded text-[9px] font-bold tracking-wider uppercase border border-white/5">
                      7-DAY BLUEPRINTS
                    </span>
                    <span className="bg-[#20201f] text-[#c8c6c5] px-3 py-1 rounded text-[9px] font-bold tracking-wider uppercase border border-white/5">
                      SHOPPING CHECKS
                    </span>
                  </div>
                </div>

                <div className="relative h-[220px] overflow-hidden mt-6">
                  <img
                    src={mealPrepBook.image}
                    alt={mealPrepBook.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle hover blur dimming */}
                  <div className="absolute inset-0 bg-[#121212]/15 group-hover:bg-[#121212]/0 transition-colors duration-300" />
                  
                  <div className="absolute bottom-4 right-4">
                    <button
                      onClick={() => triggerAddToCart(mealPrepBook)}
                      className={`px-6 py-3 cursor-pointer rounded-full font-sans text-[10px] font-semibold tracking-widest uppercase flex items-center gap-2 mt-auto shadow-2xl transition-all hover:scale-105 active:scale-95 ${
                        successAnimationItem === mealPrepBook.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[#D2B48C] text-[#402d10] hover:bg-[#feddb3]'
                      }`}
                    >
                      {successAnimationItem === mealPrepBook.id ? (
                        <>ADDED ✓</>
                      ) : (
                        <>
                          {isSignedIn ? `Buy Now ₹${mealPrepBook.price.toLocaleString('en-IN')}` : 'Sign in to buy'} <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cookbook 4: Newsletter Call out Block Card (Col span 7 on desktop) */}
          <div className="md:col-span-12 lg:col-span-7">
            <div className="bg-[#20201f]/40 border border-[#D2B48C]/15 rounded-xl h-full p-10 md:p-12 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#D2B48C]/5 rounded-full blur-[80px]" />
              
              <div className="relative z-10 max-w-xl space-y-6">
                <BookOpen className="w-12 h-12 text-[#D2B48C] opacity-80" />
                <div className="space-y-2">
                  <h3 className="font-serif text-3xl text-[#D2B48C] font-semibold leading-tight">
                    Join the Kitchen Telegram &amp; Newsletter
                  </h3>
                  <p className="font-sans text-sm text-[#c4c7c7] font-light leading-relaxed">
                    Get premium recipes, nutrition strategies, and fat-loss guidance delivered straight to your mailbox every Sunday morning.
                  </p>
                </div>

                {isSubscribed ? (
                  <div className="bg-emerald-900/20 border border-emerald-500/30 p-5 rounded-lg text-emerald-400 text-sm font-sans flex items-center gap-3 animate-fade-in-down">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>Thank you for joining! The Sunday Newsletter strategy guide is on its way.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full gap-3 mt-4">
                    <input
                      type="email"
                      required
                      value={subscribedEmail}
                      onChange={(e) => setSubscribedEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-grow bg-[#131313] border border-[#e5e2e1]/10 text-white rounded px-5 py-3.5 font-sans text-sm focus:outline-none focus:border-[#D2B48C] focus:ring-1 focus:ring-[#D2B48C]"
                    />
                    <button
                      type="submit"
                      className="bg-[#D2B48C] hover:bg-[#feddb3] cursor-pointer text-[#402d10] font-sans font-bold text-xs tracking-widest px-8 py-3.5 rounded transition-colors whitespace-nowrap uppercase"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Quote Section inside image description */}
      <section className="py-24 md:py-28 bg-[#131110] border-t border-b border-[#e5e2e1]/5">
        <div className="px-6 md:px-16 max-w-7xl mx-auto text-center space-y-8">
          <Quote className="w-12 h-12 text-[#D2B48C]/30 mx-auto" />
          <h2 className="font-serif italic text-2xl sm:text-3xl md:text-4.5xl text-[#e5e2e1] max-w-4xl mx-auto leading-[1.3] font-light">
            &ldquo;Healthy eating shouldn't be a compromise. It’s an elevation of daily rituals through mindful preparation and premium ingredients.&rdquo;
          </h2>
          <div className="w-10 h-[1.5px] bg-[#D2B48C] mx-auto opacity-60" />
          <p className="font-sans text-xs tracking-[0.35em] text-[#D2B48C] font-semibold uppercase">
            SAKETH KRISHNA
          </p>
        </div>
      </section>
    </div>
  );
}
