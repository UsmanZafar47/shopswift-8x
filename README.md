# Orbit Market

A curated marketplace for considered everyday objects. This revision keeps the original shopping journey while introducing an original editorial identity and PostgreSQL-backed products, carts, and orders.

- Public repository: https://github.com/UsmanZafar47/shopswift-8x
- Existing production URL: https://shopswift-8x.vercel.app
- **Revision status:** implemented and tested locally; hosted Supabase setup and the updated production deployment are pending. The production URL still serves the prior submission until deployment is verified.

## Design and features

A light, compact header; an asymmetric editorial hero; violet accents; collection chips; spacious cards; a restrained cart and checkout. Search suggestions, filters, sorting, product galleries/variants, cart editing, saved items, guest details, shipping choices, confirmation, and order history.

**Checkout is a demo. No payments, genuine card details, emails, or shipments.** Use fictional contact information.

## Architecture

Next.js App Router / React / TypeScript / Tailwind / Supabase PostgreSQL. The browser calls Next.js route handlers. `lib/database.ts` accesses Supabase's REST API using the public key. Products are queried from PostgreSQL; JSON under `supabase/` is seed input only and is never imported by the runtime.

An HttpOnly, SameSite guest cookie holds a random 256-bit capability. PostgreSQL stores its SHA-256 hash. Guest tables deny direct anonymous access; a narrowly scoped database function checks the capability on every operation. No service-role key or localStorage is used. This is guest-session access, not email/password authentication or cross-device account recovery.

Tables:

| Table | Purpose |
| --- | --- |
| `products` | Catalog, variants, prices, images, ratings, stock |
| `carts` | Hashed guest session, profile, saved address |
| `cart_items` | Active/saved items; unique cart + product + variant |
| `orders` | Address, totals, status, idempotency key |
| `order_items` | Product name/image/price/variant snapshots |

`orbit_shop` serializes cart writes. Order creation locks products in a stable order, validates stock, calculates totals from database prices, snapshots items, decrements stock, and clears purchased items in one transaction. An idempotency key prevents a retried request from duplicating the order. Standard shipping is $4.99, free from $50; express is $9.99. Tax is zero in this demo.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/products?search=&category=&sort=` | Catalog; sort `price-asc`, `price-desc`, `rating` |
| GET | `/api/products/[id]` | Product or 404 |
| GET / POST | `/api/cart` | Read session state / add product, variant, quantity |
| PATCH / DELETE | `/api/cart/[id]` | Update quantity/saved flag / remove item |
| POST | `/api/profile` | Save guest name and email |
| GET / POST | `/api/orders` | Session order history / transactional checkout |

Mutation routes validate input and reject cross-origin requests. Errors use JSON `{error}` with 400/403/404/409/503 statuses. Database outages produce an explicit retry state, never a fallback mock catalog.

## Setup

1. Install Node.js 22+ and run `npm ci`.
2. Create a free Supabase project.
3. Run `supabase/001_marketplace.sql`, then `supabase/002_seed.sql` in its SQL Editor.
4. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the public/publishable key; `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is also supported).
5. Run `npm run dev` and open http://localhost:3000.

No server secret is required. Never paste credentials into captured conversations or commit `.env` files. For Vercel, configure the same variable names for production and deploy the linked project using `vercel deploy --prod`. GitHub automatic deployments are not configured.

## Verification

```sh
npm run lint
npx tsc --noEmit
npm run test:db
npm run build
npm run test:e2e
npm run test:a11y
```

Browser tests require Google Chrome and a running server. Set `TEST_BASE_URL` to its URL (e.g. `http://localhost:3000`). Tests create demo orders and decrement demo stock. `test:db` runs the real migration and transaction tests in an isolated PGlite PostgreSQL engine; it does not verify hosted Supabase.

For local integration work without hosted credentials only: run `node scripts/dev-postgres.cjs`, then start Next.js with `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54329` and `NEXT_PUBLIC_SUPABASE_ANON_KEY=local-integration-public-key` in that process's environment. This adapter runs PostgreSQL locally and is excluded from deployment. It is not a production database substitute.

See [QA_REPORT.md](QA_REPORT.md), [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md), and [WALKTHROUGH_SCRIPT.md](WALKTHROUGH_SCRIPT.md).

## Tradeoffs and capture

Catalog values are seeded demonstration data, read from the database at runtime. Recently viewed items live only in React memory. Guest access depends on the session cookie; clearing it loses access to prior orders. There is no real authentication, payment, admin, recovery, inventory replenishment UI, or distributed rate limiter. Before broader public use, add abuse protection and authenticated ownership.

Existing `.agent-logs/` are preserved. Automatic capture remains active; logs are committed incrementally. Original implementation evidence/screenshots remain in Git history and `docs/`, labelled as previous-version evidence. Photo sources are in `research/ASSET_SOURCES.md`.
