import { getProduct, products } from '@/lib/catalog';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product-detail';
export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = getProduct((await params).id);
  return { title: p?.title || 'Product not found' };
}
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = getProduct((await params).id);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
