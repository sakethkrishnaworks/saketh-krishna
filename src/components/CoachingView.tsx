import React, { useEffect, useState } from 'react';
import { Calendar, Phone, Mail, Clock, ArrowRight, UserCheck, Star, Users, CheckCircle, Video } from 'lucide-react';
import { DIET_PLANS, TESTIMONIALS_DATA, ASSET_IMAGES } from '../data';
import { EventSession, DietPlan } from '../types';

interface CoachingViewProps {
  events: EventSession[];
  dietPlans: DietPlan[];
  isSignedIn: boolean;
  onLogin: () => void;
  userName: string;
  userEmail: string;
}

export default function CoachingView({ events, dietPlans, isSignedIn, onLogin, userName, userEmail }: CoachingViewProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [bookedSessions, setBookedSessions] = useState<string[]>([]);
  const [authPrompt, setAuthPrompt] = useState<string>('');
  const [transformationUser, setTransformationUser] = useState<'marcus' | 'elena'>('marcus');
  const [transformationSlider, setTransformationSlider] = useState<number>(50); // 0-100 percentage layout slider

  // Real consultation booking state
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [bookingName, setBookingName] = useState<string>('');
  const [bookingEmail, setBookingEmail] = useState<string>('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState<boolean>(false);
  const [isBookingSuccess, setIsBookingSuccess] = useState<boolean>(false);

  const availableDays = [
    { value: '2026-06-01', label: 'Mon, June 1' },
    { value: '2026-06-02', label: 'Tue, June 2' },
    { value: '2026-06-03', label: 'Wed, June 3' },
    { value: '2026-06-04', label: 'Thu, June 4' },
    { value: '2026-06-05', label: 'Fri, June 5' },
  ];

  const availableTimes = [
    '09:00 AM EST',
    '11:30 AM EST',
    '02:00 PM EST',
    '04:30 PM EST',
  ];

  useEffect(() => {
    if (!bookingName && userName) setBookingName(userName);
    if (!bookingEmail && userEmail) setBookingEmail(userEmail);
  }, [bookingEmail, bookingName, userEmail, userName]);

  const handleRSVP = (eventId: string) => {
    if (!isSignedIn) {
      setAuthPrompt('Please sign in with Google to join coaching calls.');
      onLogin();
      return;
    }

    if (bookedSessions.includes(eventId)) return;
    setBookedSessions([...bookedSessions, eventId]);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      setAuthPrompt('Please sign in with Google to book a coaching session.');
      onLogin();
      return;
    }

    if (!bookingDate || !bookingTime || !bookingName || !bookingEmail) return;

    setIsBookingSubmitting(true);
    setTimeout(() => {
      setIsBookingSubmitting(false);
      setIsBookingSuccess(true);
    }, 1500);
  };

  const resetBookingForm = () => {
    setIsBookingSuccess(false);
    setBookingDate('');
    setBookingTime('');
    setBookingName('');
    setBookingEmail('');
  };

  const handleSelectPlan = (planTitle: string) => {
    if (!isSignedIn) {
      setAuthPrompt('Please sign in with Google to select a coaching plan.');
      onLogin();
      return;
    }

    setSelectedPlan(planTitle);
    const el = document.getElementById('scheduler-module');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative pt-[70px]">
      {/* High-Performance Coaching Hero */}
      <section className="relative h-[550px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={ASSET_IMAGES.dietPlansHeroBg}
            alt="Organic cooking background ingredients with dark cinematic tone"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-6 md:px-16 max-w-7xl mx-auto">
          <div className="max-w-3xl space-y-4">
            <span className="font-sans text-xs tracking-[0.35em] text-[#D2B48C] font-semibold block uppercase">
              ELEVATED NUTRITION &amp; LIFESTYLE
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6.5xl leading-[1.1] text-white font-bold tracking-tight">
              Strategic Coaching &amp; <br />Bespoke Meal Plans
            </h2>
            <p className="font-sans text-base md:text-lg text-[#c4c7c7] font-light max-w-2xl leading-relaxed">
              Tailored fat-loss algorithms engineered to align your metabolic biology with gourmet culinary craft. Start living and eating with maximum performance and luxury.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Matrix Plans Column */}
      <section className="py-24 md:py-32 bg-[#121212] px-6 md:px-16 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
          <span className="font-sans text-xs tracking-[0.3em] text-[#D2B48C] font-bold uppercase">STRATEGY OPTIONS</span>
          <h2 className="font-serif text-3.5xl md:text-5.5xl text-white font-medium">Choose Your Custom Protocol</h2>
          <p className="font-sans text-sm text-[#c4c7c7] font-light leading-relaxed">
            All programs are formatted for absolute quality, providing 100% macro accuracy, weekly audits, and responsive lifestyle alignment support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {dietPlans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-panel rounded-xl overflow-hidden flex flex-col justify-between h-full transition-all duration-500 hover:-translate-y-1 relative shadow-lg ${
                plan.popular ? 'border-[#D2B48C]/40 md:scale-[1.03] shadow-[#D2B48C]/5' : 'hover:border-[#D2B48C]/25'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-[#D2B48C] text-[#402d10] font-sans text-[8px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase">
                  RECOMMENDED
                </div>
              )}

              {/* Cover Top Section */}
              <div className="relative h-[200px] overflow-hidden bg-zinc-900 border-b border-[#e5e2e1]/5">
                <img
                  src={plan.image}
                  alt={plan.title}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                />
              </div>

              {/* Specs and content */}
              <div className="p-6 flex flex-col justify-between flex-grow gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="font-sans text-[9px] tracking-widest text-[#D2B48C] font-semibold uppercase">{plan.badge}</span>
                    <h3 className="font-serif text-xl md:text-2xl text-white font-semibold leading-none">{plan.title}</h3>
                  </div>
                  <p className="font-sans text-xs text-[#c4c7c7] font-light leading-relaxed min-h-[50px]">{plan.description}</p>
                </div>

                <div className="space-y-6 pt-4 border-t border-[#e5e2e1]/10">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-3xl font-bold text-white">₹{plan.price.toLocaleString('en-IN')}</span>
                    <span className="font-sans text-xs text-[#c4c7c7]/60">/ {plan.period}</span>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.title)}
                    className={`w-full py-3.5 rounded cursor-pointer font-sans font-bold tracking-widest text-[10px] uppercase transition-colors ${
                      plan.popular
                        ? 'bg-[#D2B48C] text-[#402d10] hover:bg-[#feddb3]'
                        : 'bg-[#20201f] text-[#e5e2e1] hover:bg-white/5 border border-[#e5e2e1]/15 hover:border-[#D2B48C]/50'
                    }`}
                  >
                    {isSignedIn ? 'Select Plan' : 'Sign In To Select'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Accountability Bento Section */}
      <section className="bg-[#0e0e0e] py-24 border-t border-b border-[#e5e2e1]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual left column representation of coach details */}
            <div className="lg:col-span-5 relative group" id="coaching-portrait">
              <div className="aspect-[4/5] rounded-xl overflow-hidden relative shadow-2xl border border-white/5 bg-[#1b1b1b]">
                <img
                  src={ASSET_IMAGES.athleticHero}
                  alt="Coach Saketh Krishna modeling fitness physique in grey background"
                  className="w-full h-full object-cover grayscale-[15%] transition-all duration-700 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Embedded Floating Accountability Badge */}
                <div className="absolute bottom-6 left-6 p-4 rounded-xl glass-panel text-white max-w-xs flex gap-3.5 items-center">
                  <div className="w-10 h-10 rounded-full bg-[#D2B48C]/20 flex items-center justify-center border border-[#D2B48C]/40">
                    <UserCheck className="w-5 h-5 text-[#D2B48C]" />
                  </div>
                  <div>
                    <h5 className="font-serif text-sm font-semibold text-white">Daily Checks</h5>
                    <p className="font-sans text-[10px] text-[#c4c7c7] font-light">Direct WhatsApp accountability logs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Structured description list details on right col (cols-7) */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-3">
                <span className="font-sans text-xs tracking-[0.3em] text-[#D2B48C] font-semibold block uppercase">
                  DAILY ACCOUNTABILITY
                </span>
                <h2 className="font-serif text-3xl sm:text-4.5xl text-white font-medium leading-tight">
                  Guaranteed Alignment at every step.
                </h2>
                <p className="font-sans text-base text-[#c4c7c7] font-light leading-relaxed">
                  We don't hand you static PDFs to solve alone. Our model includes direct high-tier WhatsApp accountability loops and performance audits. 
                </p>
              </div>

              {/* Grid bullet blocks precisely structured like screen panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-900/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                    <h4 className="font-serif text-lg text-white font-semibold">24/7 WhatsApp Premium Access</h4>
                  </div>
                  <p className="font-sans text-xs text-[#c4c7c7]/80 leading-relaxed font-light pl-11">
                    Direct communication line with Coach Saketh. Micro adjustments to travel constraints, business lunches, and dynamic social events.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-950/25 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Users className="w-4 h-4" />
                    </span>
                    <h4 className="font-serif text-lg text-white font-semibold">Weekly Zoom Audits</h4>
                  </div>
                  <p className="font-sans text-xs text-[#c4c7c7]/80 leading-relaxed font-light pl-11">
                    Join private interactive classes on fat-loss biology, glycemic management, and high-protein batch preparation with peers worldwide.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#D2B48C]/15 border border-[#D2B48C]/30 flex items-center justify-center text-[#D2B48C]">
                      <Video className="w-4 h-4" />
                    </span>
                    <h4 className="font-serif text-lg text-white font-semibold">Technique Clinics</h4>
                  </div>
                  <p className="font-sans text-xs text-[#c4c7c7]/80 leading-relaxed font-light pl-11">
                    Submit clips of your batch prep flow and kitchen tool setups to optimize time and energy efficiencies. Perfect professional craft.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#556B2F]/15 border border-[#556B2F]/30 flex items-center justify-center text-[#9bc15f]">
                      <Star className="w-4 h-4" />
                    </span>
                    <h4 className="font-serif text-lg text-white font-semibold">Aesthetic Progress Tracks</h4>
                  </div>
                  <p className="font-sans text-xs text-[#c4c7c7]/80 leading-relaxed font-light pl-11">
                    Proprietary dashboards logging visual metrics, bio-feedback, energy, glycemic response, and sleep cycle states.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Before/After Transformation Slider Gallery */}
      <section className="py-24 md:py-32 bg-[#121212] border-b border-[#e5e2e1]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <span className="font-sans text-xs tracking-[0.3em] text-[#D2B48C] font-semibold block uppercase">TRANSFORMATION STORIES</span>
              <h2 className="font-serif text-3.5xl md:text-5.5xl text-white font-medium">Bespoke Living Proof</h2>
            </div>

            {/* Transformation Selector Toggles */}
            <div className="flex bg-[#20201f] rounded p-1 border border-[#e5e2e1]/10">
              <button
                onClick={() => setTransformationUser('marcus')}
                className={`px-5 py-2 cursor-pointer font-sans text-xs font-semibold rounded tracking-wider uppercase transition-colors ${
                  transformationUser === 'marcus'
                    ? 'bg-[#D2B48C] text-[#402d10]'
                    : 'text-[#c8c6c5] hover:text-white'
                }`}
              >
                Marcus R.
              </button>
              <button
                onClick={() => setTransformationUser('elena')}
                className={`px-5 py-2 cursor-pointer font-sans text-xs font-semibold rounded tracking-wider uppercase transition-colors ${
                  transformationUser === 'elena'
                    ? 'bg-[#D2B48C] text-[#402d10]'
                    : 'text-[#c8c6c5] hover:text-white'
                }`}
              >
                Elena V.
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Split screen interact slider block on left (cols-7) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <p className="font-sans text-xs text-[#c4c7c7]/50 mb-4 select-none tracking-widest uppercase">
                DRAG SLIDER TO SEE TRANSFORMATION
              </p>
              
              <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-2xl border border-white/5 select-none touch-none bg-[#1a1a1a]">
                
                {/* BEFORE PICTURE (Underneath) */}
                <img
                  src={transformationUser === 'marcus' ? ASSET_IMAGES.marcusBefore : ASSET_IMAGES.elenaBefore}
                  alt="Transformation Before status portrait"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* AFTER PICTURE (Overlaid with clip-path matching slider value) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `polygon(0 0, ${transformationSlider}% 0, ${transformationSlider}% 100%, 0 100%)` }}
                >
                  <img
                    src={transformationUser === 'marcus' ? ASSET_IMAGES.marcusAfter : ASSET_IMAGES.elenaAfter}
                    alt="Transformation After status portrait"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: '100%', height: '100%', maxWidth: 'none' }}
                  />
                </div>

                {/* SLIDER CONTROLLER STRIP */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white hover:bg-[#D2B48C] cursor-ew-resize transition-colors flex items-center justify-center z-20"
                  style={{ left: `${transformationSlider}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-[#121212]/90 border border-white/30 flex items-center justify-center text-white scale-110 shadow-xl group">
                    <span className="text-[10px] tracking-tight font-mono select-none">&lt;&gt;</span>
                  </div>
                </div>

                {/* Text Badges indicating statuses */}
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3.5 py-1 rounded text-[10px] font-bold text-[#e5e2e1] uppercase z-10 border border-white/10 select-none">
                  After Transformation
                </div>
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3.5 py-1 rounded text-[10px] font-bold text-[#D2B48C] uppercase z-10 border border-white/10 select-none">
                  Before
                </div>
              </div>

              {/* Native styling slider input range selector */}
              <input
                type="range"
                min="0"
                max="100"
                value={transformationSlider}
                onChange={(e) => setTransformationSlider(Number(e.target.value))}
                className="w-full max-w-lg mt-6 accent-[#D2B48C] cursor-pointer"
                aria-label="Drag slider to view client before and after progress pictures"
              />
            </div>

            {/* Description metrics quotes block on right (cols-5) */}
            <div className="lg:col-span-5 space-y-6">
              <span className="font-sans text-[10px] tracking-widest text-[#D2B48C] font-semibold uppercase">
                {transformationUser === 'marcus' ? 'Case Study 04' : 'Case Study 11'}
              </span>
              <h3 className="font-serif text-3xl md:text-4.5xl text-white font-medium">
                {transformationUser === 'marcus' ? 'Marcus R.' : 'Elena V.'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 pb-4">
                <div className="bg-[#1b1b1b] p-4 rounded-lg border border-white/5 space-y-1">
                  <span className="font-sans text-[10px] text-[#c4c7c7]/50 tracking-wider uppercase block">DURATION</span>
                  <span className="font-serif text-xl font-bold text-[#D2B48C]">{transformationUser === 'marcus' ? '12 Weeks' : '16 Weeks'}</span>
                </div>
                <div className="bg-[#1b1b1b] p-4 rounded-lg border border-white/5 space-y-1">
                  <span className="font-sans text-[10px] text-[#c4c7c7]/50 tracking-wider uppercase block">FAT SHREDDED</span>
                  <span className="font-serif text-xl font-bold text-white">{transformationUser === 'marcus' ? '-32 lbs' : '-24 lbs'}</span>
                </div>
              </div>

              <blockquote className="font-sans italic text-sm text-[#c4c7c7] font-light leading-relaxed border-l-2 border-[#D2B48C] pl-4">
                {transformationUser === 'marcus' 
                  ? '"The biggest transformation wasn’t how I looked. It was my energy levels and cognitive clarity during stressful board meetings. I eat South Indian foods guilt-free now."'
                  : '"This is the first program where I didn\'t feel like I was on extreme starvation protocols. The Air Fryer desserts keep me fully balanced."'}
              </blockquote>

              <div className="space-y-1">
                <span className="font-sans text-[10px] tracking-widest text-[#D2B48C]/70 font-semibold uppercase">SUSTAINED FOR</span>
                <p className="font-sans text-xs text-[#c4c7c7] font-light">Over {transformationUser === 'marcus' ? '2.5 Years' : '1.8 Years'} completely fat-rebound free.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Real scheduling / Calendar module */}
      <section id="scheduler-module" className="py-24 md:py-32 bg-[#0e0e0e] border-b border-[#e5e2e1]/5">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Upcoming workshops RSVP stream list panel (cols-5) */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3">
                <span className="font-sans text-xs tracking-[0.3em] text-[#D2B48C] font-semibold block uppercase">LIVE WORKSHOPS</span>
                <h2 className="font-serif text-3xl md:text-4.5xl text-white font-medium">Weekly Member Streams</h2>
                <p className="font-sans text-sm text-[#c4c7c7] font-light leading-relaxed">
                  Join our interactive cooking masterclasses. Real-time micro tips and technique breakdowns directly inside Saketh&apos;s kitchen.
                </p>
              </div>

              {/* Event Streams Render loop */}
              <div className="space-y-6">
                {events.map((event) => (
                  <div key={event.id} className="glass-panel rounded-xl overflow-hidden flex h-[160px] relative hover:border-[#D2B48C]/20 transition-all">
                    
                    {/* Left image thumbnail element */}
                    <div className="w-[30%] min-w-[100px] h-full relative">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40" />
                      
                      {/* Date stack */}
                      <div className="absolute inset-x-0 bottom-3 flex flex-col items-center">
                        <span className="font-serif text-xl font-bold text-white leading-none">{event.date}</span>
                        <span className="font-sans text-[8px] tracking-widest text-[#D2B48C] font-bold uppercase">{event.month}</span>
                      </div>
                    </div>

                    {/* Right text specs elements */}
                    <div className="w-[70%] p-5 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="font-sans text-[8px] tracking-widest text-[#D2B48C] font-bold uppercase bg-[#D2B48C]/10 px-2 py-0.5 rounded border border-[#D2B48C]/20 w-fit block mb-1">
                          {event.tag}
                        </span>
                        <h4 className="font-serif text-sm font-semibold text-white leading-tight line-clamp-1">{event.title}</h4>
                        <p className="font-sans text-[10px] text-[#c4c7c7] font-light line-clamp-1">{event.description}</p>
                      </div>

                      <div className="flex justify-between items-baseline pt-2">
                        <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-mono">
                          <Clock className="w-3.5 h-3.5 text-[#D2B48C]" />
                          <span>{event.time}</span>
                        </div>
                        
                        <button
                          onClick={() => handleRSVP(event.id)}
                          className={`font-sans text-[9px] font-bold tracking-widest uppercase cursor-pointer py-1.5 px-3 rounded transition-all ${
                            bookedSessions.includes(event.id)
                              ? 'bg-[#556B2F]/20 text-[#9bc15f] border border-[#556B2F]'
                              : 'bg-[#D2B48C] text-[#402d10] hover:bg-[#feddb3]'
                          }`}
                        >
                          {bookedSessions.includes(event.id) ? 'RSVPED ✓' : 'JOIN CALL'}
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Custom Interactive Booking form (cols-7) */}
            <div className="lg:col-span-7">
              <div className="glass-panel border border-[#D2B48C]/15 rounded-2xl p-8 md:p-10 relative">
                {!isSignedIn && (
                  <div className="mb-6 rounded-lg border border-[#D2B48C]/25 bg-[#D2B48C]/10 px-5 py-4 text-center md:text-left">
                    <p className="font-sans text-xs text-[#D2B48C] uppercase tracking-wider">
                      {authPrompt || 'Sign in with Google to book coaching sessions and join calls.'}
                    </p>
                    <button
                      onClick={onLogin}
                      className="mt-3 rounded bg-[#D2B48C] px-5 py-2 text-[10px] font-sans font-bold uppercase tracking-widest text-[#402d10] hover:bg-[#feddb3]"
                    >
                      Sign In With Google
                    </button>
                  </div>
                )}
                
                {isBookingSuccess ? (
                  <div className="text-center py-10 space-y-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-bounce shadow-xl">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif text-3xl text-white font-semibold">Consultation Confirmed</h3>
                      <p className="font-sans text-sm text-[#c4c7c7] font-light max-w-md mx-auto leading-relaxed">
                        Excellent, {bookingName}! Your 1:1 strategy audit slot with Coach Saketh is confirmed. 
                      </p>
                    </div>

                    {/* Receipt breakdown specs */}
                    <div className="bg-[#1b1b1b] p-6 rounded-lg text-left max-w-sm mx-auto border border-white/5 space-y-3 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#c4c7c7]/50 uppercase">CLIENT:</span>
                        <span className="text-white font-semibold">{bookingName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#c4c7c7]/50 uppercase">SERVICE:</span>
                        <span className="text-[#D2B48C] font-semibold">{selectedPlan || 'Macro Consultation Audit'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#c4c7c7]/50 uppercase">DATE SLOT:</span>
                        <span className="text-white font-semibold">{bookingDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#c4c7c7]/50 uppercase">TIME GMT:</span>
                        <span className="text-white font-semibold">{bookingTime}</span>
                      </div>
                    </div>

                    <p className="font-sans text-xs text-white/40 pt-2">
                      We sent a Zoom invitation and custom prep workbook to <strong>{bookingEmail}</strong>.
                    </p>

                    <button
                      onClick={resetBookingForm}
                      className="px-6 py-2.5 cursor-pointer bg-[#D2B48C] hover:bg-[#feddb3] text-[#402d10] text-[10px] font-sans font-bold tracking-widest uppercase rounded"
                    >
                      Book Another Slot
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <div className="space-y-2 text-center md:text-left mb-4">
                      <span className="font-sans text-[10px] tracking-widest text-[#D2B48C] font-semibold uppercase">SECURE YOUR AUDIT</span>
                      <h3 className="font-serif text-2.5xl text-white font-semibold">Book Strategic 1:1 Consultation</h3>
                      <p className="font-sans text-xs text-[#c4c7c7] font-light leading-relaxed">
                        Identify metabolism bottlenecks directly. Fill out our security scheduling parameters below.
                      </p>
                    </div>

                    {/* Pre-fill highlight badge if client selected a plan */}
                    {selectedPlan && (
                      <div className="bg-[#D2B48C]/10 border border-[#D2B48C]/20 rounded-lg p-3 flex justify-between items-center px-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#D2B48C]" />
                          <span className="font-sans text-xs font-semibold text-[#D2B48C] uppercase">PRE-SELECTED PLAN:</span>
                        </div>
                        <span className="font-serif text-sm font-bold text-white uppercase">{selectedPlan}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Name input */}
                      <div className="space-y-2">
                        <label className="font-sans text-[10px] font-bold text-[#c4c7c7] tracking-wider uppercase block">
                          Your Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          placeholder="e.g., James Roy"
                          className="w-full bg-[#131211] border border-white/10 text-white rounded px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#D2B48C]"
                        />
                      </div>

                      {/* Email input */}
                      <div className="space-y-2">
                        <label className="font-sans text-[10px] font-bold text-[#c4c7c7] tracking-wider uppercase block">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={bookingEmail}
                          onChange={(e) => setBookingEmail(e.target.value)}
                          placeholder="e.g., james@nexustech.com"
                          className="w-full bg-[#131211] border border-white/10 text-white rounded px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#D2B48C]"
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Date Select dropdown options */}
                      <div className="space-y-2">
                        <label className="font-sans text-[10px] font-bold text-[#c4c7c7] tracking-wider uppercase block">
                          Select Date
                        </label>
                        <select
                          required
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-[#131211] border border-white/10 text-[#c8c6c5] rounded px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#D2B48C]"
                        >
                          <option value="">-- Choose Calendar Day --</option>
                          {availableDays.map((day) => (
                            <option key={day.value} value={day.value}>{day.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Time Slot select drop down */}
                      <div className="space-y-2">
                        <label className="font-sans text-[10px] font-bold text-[#c4c7c7] tracking-wider uppercase block">
                          Choose Time Slot
                        </label>
                        <select
                          required
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full bg-[#131211] border border-white/10 text-[#c8c6c5] rounded px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#D2B48C]"
                        >
                          <option value="">-- Choose Free Slot --</option>
                          {availableTimes.map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={isBookingSubmitting}
                      className="w-full py-4 cursor-pointer bg-[#D2B48C] hover:bg-[#feddb3] text-[#402d10] font-sans font-bold text-xs tracking-widest rounded transition-colors uppercase disabled:opacity-40"
                    >
                      {isBookingSubmitting ? 'SECURING BOOKING CRYPTO...' : 'SCHEDULATION CONFIRMED AUDIT'}
                    </button>

                    <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5 text-[10px] text-white/40 font-light">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#D2B48C]/50" />
                        <span>Live WhatsApp Follows</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#D2B48C]/50" />
                        <span>Zoom Secure Integration</span>
                      </div>
                    </div>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
