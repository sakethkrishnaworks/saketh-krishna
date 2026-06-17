import { ArrowLeft, Quote, Heart, Award, ShieldAlert } from 'lucide-react';
import { ActiveTab } from '../types';
import { ASSET_IMAGES } from '../data';

interface StoryViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export default function StoryView({ onNavigate }: StoryViewProps) {
  return (
    <div className="min-h-screen bg-[#0c0c0b] pt-14 pb-10 safe-bottom">
      <div className="max-w-md mx-auto px-5">
        {/* Back button */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1 text-[#a0a0a0] hover:text-white transition-colors min-h-[44px] active:scale-95 mb-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-medium">Back</span>
        </button>

        {/* Hero section */}
        <div className="relative w-full rounded-xl overflow-hidden mb-6" style={{ height: '480px' }}>
          <img
            src={ASSET_IMAGES.readStory}
            alt="Chef Saketh"
            className="w-full h-full object-cover brightness-[70%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0b] via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="font-sans text-[8px] tracking-widest text-[#D2B48C] font-semibold uppercase">FOUNDER PROFILE</span>
            <h2 className="font-serif text-xl text-white font-semibold">Chef Saketh Krishna</h2>
          </div>
        </div>

        {/* Story content */}
        <div className="space-y-6 font-sans text-sm text-[#c4c7c7] font-light leading-relaxed">
          <div className="space-y-1">
            <span className="font-sans text-[9px] tracking-[0.25em] text-[#D2B48C] font-semibold uppercase">EXECUTIVE STORY</span>
            <h1 className="font-serif text-2xl text-white font-medium leading-tight">From Pastry Chef to Bare Kitchen</h1>
          </div>

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

          <h4 className="font-serif text-white font-semibold text-lg pt-2">From His Kitchen to Yours</h4>

          <p>
            Saketh started posting his meals online. No fancy studio, just his stovetop and a phone camera. High-protein Indian food that didn&rsquo;t look like hospital fare. Dosa with 30g of protein. Air fryer chicken that was actually juicy. Curries that fit macros without losing soul. The response was overwhelming — thousands of people living alone, working full-time, or juggling college and fitness, all asking the same thing: <em>&ldquo;Can you teach me?&rdquo;</em>
          </p>

          <p>
            That became the mission. Not just recipes, but a system. He built @barekitchenco as a way to bring chef-level thinking into everyday cooking for people who don&rsquo;t have hours to spend in the kitchen. Every recipe is designed to be meal-prep friendly, high in protein, and low in effort — because if it&rsquo;s not easy, you won&rsquo;t stick with it.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="space-y-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-[#D2B48C]" />
                <span className="font-serif text-xs font-semibold text-white">Chef-Level Taste</span>
              </div>
              <p className="text-[11px] text-[#c4c7c7]/70 font-light">
                Trained pastry chef techniques applied to healthy cooking. Every bite is intentional.
              </p>
            </div>

            <div className="space-y-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-[#D2B48C]" />
                <span className="font-serif text-xs font-semibold text-white">Protein-First</span>
              </div>
              <p className="text-[11px] text-[#c4c7c7]/70 font-light">
                40g+ protein per meal without the blandness. Designed for muscle and satiety.
              </p>
            </div>

            <div className="space-y-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
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
  );
}
