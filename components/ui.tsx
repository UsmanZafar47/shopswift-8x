import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Package, Check, Truck } from 'lucide-react';
import { discount, money, Product } from '@/lib/catalog';
export function ProductImage({
  product,
  index = 0,
  priority = false,
  className = '',
}: {
  product: Pick<Product, 'title' | 'images'>;
  index?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      className={`product-image ${className}`}
      src={product.images[index] || product.images[0]}
      alt={product.title}
      fill
      sizes="(max-width: 600px) 45vw, (max-width: 1000px) 30vw, 300px"
      priority={priority}
    />
  );
}
export function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <span
      className="rating"
      aria-label={`${rating.toFixed(1)} out of 5 stars${count ? `, ${count} reviews` : ''}`}
    >
      <span className="stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={12} fill={i <= Math.round(rating) ? 'currentColor' : 'none'} />
        ))}
      </span>
      <span>{rating.toFixed(1)}</span>
      {count && <span className="muted">({count.toLocaleString()})</span>}
    </span>
  );
}
export function ProductCard({ product: p, index = 0 }: { product: Product; index?: number }) {
  return (
    <article className="product-card">
      <Link href={`/product/${p.id}`} className="card-photo" aria-label={`View ${p.title}`}>
        <span className={`product-badge ${index % 3 === 1 ? 'green' : ''}`}>
          {index % 3 === 1 ? 'Popular pick' : `${discount(p)}% off`}
        </span>
        <ProductImage product={p} />
      </Link>
      <div className="card-content">
        <span className="eyebrow muted">{p.brand}</span>
        <Link href={`/product/${p.id}`} className="product-title">
          {p.title}
        </Link>
        <Stars rating={p.rating} count={p.reviews} />
        <div className="price-row">
          <strong>{money(p.price)}</strong>
          <del>{money(p.originalPrice)}</del>
        </div>
        <p className="card-delivery">
          <Check size={13} />
          <b>swift</b>
          <span>Free shipping over $50</span>
        </p>
      </div>
    </article>
  );
}
export function ProductSection({
  title,
  subtitle,
  products,
  href = '/search',
  link = 'Shop all',
  id,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  href?: string;
  link?: string;
  id?: string;
}) {
  return (
    <section className="product-section" id={id}>
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <Link className="text-link" href={href}>
          {link}
          <ArrowRight size={16} />
        </Link>
      </div>
      <div className="product-grid">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
export function EmptyState({
  title,
  description,
  href = '/search',
  action = 'Explore the store',
  icon,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon || <Package size={36} />}</div>
      <h1>{title}</h1>
      <p>{description}</p>
      <Link className="button primary" href={href}>
        {action}
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
export function LoadingState() {
  return (
    <div
      className="page-shell loading-state"
      role="status"
      aria-label="Loading your shopping details"
    >
      <div className="skeleton title" />
      <div className="skeleton block" />
      <span className="muted">Getting everything ready…</span>
    </div>
  );
}
export function ShippingNote() {
  return (
    <div className="shipping-note">
      <Truck size={20} />
      <span>
        <b>A little perk, on us.</b> Free standard shipping on orders $50+.
      </span>
    </div>
  );
}
