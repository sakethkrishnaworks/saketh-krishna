import { ArrowRight, Sparkles } from 'lucide-react';
import SK from '../../assets/sk.jpg';
import { ASSET_IMAGES } from '../data';
import { ActiveTab } from '../types';

interface HomeViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onReadStory: () => void;
}

export default function HomeView({ onNavigate, onReadStory }: HomeViewProps) {
  return (
    <div className="relative">
      {/* Cinematic Hero Segment */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Immersive Dark Food Backdrop with subtle overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={ASSET_IMAGES.heroBg}
            alt="Cinematic gourmet dark culinary dish"
            className="w-full h-full object-cover brightness-[40%] scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Subtle gradient to mask borders smoothly */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/30 via-[#121212]/80 to-[#121212]" />
        </div>

        {/* Hero Interactive Text Component */}
        <div className="relative z-10 w-full max-w-7xl px-6 md:px-16 text-center mt-12">
          <div className="flex flex-col items-center gap-8">
            <span className="font-sans text-xs tracking-[0.45em] text-[#D2B48C] font-semibold uppercase animate-pulse flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> CINEMATIC WELLNESS
            </span>

            <h2 className="font-serif text-4xl sm:text-5xl md:text-7.5xl max-w-5xl leading-[1.1] text-[#e5e2e1] tracking-tight text-center select-none font-bold">
              Healthy Food. <br className="sm:hidden" />
              Sustainable Fat Loss. <br />
              Elevated Living.
            </h2>

            <div className="flex flex-col sm:flex-row gap-5 mt-4 min-w-[220px]">
              <button
                onClick={() => onNavigate('cookbooks')}
                className="px-10 py-4 bg-[#D2B48C] hover:bg-[#feddb3] text-[#402d10] font-sans font-bold tracking-widest text-xs uppercase cursor-pointer rounded shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                Buy Cookbooks
              </button>
              <button
                onClick={() => onNavigate('coaching')}
                className="px-10 py-4 border border-[#e5e2e1]/30 hover:border-[#D2B48C] hover:bg-white/5 text-[#e5e2e1] font-sans tracking-widest text-xs uppercase cursor-pointer rounded transition-all hover:scale-[1.03]"
              >
                Start Coaching
              </button>
            </div>

            {/* Social Trust Metrics */}
            <div className="mt-16 flex flex-col md:flex-row justify-center gap-10 md:gap-16 border-t border-[#e5e2e1]/10 pt-10 w-full max-w-xl mx-auto">
              <div className="flex flex-col items-center gap-1 group">
                <span className="font-serif text-3xl md:text-4xl text-[#c8c6c5] font-semibold group-hover:text-[#D2B48C] transition-colors">
                  10K+
                </span>
                <span className="font-sans text-[10px] tracking-widest text-[#c4c7c7] uppercase">
                  meals inspired
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 group">
                <span className="font-serif text-3xl md:text-4xl text-[#c8c6c5] font-semibold group-hover:text-[#D2B48C] transition-colors">
                  50K+
                </span>
                <span className="font-sans text-[10px] tracking-widest text-[#c4c7c7] uppercase">
                  fitness community
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 opacity-60">
          <span className="font-sans text-[9px] tracking-[0.3em] text-[#e5e2e1]/60 font-semibold uppercase">
            SCROLL
          </span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-[#D2B48C] to-transparent animate-pulse" />
        </div>
      </section>

      {/* Meet Saketh Redefining Section */}
      <section className="relative py-28 md:py-36 bg-[#121212] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* Left Image Side in Bento Style styling */}
            <div className="md:col-span-5 relative group" id="hero-portrait-section">
              <div className="aspect-[4/5] overflow-hidden rounded-lg bg-[#1b1b1b] border border-white/5 relative shadow-2xl">
                <img
                  src={SK.src}
                  alt="Chef Saketh Krishna in dark culinary attire"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>

              {/* Decorative Floating Frame */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b border-r border-[#D2B48C]/30 hidden md:block pointer-events-none group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-500" />
            </div>

            {/* Right Copy Description text side */}
            <div className="md:col-span-7">
              <span className="font-sans text-[10px] tracking-[0.3em] text-[#D2B48C] font-semibold mb-3 block uppercase">
                THE VISIONARY
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#e5e2e1] mb-6 leading-[1.2] font-semibold">
                Meet Saketh: The Young Telugu Chef redefining Indian fitness food.
              </h3>
              <p className="font-sans text-base md:text-lg text-[#c4c7c7] leading-[1.6] mb-8 font-light max-w-2xl">
                Bridging the gap between traditional flavors and modern nutrition, Saketh has pioneered a lifestyle approach where gourmet dining meets rigorous fat-loss science. His methods aren't just about recipes; they are about elevating the human experience through conscious consumption.
              </p>
              <button
                onClick={onReadStory}
                className="inline-flex items-center gap-3 group text-[#e5e2e1] hover:text-[#D2B48C] transition-colors focus:outline-none"
              >
                <span className="font-sans text-xs font-bold tracking-widest uppercase border-b border-[#e5e2e1] pb-1 group-hover:border-[#D2B48C] group-hover:text-[#D2B48C] transition-all">
                  READ THE FULL STORY
                </span>
                <ArrowRight className="w-4 h-4 text-[#D2B48C] group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Concepts Grid Column */}
      <section className="py-24 md:py-32 bg-[#0e0e0e] border-t border-[#e5e2e1]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-5">
            <div>
              <span className="font-sans text-[10px] tracking-[0.3em] text-[#D2B48C] font-semibold mb-3 block uppercase">
                CURATED COLLECTIONS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5.5xl font-semibold text-[#e5e2e1]">
                Signature Concepts
              </h2>
            </div>
            <p className="font-sans text-sm md:text-base text-[#c4c7c7]/80 max-w-md md:text-right font-light leading-relaxed">
              Explore a meticulously curated selection of nutritional programs designed for peak performance and aesthetic excellence.
            </p>
          </div>

          {/* Asymmetric Bento Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bento Item 1 (Vegan Blueprint - Plant-Based) */}
            <div
              onClick={() => onNavigate('cookbooks')}
              className="md:col-span-2 group relative overflow-hidden rounded-xl border border-white/5 h-[400px] cursor-pointer shadow-lg hover:border-[#D2B48C]/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
            >
              <img
                src={ASSET_IMAGES.veganBlueprint}
                alt="Colorful vegan plant-based bowls"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col items-start gap-4">
                <span className="bg-emerald-950/40 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-emerald-500/20 backdrop-blur-md">
                  PLANT-BASED
                </span>
                <div>
                  <h4 className="font-serif text-2xl md:text-3xl text-white font-bold mb-2">
                    The Vegan Blueprint
                  </h4>
                  <p className="font-sans text-xs md:text-sm text-[#c4c7c7] font-light max-w-md line-clamp-2">
                    Redefining protein intake without animal products. Sustainable, ethical, high-quality, and high-performance.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Item 2 (Lean 30 - High Protein) */}
            <div
              onClick={() => onNavigate('cookbooks')}
              className="md:col-span-1 group relative overflow-hidden rounded-xl border border-white/5 h-[400px] cursor-pointer shadow-lg hover:border-[#D2B48C]/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
            >
              <img
                src={ASSET_IMAGES.lean30}
                alt="Salmon dish served with citrus"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-start gap-4">
                <span className="bg-[#5b4526]/50 text-[#e1c299] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#feddb3]/10 backdrop-blur-md">
                  HIGH PROTEIN
                </span>
                <div>
                  <h4 className="font-serif text-2.5xl text-white font-bold mb-2">
                    Lean 30
                  </h4>
                  <p className="font-sans text-xs text-[#c4c7c7] font-light line-clamp-2">
                    30-day transformation focused on high-satiety, nutrient-dense culinary masterpieces.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
