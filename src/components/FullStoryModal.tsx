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
            src={ASSET_IMAGES.readStory}
            alt="Chef Saketh portrait closeup"
            className="w-full h-full object-cover brightness-[80%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#171615] via-transparent to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 space-y-1.5 md:block hidden">
            <span className="font-sans text-[8px] tracking-widest text-[#D2B48C] font-semibold uppercase">FOUNDER PROFILE</span>
            <h4 className="font-serif text-lg text-white font-semibold">Chef Saketh Krishna</h4>
            <p className="font-sans text-[10px] text-white/50 font-light leading-relaxed">High-protein cooking made simple.</p>
          </div>
        </div>

        {/* Right Side: Editorial article contents (Col span 8) */}
        <div className="md:w-[65%] p-8 md:p-12 overflow-y-auto space-y-8 select-text">

          {/* Header Action Row */}
          <div className="flex justify-between items-start border-b border-white/10 pb-6">
            <div className="space-y-1">
              <span className="font-sans text-[9px] tracking-[0.25em] text-[#D2B48C] font-semibold uppercase">EXECUTIVE STORY</span>
              <h2 className="font-serif text-2.5xl md:text-3.5xl text-white font-medium leading-tight">
                From Pastry Chef to Bare Kitchen
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
              Saketh was a pastry chef. He spent years in professional kitchens where butter, sugar, and cream were the foundation of everything beautiful. He could plate a dessert that looked like art. But behind the counter, his own health was falling apart.
            </p>

            <p>
              Long hours, erratic eating, and a body running on caffeine and leftover pastry — it caught up. He hit a point where he looked in the mirror and didn&rsquo;t recognise himself. That&rsquo;s when he realised: knowing how to cook isn&rsquo;t the same as knowing how to eat.
            </p>

            <blockquote className="my-8 pl-6 border-l-2 border-[#D2B48C] italic font-serif text-base text-[#e5e2e1]/90 py-1 space-y-2">
              <Quote className="w-6 h-6 text-[#D2B48C]/30 -ml-1" />
              <span>&ldquo;I could make a croissant blindfolded, but I couldn&rsquo;t fuel my own body to get through a day without crashing. Something had to change.&rdquo;</span>
            </blockquote>

            <p>
              So he went back to the basics. He took his culinary training and applied it to himself — not with deprivation, but with precision. He learned to reverse-engineer the flavours he loved into meals that worked for fat loss. The same techniques that made pastries indulgent could make chicken breast exciting. The same knife skills could turn meal prep into a ritual, not a chore.
            </p>

            <h4 className="font-serif text-white font-semibold text-lg pt-4">From His Kitchen to Yours</h4>
            <p>
              Saketh started posting his meals online. No fancy studio, just his stovetop and a phone camera. High-protein Indian food that didn&rsquo;t look like hospital fare. Dosa with 30g of protein. Air fryer chicken that was actually juicy. Curries that fit macros without losing soul. The response was overwhelming — thousands of people living alone, working full-time, or juggling college and fitness, all asking the same thing: <em>&ldquo;Can you teach me?&rdquo;</em>
            </p>

            <p>
              That became the mission. Not just recipes, but a system. He built @barekitchenco as a way to bring chef-level thinking into everyday cooking for people who don&rsquo;t have hours to spend in the kitchen. Every recipe is designed to be meal-prep friendly, high in protein, and low in effort — because if it&rsquo;s not easy, you won&rsquo;t stick with it.
            </p>

            {/* Core Pillars grids */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#D2B48C]" />
                  <span className="font-serif text-xs font-semibold text-white">Chef-Level Taste</span>
                </div>
                <p className="text-[11px] text-[#c4c7c7]/70 font-light">
                  Trained pastry chef techniques applied to healthy cooking. Every bite is intentional.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#D2B48C]" />
                  <span className="font-serif text-xs font-semibold text-white">Protein-First</span>
                </div>
                <p className="text-[11px] text-[#c4c7c7]/70 font-light">
                  40g+ protein per meal without the blandness. Designed for muscle and satiety.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#D2B48C]" />
                  <span className="font-serif text-xs font-semibold text-white">Real-Life Practical</span>
                </div>
                <p className="text-[11px] text-[#c4c7c7]/70 font-light">
                  Built for solo cooks, students, and busy professionals. Meal prep that actually fits your week.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
