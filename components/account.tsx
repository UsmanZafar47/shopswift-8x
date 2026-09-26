'use client';
import Link from 'next/link';
import { useStore } from './store';
import { LoadingState } from './ui';
export function AccountPage() {
  const store = useStore();
  if (!store.ready) return <LoadingState />;
  return (
    <div className="page-shell">
      <span className="eyebrow">YOUR ORBIT</span>
      <h1>{store.user ? `Hello, ${store.user.name.split(' ')[0]}.` : 'Make yourself at home.'}</h1>
      <p className="muted">Your guest details, bag, and order history.</p>
      <div className="account-grid">
        <Link className="account-card" href="/orders">
          <h2>Your orders</h2>
          <p>{store.orders.length} demo orders saved to your session.</p>
          <span className="text-link">View order history →</span>
        </Link>
        <Link className="account-card" href="/cart">
          <h2>Your bag</h2>
          <p>{store.cart.reduce((s, i) => s + i.quantity, 0)} thoughtfully chosen pieces.</p>
          <span className="text-link">View your bag →</span>
        </Link>
        <Link className="account-card" href="/signin">
          <h2>Guest details</h2>
          <p>
            {store.user?.name || 'Add your name'}
            <br />
            {store.user?.email || 'No password needed.'}
          </p>
          <span className="text-link">Update details →</span>
        </Link>
      </div>
      <p className="demo-credentials">
        Your orders are stored in our database and linked to a private guest session. Clearing your
        cookie loses access; matching email addresses do not grant access to another session. No
        payment is processed.
      </p>
    </div>
  );
}
