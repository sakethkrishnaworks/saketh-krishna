import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  Search,
  Download,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Settings as SettingsIcon,
  Layout,
  Briefcase,
  ExternalLink,
  Mail,
  Star
} from 'lucide-react';
import { Cookbook, EventSession, Subscriber, DietPlan } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';

interface AdminDashboardProps {
  cookbooks: Cookbook[];
  events: EventSession[];
  subscribers: Subscriber[];
  dietPlans: DietPlan[];
  user: FirebaseUser | null | undefined;
}

const MOCK_SALES_DATA = [
  { name: 'Mon', sales: 4000, revenue: 2400 },
  { name: 'Tue', sales: 3000, revenue: 1398 },
  { name: 'Wed', sales: 2000, revenue: 9800 },
  { name: 'Thu', sales: 2780, revenue: 3908 },
  { name: 'Fri', sales: 1890, revenue: 4800 },
  { name: 'Sat', sales: 2390, revenue: 3800 },
  { name: 'Sun', sales: 3490, revenue: 4300 },
];

export default function AdminDashboard({ cookbooks, events, subscribers, dietPlans }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'cookbooks' | 'schedules' | 'subscribers' | 'dietPlans' | 'settings'>('overview');
  const [editingCookbook, setEditingCookbook] = useState<Cookbook | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventSession | null>(null);
  const [editingDietPlan, setEditingDietPlan] = useState<DietPlan | null>(null);
  const [isAddingCookbook, setIsAddingCookbook] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isAddingDietPlan, setIsAddingDietPlan] = useState(false);

  // Growth Performance state
  const [activeMetric, setActiveMetric] = useState<'sales' | 'revenue'>('revenue');

  // --- CRUD Operations for Diet Plans ---
  const handleSaveDietPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingDietPlan?.id || `plan-${Date.now()}`;

    const newPlan: DietPlan = {
      id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      period: (formData.get('period') as string) || 'quarter',
      image: (formData.get('image') as string) || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
      badge: formData.get('badge') as string,
      popular: formData.get('popular') === 'on'
    };

    try {
      await setDoc(doc(db, 'dietPlans', id), newPlan);
      setEditingDietPlan(null);
      setIsAddingDietPlan(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `dietPlans/${id}`);
    }
  };

  const handleDeleteDietPlan = async (id: string) => {
    if (confirm('Delete this diet plan?')) {
      try {
        await deleteDoc(doc(db, 'dietPlans', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `dietPlans/${id}`);
      }
    }
  };

  // --- CRUD Operations for Cookbooks ---
  const handleSaveCookbook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingCookbook?.id || `book-${Date.now()}`;
    
    const newBook: Cookbook = {
      id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      image: (formData.get('image') as string) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      category: formData.get('category') as 'high-protein' | 'vegetarian' | 'air-fryer',
      features: (formData.get('features') as string).split(',').map(f => f.trim()),
      tag: formData.get('tag') as string,
      oldPrice: formData.get('oldPrice') ? parseFloat(formData.get('oldPrice') as string) : undefined
    };

    try {
      await setDoc(doc(db, 'cookbooks', id), newBook);
      setEditingCookbook(null);
      setIsAddingCookbook(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `cookbooks/${id}`);
    }
  };

  const handleDeleteCookbook = async (id: string) => {
    if (confirm('Delete this asset? This cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'cookbooks', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `cookbooks/${id}`);
      }
    }
  };

  // --- CRUD Operations for Events ---
  const handleSaveEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingEvent?.id || `event-${Date.now()}`;

    const newEvent: EventSession = {
      id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      date: formData.get('date') as string,
      month: formData.get('month') as string,
      time: formData.get('time') as string,
      tag: formData.get('tag') as string,
      image: (formData.get('image') as string) || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d',
      joined: editingEvent?.joined || 0,
      tagColor: editingEvent?.tagColor || 'bg-brand-beige text-black'
    };

    try {
      await setDoc(doc(db, 'events', id), newEvent);
      setEditingEvent(null);
      setIsAddingEvent(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `events/${id}`);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Delete this coaching schedule?')) {
      try {
        await deleteDoc(doc(db, 'events', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `events/${id}`);
      }
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (confirm('Remove this subscriber?')) {
      try {
        await deleteDoc(doc(db, 'subscribers', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `subscribers/${id}`);
      }
    }
  };

  const handleToggleSubscriberStatus = async (sub: Subscriber) => {
    const newStatus = sub.status === 'Active' ? 'Unsubscribed' : 'Active';
    try {
      await updateDoc(doc(db, 'subscribers', sub.id), { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `subscribers/${sub.id}`);
    }
  };

  return (
    <div className="relative pt-[100px] pb-24 min-h-screen bg-[#121212]">
      {/* Admin Sidebar Navigation */}
      <div className="fixed left-6 md:left-12 top-[120px] w-16 md:w-64 z-40 hidden lg:block">
        <div className="glass-panel rounded-2xl p-4 space-y-4">
          <div className="px-4 py-2 mb-4">
            <span className="font-sans text-[10px] tracking-[0.3em] text-[#D2B48C] font-semibold block uppercase">MANAGEMENT</span>
          </div>
          <nav className="space-y-1">
              {[
                { id: 'overview', label: 'E-commerce Ops', icon: Layout },
                { id: 'cookbooks', label: 'Digital Assets', icon: ShoppingBag },
                { id: 'dietPlans', label: 'Coaching Plans', icon: Star },
                { id: 'schedules', label: 'Service Catalog', icon: Calendar },
                { id: 'subscribers', label: 'Subscribers', icon: Mail },
                { id: 'settings', label: 'System Logic', icon: SettingsIcon },
              ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-sans text-xs font-bold tracking-widest uppercase transition-all ${
                  activeTab === item.id 
                    ? 'bg-[#D2B48C] text-[#402d10] shadow-lg shadow-[#D2B48C]/10' 
                    : 'text-[#c4c7c7]/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="lg:pl-80 max-w-7xl mx-auto px-6 md:px-16">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <span className="font-sans text-xs tracking-[0.3em] text-[#D2B48C] font-semibold block uppercase">ADMIN STRATEGY PORTAL</span>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="font-serif text-3.5xl md:text-5xl text-white font-bold leading-tight">
              {activeTab === 'overview' && 'Executive Control'}
              {activeTab === 'cookbooks' && 'Asset Inventory'}
              {activeTab === 'dietPlans' && 'Coaching Catalog'}
              {activeTab === 'schedules' && 'Service Distribution'}
              {activeTab === 'subscribers' && 'Marketing Ledger'}
              {activeTab === 'settings' && 'Global Configurations'}
            </h1>
          </div>
          <div className="flex gap-4">
            {activeTab === 'cookbooks' && !isAddingCookbook && (
              <button 
                onClick={() => setIsAddingCookbook(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#D2B48C] text-[#402d10] font-sans text-[10px] font-bold tracking-widest uppercase rounded hover:bg-[#feddb3] transition-colors"
                id="add-cookbook-btn"
              >
                <Plus className="w-3.5 h-3.5" /> NEW PRODUCT
              </button>
            )}
            {activeTab === 'dietPlans' && !isAddingDietPlan && (
              <button 
                onClick={() => setIsAddingDietPlan(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#D2B48C] text-[#402d10] font-sans text-[10px] font-bold tracking-widest uppercase rounded hover:bg-[#feddb3] transition-colors"
                id="add-dietplan-btn"
              >
                <Plus className="w-3.5 h-3.5" /> NEW PLAN
              </button>
            )}
            {activeTab === 'schedules' && !isAddingEvent && (
              <button 
                onClick={() => setIsAddingEvent(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#D2B48C] text-[#402d10] font-sans text-[10px] font-bold tracking-widest uppercase rounded hover:bg-[#feddb3] transition-colors"
                id="add-schedule-btn"
              >
                <Plus className="w-3.5 h-3.5" /> NEW SCHEDULE
              </button>
            )}
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 text-white font-sans text-[10px] font-bold tracking-widest uppercase rounded hover:bg-white/10 transition-colors">
              <Download className="w-3.5 h-3.5" /> REVENUE DATA
            </button>
          </div>
        </div>

        {/* Tab Content Mapping */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-panel p-6 rounded-xl space-y-4 border-l-4 border-l-[#D2B48C]">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-[#D2B48C]/10 rounded-lg"><DollarSign className="w-5 h-5 text-[#D2B48C]" /></div>
                  <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold"><TrendingUp className="w-3 h-3" /> +12.5%</span>
                </div>
                <div>
                  <p className="font-sans text-[10px] tracking-widest text-[#c4c7c7]/60 uppercase">Gross Monthly Revenue</p>
                  <h3 className="font-serif text-2.5xl text-white font-bold">₹35,00,000.00</h3>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-xl space-y-4 border-l-4 border-l-emerald-500/50">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-emerald-500/10 rounded-lg"><Users className="w-5 h-5 text-emerald-400" /></div>
                  <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold"><TrendingUp className="w-3 h-3" /> +8.2%</span>
                </div>
                <div>
                  <p className="font-sans text-[10px] tracking-widest text-[#c4c7c7]/60 uppercase">Daily Account Subscriptions</p>
                  <h3 className="font-serif text-2.5xl text-white font-bold">1,482</h3>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-xl space-y-4 border-l-4 border-l-blue-500/50">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-blue-500/10 rounded-lg"><ShoppingBag className="w-5 h-5 text-blue-400" /></div>
                  <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold"><TrendingUp className="w-3 h-3" /> +15.1%</span>
                </div>
                <div>
                  <p className="font-sans text-[10px] tracking-widest text-[#c4c7c7]/60 uppercase">Checkout Converions</p>
                  <h3 className="font-serif text-2.5xl text-white font-bold">14.2%</h3>
                </div>
              </div>
              <div className="glass-panel p-6 rounded-xl space-y-4 border-l-4 border-l-purple-500/50">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-purple-500/10 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-400" /></div>
                  <span className="flex items-center gap-1 text-white/20 text-[10px] font-bold">STABLE</span>
                </div>
                <div>
                  <p className="font-sans text-[10px] tracking-widest text-[#c4c7c7]/60 uppercase">LTV (Customer Value)</p>
                  <h3 className="font-serif text-2.5xl text-white font-bold">₹10,500.00</h3>
                </div>
              </div>
            </div>

            {/* Sales Chart Section */}
            <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0e0e0e]/50">
                <div>
                  <h3 className="font-serif text-xl text-white font-semibold">Growth Performance</h3>
                  <p className="font-sans text-[10px] text-[#c4c7c7]/60 tracking-wider uppercase">Direct Transaction Ledger Metrics</p>
                </div>
                <div className="flex bg-[#20201f] rounded p-1 border border-white/5">
                  <button onClick={() => setActiveMetric('revenue')} className={`px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded transition-all cursor-pointer ${activeMetric === 'revenue' ? 'bg-[#D2B48C] text-[#402d10]' : 'text-white/40 hover:text-white'}`}>Revenue</button>
                  <button onClick={() => setActiveMetric('sales')} className={`px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded transition-all cursor-pointer ${activeMetric === 'sales' ? 'bg-[#D2B48C] text-[#402d10]' : 'text-white/40 hover:text-white'}`}>Orders</button>
                </div>
              </div>
              <div className="p-8 h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_SALES_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D2B48C" stopOpacity={0.3}/><stop offset="95%" stopColor="#D2B48C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontFamily: 'Inter' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontFamily: 'Inter' }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1b1b1b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ fontSize: '10px', color: '#D2B48C', fontWeight: 'bold' }} labelStyle={{ fontSize: '10px', color: '#fff', marginBottom: '4px' }} />
                    <Area type="monotone" dataKey={activeMetric} stroke="#D2B48C" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* --- Cookbooks CMS --- */}
        {activeTab === 'cookbooks' && (
          <div className="space-y-8">
            {(isAddingCookbook || editingCookbook) && (
              <div className="glass-panel p-8 rounded-xl border-[#D2B48C]/40 bg-[#0e0e0e]">
                <div className="flex justify-between mb-8">
                  <h3 className="font-serif text-2xl text-white font-semibold">
                    {editingCookbook ? 'MODIFICATION' : 'NEW ASSET CREATION'}
                  </h3>
                  <button onClick={() => { setEditingCookbook(null); setIsAddingCookbook(false); }} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSaveCookbook} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Title</label>
                    <input name="title" defaultValue={editingCookbook?.title} required className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Price (INR)</label>
                    <input name="price" type="number" step="1" defaultValue={editingCookbook?.price} required className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Description</label>
                    <textarea name="description" defaultValue={editingCookbook?.description} required className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none h-24" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Image URL</label>
                    <input name="image" defaultValue={editingCookbook?.image} className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Category</label>
                    <select name="category" defaultValue={editingCookbook?.category} className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-[#c4c7c7] text-sm focus:border-[#D2B48C] outline-none">
                      <option value="high-protein">High Protein</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="air-fryer">Air Fryer</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Features (comma separated)</label>
                    <input name="features" defaultValue={editingCookbook?.features.join(', ')} required className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <button type="submit" className="w-full bg-[#D2B48C] text-[#402d10] font-sans font-bold text-xs tracking-widest uppercase py-4 rounded hover:bg-[#feddb3] flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> COMMIT CHANGES
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="glass-panel overflow-hidden rounded-xl border-white/5">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1b1b1b] border-b border-white/5 font-sans text-[10px] tracking-widest text-[#c4c7c7]/60 uppercase">
                  <tr>
                    <th className="px-8 py-4">Status & Title</th>
                    <th className="px-8 py-4">Units Sold</th>
                    <th className="px-8 py-4">Price Value</th>
                    <th className="px-8 py-4 text-right">Action Interface</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cookbooks.map(book => (
                    <tr key={book.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                           <img src={book.image} className="w-10 h-12 rounded bg-zinc-900 object-cover" />
                           <div>
                              <div className="font-serif text-sm text-white font-medium">{book.title}</div>
                              <div className="font-sans text-[9px] text-[#D2B48C] font-bold uppercase">{book.category}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-xs text-white/40">342 Units</td>
                      <td className="px-8 py-5 font-serif font-bold text-emerald-400">₹{book.price.toLocaleString('en-IN')}</td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingCookbook(book)} className="p-2 bg-white/5 rounded hover:bg-[#D2B48C] hover:text-[#402d10] transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteCookbook(book.id)} className="p-2 bg-white/5 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Diet Plans CMS --- */}
        {activeTab === 'dietPlans' && (
          <div className="space-y-8">
            {(isAddingDietPlan || editingDietPlan) && (
              <div className="glass-panel p-8 rounded-xl border-[#D2B48C]/40 bg-[#0e0e0e]">
                <div className="flex justify-between mb-8">
                  <h3 className="font-serif text-2xl text-white font-semibold">
                    {editingDietPlan ? 'PLAN REVISION' : 'NEW PLAN DEPLOYMENT'}
                  </h3>
                  <button onClick={() => { setEditingDietPlan(null); setIsAddingDietPlan(false); }} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSaveDietPlan} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Plan Title</label>
                    <input name="title" defaultValue={editingDietPlan?.title} required className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Price (INR)</label>
                    <input name="price" type="number" step="1" defaultValue={editingDietPlan?.price} required className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Description</label>
                    <textarea name="description" defaultValue={editingDietPlan?.description} required className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none h-20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Period (e.g. quarter)</label>
                    <input name="period" defaultValue={editingDietPlan?.period} placeholder="quarter" className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Badge</label>
                    <input name="badge" defaultValue={editingDietPlan?.badge} placeholder="Entry Level" className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Image URL</label>
                    <input name="image" defaultValue={editingDietPlan?.image} className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input type="checkbox" name="popular" defaultChecked={editingDietPlan?.popular} className="w-4 h-4 accent-[#D2B48C]" />
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Mark as Popular</label>
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <button type="submit" className="w-full bg-[#D2B48C] text-[#402d10] font-sans font-bold text-xs tracking-widest uppercase py-4 rounded hover:bg-[#feddb3] flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> COMMIT PLAN
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dietPlans.map(plan => (
                <div key={plan.id} className="glass-panel overflow-hidden rounded-xl group relative">
                   <div className="h-44 relative">
                     <img src={plan.image} className="w-full h-full object-cover opacity-60" />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#121212] flex items-end p-6">
                        <div>
                          <div className="text-[8px] font-bold text-[#D2B48C] tracking-widest uppercase">{plan.badge}</div>
                          <div className="text-white font-serif text-xl font-bold">{plan.title}</div>
                        </div>
                     </div>
                   </div>
                   <div className="p-6 space-y-4">
                      <div className="flex justify-between items-baseline">
                         <span className="font-serif text-2xl font-bold text-emerald-400">₹{plan.price.toLocaleString('en-IN')}</span>
                         <span className="text-[10px] text-white/40 uppercase">/ {plan.period}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <button onClick={() => setEditingDietPlan(plan)} className="flex items-center gap-2 text-[10px] font-bold text-[#D2B48C] uppercase hover:text-white transition-colors"><Edit2 className="w-3 h-3" /> SETTINGS</button>
                        <button onClick={() => handleDeleteDietPlan(plan.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Schedules CMS --- */}
        {activeTab === 'schedules' && (
          <div className="space-y-8">
            {(isAddingEvent || editingEvent) && (
              <div className="glass-panel p-8 rounded-xl border-blue-500/30 bg-[#0e0e0e]">
                <div className="flex justify-between mb-8">
                  <h3 className="font-serif text-2xl text-white font-semibold">
                    {editingEvent ? 'RESCHEDULING PARAMETERS' : 'NEW SERVICE DEPLOYMENT'}
                  </h3>
                  <button onClick={() => { setEditingEvent(null); setIsAddingEvent(false); }} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSaveEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Session Title</label>
                    <input name="title" defaultValue={editingEvent?.title} required className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Description</label>
                    <textarea name="description" defaultValue={editingEvent?.description} required className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none h-20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Day</label>
                    <input name="date" defaultValue={editingEvent?.date} placeholder="e.g. 28" required className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Month</label>
                    <input name="month" defaultValue={editingEvent?.month} placeholder="MAY" required className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Time Range</label>
                    <input name="time" defaultValue={editingEvent?.time} placeholder="6:00 PM EST" required className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#c4c7c7] uppercase">Service Tag</label>
                    <input name="tag" defaultValue={editingEvent?.tag} placeholder="Nutrition Workshop" className="w-full bg-[#1b1b1b] border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-[#D2B48C] outline-none" />
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <button type="submit" className="w-full bg-[#D2B48C] text-[#402d10] font-sans font-bold text-xs tracking-widest uppercase py-4 rounded hover:bg-[#feddb3] flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> PUBLISH TO FEED
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(ev => (
                <div key={ev.id} className="glass-panel overflow-hidden rounded-xl group relative">
                   <div className="h-40 relative">
                     <img src={ev.image} className="w-full h-full object-cover opacity-60" />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#121212] flex items-end p-6">
                        <div className="text-white font-serif text-2xl font-bold">{ev.date} {ev.month}</div>
                     </div>
                   </div>
                   <div className="p-6 space-y-4">
                      <div>
                        <span className="text-[9px] font-bold text-[#D2B48C] tracking-widest uppercase">{ev.tag}</span>
                        <h4 className="font-serif text-lg text-white font-semibold line-clamp-1">{ev.title}</h4>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <button onClick={() => setEditingEvent(ev)} className="flex items-center gap-2 text-[10px] font-bold text-[#D2B48C] uppercase hover:text-white transition-colors"><Edit2 className="w-3 h-3" /> SETTINGS</button>
                        <button onClick={() => handleDeleteEvent(ev.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Subscribers Ledger --- */}
        {activeTab === 'subscribers' && (
          <div className="space-y-8">
            <div className="glass-panel overflow-hidden rounded-xl border-white/5">
              <div className="p-8 border-b border-white/5 bg-[#0e0e0e]/50 flex justify-between items-center">
                 <div>
                    <h3 className="font-serif text-xl text-white font-semibold">User Subscriptions</h3>
                    <p className="font-sans text-[10px] text-[#c4c7c7]/60 tracking-wider uppercase">Mailing list & Active leads</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input placeholder="SEARCH EMAILS..." className="bg-[#131313] border border-white/10 rounded px-10 py-2.5 font-sans text-[10px] tracking-widest text-white focus:outline-none focus:border-[#D2B48C]" />
                    </div>
                 </div>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1b1b1b] border-b border-white/5 font-sans text-[10px] tracking-widest text-[#c4c7c7]/60 uppercase">
                  <tr>
                    <th className="px-8 py-4">Client Email Address</th>
                    <th className="px-8 py-4">Joined Date</th>
                    <th className="px-8 py-4">Current Status</th>
                    <th className="px-8 py-4 text-right">Ledger Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subscribers.map(sub => (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#D2B48C]/10 flex items-center justify-center text-[#D2B48C] font-bold text-xs">
                              {sub.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-sans text-sm text-white font-medium">{sub.email}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-xs text-white/40">{sub.date}</td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase border ${
                          sub.status === 'Active' 
                            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' 
                            : 'bg-red-950/20 text-red-400 border-red-500/20'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleToggleSubscriberStatus(sub)} className="p-2 bg-white/5 rounded hover:bg-white/10 transition-colors text-white/40 hover:text-white" title="Toggle Status">
                            <SettingsIcon className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteSubscriber(sub.id)} className="p-2 bg-white/5 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <Mail className="w-12 h-12" />
                          <p className="font-serif text-xl">No active leads found in the ledger</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="p-6 bg-[#0e0e0e]/50 border-t border-white/5 text-center">
                <span className="font-sans text-[10px] text-[#c4c7c7]/40 tracking-widest uppercase">END OF MARKETING LEDGER</span>
              </div>
            </div>
          </div>
        )}

        {/* --- Global System Settings --- */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="glass-panel p-10 rounded-xl space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <SettingsIcon className="w-5 h-5 text-[#D2B48C]" />
                      <h3 className="font-serif text-xl text-white">Application Parameters</h3>
                    </div>
                    <div className="space-y-6 pt-4">
                       <div className="flex justify-between items-center py-4 border-b border-white/5">
                          <div>
                            <div className="text-white text-sm font-medium">Production Checkout</div>
                            <div className="text-[10px] text-white/40 uppercase">Enable real-time Stripe processing hooks</div>
                          </div>
                          <div className="w-12 h-6 bg-emerald-500/20 border border-emerald-500/40 rounded-full relative p-1 cursor-pointer">
                             <div className="absolute right-1 top-1 w-4 h-4 bg-emerald-500 rounded-full" />
                          </div>
                       </div>
                       <div className="flex justify-between items-center py-4 border-b border-white/5">
                          <div>
                            <div className="text-white text-sm font-medium">Inventory Sync</div>
                            <div className="text-[10px] text-white/40 uppercase">AWS S3 Image processing pipeline status</div>
                          </div>
                          <div className="w-12 h-6 bg-emerald-500/20 border border-emerald-500/40 rounded-full relative p-1 cursor-pointer">
                             <div className="absolute right-1 top-1 w-4 h-4 bg-emerald-500 rounded-full" />
                          </div>
                       </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-[#D2B48C]" />
                      <h3 className="font-serif text-xl text-white">Security &amp; API Keys</h3>
                    </div>
                    <div className="space-y-4 pt-4">
                       <div className="space-y-2">
                         <label className="text-[9px] font-bold text-[#c4c7c7] uppercase">Integration Endpoint</label>
                         <div className="flex gap-2">
                           <input disabled value="https://api.gateway.v2.sakethkrishna.com/v1" className="flex-grow bg-[#1b1b1b] border border-white/5 rounded px-4 py-3 text-white/30 text-xs font-mono" />
                           <button className="px-4 bg-white/5 rounded text-white/40"><ExternalLink className="w-4 h-4" /></button>
                         </div>
                       </div>
                    </div>
                  </div>
               </div>
               
               <div className="pt-12 border-t border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-blue-500/10 rounded-full"><TrendingUp className="w-5 h-5 text-blue-400" /></div>
                     <div>
                        <div className="text-white text-sm font-bold">Cloud Cluster Health</div>
                        <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">99.98% Uptime - 23ms Latency</div>
                     </div>
                  </div>
                  <button className="px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-500 font-sans font-bold text-[10px] tracking-widest uppercase rounded hover:bg-red-500/20 transition-all">Emergency Lockdown</button>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
