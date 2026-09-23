You are my senior product engineer. Build and deploy a polished Amazon-inspired e-commerce clone for an 8x take-home assignment.

We have a maximum of 24 hours, but the target is to finish in 5–7 hours. Keep the implementation focused, fast, reliable, and visually impressive. Do not overengineer it.

IMPORTANT: Work autonomously inside the currently opened Amazon folder. Inspect the existing files before making changes. Ask me only when authentication, account access, or a manual action is genuinely required.

## Step 1 — Mandatory agent capture setup

Before writing any product code:

1. Open and follow:
   https://8x-internal.com/p/8x-agent-capture-setup
2. Complete the setup exactly as instructed.
3. Run its capture test.
4. Do not begin the Amazon clone until the capture test passes.
5. Confirm that `.agent-logs/` is being created.
6. Initialize Git if needed and make an initial commit containing the capture setup and `.agent-logs/`.
7. Continue committing `.agent-logs/` throughout development—not only at the end.
8. Never commit secrets, tokens, credentials, or `.env` files.

If you cannot access the setup page, stop and ask me to paste its instructions. Do not guess its configuration.

## Step 2 — Study the original product

Use Amazon.com before coding.

Inspect and document the main customer journey:

- Homepage and navigation
- Search and search suggestions
- Search results
- Category/filter controls
- Product details
- Quantity selection
- Add to cart
- Cart editing and removal
- Sign-up/sign-in experience
- Checkout steps
- Delivery address
- Payment selection
- Order review
- Order confirmation
- Orders/account view

Take screenshots of the important flows and save them inside a clearly named research folder in the repository, if permitted.

Do not make a real purchase or enter real payment information. If Amazon requires my login, OTP, CAPTCHA, address, or other private information, ask me to complete that step manually.

Create a short `PRODUCT_NOTES.md` containing:

- Core Amazon flows observed
- Features selected for this build
- Features deliberately excluded
- Brief reasoning behind the scope

## Product scope

Build the core shopping flow extremely well. This is a portfolio/demo application, not a real marketplace.

Required working journey:

Homepage → search/browse → product page → add to cart → edit cart → checkout → place demo order → confirmation → view orders

Also support:

- Demo sign-up and sign-in
- Responsive mobile and desktop layouts
- Search suggestions
- Product categories
- Search results with filtering and sorting
- Product ratings and review counts
- Product image gallery
- Product variants where appropriate
- Quantity selection
- Cart count and subtotal
- Saved delivery address during checkout
- Fake/demo payment selection
- Order review
- Order history
- Loading, empty, validation, and error states
- Toasts or clear feedback after actions

Do not build:

- Real payments
- Seller dashboards
- Admin panels
- Real delivery infrastructure
- Complex backend services
- AI recommendations
- Full Amazon feature parity
- Anything that risks delaying the finished deployment

## Technical direction

Use the simplest strong stack suitable for Vercel:

- Next.js with App Router
- TypeScript
- Tailwind CSS
- Lucide icons if useful
- Local product data stored in the repository
- Local storage or another simple persistence method for demo authentication, cart, addresses, and orders
- No paid services
- No unnecessary backend
- No required API keys
- No dependency on an unreliable third-party product API

If this folder already contains a suitable project, improve it instead of recreating it.

The deployed version must work immediately for an anonymous reviewer. Include a demo account or a clear “Continue as demo user” option. Do not require email verification.

Suggested demo credentials:

Email: demo@shopswift.com
Password: demo123

## Branding and design

Create an original marketplace brand such as “ShopSwift.” The experience should clearly demonstrate an Amazon-style marketplace, but do not pretend to be the official Amazon website.

Avoid directly copying protected Amazon assets. Use original branding, icons, layout details, and copy while retaining the familiar e-commerce structure.

Design goals:

- Professional and polished
- Dense enough to feel like a real marketplace
- Better visual hierarchy than Amazon
- Fast navigation
- Consistent spacing and typography
- Clear calls to action
- High-quality product cards
- Strong desktop and mobile layouts
- Accessible color contrast
- Keyboard-friendly controls
- Visible focus states

Use around 20 realistic products across categories such as electronics, gaming, home, fashion, books, and fitness. Keep all product data local. Use stable image assets and configure Next.js images correctly.

## Pages/routes

At minimum, implement:

- `/` — marketplace homepage
- `/search` — search results, filters, and sorting
- `/product/[id]` — product details
- `/cart` — cart management
- `/signin` — demo sign-in/sign-up
- `/checkout` — address, payment, review, and place-order flow
- `/order-confirmation/[id]` — successful demo order
- `/orders` — order history
- A useful custom not-found page

## Homepage sections

Include:

- Top navigation with logo, delivery location, search, account, orders, and cart
- Category navigation
- Hero promotion
- Category cards
- Deals section
- Recommended products
- Popular products
- Recently viewed products if time allows
- Footer

## Product and cart behavior

Product page:

- Breadcrumbs
- Image gallery
- Title, rating, review count, price, discount, availability
- Delivery information
- Variant and quantity selectors
- Add to Cart
- Buy Now
- Product description and feature list
- Related products

Cart:

- Update quantity
- Remove item
- Save for later only if easy
- Accurate subtotal
- Empty-cart state
- Proceed to checkout

Checkout:

- Require demo authentication or offer demo sign-in
- Delivery address form with validation
- Standard and express demo shipping choices
- Fake card or cash-on-delivery-style payment choice
- Never collect or process real payment details
- Order summary
- Place Demo Order
- Create an order ID
- Clear the cart after success
- Save the order in browser persistence
- Display it on the Orders page

## Quality requirements

Before declaring completion:

1. Run linting.
2. Run the production build.
3. Fix all TypeScript, console, hydration, and responsive-layout problems.
4. Test every primary flow from a clean browser session.
5. Test at desktop and mobile widths.
6. Verify refresh persistence for cart and demo orders.
7. Verify every button and link used in the walkthrough.
8. Ensure there are no broken images or placeholder text.
9. Ensure the browser console has no serious errors.
10. Confirm `.agent-logs/` is present and committed.

Add a concise README containing:

- Project overview
- Features
- Tech stack
- Local setup instructions
- Demo credentials
- Important routes
- Product decisions and excluded scope
- Deployment link
- Screenshots if useful

## Git workflow

Make small, meaningful commits during the build, including `.agent-logs/` as they change.

Suggested milestones:

1. `chore: configure agent capture and initialize project`
2. `feat: build marketplace homepage and product catalog`
3. `feat: add search filters and product details`
4. `feat: implement cart authentication and checkout`
5. `feat: add orders responsive polish and persistence`
6. `docs: add walkthrough notes and deployment details`

Do not wait until the end for one giant commit.

## Deployment and submission

Prepare the project for a free Vercel deployment.

When the app is complete:

1. Push it to a public GitHub repository.
2. Confirm `.agent-logs/` is visible in the public repository.
3. Deploy to Vercel.
4. Verify the production URL in a signed-out/incognito session.
5. Confirm all major routes work directly when refreshed.
6. Add the production URL to the README.

If GitHub or Vercel authentication is needed, stop at that exact point and ask me to authenticate. Continue immediately afterward.

## Walkthrough preparation

Create `WALKTHROUGH_SCRIPT.md` for a video under five minutes.

Keep it natural and concise:

- 15 seconds: introduction and goal
- 30 seconds: product decisions and scope
- 2–3 minutes: demonstrate the full shopping journey
- 30 seconds: responsive/mobile experience
- 30 seconds: code structure and agent logs
- 15 seconds: live deployment and conclusion

Remind me that my camera must be on during the recording.

## Final completion report

At the end, provide:

- What was built
- Test/build results
- Public repository URL
- Live Vercel URL
- Demo credentials
- Walkthrough script location
- Any limitations
- A final submission checklist

Work in focused milestones. Start with the mandatory agent capture setup now. Do not write product code before its capture test passes.