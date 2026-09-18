import {
  CartItem,
  CoachingPlan,
  Consultation,
  Cookbook,
  Course,
  DietPlan,
  ProductKind,
  PurchasableProduct,
} from '../types';

/** Bundle id -> cookbook ids it unlocks in the reader. */
export const BUNDLE_CONTENTS: Record<string, string[]> = {
  'complete-bundle': ['telugu-kitchen', 'air-fryer', 'meal-prep'],
};

export const KIND_LABELS: Record<ProductKind, string> = {
  cookbook: 'Cookbook',
  diet: 'Diet Plan',
  coaching: 'Coaching',
  consultation: 'Consultation',
  course: 'Course',
};

export function kindLabel(kind: string | undefined): string {
  return (KIND_LABELS as Record<string, string>)[kind ?? ''] ?? 'Item';
}

export function cookbookToProduct(book: Cookbook): PurchasableProduct {
  return {
    id: book.id,
    kind: 'cookbook',
    title: book.title,
    price: book.price,
    image: book.image,
    pdf_url: book.pdfUrl ?? null,
  };
}

export function dietPlanToProduct(plan: DietPlan): PurchasableProduct {
  return { id: plan.id, kind: 'diet', title: plan.title, price: plan.price, image: plan.image };
}

export function coachingPlanToProduct(plan: CoachingPlan): PurchasableProduct {
  return { id: plan.id, kind: 'coaching', title: plan.title, price: plan.price, image: plan.image };
}

export function consultationToProduct(item: Consultation): PurchasableProduct {
  return { id: item.id, kind: 'consultation', title: item.title, price: item.price, image: item.image };
}

export function courseToProduct(course: Course): PurchasableProduct {
  return { id: course.id, kind: 'course', title: course.title, price: course.price, image: course.image };
}

/** Migrate pre-generic carts stored as { cookbook, quantity }. */
export function normalizeCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CartItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as { product?: PurchasableProduct; cookbook?: Cookbook; quantity?: unknown };
    const quantity = typeof item.quantity === 'number' && Number.isSafeInteger(item.quantity) && item.quantity > 0
      ? Math.min(item.quantity, 100)
      : 1;
    if (item.product && typeof item.product.id === 'string' && typeof item.product.title === 'string' &&
        typeof item.product.price === 'number') {
      out.push({ product: item.product, quantity });
    } else if (item.cookbook && typeof item.cookbook.id === 'string') {
      out.push({ product: cookbookToProduct(item.cookbook), quantity });
    }
  }
  return out;
}
