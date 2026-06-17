export type ActiveTab = 'home' | 'cookbooks' | 'coaching' | 'library' | 'admin';

export interface Subscriber {
  id: string;
  email: string;
  date: string;
  status: 'Active' | 'Unsubscribed';
}

export interface Cookbook {
  id: string;
  title: string;
  category: 'high-protein' | 'vegetarian' | 'air-fryer';
  price: number;
  oldPrice?: number;
  description: string;
  image: string;
  pdfUrl?: string;
  tag?: string;
  features: string[];
  macros?: string;
}

export interface CartItem {
  cookbook: Cookbook;
  quantity: number;
}

export interface PurchaseRecord {
  id: string;
  cookbook: Cookbook;
  purchasedAt: string;
}

export interface EventSession {
  id: string;
  title: string;
  date: string;
  month: string;
  description: string;
  time: string;
  joined: number;
  tag: string;
  tagColor: string;
  image: string;
  level?: string;
}

export interface DietPlan {
  id: string;
  title: string;
  price: number;
  period: string;
  description: string;
  image: string;
  badge?: string;
  popular?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
}
