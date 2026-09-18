export type ActiveTab = 'home' | 'story' | 'cookbooks' | 'coaching' | 'library' | 'admin';

export interface Subscriber {
  id: string;
  email: string;
  date: string;
  status: 'Active' | 'Unsubscribed';
}

export interface Cookbook {
  id: string;
  title: string;
  category: 'high-protein' | 'vegetarian' | 'air-fryer' | 'bundle';
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
  product: PurchasableProduct;
  quantity: number;
}

export type ProductKind = 'cookbook' | 'diet' | 'coaching' | 'consultation' | 'course';

/** Anything sellable through cart + Razorpay. Cookbooks/bundles carry a PDF; services carry scheduling. */
export interface PurchasableProduct {
  id: string;
  kind: ProductKind;
  title: string;
  price: number;
  image: string;
  pdf_url?: string | null;
}

/**
 * A purchase row from the `purchases` table. The paid product is snapshotted
 * (title/image/pdf_url/price) so the library survives catalog edits, while
 * `cookbook_id` lets us pick up a fresher PDF link when one exists.
 */
export interface PurchaseRecord {
  id: string;
  user_id?: string;
  cookbook_id: string | null;
  product_kind?: string;
  product_id?: string | null;
  title: string;
  image?: string | null;
  pdf_url?: string | null;
  price?: number | null;
  quantity?: number;
  amount_paid?: number | null;
  currency?: string;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  status?: string;
  purchased_at: string;
}

/** Payload handed to the parent after a verified payment. */
export interface PurchasePayload {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  items: Array<{
    id: string;
    kind: string;
    title: string;
    image: string | null;
    pdf_url: string | null;
    price: number;
    quantity: number;
  }>;
  /** True when the server already wrote the rows (service role configured). */
  recorded: boolean;
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
  goal?: string;
  dietType?: 'veg' | 'non-veg' | 'vegan' | 'any';
}

export interface CoachingPlan {
  id: string;
  title: string;
  price: number;
  duration: string;
  durationMonths: number;
  description: string;
  image: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

export interface Consultation {
  id: string;
  title: string;
  price: number;
  duration: string;
  description: string;
  image: string;
}

export interface Course {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  tag?: string;
  features: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
