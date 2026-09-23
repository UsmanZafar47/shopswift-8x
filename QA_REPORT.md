# ShopSwift verification

Verified on 23 September 2026 with Google Chrome and the local Next.js production server.

## Completed

- ESLint: passed with no warnings or errors.
- Production build: passed, including TypeScript and all 31 generated pages.
- Browser suite: **14 checks passed**, including desktop and clean mobile purchases, variant separation, cart persistence, save/restore, removal, shipping totals, address validation, demo authentication, separate account order histories, confirmation/order refreshes, and unknown routes.
- Responsive layout: no horizontal overflow on the tested primary routes at 360, 768, and 1440 pixels. Full mobile checkout also tested at 390 pixels.
- Images: every bundled catalog image returned HTTP 200; homepage images loaded after scrolling.
- Browser console: no serious errors or hydration errors during the suite.
- Accessibility: **zero automated WCAG A/AA violations in 16 audited screens/states**, covering homepage, search, product, sign-in, populated cart, three checkout steps, confirmation, orders, account, about, and selected mobile views. Automated checks supplement rather than replace manual accessibility review.
- Capture: two real-session canaries passed before product implementation; the automatic watcher remains running. Logs are committed throughout development.

Raw reports: [browser results](docs/browser-results.json), [accessibility results](docs/accessibility-results.json). Test programs: `scripts/test-e2e.cjs` and `scripts/test-accessibility.cjs`.

## Issues found and resolved

- URL-driven filter updates needed navigation-aware test assertions.
- Runtime image optimization stalled on a local image. The catalog's already-compressed local images now use direct delivery through Next.js Image, with no external runtime request or Vercel image transformation dependency.
- Unknown product IDs now return a real 404 through a fixed set of generated product routes.
- Secondary text colors were darkened to meet contrast requirements.
- Delivery dates are computed after hydration so a statically generated product page does not disagree with a later browser visit.
- Tests use a specific validation-error locator rather than matching Next.js's separate route announcer.

## Still external to local verification

The production Vercel URL, signed-out access, and deployed route refreshes must be checked after Vercel authentication and deployment. The camera-on walkthrough must be recorded by the applicant. Private Amazon account/checkout screens remain unverified unless the applicant inspects them manually.
