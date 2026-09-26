# Orbit Market walkthrough — target 4:30, camera on

Record only after the revised production deployment is verified. Keep your camera visible throughout. Do not show credentials, environment values, or a dashboard containing secrets.

- **0:00–0:40 — Product judgment.** Introduce Orbit Market: a curated everyday marketplace. Show its light compact header, original orbital brand, editorial hero, collection chips, and responsive layout.
- **0:40–1:20 — Discovery.** Search, filter a category, sort prices, open a product, select a variant, and add it to the bag.
- **1:20–2:10 — Persistence.** Change quantity and refresh. Explain that the bag comes from PostgreSQL through the Next.js API. Show save-for-later and restore.
- **2:10–3:00 — Purchase.** Continue as a demo guest, use the fictional demo address, choose shipping, review totals, and place a demo order. Explain no payment is processed.
- **3:00–3:35 — Order history.** Show confirmation and orders, then refresh. The database stores snapshots and totals; the cart is cleared atomically.
- **3:35–4:15 — Implementation.** Show the public repository's `app/api`, `supabase` migrations, tests, and preserved `.agent-logs/`. Explain the HttpOnly guest session, row access restrictions, transaction, and idempotency. Show the API response or a redacted database table view if convenient.
- **4:15–4:30 — Tradeoffs.** Guest sessions instead of full authentication; seeded catalog instead of inventory administration; no real payments. End with the live and repository links.

Submission links: https://shopswift-8x.vercel.app and https://github.com/UsmanZafar47/shopswift-8x. The existing URL must be verified to show Orbit Market before recording.
