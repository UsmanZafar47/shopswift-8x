import 'server-only';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { Product } from './catalog';

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
async function database(path: string, body?: unknown) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new ApiError(
      'The catalog connection is not configured yet. Please try again later.',
      503,
    );
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
      ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (error.code === 'P0001')
      throw new ApiError(error.message, /not found/i.test(error.message) ? 404 : 409);
    throw new ApiError('The database could not complete this request. Please try again.', 503);
  }
  return response.json();
}
export async function catalog(): Promise<Product[]> {
  const rows = await database('products?select=*&order=created_at.asc,id.asc');
  return rows.map((p: Record<string, unknown>) => ({
    id: p.id,
    title: p.name,
    brand: p.brand,
    category: p.category,
    price: Number(p.price),
    originalPrice: Number(p.original_price),
    description: p.description,
    tagline: p.tagline,
    features: p.features,
    images: p.images,
    variants: p.variants,
    rating: Number(p.rating),
    reviews: p.review_count,
    stock: p.stock,
  }));
}
export async function shop(action: string, data: unknown = {}) {
  const jar = await cookies();
  let token = jar.get('orbit_session')?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    token = randomBytes(32).toString('hex');
    jar.set('orbit_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return database('rpc/orbit_shop', { p_token: token, p_action: action, p_data: data });
}
export async function input(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    throw new ApiError('Cross-site request rejected', 403);
  const raw = await request.text();
  if (raw.length > 12000) throw new ApiError('Request is too large', 413);
  try {
    const data = JSON.parse(raw || '{}');
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data;
  } catch {
    throw new ApiError('Invalid JSON request');
  }
}
export function textField(value: unknown, name: string, max = 200) {
  if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw new ApiError(`Invalid ${name}`);
  return value.trim();
}
export function quantity(value: unknown) {
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 10)
    throw new ApiError('Quantity must be an integer from 1 to 10');
}
export const uuid = (value: string) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))
    throw new ApiError('Invalid ID');
  return value;
};
export async function respond(fn: () => Promise<unknown>, status = 200) {
  try {
    return Response.json(await fn(), { status, headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return Response.json(
      { error: e instanceof ApiError ? e.message : 'Service unavailable. Please retry.' },
      { status: e instanceof ApiError ? e.status : 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
