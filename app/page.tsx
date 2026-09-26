'use client';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { useStore } from '@/components/store';
import { ProductImage, ProductSection, LoadingState } from '@/components/ui';
import { RecentlyViewed } from '@/components/recently-viewed';
import { categories, money } from '@/lib/catalog';
export default function Home() {
  const { products, ready } = useStore();
  if (!ready) return <LoadingState />;
  const featured = products.find((p) => p.id === 'table-lamp') || products[0];
  const secondary = products.find((p) => p.id === 'airpods-max') || products[1];
  return (
    <div className="orbit-home">
      <div className="edition-line">
        <span>OBJECTS FOR A LIFE WELL LIVED</span>
        <span>THE EVERYDAY EDIT / 01</span>
      </div>
      <section className="orbit-hero">
        <div className="orbit-hero-copy">
          <span className="eyebrow">FEWER THINGS. BETTER FINDS.</span>
          <h1>
            Make room
            <br />
            for <em>good things.</em>
          </h1>
          <p>
            A considered collection for your home, your routine, and everything in between. Find the
            pieces that feel like you.
          </p>
          <Link className="button primary" href="/search">
            Explore the collection <ArrowUpRight size={20} />
          </Link>
          <div className="hero-footnote">
            <span className="small-orbit" />
            Small everyday upgrades.
            <br />A different kind of marketplace.
          </div>
        </div>
        <div className="orbit-hero-art">
          {featured && (
            <Link href={`/product/${featured.id}`} className="feature-object">
              <span className="object-index">01 / IN THE SPOTLIGHT</span>
              <ProductImage product={featured} priority />
              <div className="object-caption">
                <div>
                  <small>MAKE YOURSELF AT HOME</small>
                  <h2>{featured.title}</h2>
                  <span>{money(featured.price)}</span>
                </div>
                <span className="round-link">
                  <ArrowUpRight size={25} />
                </span>
              </div>
            </Link>
          )}
          {secondary && (
            <Link href={`/product/${secondary.id}`} className="secondary-object">
              <div className="secondary-image">
                <ProductImage product={secondary} />
              </div>
              <div>
                <span className="eyebrow">TUNE INTO YOURSELF</span>
                <b>{secondary.title}</b>
                <span className="text-link">
                  Find your focus <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>
      <section className="orbit-categories">
        <div>
          <span className="eyebrow">FIND YOUR CORNER</span>
          <h2>What’s in your orbit?</h2>
        </div>
        <nav aria-label="Collections">
          {categories.map((c, i) => (
            <Link key={c} href={`/search?category=${c}`}>
              <span>0{i + 1}</span>
              {c === 'Home' ? 'Living' : c}
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </nav>
      </section>
      <ProductSection
        title="The current favorites"
        subtitle="Good design. Everyday purpose. A place in your routine."
        products={products.slice(0, 8)}
        link="Explore all pieces"
      />
      <section className="orbit-manifesto">
        <span className="eyebrow">OUR POINT OF VIEW</span>
        <h2>
          A little less noise.
          <br />A lot more <em>you.</em>
        </h2>
        <div>
          <p>
            We believe the things you surround yourself with should earn their place. Useful,
            thoughtful, and a pleasure to live with.
          </p>
          <Link className="text-link" href="/about">
            Meet Orbit Market <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <RecentlyViewed />
    </div>
  );
}
