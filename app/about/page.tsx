import Link from 'next/link';
export const metadata = { title: 'Our approach' };
export default function About() {
  return (
    <div className="page-shell about-orbit">
      <span className="eyebrow">OUR POINT OF VIEW</span>
      <h1>
        Considered objects.
        <br />
        <em>Everyday purpose.</em>
      </h1>
      <p>
        Orbit Market is a curated marketplace for the pieces that make everyday life a little
        better. We bring home, technology, movement, and reading together in one quiet, purposeful
        space.
      </p>
      <div className="account-grid">
        <section className="account-card">
          <h2>A smaller, better collection</h2>
          <p>
            Browse by the part of your life you want to improve. Clear choices, useful details, and
            room to look around.
          </p>
        </section>
        <section className="account-card">
          <h2>Your own little orbit</h2>
          <p>
            Your bag, saved pieces, and order history stay with your guest session. No passwords,
            subscriptions, or emails.
          </p>
        </section>
        <section className="account-card">
          <h2>A real flow. A demo purchase.</h2>
          <p>
            Products, carts, stock, and orders are stored in PostgreSQL. Checkout creates a real
            database record, but never charges money or ships goods. Use fictional contact details.
          </p>
        </section>
      </div>
      <p>
        Catalog prices and ratings are seed data for this demonstration. No real customer reviews or
        payment processing are claimed. Guest access lasts while your session cookie is available;
        it is not cross-device account authentication.
      </p>
      <Link href="/search" className="button primary">
        Explore the collection
      </Link>
    </div>
  );
}
