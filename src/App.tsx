'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import CookbooksView from './components/CookbooksView';
import CoachingView from './components/CoachingView';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import StoryView from './components/StoryView';
import CartDrawer from './components/CartDrawer';
import PurchaseLibraryView from './components/PurchaseLibraryView';
import { ActiveTab, CartItem, Cookbook, EventSession, Subscriber, DietPlan, PurchaseRecord } from './types';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';

const AUTHORIZED_ADMIN_EMAILS = ['sakethkrishna.work@gmail.com', 'gokulkannan0205@gmail.com'];

function isAuthorizedAdminEmail(email?: string | null) {
  return Boolean(email && AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase()));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // State synchronized with Supabase
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [events, setEvents] = useState<EventSession[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error('Supabase auth initialization failed:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Check Admin Status and Bootstrap primary user
  useEffect(() => {
    async function checkAdmin() {
      if (!user?.email) {
        setIsAdmin(false);
        return;
      }

      const isAuthorizedAdmin = isAuthorizedAdminEmail(user.email);

      try {
        const { data, error } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data) {
          setIsAdmin(true);
          return;
        }

        if (isAuthorizedAdmin) {
          const { error: upsertError } = await supabase
            .from('admins')
            .upsert(
              { user_id: user.id, email: user.email.toLowerCase(), role: 'admin' },
              { onConflict: 'user_id' }
            );

          if (upsertError) throw upsertError;
          setIsAdmin(true);
          return;
        }

        setIsAdmin(false);
      } catch (err) {
        console.error('Admin bootstrap failed:', err);
        setIsAdmin(isAuthorizedAdmin);
      }
    }

    void checkAdmin();
  }, [user]);

  // Sync state with Supabase
  useEffect(() => {
    const fetchCookbooks = async () => {
      const { data, error } = await supabase.from('cookbooks').select('*');
      if (error) {
        console.error('Cookbooks fetch failed:', error);
        return;
      }

      const normalized = (data ?? []).map((row: any) => ({
        ...row,
        pdfUrl: row.pdfUrl ?? row.pdfurl ?? row.pdf_url ?? undefined,
        oldPrice: row.oldprice ?? row.old_price ?? row.oldPrice ?? undefined,
      }));

      setCookbooks(normalized as Cookbook[]);
    };

    const fetchEvents = async () => {
      const { data, error } = await supabase.from('events').select('*');
      if (error) {
        console.error('Events fetch failed:', error);
        return;
      }
      setEvents((data ?? []) as EventSession[]);
    };

    const fetchDietPlans = async () => {
      const { data, error } = await supabase.from('dietplans').select('*');
      if (error) {
        console.error('Diet plans fetch failed:', error);
        return;
      }
      setDietPlans((data ?? []) as DietPlan[]);
    };

    const fetchSubscribers = async () => {
      const { data, error } = await supabase.from('subscribers').select('*');
      if (error) {
        console.error('Subscribers fetch failed:', error);
        return;
      }
      setSubscribers((data ?? []) as Subscriber[]);
    };

    const applyRealtimeUpdate = (payload: any, setter: any) => {
      const normalize = (obj: any) => ({
        ...obj,
        pdfUrl: obj?.pdfUrl ?? obj?.pdfurl ?? obj?.pdf_url ?? undefined,
        oldPrice: obj?.oldprice ?? obj?.old_price ?? obj?.oldPrice ?? undefined,
      });

      if (payload.eventType === 'INSERT') {
        setter((prev: any[]) => [...prev, normalize(payload.new)]);
      } else if (payload.eventType === 'UPDATE') {
        setter((prev: any[]) => prev.map((item) => (item.id === payload.new.id ? normalize(payload.new) : item)));
      } else if (payload.eventType === 'DELETE') {
        setter((prev: any[]) => prev.filter((item) => item.id !== payload.old.id));
      }
    };

    void fetchCookbooks();
    void fetchEvents();
    void fetchDietPlans();
    if (isAdmin) void fetchSubscribers();

    const cookbooksChannel = supabase
      .channel('realtime-cookbooks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cookbooks' }, (payload) => {
        applyRealtimeUpdate(payload, setCookbooks);
      })
      .subscribe();

    const eventsChannel = supabase
      .channel('realtime-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
        applyRealtimeUpdate(payload, setEvents);
      })
      .subscribe();

    const dietPlansChannel = supabase
      .channel('realtime-dietplans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dietplans' }, (payload) => {
        applyRealtimeUpdate(payload, setDietPlans);
      })
      .subscribe();

    let subscribersChannel: any;
    if (isAdmin) {
      subscribersChannel = supabase
        .channel('realtime-subscribers')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'subscribers' }, (payload) => {
          applyRealtimeUpdate(payload, setSubscribers);
        })
        .subscribe();
    }

    return () => {
      supabase.removeChannel(cookbooksChannel);
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(dietPlansChannel);
      if (subscribersChannel) supabase.removeChannel(subscribersChannel);
    };
  }, [isAdmin]);

  // Persistence of cart items (luxury client experience)
  useEffect(() => {
    const savedCart = localStorage.getItem('saketh_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart items:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setPurchases([]);
      return;
    }

    const savedPurchases = localStorage.getItem(`saketh_purchases_${user.id}`);
    if (savedPurchases) {
      try {
        setPurchases(JSON.parse(savedPurchases));
      } catch (e) {
        console.error('Failed to parse purchases:', e);
      }
    }
  }, [user?.id]);

  const handleSaveCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem('saketh_cart', JSON.stringify(updatedCart));
  };

  const handleAddToCart = (cookbook: Cookbook) => {
    if (!user) {
      handleLogin();
      return;
    }

    const existingIndex = cartItems.findIndex(item => item.cookbook.id === cookbook.id);
    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart = [...cartItems, { cookbook, quantity: 1 }];
    }

    handleSaveCart(updatedCart);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updatedCart = cartItems
      .map(item => {
        if (item.cookbook.id === id) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      })
      .filter(item => item.quantity > 0);

    handleSaveCart(updatedCart);
  };

  const handleRemoveItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.cookbook.id !== id);
    handleSaveCart(updatedCart);
  };

  const handleClearCart = () => {
    handleSaveCart([]);
  };

  const handlePurchaseComplete = (items: CartItem[]) => {
    if (!user?.id) return;

    const purchasedAt = new Date().toISOString();
    const nextPurchases = items.reduce<PurchaseRecord[]>((records, item) => {
      const existingIndex = records.findIndex((record) => record.cookbook.id === item.cookbook.id);
      const record: PurchaseRecord = {
        id: `${item.cookbook.id}-${Date.now()}`,
        cookbook: item.cookbook,
        purchasedAt,
      };

      if (existingIndex >= 0) {
        const updatedRecords = [...records];
        updatedRecords[existingIndex] = { ...records[existingIndex], cookbook: item.cookbook, purchasedAt };
        return updatedRecords;
      }

      return [...records, record];
    }, purchases);

    setPurchases(nextPurchases);
    localStorage.setItem(`saketh_purchases_${user.id}`, JSON.stringify(nextPurchases));
  };

  const handleSubscribe = async (email: string) => {
    if (subscribers.some((s) => s.email === email)) return;
    const subId = `sub-${Date.now()}`;
    const newSub: Subscriber = {
      id: subId,
      email,
      date: new Date().toISOString().split('T')[0],
      status: 'Active',
    };

    try {
      const { error } = await supabase.from('subscribers').insert(newSub);
      if (error) throw error;
    } catch (err) {
      console.error('Subscription failed:', err);
    }
  };

  const handleLogin = async () => {
    if (isSigningIn) return;

    setAuthError('');
    setIsSigningIn(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Google sign-in failed:', err);
      const message = err?.message || 'Google sign-in failed. Please try again.';
      setAuthError(message);
      window.alert(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out failed:', error);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const libraryPurchases = purchases.map((purchase) => {
    const latestCookbook = cookbooks.find((book) => book.id === purchase.cookbook.id);

    return latestCookbook ? { ...purchase, cookbook: latestCookbook } : purchase;
  });

  return (
    <div className="min-h-screen bg-[#0c0c0b] flex flex-col justify-between selection:bg-[#D2B48C]/30 selection:text-[#feddb3]" id="applet-viewport-root">
      {/* Sticky Premium Header navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isAdmin={isAdmin}
      />

      {authError && (
        <div className="fixed left-4 right-4 top-24 z-[120] rounded-lg border border-red-400/30 bg-red-950/90 px-4 py-3 text-sm text-red-100 shadow-xl backdrop-blur-md">
          {authError}
        </div>
      )}

      {/* Main viewport segment (with elegant screen switcher) */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'story' && (
          <StoryView
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'cookbooks' && (
          <CookbooksView
            cookbooks={cookbooks}
            onAddToCart={handleAddToCart}
            onSubscribe={handleSubscribe}
            isSignedIn={Boolean(user)}
            onLogin={handleLogin}
          />
        )}
        {activeTab === 'coaching' && (
          <CoachingView
            events={events}
            dietPlans={dietPlans}
            isSignedIn={Boolean(user)}
            onLogin={handleLogin}
            userName={user?.user_metadata?.full_name || user?.email || ''}
            userEmail={user?.email || ''}
          />
        )}
        {activeTab === 'library' && (
          <PurchaseLibraryView
            purchases={libraryPurchases}
            isSignedIn={Boolean(user)}
            onLogin={handleLogin}
            onBrowseCookbooks={() => setActiveTab('cookbooks')}
          />
        )}
        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard
              cookbooks={cookbooks}
              events={events}
              subscribers={subscribers}
              dietPlans={dietPlans}
              user={user}
            />
          ) : (
            <div className="min-h-screen flex items-center justify-center p-6 text-center bg-[#0c0c0b]">
              <div className="space-y-6 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="w-16 h-16 bg-[#D2B48C]/10 border border-[#D2B48C]/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <div className="w-8 h-8 border-2 border-t-transparent border-[#D2B48C] rounded-full animate-spin" style={{ display: loading ? 'block' : 'none' }}></div>
                  {!loading && <span className="text-[#D2B48C] font-serif text-2xl">S</span>}
                </div>
                <h2 className="font-serif text-3xl tracking-tight text-white">Privileged Access</h2>
                <p className="font-sans text-xs text-[#c4c7c7]/60 leading-relaxed tracking-wider uppercase">
                  The management ledger is restricted to authorized personnel. Please authenticate using the Strategic Identity platform.
                </p>
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-[#D2B48C] text-[#402d10] px-8 py-4 rounded font-bold tracking-widest uppercase text-[10px] hover:bg-[#feddb3] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'AUTHENTICATING...' : 'SIGN IN WITH GOOGLE'}
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Auxiliary Overlays & slide trays */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        isSignedIn={Boolean(user)}
        onLogin={handleLogin}
        onPurchaseComplete={handlePurchaseComplete}
        onOpenLibrary={() => setActiveTab('library')}
      />
    </div>
  );
}
