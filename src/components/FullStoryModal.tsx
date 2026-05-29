import { X, Quote, Heart, Award, ShieldAlert } from 'lucide-react';
import { ASSET_IMAGES } from '../data';

interface FullStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FullStoryModal({ isOpen, onClose }: FullStoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      {/* Dark blur backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Editorial Modal Card */}
      <div className="relative bg-[#171615] border border-white/15 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Chef portrait backdrop (Col span 4) */}
        <div className="md:w-[35%] relative h-[250px] md:h-auto min-h-[300px] border-r border-[#e5e2e1]/10 bg-zinc-950">
          <img
            src={ASSET_IMAGES.chefPortrait}
            alt="Chef Saketh portrait closeup"
            className="w-full h-full object-cover brightness-[80%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#171615] via-transparent to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 space-y-1.5 md:block hidden">
            <span className="font-sans text-[8px] tracking-widest text-[#D2B48C] font-semibold uppercase">FOUNDER PROFILE</span>
            <h4 className="font-serif text-lg text-white font-semibold">Chef Saketh Krishna</h4>
            <p className="font-sans text-[10px] text-white/50 font-light leading-relaxed">Pioneering a luxury state of metabolic harmony.</p>
          </div>
        </div>

        {/* Right Side: Editorial article contents (Col span 8) */}
        <div className="md:w-[65%] p-8 md:p-12 overflow-y-auto space-y-8 select-text">
          
          {/* Header Action Row */}
          <div className="flex justify-between items-start border-b border-white/10 pb-6">
            <div className="space-y-1">
              <span className="font-sans text-[9px] tracking-[0.25em] text-[#D2B48C] font-semibold uppercase">EXECUTIVE STORY</span>
              <h2 className="font-serif text-2.5xl md:text-3.5xl text-white font-medium leading-tight">
                Redefining the Telugu Fitness Kitchen
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className="text-[#e5e2e1] hover:text-[#D2B48C] hover:bg-white/5 p-2 rounded-full border border-white/10 transition-all cursor-pointer"
              aria-label="Close story modal"
              id="close-story-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Article Editorial text block */}
          <div className="space-y-6 font-sans text-sm text-[#c4c7c7] font-light leading-relaxed">
            
            <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-[#D2B48C] first-letter:mr-3 first-letter:float-left first-letter:leading-none">
              Traditional Indian cuisine is often mischaracterized as either overwhelmingly heavy or overly restrictive. For decades, South Indian fitness enthusiasts believed they had to discard the comforting spices of their home heritage to attain elite physique levels. 
            </p>

            <blockquote className="my-8 pl-6 border-l-2 border-[#D2B48C] italic font-serif text-base text-[#e5e2e1]/90 py-1 space-y-2">
              <Quote className="w-6 h-6 text-[#D2B48C]/30 -ml-1" />
              <span>&ldquo;You do not need to replace your native curd rice with dry chicken breast to lose body fat. The science is in molecular balance and high-purity execution.&rdquo;</span>
            </blockquote>

            <p>
              By leveraging precise macro calculations, smart fiber ratios, and innovative preparation methodologies, Saketh has optimized classic elements like Dosa, Idli, and curated curries for elite sports performance. His books combine Michelin-level culinary standards with rigorous nutrition science to ensure you are never subjected to bland caloric deprivation.
            </p>

            <h4 className="font-serif text-white font-semibold text-lg pt-4">Sustainable Fat Loss Meets Artistry</h4>
            <p>
              Saketh’s philosophy stems from a simple, unyielding blueprint: <strong>Sustainability underpins longevity.</strong> If your diet plan feels like clinical punishment, your body will eventually rebel. By matching exquisite flavors with dynamic accountability metrics, his clients realize that clean, luxurious eating is is not a temporary regimen—it is a permanent upgrade of their daily ritual.
            </p>

            {/* Core Pillars grids */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#D2B48C]" />
                  <span className="font-serif text-xs font-semibold text-white">Flavor First</span>
                </div>
                <p className="text-[11px] text-[#c4c7c7]/70 font-light">
                  Aromatic premium spices chosen for culinary pleasure as well as insulin support.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#D2B48C]" />
                  <span className="font-serif text-xs font-semibold text-white">Macro Precision</span>
                </div>
                <p className="text-[11px] text-[#c4c7c7]/70 font-light">
                  Avg 42g protein ratios explicitly integrated to keep muscle mass peakconditioned.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#D2B48C]" />
                  <span className="font-serif text-xs font-semibold text-white">Zero Bloat</span>
                </div>
                <p className="text-[11px] text-[#c4c7c7]/70 font-light">
                  Eliminating inflammatory fillers and high glycemic spikes. Continuous energy focus.
                </p>
              </div>
            </div>

          </div>

          {/* Bottom Call action block */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#D2B48C] hover:bg-[#feddb3] cursor-pointer text-[#402d10] font-sans font-bold tracking-widest text-[10px] uppercase rounded transition-colors"
            >
              Continue Reading Store
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
