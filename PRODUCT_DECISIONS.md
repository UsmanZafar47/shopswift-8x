# Product decisions

## Direction

Orbit Market is a considered collection for everyday life. The redesign replaces the department-heavy retail header with compact navigation and a quiet search field. An asymmetric hero pairs an editorial statement with two featured objects; numbered collection chips and spacious product cards invite browsing. Neutral paper tones, violet accents, serif emphasis, and an orbital mark form a distinct identity.

## Priority within the revision window

Preserved the functioning route structure, local photography, product variants, cart controls, address validation, shipping choices, and order screens. Replaced the catalog import and localStorage store with real API calls. Prioritized browse → product → cart → checkout → saved order before optional features.

Removed browser-only password accounts and fabricated review prose. Guest details are explicitly a session profile, not authentication. Kept save-for-later in the database; recently viewed is temporary UI state.

## Database and API

Supabase PostgreSQL is the production target. Five relational tables hold catalog, cart, and order data. Next.js route handlers provide the API boundary. An HttpOnly random guest capability is hashed in the database. Public catalog reads are allowed; guest tables deny direct access. A restricted security-definer function scopes every operation to the capability and fixes its search path.

Order creation is a transaction: lock cart and products, validate available stock across variants, calculate totals from stored prices, save snapshots, decrease stock, clear the cart. Idempotency handles retrying a completed request. Email is contact data, never an authorization key.

## Deliberate omissions

No real payments or card capture, password system, OAuth, emails, admin dashboard, subscriptions, or seller platform. Twenty seeded products keep browsing meaningful. Ratings are explicitly illustrative catalog fields, not claimed customer submissions. The API reads database rows; it never falls back to JSON.

## Next improvements

Authenticated cross-device ownership and account recovery, database-backed rate limiting, inventory administration, pagination/search indexes, and hosted monitoring. Clean out unused legacy CSS after the deadline. Validate hosted behavior and deployment before considering this revision submitted.
