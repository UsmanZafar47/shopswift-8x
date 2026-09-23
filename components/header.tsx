'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  MapPin,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Package,
  User,
  Zap,
  Check,
} from 'lucide-react';
import { categories, products, money } from '@/lib/catalog';
import { useStore } from './store';
export function Logo() {
  return (
    <span className="logo">
      shop<span>swift</span>
      <Zap size={23} fill="currentColor" strokeWidth={1.5} />
    </span>
  );
}
export function Header() {
  const store = useStore();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestions = query.trim()
    ? products
        .filter(
          (p) =>
            `${p.title} ${p.category} ${p.description}`
              .toLowerCase()
              .includes(query.toLowerCase().trim()) &&
            (category === 'All' || p.category === category),
        )
        .slice(0, 5)
    : [];
  const count = store.cart.reduce((n, i) => n + i.quantity, 0);
  const address = store.user ? store.addresses[store.user.email] : null;
  function search() {
    setOpen(false);
    setActive(-1);
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category !== 'All') params.set('category', category);
    router.push(`/search?${params}`);
  }
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div className="announcement">
        <span>
          <Zap size={12} fill="currentColor" />
          Little finds. Big everyday happiness.
        </span>
        <span>
          Free shipping on orders $50+ <span className="announcement-divider">|</span> A demo store
          made for exploring
        </span>
      </div>
      <header className="site-header">
        <div className="header-main">
          <Link href="/" aria-label="ShopSwift home">
            <Logo />
          </Link>
          <Link className="delivery-location" href={store.user ? '/account' : '/signin'}>
            <MapPin size={19} />
            <span>
              <small>Deliver to</small>
              <b>{address ? `${address.city} ${address.zip}` : 'United States'}</b>
            </span>
          </Link>
          <form
            className="search-form"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              search();
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
            }}
          >
            <label className="sr-only" htmlFor="search-category">
              Search department
            </label>
            <select
              id="search-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>All</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <div className="search-input-wrap">
              <input
                ref={searchRef}
                id="store-search"
                placeholder="Search for your next great find"
                aria-label="Search products"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={open && suggestions.length > 0}
                aria-controls="search-suggestions"
                aria-activedescendant={active >= 0 ? `suggestion-${active}` : undefined}
                value={query}
                autoComplete="off"
                onFocus={() => setOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                  setActive(-1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setOpen(false);
                    setActive(-1);
                  }
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setOpen(true);
                    setActive((a) => Math.min(a + 1, suggestions.length - 1));
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActive((a) => Math.max(-1, a - 1));
                  }
                  if (e.key === 'Enter' && active >= 0 && suggestions[active]) {
                    e.preventDefault();
                    router.push(`/product/${suggestions[active].id}`);
                    setOpen(false);
                  }
                }}
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="clear-search"
                  onClick={() => {
                    setQuery('');
                    searchRef.current?.focus();
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <button className="search-submit" aria-label="Submit search">
              <Search size={23} />
            </button>
            {open && suggestions.length > 0 && (
              <ul
                className="suggestions"
                id="search-suggestions"
                role="listbox"
                aria-label="Search suggestions"
              >
                {suggestions.map((p, i) => (
                  <li key={p.id} role="option" id={`suggestion-${i}`} aria-selected={active === i}>
                    <Link
                      className={active === i ? 'active' : ''}
                      href={`/product/${p.id}`}
                      onClick={() => setOpen(false)}
                    >
                      <Search size={16} />
                      <span>
                        {p.title}
                        <small>{p.category}</small>
                      </span>
                      <b>{money(p.price)}</b>
                      <ArrowRight size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </form>
          <Link className="header-account" href={store.user ? '/account' : '/signin'}>
            <small>Hello, {store.user?.name.split(' ')[0] || 'sign in'}</small>
            <b>
              Account <ChevronDown size={12} />
            </b>
          </Link>
          <Link className="header-orders" href="/orders">
            <small>Returns</small>
            <b>& Orders</b>
          </Link>
          <Link className="header-cart" href="/cart" aria-label={`Cart with ${count} items`}>
            <span>
              <ShoppingCart size={29} />
              <b className="cart-count">{count}</b>
            </span>
            <b>Cart</b>
          </Link>
        </div>
        <nav className="category-nav" aria-label="Departments">
          <div>
            <button
              className="all-menu"
              onClick={() => setMenu(!menu)}
              aria-expanded={menu}
              aria-controls="department-menu"
            >
              {menu ? <X size={17} /> : <Menu size={17} />}All departments
            </button>
            <span className="nav-divider" />
            {categories.map((c) => (
              <Link key={c} href={`/search?category=${c}`}>
                {c === 'Home' ? 'Home & living' : c}
              </Link>
            ))}
            <Link className="nav-deals" href="/search?deals=true">
              <Zap size={15} />
              Today’s finds
            </Link>
          </div>
        </nav>
        {menu && (
          <div className="department-menu" id="department-menu">
            <div className="section-heading">
              <b>Find your next favorite</b>
              <button aria-label="Close departments" onClick={() => setMenu(false)}>
                <X size={20} />
              </button>
            </div>
            {categories.map((c) => (
              <Link key={c} href={`/search?category=${c}`} onClick={() => setMenu(false)}>
                {c}
                <ArrowRight size={16} />
              </Link>
            ))}
            <Link href="/orders" onClick={() => setMenu(false)}>
              <Package size={17} />
              Your orders
            </Link>
            <Link href="/account" onClick={() => setMenu(false)}>
              <User size={17} />
              Your account
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-benefits">
        <div>
          <Check />
          <span>
            <b>Thoughtfully picked</b>
            <small>Good finds for your everyday</small>
          </span>
        </div>
        <div>
          <Package />
          <span>
            <b>Delivered with care</b>
            <small>Free demo shipping on $50+</small>
          </span>
        </div>
        <div>
          <User />
          <span>
            <b>Made for you</b>
            <small>A simpler way to shop</small>
          </span>
        </div>
      </div>
      <div className="footer-main">
        <div>
          <Link href="/">
            <Logo />
          </Link>
          <p>
            A little of everything.
            <br />
            Something you’ll love.
          </p>
        </div>
        <div>
          <h3>Find your favorites</h3>
          <Link href="/search">Shop everything</Link>
          <Link href="/search?deals=true">Today’s finds</Link>
          <Link href="/search?sort=rating">Popular picks</Link>
        </div>
        <div>
          <h3>Your ShopSwift</h3>
          <Link href="/account">Your account</Link>
          <Link href="/orders">Your orders</Link>
          <Link href="/cart">Shopping cart</Link>
        </div>
        <div>
          <h3>A store for exploring</h3>
          <p>
            This is a demo marketplace.
            <br />
            No real purchases. Just great finds.
          </p>
          <Link href="/about">
            About this demo <ArrowRight size={13} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ShopSwift. An independent shopping demo.</span>
        <span>
          USD · English <span className="footer-dot">•</span> Not affiliated with Amazon.
        </span>
      </div>
    </footer>
  );
}
