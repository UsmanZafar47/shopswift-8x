'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Product } from '@/lib/catalog';
export type CartItem = { id: string; productId: string; variant: string; quantity: number };
export type User = { name: string; email: string };
export type Address = {
  name: string;
  street: string;
  city: string;
  region: string;
  zip: string;
  country: string;
};
export type Order = {
  id: string;
  email: string;
  created: string;
  items: (CartItem & { title: string; image: string; price: number })[];
  address: Address;
  payment: string;
  shipping: number;
  subtotal: number;
  total: number;
  express: boolean;
};
type State = {
  cart: CartItem[];
  saved: CartItem[];
  user: User | null;
  addresses: Record<string, Address>;
  orders: Order[];
};
const empty: State = { cart: [], saved: [], user: null, addresses: {}, orders: [] };
type Store = State & {
  products: Product[];
  recent: string[];
  ready: boolean;
  busy: boolean;
  error: string;
  toast: string;
  getProduct: (id: string) => Product | undefined;
  notify: (s: string) => void;
  refresh: () => Promise<void>;
  add: (id: string, variant: string, quantity?: number) => Promise<boolean>;
  quantity: (id: string, variant: string, n: number) => Promise<boolean>;
  remove: (id: string, variant: string) => Promise<boolean>;
  save: (id: string, variant: string) => Promise<boolean>;
  restore: (id: string, variant: string) => Promise<boolean>;
  view: (id: string) => void;
  profile: (name: string, email: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  placeOrder: (a: Address, express: boolean, payment: string) => Promise<string>;
};
const Context = createContext<Store | null>(null);
async function api(path: string, method = 'GET', body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed. Please retry.');
  return data;
}
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(empty),
    [products, setProducts] = useState<Product[]>([]),
    [recent, setRecent] = useState<string[]>([]),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    locked = useRef(false),
    orderRequest = useRef<string | null>(null);
  const notify = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 4200);
  }, []);
  const refresh = useCallback(async () => {
    try {
      const [catalog, data] = await Promise.all([api('/api/products'), api('/api/cart')]);
      setProducts(catalog.products);
      setState(data);
      setError('');
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to connect');
      setReady(false);
    }
  }, []);
  useEffect(() => {
    queueMicrotask(() => void refresh());
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [refresh]);
  const view = useCallback(
    (id: string) => setRecent((old) => [id, ...old.filter((i) => i !== id)].slice(0, 8)),
    [],
  );
  async function mutation(path: string, method: string, body: unknown, message: string) {
    if (locked.current) return false;
    locked.current = true;
    setBusy(true);
    try {
      const data = await api(path, method, body);
      setState(data);
      notify(message);
      return true;
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Unable to save changes');
      return false;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  const item = (id: string, variant: string) =>
    [...state.cart, ...state.saved].find((i) => i.productId === id && i.variant === variant);
  async function edit(id: string, variant: string, body: unknown, method = 'PATCH') {
    const i = item(id, variant);
    return i ? mutation(`/api/cart/${i.id}`, method, body, 'Cart updated') : false;
  }
  const profile = async (name: string, email: string) => {
    const data = await api('/api/profile', 'POST', { name, email });
    setState(data);
    notify('Guest details saved');
  };
  const value: Store = {
    ...state,
    products,
    recent,
    ready,
    busy,
    error,
    toast,
    refresh,
    notify,
    view,
    profile,
    getProduct: (id) => products.find((p) => p.id === id),
    add: (id, variant, quantity = 1) =>
      mutation('/api/cart', 'POST', { productId: id, variant, quantity }, 'Added to your bag'),
    quantity: (id, v, n) => edit(id, v, { quantity: n }),
    remove: (id, v) => edit(id, v, {}, 'DELETE'),
    save: (id, v) => edit(id, v, { saved: true }),
    restore: (id, v) => edit(id, v, { saved: false }),
    demoLogin: async () => {
      try {
        await profile('Alex Morgan', 'alex@example.com');
      } catch (e) {
        notify(e instanceof Error ? e.message : 'Unable to start guest checkout');
      }
    },
    placeOrder: async (address, express, payment) => {
      orderRequest.current ??= crypto.randomUUID();
      const result = await api('/api/orders', 'POST', {
        address,
        express,
        payment,
        requestId: orderRequest.current,
      });
      await refresh();
      orderRequest.current = null;
      return result.id;
    },
  };
  return (
    <Context.Provider value={value}>
      {error ? (
        <div className="page-shell connection-error" role="alert">
          <span className="eyebrow">CONNECTION INTERRUPTED</span>
          <h1>We couldn’t load the store.</h1>
          <p>{error}</p>
          <button className="button primary" onClick={() => void refresh()}>
            Try again
          </button>
        </div>
      ) : (
        children
      )}
      <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
      {busy && (
        <div className="saving-indicator" role="status">
          Saving your bag…
        </div>
      )}
    </Context.Provider>
  );
}
export const useStore = () => {
  const store = useContext(Context);
  if (!store) throw new Error('StoreProvider missing');
  return store;
};
