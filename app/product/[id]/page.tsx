import { catalog } from '@/lib/database';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product-detail';
export const dynamic = 'force-dynamic';
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = (await catalog()).find((p) => p.id === id);
  if (!p) notFound();
  return <ProductDetail product={p} />;
}
