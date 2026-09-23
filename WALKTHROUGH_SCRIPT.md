# ShopSwift walkthrough — target 4 minutes 30 seconds

Keep your **camera on for the entire recording**. Record the live production site, with your browser zoom at 100%. Use a clean browser profile or incognito window so the empty cart and first order flow are easy to follow. Open the public repository in a second tab before recording.

## 0:00–0:15 — Introduction

“Hi, I’m Usman. This is ShopSwift, an Amazon-inspired marketplace I built for the 8x assignment. I focused on a complete shopping journey with original branding and a storefront that works immediately for anyone opening the link.”

## 0:15–0:45 — Scope and decisions

Show the homepage, category cards, and a product row.

“I studied Amazon’s public homepage, search, product pages, guest cart, and sign-in flow. I kept the familiar search-first navigation and product information, with a calmer layout. This demo has 20 local products, so it doesn’t depend on a product API. I deliberately left out real payments, seller tools, and shipping infrastructure.”

## 0:45–3:00 — The shopping journey

1. Type **headphones** in the header to show suggestions. Select **Apple AirPods Max**.
2. Show the price, availability, quantity control, and Add to cart. Add one item, then open the cart using **View your cart**.
3. Increase quantity once, then decrease it so the subtotal visibly updates. Briefly show Save for later and Move to cart if time allows.
4. Click **Proceed to checkout**, then **Continue as demo user**.
5. Click **Use demo address**. Explain that this uses a fictional address. Save and continue.
6. Show standard/express shipping and the two fake payment options. Select express so the total visibly changes. No payment details are collected.
7. Review the order and click **Place demo order**.
8. Show the confirmation and empty cart count. Open **View your orders**, then refresh to demonstrate persistence.

Suggested narration: “The cart keeps each product option distinct. Checkout validates the address and snapshots the order with its shipping and total. Everything here is simulated and stored in this browser, so no money changes hands.”

## 3:00–3:30 — Mobile experience

Switch to a mobile viewport around 390 pixels wide. Open search, use the **Filters** panel, and show a product page. Keep the demonstration to two or three interactions.

“The search bar stays accessible on mobile, filters open in their own panel, and the purchase controls stack beneath the product information.”

## 3:30–4:00 — Code and capture

Switch to the public GitHub repository. Show `app/`, `components/`, `lib/catalog.json`, and `public/products/`. Open `CAPTURE-TEST.md`, then `.agent-logs/` and the commit history.

“This uses Next.js, TypeScript, and Tailwind, with local data and browser persistence. Agent capture was verified in two real sessions before product code. The raw prompts and final replies were committed along with development milestones.”

## 4:00–4:15 — Verification

Show the README's check instructions or the committed test report. State only the tests recorded as passed: lint, production build, shopping journey, responsive checks, persistence, and accessibility checks as applicable.

## 4:15–4:30 — Finish

Return to the live homepage.

“The public repository and live Vercel link are included in the submission. The demo can be explored without signing in, and the one-click demo account makes the complete checkout available. Thanks for taking a look.”

## Before submitting

- Live URL opens in a signed-out/incognito browser.
- Repository is public and includes `.agent-logs/` and `CAPTURE-TEST.md`.
- Recording has your camera on and is under five minutes.
- Put the recording URL in the walkthrough field.
- Label the two links **Live demo** and **Public repository** in the links field.
