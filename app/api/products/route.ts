import { catalog, respond } from '@/lib/database';
export async function GET(request: Request) {
  return respond(async () => {
    const q = new URL(request.url).searchParams;
    const search = (q.get('search') || q.get('q') || '').toLowerCase();
    const products = (await catalog()).filter(
      (p) =>
        (!search ||
          `${p.title} ${p.category} ${p.description} ${p.brand}`.toLowerCase().includes(search)) &&
        (!q.get('category') || p.category === q.get('category')),
    );
    if (q.get('sort') === 'price-asc') products.sort((a, b) => a.price - b.price);
    if (q.get('sort') === 'price-desc') products.sort((a, b) => b.price - a.price);
    if (q.get('sort') === 'rating') products.sort((a, b) => b.rating - a.rating);
    return { products };
  });
}
