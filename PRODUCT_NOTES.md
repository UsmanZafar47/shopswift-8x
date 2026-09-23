# ShopSwift product notes

## Research — 23 September 2026

Used Amazon.com in a clean Chrome browser before product implementation. Screenshots are in `research/`.

- Homepage: dark two-level navigation, delivery destination, large search field, account/orders/cart links, and grouped category cards. Some homepage promotional content loaded slowly in this session.
- Search: typing "wireless head" produced ten suggestions and shopping-type shortcuts. Results exposed price, discount, rating/review count, availability, delivery, sorting, and category-specific filters.
- Product: inspected a headphones detail page with breadcrumbs, image gallery, variants, feature bullets, review summary, and a purchase panel. The first item's Add to Cart was hidden behind a buying option; switched to a purchasable Sony headphone in search results.
- Cart: successfully added an item as a guest. Observed quantity controls, Delete/Save for later actions, subtotal, and Proceed to checkout. The isolated research browser was closed without ordering.
- Authentication: the navigation and checkout both led to an email/mobile-first "Sign in or create account" screen.
- Private checkout/account: address, payment, review, confirmation, and order history require personal account access. Asked the user to inspect these manually. They are **not claimed as personally verified**. No credentials, address, OTP, or payment information were entered.

Sources: https://www.amazon.com/ and the live search/product/cart/sign-in pages reached through it. Screenshots are research references, not assets used by the application.

## Selected scope

An original ShopSwift marketplace with a search-led header, six departments, 20 local products, filtering/sorting, product galleries, appropriate variants, quantity controls, persistent cart, demo sign-in/sign-up, a validated address form, shipping/payment selection, review, demo confirmation, and order history. Use familiar Amazon shopping structure with calmer spacing, warm amber accents, and clear visual hierarchy. Add mobile layouts, accessible controls, useful empty/error states, and action feedback.

All purchase and account behavior is a browser-local simulation, explicitly labeled. No real payment fields. Prices/reviews/availability are fictional demo data. Product photos are bundled locally; no API call is needed to shop. No email verification or backend setup for reviewers.

## Excluded

Real payments, shipping, sellers, admin, subscriptions, marketplace integrations, live inventory, recommendations infrastructure, account security infrastructure, and full Amazon parity. Focus on one complete and reliable shopping journey, not dozens of unfinished links. The demo account and saved orders are local to a browser. Public GitHub and Vercel authentication will be requested only when needed.
