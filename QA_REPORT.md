# Orbit Market verification

Revision verified on 26 September 2026. Local PostgreSQL checks and hosted Supabase production checks both passed. The earlier ShopSwift production report is not evidence for this revision.

- ESLint: passed.
- TypeScript: passed.
- Next.js production build: passed, with dynamic database/API routes.
- Database migration and seed: executed in PGlite's real PostgreSQL engine. Tests cover restricted table access, guest isolation, cart operations, validation, order snapshots, stock decrement, transactional rollback, and idempotent retries.
- Updated browser suite: 14 checks passed against local development, local production, and the live deployment.
- Accessibility: zero automated WCAG A/AA violations in 16 desktop/mobile screens and checkout states on the live deployment.
- No browser runtime errors in the tested shopping flow.
- Browser localStorage stays empty; runtime catalog data comes from the API. Seed JSON is outside runtime imports.
- Agent capture heartbeat is active. Existing logs are preserved and committed incrementally.

**Production:** https://shopswift-8x.vercel.app (Vercel deployment `dpl_AVhkAj1agVLytngpTKx3biJjpw2R`). An anonymous `GET /api/products` returned 20 PostgreSQL catalog rows. Search, Home filtering, and price sorting passed. The signed-out journey added, refreshed, updated, and removed cart rows, then created an order whose item snapshots appeared in order history. Refresh retained the confirmation, and checkout cleared the cart. No Supabase/API errors or serious browser console errors occurred.

Reports: [production browser results](docs/orbit/browser-results.json), [production accessibility results](docs/orbit/accessibility-results.json), [screenshots](docs/orbit/README.md). `test:db` separately exercises migration, access isolation, transaction rollback, stock decrement, and idempotency in PGlite. Automated accessibility audits supplement manual review.

## Remaining limitations

Guest order access depends on an HttpOnly session cookie; clearing it removes access to prior orders. There is no full authentication, account recovery, real payment, email, shipment, inventory administration, or distributed rate limiting. Catalog values are seeded demo content. The camera-on walkthrough remains the applicant's responsibility.

Original reports and screenshots elsewhere in `docs/` document the previous submission only.
