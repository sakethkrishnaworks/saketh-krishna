'use client';

import { useState, useEffect } from 'react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import CookbooksView from './components/CookbooksView';
import CoachingView from './components/CoachingView';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import FullStoryModal from './components/FullStoryModal';
import CartDrawer from './components/CartDrawer';
import { ActiveTab, CartItem, Cookbook, EventSession, Subscriber, DietPlan } from './types';
import { COOKBOOKS_DATA, EVENTS_DATA, DIET_PLANS } from './data';
import { auth, db, googleProvider, testFirebaseConnection } from './lib/firebase';
import { getRedirectResult, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // State synchronized with Firebase
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [events, setEvents] = useState<EventSession[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isStoryOpen, setIsStoryOpen] = useState<boolean>(false);

  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.error('Google redirect sign-in failed:', err);
    });
  }, []);

  // Check Admin Status and Bootstrap primary user
  useEffect(() => {
    async function checkAdmin() {
      if (user) {
        // Special bootstrap for authorized administrators
        const authorizedEmails = ['sakethkrishna.work@gmail.com', 'gokulkannan0205@gmail.com'];
        if (user.email && authorizedEmails.includes(user.email.toLowerCase())) {
          try {
            const adminRef = doc(db, 'admins', user.uid);
            const adminSnap = await getDoc(adminRef);
            if (!adminSnap.exists()) {
              await setDoc(adminRef, { uid: user.uid, email: user.email.toLowerCase(), role: 'admin' });
              console.log('Admin bootstrap successful for:', user.email);
            }
          } catch (err) {
            console.error('Admin bootstrap failed:', err);
          }
        }

        const adminRef = doc(db, 'admins', user.uid);
        const adminSnap = await getDoc(adminRef);
        setIsAdmin(adminSnap.exists());
      } else {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [user]);

  // Sync state with Firestore real-time listeners
  useEffect(() => {
    testFirebaseConnection();

    // Subscribe to Cookbooks
    const unsubCookbooks = onSnapshot(collection(db, 'cookbooks'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data() as Cookbook }));
      setCookbooks(data.length > 0 ? data : COOKBOOKS_DATA);
    }, (err) => {
      console.error('Cookbooks fetch failed:', err);
    });

    // Subscribe to Events
    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data() as EventSession }));
      setEvents(data.length > 0 ? data : EVENTS_DATA);
    }, (err) => {
      console.error('Events fetch failed:', err);
    });

    // Subscribe to Diet Plans
    const unsubDietPlans = onSnapshot(collection(db, 'dietPlans'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data() as DietPlan }));
      setDietPlans(data.length > 0 ? data : DIET_PLANS);
    }, (err) => {
      console.error('Diet plans fetch failed:', err);
    });

    let unsubSubs: (() => void) | undefined;
    if (isAdmin) {
      unsubSubs = onSnapshot(collection(db, 'subscribers'), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data() as Subscriber }));
        setSubscribers(data);
      }, (err) => {
        console.error('Subscribers stream restricted:', err);
      });
    }

    return () => {
      unsubCookbooks();
      unsubEvents();
      unsubDietPlans();
      if (unsubSubs) unsubSubs();
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

  const handleSubscribe = async (email: string) => {
    if (subscribers.some(s => s.email === email)) return;
    const subId = `sub-${Date.now()}`;
    const newSub: Subscriber = {
      id: subId,
      email,
      date: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    
    try {
      await setDoc(doc(db, 'subscribers', subId), newSub);
    } catch (err) {
      console.error('Subscription failed:', err);
    }
  };

  const handleLogin = async () => {
    const isMobileBrowser =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches;

    try {
      if (isMobileBrowser) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      console.error('Google sign-in failed:', err);
    }
  };
  const handleLogout = () => signOut(auth);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col justify-between selection:bg-[#D2B48C]/30 selection:text-[#feddb3]" id="applet-viewport-root">
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

      {/* Main viewport segment (with elegant screen switcher) */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={setActiveTab}
            onReadStory={() => setIsStoryOpen(true)}
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

      {/* Standard bottom footer layout */}
      <Footer 
        onNavigate={setActiveTab} 
        onSubscribe={handleSubscribe} 
      />

      {/* Auxiliary Overlays & slide trays */}
      <FullStoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        isSignedIn={Boolean(user)}
        onLogin={handleLogin}
      />
    </div>
  );
}
