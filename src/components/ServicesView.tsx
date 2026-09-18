'use client';

import { useState } from 'react';
import { Briefcase, CheckCircle, ChefHat, Loader2, Mail, MessageCircle } from 'lucide-react';
import { CONTACT, RECIPE_DEVELOPMENT, RESTAURANT_CONSULTING } from '../data';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastProvider';

interface ServicesViewProps {
  isSignedIn: boolean;
  onLogin: () => void;
  userId?: string;
  userName: string;
  userEmail: string;
}

function ServiceCard({ icon: Icon, title, priceLine, description, services }: {
  icon: typeof Briefcase;
  title: string;
  priceLine: string;
  description: string;
  services: string[];
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 md:p-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-10 h-10 rounded-lg bg-[#D2B48C]/15 border border-[#D2B48C]/30 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#D2B48C]" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-serif text-base text-white font-semibold leading-tight">{title}</h2>
          <p className="font-sans text-[10px] font-bold text-[#D2B48C] tracking-wider uppercase">{priceLine}</p>
        </div>
      </div>
      <p className="font-sans text-xs text-[#a0a0a0] leading-relaxed mb-4">{description}</p>
      <div className="grid grid-cols-2 gap-2">
        {services.map((service) => (
          <div key={service} className="flex items-center gap-2 bg-[#0c0c0b] border border-[#2a2a2a] rounded-lg px-3 py-2.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" aria-hidden="true" />
            <span className="font-sans text-[11px] text-white">{service}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServicesView({ isSignedIn, onLogin, userId, userName, userEmail }: ServicesViewProps) {
  const { toast } = useToast();
  const [service, setService] = useState('Restaurant Consulting');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !userId) {
      onLogin();
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('inquiries').insert({
        id: `inq_${userId}_${Date.now()}`,
        user_id: userId,
        name: userName || 'Client',
        email: userEmail,
        service,
        budget: budget || null,
        message: message || null,
        status: 'new',
      });
      if (error) throw error;
      setIsSuccess(true);
      setBudget('');
      setMessage('');
      toast('Inquiry sent. Expect a reply within 48 hours.', 'success');
    } catch (err) {
      console.error('Inquiry failed:', err);
      toast('Could not send your inquiry. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0b] pt-14 pb-10 px-5 safe-bottom">
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-tight mb-2">
            Services
          </h1>
          <p className="font-sans text-xs text-[#a0a0a0]">For businesses, brands, and serious food projects</p>
        </div>

        <div className="flex flex-col gap-3.5 mb-10">
          <ServiceCard
            icon={Briefcase}
            title={RESTAURANT_CONSULTING.title}
            priceLine={`Starting ₹${RESTAURANT_CONSULTING.startingPrice.toLocaleString('en-IN')}+`}
            description={RESTAURANT_CONSULTING.description}
            services={RESTAURANT_CONSULTING.services}
          />
          <ServiceCard
            icon={ChefHat}
            title={RECIPE_DEVELOPMENT.title}
            priceLine={`₹${RECIPE_DEVELOPMENT.priceMin.toLocaleString('en-IN')}–${RECIPE_DEVELOPMENT.priceMax.toLocaleString('en-IN')} per recipe`}
            description={RECIPE_DEVELOPMENT.description}
            services={RECIPE_DEVELOPMENT.services}
          />
        </div>

        <div className="mb-10">
          <h2 className="font-serif text-lg text-white font-semibold mb-4">Request a Quote</h2>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 md:p-6">
            {!isSignedIn ? (
              <div className="text-center">
                <p className="font-sans text-xs text-[#D2B48C] mb-3">Sign in to send an inquiry.</p>
                <button onClick={onLogin} className="bg-[#D2B48C] text-[#0c0c0b] px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#feddb3]">
                  Sign In With Google
                </button>
              </div>
            ) : isSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="font-serif text-xl text-white font-semibold">Inquiry received</h3>
                <p className="font-sans text-xs text-[#a0a0a0]">We reply within 48 hours on your registered email.</p>
                <button onClick={() => setIsSuccess(false)} className="bg-[#1a1a1a] border border-[#2a2a2a] text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:border-[#D2B48C]/40">
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="font-sans text-[9px] font-bold text-[#a0a0a0] tracking-wider uppercase block mb-1.5">Service</span>
                  <select value={service} onChange={(e) => setService(e.target.value)}
                    className="w-full bg-[#0c0c0b] border border-[#2a2a2a] text-white rounded-lg px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#D2B48C]">
                    <option>Restaurant Consulting</option>
                    <option>Recipe Development</option>
                    <option>Something else</option>
                  </select>
                </label>
                <label className="block">
                  <span className="font-sans text-[9px] font-bold text-[#a0a0a0] tracking-wider uppercase block mb-1.5">Budget range (optional)</span>
                  <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. ₹25,000 – ₹50,000"
                    className="w-full bg-[#0c0c0b] border border-[#2a2a2a] text-white rounded-lg px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#D2B48C]" />
                </label>
                <label className="block">
                  <span className="font-sans text-[9px] font-bold text-[#a0a0a0] tracking-wider uppercase block mb-1.5">Project details</span>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                    placeholder="Tell us about your restaurant, brand, or idea…"
                    className="w-full bg-[#0c0c0b] border border-[#2a2a2a] text-white rounded-lg px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#D2B48C] resize-none" />
                </label>
                <button type="submit" disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#D2B48C] hover:bg-[#feddb3] text-[#0c0c0b] font-sans font-bold text-xs tracking-wider rounded-lg transition-all uppercase disabled:opacity-40 flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Sending…' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-serif text-lg text-white font-semibold mb-4">Contact</h2>
          <div className="flex flex-col gap-2.5">
            <a href={CONTACT.instagram} target="_blank" rel="noreferrer"
              className="flex items-center justify-between px-5 py-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#D2B48C]/30 transition-all active:scale-[0.98]">
              <span className="font-sans text-sm font-medium text-white">Instagram · {CONTACT.instagramHandle}</span>
              <span className="font-sans text-[10px] font-bold tracking-wider uppercase text-[#D2B48C]">Follow</span>
            </a>
            <a href={`mailto:${CONTACT.email}`}
              className="flex items-center justify-between px-5 py-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#D2B48C]/30 transition-all active:scale-[0.98]">
              <span className="font-sans text-sm font-medium text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D2B48C]" aria-hidden="true" /> {CONTACT.email}
              </span>
              <span className="font-sans text-[10px] font-bold tracking-wider uppercase text-[#D2B48C]">Email</span>
            </a>
            {CONTACT.whatsapp ? (
              <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer"
                className="flex items-center justify-between px-5 py-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#D2B48C]/30 transition-all active:scale-[0.98]">
                <span className="font-sans text-sm font-medium text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#D2B48C]" aria-hidden="true" /> WhatsApp
                </span>
                <span className="font-sans text-[10px] font-bold tracking-wider uppercase text-[#D2B48C]">Chat</span>
              </a>
            ) : (
              <div className="px-5 py-4 rounded-xl bg-[#1a1a1a] border border-dashed border-[#2a2a2a]">
                <span className="font-sans text-xs text-[#a0a0a0]">WhatsApp number coming soon.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
