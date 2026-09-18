'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import CookbooksView from './components/CookbooksView';
import CoachingView from './components/CoachingView';
import AdminDashboard from './components/AdminDashboard';
import StoryView from './components/StoryView';
import CartDrawer from './components/CartDrawer';
import PurchaseLibraryView from './components/PurchaseLibraryView';
import { ToastProvider, useToast } from './components/ToastProvider';
import { ActiveTab, CartItem, Cookbook, EventSession, Subscriber, DietPlan, PurchaseRecord, PurchasePayload } from './types';
import { supabase } from './lib/supabase';
import { isAuthorizedAdminEmail } from './lib/admins';
import { normalizeCookbook, normalizeEvent, normalizePurchase } from './lib/normalize';
import { User } from '@supabase/supabase-js';

function cartStorageKey(userId?: string | null): string {
  // Carts are scoped per account so a shared browser can't leak items between
  // two signed-in users. Anonymous browsing keeps the shared guest cart.
  return userId ? `saketh_cart_${userId}` : 'saketh_cart';
}

function AppContent() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCatalogLoading, setIsCatalogLoading] = useState<boolean>(true);

  // State synchronized with Supabase
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [events, setEvents] = useState<EventSession[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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

  // Admin status. Only an `admins` table row grants access. Whitelisted emails
  // may bootstrap that row once; if RLS or the lookup fails we fail CLOSED —
  // never fall back to trusting a client-side email list.
  useEffect(() => {
    async function checkAdmin() {
      if (!user?.id || !user?.email) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setIsAdmin(true);
          return;
        }

        if (isAuthorizedAdminEmail(user.email)) {
          const { error: upsertError } = await supabase
            .from('admins')
            .upsert(
              { user_id: user.id, email: user.email.toLowerCase(), role: 'admin' },
              { onConflict: 'user_id' }
            );

          if (upsertError) {
            console.error('Admin bootstrap denied:', upsertError.message);
            setIsAdmin(false);
            return;
          }
          setIsAdmin(true);
          return;
        }

        setIsAdmin(false);
      } catch (err) {
        console.error('Admin lookup failed:', err);
        setIsAdmin(false);
      }
    }

    void checkAdmin();
  }, [user]);

  // Sync catalog state with Supabase
  useEffect(() => {
    const fetchCookbooks = async () => {
      const { data, error } = await supabase.from('cookbooks').select('*');
      if (error) {
        console.error('Cookbooks fetch failed:', error);
        return;
      }
      setCookbooks((data ?? []).map((row: any) => normalizeCookbook(row as Record<string, any>)));
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

    void fetchCookbooks();
    void fetchEvents();
    void fetchDietPlans();
    setIsCatalogLoading(false);
    if (isAdmin) void fetchSubscribers();

    const applyRealtimeUpdate = (payload: any, setter: any) => {
      if (payload.eventType === 'INSERT') {
        setter((prev: any[]) => [...prev, payload.new]);
      } else if (payload.eventType === 'UPDATE') {
        setter((prev: any[]) => prev.map((item) => (item.id === payload.new.id ? payload.new : item)));
      } else if (payload.eventType === 'DELETE') {
        setter((prev: any[]) => prev.filter((item) => item.id !== payload.old.id));
      }
    };

    const cookbooksChannel = supabase
      .channel('realtime-cookbooks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cookbooks' }, (payload) => {
        applyRealtimeUpdate(payload, (prev: any[]) => prev.map((row: any) => normalizeCookbook(row)));
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

  // Load the cart scoped to the current account.
  useEffect(() => {
    const key = cartStorageKey(user?.id);
    try {
      const savedCart = localStorage.getItem(key);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } catch (e) {
      console.error('Failed to parse cart items:', e);
      setCartItems([]);
    }
  }, [user?.id]);

  // Load purchases from the server (single source of truth).
  const refreshPurchases = useCallback(async () => {
    if (!user?.id) {
      setPurchases([]);
      return;
    }

    let query = supabase.from('purchases').select('*');
    if (!isAdmin) query = query.eq('user_id', user.id);
    query = query.order('purchased_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error('Purchases fetch failed:', error);
      throw new Error('Could not load your library. Please refresh or contact support; do not pay again.');
    }
    const loaded = (data ?? []).map(normalizePurchase);
    setPurchases(loaded);
    return loaded;
  }, [user?.id, isAdmin]);

  useEffect(() => {
    setPurchases([]);
    void refreshPurchases().catch(() => toast('Could not load your library. Please refresh or contact support.', 'error'));

    if (!user?.id) return;

    const purchasesChannel = supabase
      .channel('realtime-purchases')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'purchases' }, (payload) => {
        const row = payload.new as Record<string, unknown>;
        if (isAdmin || row.user_id === user.id) {
          setPurchases((prev) => [normalizePurchase(row), ...prev.filter((purchase) => purchase.id !== row.id)]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(purchasesChannel);
    };
  }, [user?.id, isAdmin, refreshPurchases]);

  const handleSaveCart = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem(cartStorageKey(user?.id), JSON.stringify(updatedCart));
  };

  const handleAddToCart = (cookbook: Cookbook) => {
    if (!user) {
      handleLogin();
      return;
    }

    const existingIndex = cartItems.findIndex((item) => item.cookbook.id === cookbook.id);
    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      // Immutable update — never mutate the existing state object.
      updatedCart = cartItems.map((item, index) =>
        index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cartItems, { cookbook, quantity: 1 }];
    }

    handleSaveCart(updatedCart);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updatedCart = cartItems
      .map((item) => {
        if (item.cookbook.id === id) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    handleSaveCart(updatedCart);
  };

  const handleRemoveItem = (id: string) => {
    const updatedCart = cartItems.filter((item) => item.cookbook.id !== id);
    handleSaveCart(updatedCart);
  };

  const handleClearCart = () => {
    handleSaveCart([]);
  };

  const handlePurchaseComplete = async (payload: PurchasePayload) => {
    if (!user?.id || !payload.recorded || payload.items.length === 0) {
      throw new Error('Your purchase could not be confirmed in the library. Contact support; do not pay again.');
    }

    const loaded = await refreshPurchases();
    const allRecorded = payload.items.every((item) => loaded?.some((purchase) =>
      purchase.user_id === user.id && purchase.cookbook_id === item.id &&
      purchase.razorpay_order_id === payload.orderId && purchase.status === 'paid'
    ));
    if (!allRecorded) {
      throw new Error('Payment received, but your library has not loaded yet. Refresh or contact support; do not pay again.');
    }
    toast('Payment confirmed. Your cookbooks are now in your library.', 'success');
  };

  const handleSubscribe = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    try {
      // Case-insensitive existence check so "A@b.com" and "a@b.com" match.
      const { data: existing } = await supabase
        .from('subscribers')
        .select('id')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      if (existing) {
        toast("You're already subscribed.", 'info');
        return;
      }

      const { error } = await supabase.from('subscribers').insert({
        id: `sub-${Date.now()}`,
        email: normalizedEmail,
        date: new Date().toISOString().split('T')[0],
        status: 'Active',
      });

      if (error) {
        // Race-safe fallback: unique constraint means another request won.
        if (error.code === '23505') {
          toast("You're already subscribed.", 'info');
          return;
        }
        throw error;
      }

      toast('Subscribed! Welcome to the collective.', 'success');
    } catch (err) {
      console.error('Subscription failed:', err);
      toast('Subscription failed. Please try again.', 'error');
    }
  };

  const handleLogin = async () => {
    if (isSigningIn) return;

    setAuthError('');
    setIsSigningIn(true);

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: siteUrl,
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
      toast(message, 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out failed:', error);
      toast('Sign out failed. Please try again.', 'error');
    } else {
      setActiveTab('home');
    }
  };

  // Auto-dismiss the auth banner instead of leaving it stuck on screen.
  useEffect(() => {
    if (!authError) return;
    const timer = window.setTimeout(() => setAuthError(''), 6000);
    return () => window.clearTimeout(timer);
  }, [authError]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isAdminView = activeTab === 'admin';

  return (
    <div
      id="applet-viewport-root"
      className={
        isAdminView
          ? 'admin-viewport min-h-dvh bg-[#0c0c0b] flex flex-col selection:bg-[#D2B48C]/30 selection:text-[#feddb3]'
          : 'mobile-viewport min-h-dvh bg-[#0c0c0b] flex flex-col justify-between selection:bg-[#D2B48C]/30 selection:text-[#feddb3]'
      }
    >
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

      <main className="flex-grow">
        {activeTab === 'home' && (
          <HomeView onNavigate={setActiveTab} />
        )}
        {activeTab === 'story' && (
          <StoryView onNavigate={setActiveTab} />
        )}
        {activeTab === 'cookbooks' && (
          <CookbooksView
            cookbooks={cookbooks}
            onAddToCart={handleAddToCart}
            onSubscribe={handleSubscribe}
            isSignedIn={Boolean(user)}
            onLogin={handleLogin}
            isLoading={isCatalogLoading}
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
            userId={user?.id}
          />
        )}
        {activeTab === 'library' && (
          <PurchaseLibraryView
            purchases={purchases}
            cookbooks={cookbooks}
            isSignedIn={Boolean(user)}
            onLogin={handleLogin}
            onBrowseCookbooks={() => setActiveTab('cookbooks')}
          />
        )}
        {isAdminView &&
          (isAdmin ? (
            <AdminDashboard
              cookbooks={cookbooks}
              events={events}
              subscribers={subscribers}
              dietPlans={dietPlans}
              purchases={purchases}
              user={user}
              onNavigate={setActiveTab}
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
          ))}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        isSignedIn={Boolean(user)}
        userName={user?.user_metadata?.full_name || user?.email || ''}
        userEmail={user?.email || ''}
        onLogin={handleLogin}
        onPurchaseComplete={handlePurchaseComplete}
        onOpenLibrary={() => setActiveTab('library')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
