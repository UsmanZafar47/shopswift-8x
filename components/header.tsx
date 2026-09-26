'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, ShoppingBag, ArrowUpRight, ArrowRight } from 'lucide-react';
import { useStore } from './store';
import { money } from '@/lib/catalog';
export function Logo() {
  return (
    <span className="orbit-logo">
      <span className="orbit-mark" aria-hidden="true" />
      orbit<span className="logo-caption">MARKET</span>
    </span>
  );
}
export function Header() {
  const store = useStore(),
    router = useRouter();
  const [query, setQuery] = useState(''),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  const suggestions = query.trim()
    ? store.products
        .filter((p) =>
          `${p.title} ${p.category} ${p.description} ${p.brand}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
        )
        .slice(0, 4)
    : [];
  const count = store.cart.reduce((n, i) => n + i.quantity, 0);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <header className="orbit-header">
        <Link href="/" aria-label="Orbit Market home">
          <Logo />
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/search">The collection</Link>
          <Link href="/about">
            Our approach <ArrowUpRight size={13} />
          </Link>
        </nav>
        <form
          className="orbit-search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
            router.push(`/search?q=${encodeURIComponent(query)}`);
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
          }}
        >
          <Search size={18} />
          <input
            placeholder="Find your everyday favorite"
            aria-label="Search products"
            role="combobox"
            aria-controls="search-suggestions"
            aria-expanded={open && suggestions.length > 0}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `suggestion-${active}` : undefined}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false);
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, suggestions.length - 1));
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(-1, a - 1));
              }
              if (e.key === 'Enter' && active >= 0 && suggestions[active]) {
                e.preventDefault();
                setOpen(false);
                router.push(`/product/${suggestions[active].id}`);
              }
            }}
          />
          <button aria-label="Submit search">
            <ArrowRight size={18} />
          </button>
          {open && suggestions.length > 0 && (
            <ul
              className="suggestions"
              id="search-suggestions"
              role="listbox"
              aria-label="Search suggestions"
            >
              {suggestions.map((p, i) => (
                <li role="option" aria-selected={active === i} id={`suggestion-${i}`} key={p.id}>
                  <Link
                    href={`/product/${p.id}`}
                    className={active === i ? 'active' : ''}
                    onClick={() => setOpen(false)}
                  >
                    <span>
                      {p.title}
                      <small>{p.category}</small>
                    </span>
                    <b>{money(p.price)}</b>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </form>
        <Link className="orbit-orders" href="/orders">
          Orders
        </Link>
        <Link className="orbit-bag" href="/cart" aria-label={`Cart with ${count} items`}>
          <ShoppingBag size={20} />
          <span>Bag</span>
          <b>{count}</b>
        </Link>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="orbit-footer">
      <div>
        <Link href="/">
          <Logo />
        </Link>
        <p>
          Less searching.
          <br />
          More finding your thing.
        </p>
      </div>
      <div>
        <span className="eyebrow">EXPLORE YOUR ORBIT</span>
        <Link href="/search">The collection</Link>
        <Link href="/about">Our approach</Link>
        <Link href="/account">Guest details</Link>
        <Link href="/orders">Your orders</Link>
      </div>
      <div className="footer-note">
        <span className="eyebrow">A CONSIDERED LITTLE MARKET</span>
        <p>
          Everyday objects, selected with intention.
          <br />
          Demo checkout. No payments or shipments.
        </p>
        <small>© {new Date().getFullYear()} Orbit Market</small>
      </div>
    </footer>
  );
}
