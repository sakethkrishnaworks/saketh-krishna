'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Phone, Mail, Clock, ArrowRight, UserCheck, Star, Users, CheckCircle, Video, ChevronLeft } from 'lucide-react';
import { ASSET_IMAGES } from '../data';
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
  const [transformationSlider, setTransformationSlider] = useState<number>(50);

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
      setAuthPrompt('Please sign in to join coaching calls.');
      onLogin();
      return;
    }
    if (bookedSessions.includes(eventId)) return;
    setBookedSessions([...bookedSessions, eventId]);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      setAuthPrompt('Please sign in to book a session.');
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
      setAuthPrompt('Please sign in to select a plan.');
      onLogin();
      return;
    }
    setSelectedPlan(planTitle);
    const el = document.getElementById('scheduler-module');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0c0c0b] pt-14 pb-10 px-5 safe-bottom">
      <div className="max-w-md mx-auto">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl md:text-3xl text-white font-bold tracking-tight mb-2">
            Coaching
          </h1>
          <p className="font-sans text-xs text-[#a0a0a0]">
            1:1 strategic nutrition & lifestyle coaching
          </p>
        </div>

        {authPrompt && (
          <div className="mb-6 rounded-xl border border-[#D2B48C]/20 bg-[#D2B48C]/10 px-5 py-3 text-xs font-sans text-[#D2B48C] text-center">
            {authPrompt}
          </div>
        )}

        {/* Diet Plans */}
        <div className="mb-10">
          <h2 className="font-serif text-lg text-white font-semibold mb-4">Choose Your Protocol</h2>
          <div className="flex flex-col gap-3.5">
            {dietPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-[#1a1a1a] border ${plan.popular ? 'border-[#D2B48C]/30' : 'border-[#2a2a2a]'} hover:border-[#D2B48C]/30 rounded-xl transition-all duration-200 overflow-hidden`}
              >
                <div className="flex items-stretch">
                  <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-[#2a2a2a] overflow-hidden">
                    <img src={plan.image} alt={plan.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 p-3.5 md:p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {plan.badge && (
                            <span className="text-[8px] font-sans font-bold tracking-wider text-[#D2B48C] uppercase">{plan.badge}</span>
                          )}
                          <h3 className="font-serif text-sm md:text-base text-white font-semibold leading-tight">{plan.title}</h3>
                        </div>
                        {plan.popular && (
                          <span className="flex-shrink-0 text-[8px] font-sans font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase border border-emerald-500/20">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-[10px] text-[#a0a0a0] mt-1 line-clamp-1">{plan.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif text-base md:text-lg text-white font-bold">₹{plan.price.toLocaleString('en-IN')}</span>
                        <span className="font-sans text-[9px] text-[#a0a0a0]">/ {plan.period}</span>
                      </div>
                      <button
                        onClick={() => handleSelectPlan(plan.title)}
                        className="px-3.5 py-2 bg-[#D2B48C] text-[#0c0c0b] rounded-lg font-sans text-[10px] font-bold tracking-wider uppercase hover:bg-[#feddb3] transition-all"
                      >
                        {isSignedIn ? 'Select' : 'Sign In'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accountability Section - Simplified Card */}
        <div className="mb-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 md:p-6">
          <div className="flex items-center gap-3 mb-3">
            <UserCheck className="w-5 h-5 text-[#D2B48C]" />
            <div>
              <h3 className="font-serif text-base text-white font-semibold">Daily Accountability</h3>
              <p className="font-sans text-[10px] text-[#a0a0a0]">Direct WhatsApp support + weekly audits</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0c0c0b] rounded-lg p-3 border border-[#2a2a2a]">
              <span className="text-[10px] font-sans text-[#D2B48C] font-semibold block mb-1">24/7 Access</span>
              <span className="text-[9px] font-sans text-[#a0a0a0]">Direct line to coach</span>
            </div>
            <div className="bg-[#0c0c0b] rounded-lg p-3 border border-[#2a2a2a]">
              <span className="text-[10px] font-sans text-[#D2B48C] font-semibold block mb-1">Weekly Zoom</span>
              <span className="text-[9px] font-sans text-[#a0a0a0]">Private group audits</span>
            </div>
          </div>
        </div>

        {/* Live Workshops */}
        <div className="mb-10">
          <h2 className="font-serif text-lg text-white font-semibold mb-4">Live Workshops</h2>
          <div className="flex flex-col gap-3.5">
            {events.map((event) => (
              <div key={event.id} className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#D2B48C]/30 rounded-xl transition-all duration-200 overflow-hidden">
                <div className="flex items-stretch">
                  <div className="w-20 h-20 flex-shrink-0 bg-[#2a2a2a] overflow-hidden relative">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="font-serif text-lg font-bold text-white leading-none">{event.date}</span>
                      <span className="font-sans text-[7px] tracking-widest text-[#D2B48C] font-bold uppercase">{event.month}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 p-3.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-sans font-bold tracking-wider text-[#D2B48C] uppercase">{event.tag}</span>
                      <h3 className="font-serif text-sm text-white font-semibold leading-tight mt-0.5">{event.title}</h3>
                      <p className="font-sans text-[10px] text-[#a0a0a0] mt-0.5 line-clamp-1">{event.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="flex items-center gap-1 text-[9px] text-[#a0a0a0] font-mono">
                        <Clock className="w-3 h-3 text-[#D2B48C]" />
                        {event.time}
                      </span>
                      <button
                        onClick={() => handleRSVP(event.id)}
                        className={`px-3 py-1.5 rounded-lg font-sans text-[9px] font-bold tracking-wider uppercase transition-all ${bookedSessions.includes(event.id)
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#D2B48C] text-[#0c0c0b] hover:bg-[#feddb3]'
                          }`}
                      >
                        {bookedSessions.includes(event.id) ? 'Joined' : 'Join'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Section */}
        <div id="scheduler-module">
          <h2 className="font-serif text-lg text-white font-semibold mb-4">Book Consultation</h2>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 md:p-6">
            {!isSignedIn && (
              <div className="mb-4 rounded-lg border border-[#D2B48C]/20 bg-[#D2B48C]/10 px-4 py-3 text-center">
                <p className="font-sans text-xs text-[#D2B48C]">Sign in to book a coaching session.</p>
                <button onClick={onLogin} className="mt-2 bg-[#D2B48C] text-[#0c0c0b] px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#feddb3]">
                  Sign In With Google
                </button>
              </div>
            )}

            {isBookingSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-white font-semibold">Confirmed!</h3>
                  <p className="font-sans text-xs text-[#a0a0a0] mt-1">Your session with Coach Saketh is booked.</p>
                </div>
                <div className="bg-[#0c0c0b] rounded-lg p-4 text-left text-xs space-y-2 font-mono max-w-xs mx-auto border border-[#2a2a2a]">
                  <div className="flex justify-between"><span className="text-[#a0a0a0] uppercase">Client:</span><span className="text-white font-semibold">{bookingName}</span></div>
                  <div className="flex justify-between"><span className="text-[#a0a0a0] uppercase">Plan:</span><span className="text-[#D2B48C] font-semibold">{selectedPlan || 'Consultation'}</span></div>
                  <div className="flex justify-between"><span className="text-[#a0a0a0] uppercase">Date:</span><span className="text-white font-semibold">{bookingDate}</span></div>
                  <div className="flex justify-between"><span className="text-[#a0a0a0] uppercase">Time:</span><span className="text-white font-semibold">{bookingTime}</span></div>
                </div>
                <button onClick={resetBookingForm} className="bg-[#D2B48C] text-[#0c0c0b] px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#feddb3]">
                  Book Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {selectedPlan && (
                  <div className="bg-[#D2B48C]/10 border border-[#D2B48C]/20 rounded-lg p-3 flex items-center justify-between">
                    <span className="font-sans text-[10px] font-semibold text-[#D2B48C] uppercase">Plan: {selectedPlan}</span>
                    <CheckCircle className="w-4 h-4 text-[#D2B48C]" />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-[9px] font-bold text-[#a0a0a0] tracking-wider uppercase block mb-1">Full Name</label>
                    <input type="text" required value={bookingName} onChange={(e) => setBookingName(e.target.value)}
                      placeholder="Your name" className="w-full bg-[#0c0c0b] border border-[#2a2a2a] text-white rounded-lg px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#D2B48C]" />
                  </div>
                  <div>
                    <label className="font-sans text-[9px] font-bold text-[#a0a0a0] tracking-wider uppercase block mb-1">Email</label>
                    <input type="email" required value={bookingEmail} onChange={(e) => setBookingEmail(e.target.value)}
                      placeholder="your@email.com" className="w-full bg-[#0c0c0b] border border-[#2a2a2a] text-white rounded-lg px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#D2B48C]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-[9px] font-bold text-[#a0a0a0] tracking-wider uppercase block mb-1">Date</label>
                    <select required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-[#0c0c0b] border border-[#2a2a2a] text-[#a0a0a0] rounded-lg px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#D2B48C]">
                      <option value="">Select a day</option>
                      {availableDays.map((day) => (<option key={day.value} value={day.value}>{day.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="font-sans text-[9px] font-bold text-[#a0a0a0] tracking-wider uppercase block mb-1">Time</label>
                    <select required value={bookingTime} onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-[#0c0c0b] border border-[#2a2a2a] text-[#a0a0a0] rounded-lg px-4 py-3 font-sans text-sm focus:outline-none focus:border-[#D2B48C]">
                      <option value="">Select time</option>
                      {availableTimes.map((time) => (<option key={time} value={time}>{time}</option>))}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={isBookingSubmitting || !isSignedIn}
                  className="w-full py-3.5 bg-[#D2B48C] hover:bg-[#feddb3] text-[#0c0c0b] font-sans font-bold text-xs tracking-wider rounded-lg transition-all uppercase disabled:opacity-40">
                  {isBookingSubmitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Transformation Slider - Simplified */}
        <div className="mt-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 md:p-6">
          <h3 className="font-serif text-base text-white font-semibold mb-1">Transformation Stories</h3>
          <p className="font-sans text-[10px] text-[#a0a0a0] mb-4">Drag to see before/after results</p>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setTransformationUser('marcus')}
              className={`px-4 py-1.5 rounded-lg font-sans text-[10px] font-semibold tracking-wider uppercase transition-all ${transformationUser === 'marcus' ? 'bg-[#D2B48C] text-[#0c0c0b]' : 'bg-[#2a2a2a] text-[#a0a0a0] hover:text-white'}`}>
              Marcus
            </button>
            <button onClick={() => setTransformationUser('elena')}
              className={`px-4 py-1.5 rounded-lg font-sans text-[10px] font-semibold tracking-wider uppercase transition-all ${transformationUser === 'elena' ? 'bg-[#D2B48C] text-[#0c0c0b]' : 'bg-[#2a2a2a] text-[#a0a0a0] hover:text-white'}`}>
              Elena
            </button>
          </div>
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-[#2a2a2a]">
            <img src={transformationUser === 'marcus' ? ASSET_IMAGES.marcusBefore : ASSET_IMAGES.elenaBefore} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `polygon(0 0, ${transformationSlider}% 0, ${transformationSlider}% 100%, 0 100%)` }}>
              <img src={transformationUser === 'marcus' ? ASSET_IMAGES.marcusAfter : ASSET_IMAGES.elenaAfter} alt="After" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize z-20" style={{ left: `${transformationSlider}%` }} />
          </div>
          <input type="range" min="0" max="100" value={transformationSlider} onChange={(e) => setTransformationSlider(Number(e.target.value))}
            className="w-full mt-3 accent-[#D2B48C]" />
          <div className="flex justify-between mt-2 text-[9px] font-sans text-[#a0a0a0]">
            <span>After</span>
            <span>{transformationUser === 'marcus' ? '-32 lbs in 12 weeks' : '-24 lbs in 16 weeks'}</span>
            <span>Before</span>
          </div>
        </div>
      </div>
    </div>
  );
}