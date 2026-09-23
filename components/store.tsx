'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getProduct } from '@/lib/catalog';

export type CartItem = { productId: string; variant: string; quantity: number };
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
type Account = User & { passwordHash: string };
type State = {
  version: 1;
  cart: CartItem[];
  saved: CartItem[];
  user: User | null;
  accounts: Account[];
  addresses: Record<string, Address>;
  orders: Order[];
  recent: string[];
};
const empty: State = {
  version: 1,
  cart: [],
  saved: [],
  user: null,
  accounts: [],
  addresses: {},
  orders: [],
  recent: [],
};
const key = 'shopswift-demo-v1';
const validItem = (i: CartItem) =>
  i &&
  getProduct(i.productId)?.variants.includes(i.variant) &&
  Number.isInteger(i.quantity) &&
  i.quantity >= 1 &&
  i.quantity <= 10;
function readState(raw: string | null): State {
  if (!raw) return empty;
  const s = JSON.parse(raw);
  if (
    s.version !== 1 ||
    !Array.isArray(s.cart) ||
    !s.cart.every(validItem) ||
    !Array.isArray(s.saved) ||
    !s.saved.every(validItem) ||
    !Array.isArray(s.accounts) ||
    !Array.isArray(s.orders) ||
    !Array.isArray(s.recent) ||
    !s.addresses ||
    typeof s.addresses !== 'object'
  )
    throw new Error('Invalid saved data');
  if (s.user && (typeof s.user.name !== 'string' || typeof s.user.email !== 'string'))
    throw new Error('Invalid saved account');
  if (
    !s.orders.every(
      (o: Order) =>
        typeof o.id === 'string' &&
        typeof o.email === 'string' &&
        Array.isArray(o.items) &&
        o.items.every(
          (i) => validItem(i) && typeof i.price === 'number' && typeof i.title === 'string',
        ) &&
        o.address &&
        typeof o.total === 'number',
    )
  )
    throw new Error('Invalid saved orders');
  return s;
}
type Store = State & {
  ready: boolean;
  toast: string;
  storageError: boolean;
  notify: (s: string) => void;
  add: (id: string, variant: string, quantity?: number) => void;
  quantity: (id: string, variant: string, n: number) => void;
  remove: (id: string, variant: string) => void;
  save: (id: string, variant: string) => void;
  restore: (id: string, variant: string) => void;
  view: (id: string) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  demoLogin: () => void;
  logout: () => void;
  saveAddress: (a: Address) => void;
  placeOrder: (a: Address, express: boolean, payment: string) => string;
};
const Context = createContext<Store | null>(null);
async function hash(password: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`shopswift-demo:${password}`),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(empty);
  const current = useRef(state);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState('');
  const [storageError, setStorageError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 4200);
  }, []);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = readState(localStorage.getItem(key));
        current.current = saved;
        setState(saved);
      } catch {
        setStorageError(true);
      }
      setReady(true);
    });
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          const s = readState(event.newValue);
          current.current = s;
          setState(s);
        } catch {
          setStorageError(true);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      active = false;
      window.removeEventListener('storage', onStorage);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  const update = useCallback((fn: (s: State) => State, mustPersist = false) => {
    const next = fn(current.current);
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
      if (mustPersist)
        throw new Error(
          'Your browser could not save the order. Enable browser storage and try again. Your cart is unchanged.',
        );
    }
    current.current = next;
    setState(next);
  }, []);
  const add = (id: string, variant: string, quantity = 1) => {
    const product = getProduct(id);
    if (!product || !product.variants.includes(variant)) return;
    update((s) => {
      const existing = s.cart.find((i) => i.productId === id && i.variant === variant);
      const n = Math.min(10, product.stock, (existing?.quantity || 0) + quantity);
      return {
        ...s,
        cart: existing
          ? s.cart.map((i) => (i === existing ? { ...i, quantity: n } : i))
          : [...s.cart, { productId: id, variant, quantity: n }],
      };
    });
    notify(`${product.title} added to your cart`);
  };
  const view = useCallback(
    (id: string) => {
      if (getProduct(id) && current.current.recent[0] !== id)
        update((s) => ({ ...s, recent: [id, ...s.recent.filter((p) => p !== id)].slice(0, 6) }));
    },
    [update],
  );
  const matches = (i: CartItem, id: string, v: string) => i.productId === id && i.variant === v;
  const value: Store = {
    ...state,
    ready,
    toast,
    storageError,
    notify,
    add,
    view,
    quantity: (id, v, n) =>
      update((s) => ({
        ...s,
        cart: s.cart.map((i) =>
          matches(i, id, v) ? { ...i, quantity: Math.max(1, Math.min(10, n)) } : i,
        ),
      })),
    remove: (id, v) => {
      update((s) => ({ ...s, cart: s.cart.filter((i) => !matches(i, id, v)) }));
      notify('Item removed from your cart');
    },
    save: (id, v) => {
      update((s) => ({
        ...s,
        cart: s.cart.filter((i) => !matches(i, id, v)),
        saved: [
          ...s.saved.filter((i) => !matches(i, id, v)),
          ...s.cart.filter((i) => matches(i, id, v)),
        ],
      }));
      notify('Saved for later');
    },
    restore: (id, v) => {
      const item = current.current.saved.find((i) => matches(i, id, v));
      if (item) {
        add(id, v, item.quantity);
        update((s) => ({ ...s, saved: s.saved.filter((i) => !matches(i, id, v)) }));
      }
    },
    login: async (email, password) => {
      const normalized = email.trim().toLowerCase();
      let user: User;
      if (normalized === 'demo@shopswift.com' && password === 'demo123')
        user = { name: 'Alex', email: normalized };
      else {
        const passwordHash = await hash(password);
        const a = current.current.accounts.find(
          (a) => a.email === normalized && a.passwordHash === passwordHash,
        );
        if (!a)
          throw new Error('Email or password is incorrect. You can also continue as a demo user.');
        user = { name: a.name, email: a.email };
      }
      update((s) => ({ ...s, user }));
      notify(`Welcome back, ${user.name}!`);
    },
    signup: async (name, email, password) => {
      const normalized = email.trim().toLowerCase();
      if (
        normalized === 'demo@shopswift.com' ||
        current.current.accounts.some((a) => a.email === normalized)
      )
        throw new Error(
          'An account with this email already exists in this browser. Please sign in.',
        );
      const passwordHash = await hash(password);
      const user = { name: name.trim(), email: normalized };
      update((s) => ({ ...s, user, accounts: [...s.accounts, { ...user, passwordHash }] }));
      notify(`Welcome to ShopSwift, ${user.name}!`);
    },
    demoLogin: () => {
      update((s) => ({ ...s, user: { name: 'Alex', email: 'demo@shopswift.com' } }));
      notify('You’re signed in as Alex, our demo shopper');
    },
    logout: () => {
      update((s) => ({ ...s, user: null }));
      notify('You’ve signed out');
    },
    saveAddress: (a) =>
      update((s) => (s.user ? { ...s, addresses: { ...s.addresses, [s.user.email]: a } } : s)),
    placeOrder: (address, express, payment) => {
      const s = current.current;
      if (!s.user) throw new Error('Please sign in to place your demo order.');
      if (!s.cart.length) throw new Error('Your cart is empty. Add an item before checking out.');
      const items = s.cart.map((i) => {
        const p = getProduct(i.productId)!;
        return { ...i, title: p.title, image: p.images[0], price: p.price };
      });
      const subtotal =
        items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0) / 100;
      const shipping = express ? 9.99 : subtotal >= 50 ? 0 : 4.99;
      const id = `SW-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const order: Order = {
        id,
        email: s.user.email,
        created: new Date().toISOString(),
        items,
        address,
        payment,
        subtotal,
        shipping,
        total: Math.round((subtotal + shipping) * 100) / 100,
        express,
      };
      update(
        (s) => ({
          ...s,
          orders: [order, ...s.orders],
          cart: [],
          addresses: { ...s.addresses, [s.user!.email]: address },
        }),
        true,
      );
      return id;
    },
  };
  return (
    <Context.Provider value={value}>
      {children}
      {storageError && (
        <div className="storage-warning" role="alert">
          Browser storage is unavailable or saved data could not be read. Changes may not survive a
          refresh.
        </div>
      )}
      <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">
        {toast && (
          <>
            <span className="toast-check">✓</span>
            {toast}
          </>
        )}
      </div>
    </Context.Provider>
  );
}
export const useStore = () => {
  const value = useContext(Context);
  if (!value) throw new Error('StoreProvider missing');
  return value;
};
