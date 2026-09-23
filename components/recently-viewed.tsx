'use client';
import { useStore } from './store';
import { getProduct, Product } from '@/lib/catalog';
import { ProductSection } from './ui';
export function RecentlyViewed() {
  const { recent } = useStore();
  const items = recent.map(getProduct).filter((p): p is Product => !!p);
  return items.length ? (
    <ProductSection
      title="Worth another look."
      subtitle="Your recently viewed finds."
      products={items.slice(0, 5)}
    />
  ) : null;
}
