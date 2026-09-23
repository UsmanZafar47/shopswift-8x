'use client';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { SlidersHorizontal, X, Search, ChevronRight, Star } from 'lucide-react';
import { products, categories, discount } from '@/lib/catalog';
import { ProductCard } from './ui';
export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const [mobileFilters, setMobileFilters] = useState(false);
  const query = params.get('q') || '';
  const category = params.get('category') || '';
  const price = params.get('price') || '';
  const rating = params.get('rating') || '';
  const sort = params.get('sort') || 'featured';
  const deals = params.get('deals') === 'true';
  const set = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.replace(`/search?${p}`, { scroll: false });
  };
  let results = products.filter(
    (p) =>
      (!query ||
        `${p.title} ${p.category} ${p.brand} ${p.description}`
          .toLowerCase()
          .includes(query.toLowerCase().trim())) &&
      (!category || p.category === category) &&
      (!price || p.price <= Number(price)) &&
      (!rating || p.rating >= Number(rating)) &&
      (!deals || discount(p) >= 25),
  );
  if (sort === 'price-asc') results = [...results].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') results = [...results].sort((a, b) => b.price - a.price);
  if (sort === 'rating') results = [...results].sort((a, b) => b.rating - a.rating);
  return (
    <div className="page-shell">
      <div className="breadcrumbs">
        <Link href="/">Home</Link>
        <ChevronRight size={12} />
        <span>{category || 'All departments'}</span>
        {query && (
          <>
            <ChevronRight size={12} />
            <span>{query}</span>
          </>
        )}
      </div>
      <div className="browse-header">
        <div>
          <span className="eyebrow">FIND SOMETHING GOOD</span>
          <h1>
            {query
              ? `Results for “${query}”`
              : deals
                ? 'Good finds. Better prices.'
                : category
                  ? category === 'Home'
                    ? 'Make yourself at home.'
                    : `Explore ${category.toLowerCase()}.`
                  : 'Your next favorite is here.'}
          </h1>
          <p>
            {results.length} thoughtfully picked {results.length === 1 ? 'find' : 'finds'}
            {query ? ' matched your search' : ', ready to make your everyday a little better'}.
          </p>
        </div>
      </div>
      <div className="search-layout">
        <aside className={`filters ${mobileFilters ? 'mobile-open' : ''}`}>
          <div className="filter-title">
            <h2>
              <SlidersHorizontal size={17} />
              Filters
            </h2>
            <button
              className="mobile-only"
              aria-label="Close filters"
              onClick={() => setMobileFilters(false)}
            >
              <X size={20} />
            </button>
            <Link
              className="filter-reset"
              href={query ? `/search?q=${encodeURIComponent(query)}` : '/search'}
            >
              Reset
            </Link>
          </div>
          <fieldset>
            <legend>Department</legend>
            <label className="filter-radio">
              <input
                type="radio"
                name="category"
                checked={!category}
                onChange={() => set('category', '')}
              />
              All departments <span>{products.length}</span>
            </label>
            {categories.map((c) => (
              <label className="filter-radio" key={c}>
                <input
                  type="radio"
                  name="category"
                  checked={category === c}
                  onChange={() => set('category', c)}
                />
                {c === 'Home' ? 'Home & living' : c}
                <span>{products.filter((p) => p.category === c).length}</span>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            {[
              ['', 'All prices'],
              ['25', 'Under $25'],
              ['50', 'Under $50'],
              ['100', 'Under $100'],
              ['200', 'Under $200'],
            ].map(([v, l]) => (
              <label key={l} className="filter-radio">
                <input
                  type="radio"
                  name="price"
                  checked={price === v}
                  onChange={() => set('price', v)}
                />
                {l}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Customer rating</legend>
            {[
              ['', 'All ratings'],
              ['4.5', '4.5 & up'],
              ['4.8', '4.8 & up'],
            ].map(([v, l]) => (
              <label className="filter-radio" key={l}>
                <input
                  type="radio"
                  name="rating"
                  checked={rating === v}
                  onChange={() => set('rating', v)}
                />
                {v && <Star size={13} fill="currentColor" className="amber" />}
                {l}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>A little extra off</legend>
            <label className="filter-radio">
              <input
                type="checkbox"
                checked={deals}
                onChange={(e) => set('deals', e.target.checked ? 'true' : '')}
              />
              Deals of 25% or more
            </label>
          </fieldset>
          <button className="button primary mobile-only" onClick={() => setMobileFilters(false)}>
            Show {results.length} results
          </button>
          <div className="filter-promo">
            <b>Delivered with a smile.</b>
            <p>Free standard shipping when your cart reaches $50.</p>
          </div>
        </aside>
        <div className="results-main">
          <div className="results-toolbar">
            <button className="button secondary mobile-only" onClick={() => setMobileFilters(true)}>
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <span>{results.length} results</span>
            <label>
              Sort by{' '}
              <select
                value={sort}
                onChange={(e) => set('sort', e.target.value)}
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </label>
          </div>
          {(category || price || rating || deals) && (
            <div className="filter-chips">
              {[
                [category, 'category'],
                [price ? `Under $${price}` : '', 'price'],
                [rating ? `${rating}+ stars` : '', 'rating'],
                [deals ? '25%+ off' : '', 'deals'],
              ]
                .filter(([v]) => v)
                .map(([v, k]) => (
                  <button key={k} onClick={() => set(k, '')}>
                    {v}
                    <X size={12} />
                  </button>
                ))}
            </div>
          )}
          {results.length ? (
            <div className="search-grid">
              {results.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Search size={32} />
              </div>
              <h2>No finds just yet.</h2>
              <p>
                Try a shorter search or remove a filter. Your next favorite might be one click away.
              </p>
              <Link className="button primary" href="/search">
                Clear search and filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
