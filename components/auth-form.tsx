'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from './store';
export function AuthForm() {
  const store = useStore(),
    router = useRouter(),
    params = useSearchParams();
  const [name, setName] = useState(''),
    [email, setEmail] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(n: string, e: string) {
    setBusy(true);
    setError('');
    try {
      await store.profile(n, e);
      const next = params.get('next');
      router.push(next?.startsWith('/') && !next.startsWith('//') ? next : '/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="guest-layout page-shell">
      <div>
        <span className="eyebrow">A SMALL INTRODUCTION</span>
        <h1>
          Your next
          <br />
          everyday favorite.
        </h1>
        <p>
          No passwords. No account to manage. Your bag and demo orders belong to this guest session.
        </p>
      </div>
      <form
        className="address-form"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(name, email);
        }}
      >
        <h2>Continue as a guest</h2>
        <p>Use fictional details for this demo purchase.</p>
        <div className="field">
          <label htmlFor="guest-name">Your name</label>
          <input
            id="guest-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={100}
            required
            autoComplete="name"
          />
        </div>
        <div className="field">
          <label htmlFor="guest-email">Email address</label>
          <input
            id="guest-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={254}
            autoComplete="email"
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary full" disabled={busy}>
          Save guest details
        </button>
        <button
          type="button"
          className="button secondary full"
          disabled={busy}
          onClick={() => void submit('Alex Morgan', 'alex@example.com')}
        >
          Continue as demo user
        </button>
        <p className="muted">
          This is a guest profile, not an authenticated account. Clearing your session cookie loses
          access to this bag and its orders.
        </p>
      </form>
    </div>
  );
}
