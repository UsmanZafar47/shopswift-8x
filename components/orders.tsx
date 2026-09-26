'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, MapPin, CreditCard, Package, ShoppingBag, Truck } from 'lucide-react';
import { Order, useStore } from './store';
import { money } from '@/lib/catalog';
import { EmptyState, LoadingState, ProductImage } from './ui';
const eta = (o: Order) =>
  new Date(new Date(o.created).getTime() + (o.express ? 2 : 5) * 86400000).toLocaleDateString(
    'en-US',
    { weekday: 'long', month: 'long', day: 'numeric' },
  );
export function Orders() {
  const store = useStore();
  if (!store.ready) return <LoadingState />;
  if (!store.user)
    return (
      <div className="page-shell">
        <EmptyState
          title="Your good finds live here."
          description="Sign in to see your demo orders and the things you’ve loved."
          href="/signin?next=/orders"
          action="Add guest details"
          icon={<Package size={34} />}
        />
      </div>
    );
  const orders = store.orders;
  return (
    <div className="page-shell orders-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">A LITTLE HISTORY OF GOOD FINDS</span>
          <h1>Your orders</h1>
          <p>
            {orders.length} demo {orders.length === 1 ? 'order' : 'orders'} · Saved to your guest
            session
          </p>
        </div>
        <Link className="text-link" href="/search">
          Find something new
          <ArrowRight size={16} />
        </Link>
      </div>
      {!orders.length ? (
        <EmptyState
          title="Your first good find is waiting."
          description="Once you place a demo order, it will be right here. Let’s find something you’ll love."
          icon={<ShoppingBag size={34} />}
        />
      ) : (
        <div className="order-list">
          {orders.map((o) => (
            <article className="order-card" key={o.id}>
              <div className="order-card-header">
                <div>
                  <span>ORDER PLACED</span>
                  <b>
                    {new Date(o.created).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </b>
                </div>
                <div>
                  <span>TOTAL</span>
                  <b>{money(o.total)}</b>
                </div>
                <div>
                  <span>DELIVER TO</span>
                  <b>{o.address.name}</b>
                </div>
                <div className="order-id">
                  <span>ORDER # {o.id}</span>
                  <Link className="text-link" href={`/order-confirmation/${o.id}`}>
                    View order details
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
              <div className="order-card-content">
                <h2>
                  <Check size={19} />
                  Demo order confirmed
                </h2>
                <p className="muted">
                  Simulated delivery by {eta(o)}. No real shipment will be sent.
                </p>
                {o.items.map((i) => (
                  <div className="order-product" key={`${i.productId}-${i.variant}`}>
                    <Link href={`/product/${i.productId}`} className="order-product-image">
                      <ProductImage product={{ title: i.title, images: [i.image] }} />
                    </Link>
                    <div>
                      <Link href={`/product/${i.productId}`}>
                        <b>{i.title}</b>
                      </Link>
                      <p>
                        {i.variant} · Quantity: {i.quantity}
                      </p>
                      <strong>{money(i.price * i.quantity)}</strong>
                    </div>
                    <button
                      className="button secondary small"
                      onClick={() => store.add(i.productId, i.variant, i.quantity)}
                    >
                      Buy again
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
export function Confirmation({ id }: { id: string }) {
  useEffect(() => window.scrollTo(0, 0), [id]);
  const store = useStore();
  if (!store.ready) return <LoadingState />;
  if (!store.user)
    return (
      <div className="page-shell">
        <EmptyState
          title="Let’s find your order."
          description="Use the guest session that placed this order, then open Your orders."
          href="/signin?next=/orders"
          action="Guest details"
        />
      </div>
    );
  const o = store.orders.find((o) => o.id === id);
  if (!o)
    return (
      <div className="page-shell">
        <EmptyState
          title="This order is not in your session."
          description="Orders are scoped to the guest session that placed them. Check Your orders or start a new find."
          href="/orders"
          action="View your orders"
        />
      </div>
    );
  return (
    <div className="page-shell confirmation-page">
      <section className="confirmation-hero">
        <span className="confirmation-check">
          <Check size={34} />
        </span>
        <span className="eyebrow">A LITTLE HAPPINESS, CONFIRMED</span>
        <h1>Good finds. Great choice.</h1>
        <p>Thanks, {o.address.name.split(' ')[0]}! Your demo order is confirmed.</p>
        <span className="order-number">
          Order <b>{o.id}</b>
        </span>
        <div className="demo-order-notice">
          <ShieldIcon />
          This is a demo order. No payment was taken and nothing will be shipped.
        </div>
      </section>
      <div className="confirmation-layout">
        <section className="confirmation-details">
          <div className="delivery-banner">
            <Truck size={23} />
            <div>
              <b>Imagine it arriving {eta(o)}</b>
              <p>
                {o.express ? 'Express' : 'Standard'} demo delivery ·{' '}
                {o.items.reduce((s, i) => s + i.quantity, 0)} items
              </p>
            </div>
          </div>
          <div className="order-progress">
            <span className="complete">
              <Check size={15} />
              Confirmed
            </span>
            <i />
            <span>
              <Package size={15} />
              Preparing
            </span>
            <i />
            <span>
              <Truck size={15} />
              Delivered
            </span>
          </div>
          <p className="progress-note">
            Illustrative delivery timeline — this demo does not ship items.
          </p>
          <div className="review-items">
            {o.items.map((i) => (
              <div className="review-item" key={`${i.productId}-${i.variant}`}>
                <Link className="review-item-image" href={`/product/${i.productId}`}>
                  <ProductImage product={{ title: i.title, images: [i.image] }} />
                </Link>
                <div>
                  <Link href={`/product/${i.productId}`}>
                    <b>{i.title}</b>
                  </Link>
                  <p>
                    {i.variant} · Qty: {i.quantity}
                  </p>
                </div>
                <strong>{money(i.price * i.quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="review-details">
            <div>
              <h3>
                <MapPin size={16} />
                Delivery address
              </h3>
              <p>
                {o.address.name}
                <br />
                {o.address.street}
                <br />
                {o.address.city}, {o.address.region} {o.address.zip}
                <br />
                {o.address.country}
              </p>
            </div>
            <div>
              <h3>
                <CreditCard size={16} />
                Payment method
              </h3>
              <p>
                {o.payment}
                <br />
                No payment collected
              </p>
            </div>
          </div>
        </section>
        <aside className="order-summary">
          <h2>Order summary</h2>
          <div className="summary-line">
            <span>Subtotal</span>
            <b>{money(o.subtotal)}</b>
          </div>
          <div className="summary-line">
            <span>Shipping</span>
            <b>{o.shipping === 0 ? 'FREE' : money(o.shipping)}</b>
          </div>
          <div className="summary-line">
            <span>Demo tax</span>
            <span>$0.00</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <b>{money(o.total)}</b>
          </div>
          <Link className="button primary full" href="/orders">
            View your orders
            <ArrowRight size={15} />
          </Link>
          <Link className="button secondary full" href="/search">
            Keep finding good things
          </Link>
        </aside>
      </div>
    </div>
  );
}
function ShieldIcon() {
  return <Check size={15} />;
}
