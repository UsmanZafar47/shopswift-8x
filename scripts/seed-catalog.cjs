const fs = require('node:fs');
const source = require('../.capture-runtime/products-source.json').products;
const entries = [
  [
    101,
    'airpods-max',
    'Apple AirPods Max',
    'Electronics',
    399,
    549,
    ['Silver'],
    'Immersive listening. Beautifully simple.',
    'Over-ear wireless headphones with a comfortable knit canopy and rich, room-filling sound.',
    ['Active noise cancellation', 'Up to 20 hours of listening', 'Comfortable over-ear cushions'],
  ],
  [
    100,
    'airpods',
    'Apple AirPods with charging case',
    'Electronics',
    99,
    129,
    ['White'],
    'Your everyday soundtrack.',
    'Lightweight wireless earbuds with an easy-to-carry charging case.',
    ['Wireless Bluetooth connection', 'Pocket-sized charging case', 'Built-in microphone'],
  ],
  [
    78,
    'macbook',
    'Apple MacBook Pro 14-inch',
    'Electronics',
    1299,
    1499,
    ['Space Grey'],
    'Make room for your next big idea.',
    'A capable 14-inch laptop for creative projects, study, and everyday productivity.',
    ['14-inch display', 'Backlit keyboard', 'USB-C connectivity'],
  ],
  [
    106,
    'apple-watch',
    'Apple Watch, gold aluminum',
    'Electronics',
    179,
    229,
    ['Gold'],
    'A little more connected.',
    'A comfortable everyday smartwatch for activity, notifications, and staying connected.',
    ['Activity tracking', 'Comfortable sport band', 'Clear touch display'],
  ],
  [
    103,
    'homepod',
    'Apple HomePod mini',
    'Electronics',
    79,
    99,
    ['Space Grey'],
    'Small speaker. Big personality.',
    'A compact home speaker that brings music into your favorite spaces.',
    ['Compact spherical design', 'Room-filling audio', 'Simple touch controls'],
  ],
  [
    102,
    'wireless-charger',
    'Wireless charging mat',
    'Electronics',
    29,
    39,
    ['White'],
    'Less cable clutter.',
    'A clean charging surface for your compatible everyday devices.',
    ['Slim desktop design', 'Wireless charging', 'Non-slip base'],
  ],
  [
    47,
    'table-lamp',
    'Classic brass table lamp',
    'Home',
    39,
    55,
    ['Brass'],
    'A brighter little corner.',
    'Warm up a desk, bedside table, or reading nook with a classic brass-tone lamp and fabric shade.',
    ['Soft ambient light', 'Compact footprint', 'Easy on/off switch'],
  ],
  [
    46,
    'plant-pot',
    'Botanical ceramic planter',
    'Home',
    24,
    32,
    ['Natural'],
    'Bring the outside in.',
    'An easy finishing touch for shelves, windowsills, and sunny corners.',
    ['Decorative planter', 'Easy-care design', 'Perfect for a shelf or desk'],
  ],
  [
    51,
    'blender',
    'Everyday countertop blender',
    'Home',
    49,
    69,
    ['Black'],
    'Good mornings start here.',
    'Blend fruit, smoothies, and kitchen favorites with this countertop essential.',
    ['Easy-to-use controls', 'Removable blending jar', 'Compact kitchen footprint'],
  ],
  [
    49,
    'travel-cup',
    'Everyday black aluminum cup',
    'Home',
    14,
    19,
    ['Black'],
    'Your favorite daily ritual.',
    'A lightweight reusable cup for coffee breaks and everyday refreshments.',
    ['Lightweight aluminum', 'Reusable design', 'Easy-grip handle'],
  ],
  [
    90,
    'puma-trainers',
    'Puma Future Rider trainers',
    'Fashion',
    64,
    85,
    ['US 8', 'US 9', 'US 10', 'US 11'],
    'Go a little further.',
    'Everyday sneakers with a retro-inspired profile and an easy, comfortable fit.',
    ['Cushioned sole', 'Lace-up closure', 'Casual everyday styling'],
  ],
  [
    83,
    'casual-shirt',
    'Everyday checked cotton shirt',
    'Fashion',
    29,
    42,
    ['S', 'M', 'L', 'XL'],
    'Your new everyday favorite.',
    'An easygoing shirt that moves from a casual workday to weekend plans.',
    ['Classic button closure', 'Comfortable regular fit', 'Machine washable'],
  ],
  [
    175,
    'daypack',
    'Faux leather everyday backpack',
    'Fashion',
    42,
    59,
    ['White'],
    'Take the day with you.',
    'A clean, versatile backpack with room for your daily essentials.',
    ['Adjustable shoulder straps', 'Secure zip closure', 'Easy-clean faux leather'],
  ],
  [
    93,
    'leather-watch',
    'Classic brown leather watch',
    'Fashion',
    59,
    79,
    ['Brown'],
    'Right on time.',
    'A timeless everyday watch with a leather strap and an easy-to-read dial.',
    ['Adjustable leather strap', 'Classic analog dial', 'Everyday lightweight feel'],
  ],
  [
    152,
    'tennis-racket',
    'Court Club tennis racket',
    'Fitness',
    39,
    55,
    ['Standard'],
    'Make time to play.',
    'A comfortable recreational racket for your next friendly match.',
    ['Comfortable wrapped grip', 'Recreational all-court design', 'Lightweight frame'],
  ],
  [
    140,
    'basketball',
    'All Court basketball',
    'Fitness',
    24,
    32,
    ['Size 7'],
    'A little friendly competition.',
    'A durable basketball for pick-up games, practice, and weekends outdoors.',
    ['Textured grip', 'Indoor and outdoor play', 'Standard size 7'],
  ],
];
const extra = [
  {
    id: 'controller',
    title: 'Wireless game controller',
    category: 'Gaming',
    price: 49,
    originalPrice: 69,
    variants: ['White'],
    tagline: 'Ready, player one.',
    description:
      'A comfortable wireless controller for relaxed couch gaming and long weekend sessions.',
    features: ['Ergonomic grip', 'Responsive controls', 'USB-C charging'],
    remote: [
      'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=85',
    ],
  },
  {
    id: 'keyboard',
    title: 'Compact mechanical keyboard',
    category: 'Gaming',
    price: 69,
    originalPrice: 99,
    variants: ['Standard'],
    tagline: 'Find your flow.',
    description: 'A compact desktop keyboard with satisfying tactile feedback and a clean layout.',
    features: ['Compact desktop footprint', 'Mechanical switches', 'USB connection'],
    remote: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=85',
    ],
  },
  {
    id: 'small-habits',
    title: 'Small Habits, Better Days',
    category: 'Books',
    price: 16,
    originalPrice: 22,
    variants: ['Paperback'],
    tagline: 'A good day starts small.',
    description:
      'A fictional ShopSwift edition exploring thoughtful routines and small daily changes. An original demo book.',
    features: ['Original demo edition', 'Paperback format', '240 pages'],
    images: ['/products/small-habits.svg'],
  },
  {
    id: 'creative-life',
    title: 'The Creative Life',
    category: 'Books',
    price: 19,
    originalPrice: 26,
    variants: ['Hardcover'],
    tagline: 'Make something that matters.',
    description:
      'An original demo book about curiosity, finding inspiration, and making space for creative work.',
    features: ['Original demo edition', 'Hardcover format', '192 pages'],
    images: ['/products/creative-life.svg'],
  },
];
fs.mkdirSync('public/products', { recursive: true });
fs.mkdirSync('lib', { recursive: true });
const products = entries
  .map(
    (
      [
        sourceId,
        id,
        title,
        category,
        price,
        originalPrice,
        variants,
        tagline,
        description,
        features,
      ],
      i,
    ) => {
      const p = source.find((p) => p.id === sourceId);
      return {
        id,
        title,
        brand: p.brand || 'ShopSwift Home',
        category,
        price,
        originalPrice,
        variants,
        tagline,
        description,
        features,
        remote: p.images.slice(0, 3),
        rating: [4.8, 4.6, 4.9, 4.7, 4.5][i % 5],
        reviews: [1248, 862, 2301, 416, 975, 328][i % 6],
        stock: 20 + i,
      };
    },
  )
  .concat(
    extra.map((p, i) => ({
      ...p,
      brand: p.category === 'Books' ? 'ShopSwift Press' : 'Studio',
      rating: 4.5 + i * 0.1,
      reviews: 184 + i * 173,
      stock: 24,
    })),
  );
(async () => {
  for (const p of products) {
    if (p.remote) {
      p.images = [];
      for (let i = 0; i < p.remote.length; i++) {
        const url = p.remote[i];
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${response.status}: ${url}`);
        const file = `${p.id}-${i}.${url.includes('unsplash') ? 'jpg' : 'webp'}`;
        fs.writeFileSync(`public/products/${file}`, Buffer.from(await response.arrayBuffer()));
        p.images.push(`/products/${file}`);
      }
      delete p.remote;
    }
    console.log(p.id);
  }
  fs.writeFileSync('lib/catalog.json', JSON.stringify(products, null, 2) + '\n');
  for (const [id, title, a, b, bg, fg] of [
    [
      'small-habits',
      'Small Habits, Better Days',
      'SMALL HABITS,',
      'BETTER DAYS',
      '#efbf73',
      '#233b35',
    ],
    ['creative-life', 'The Creative Life', 'THE CREATIVE', 'LIFE', '#24483f', '#f5e6c6'],
  ]) {
    fs.writeFileSync(
      `public/products/${id}.svg`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" role="img" aria-label="${title}"><rect x="60" y="25" width="285" height="450" rx="4" fill="${bg}"/><path d="M65 25v450" stroke="${fg}" opacity=".2" stroke-width="10"/><text x="91" y="82" fill="${fg}" font-family="Georgia" font-size="13" letter-spacing="4">SHOPSWIFT PRESS</text><text x="90" y="168" fill="${fg}" font-family="Georgia" font-size="29">${a}</text><text x="90" y="211" fill="${fg}" font-family="Georgia" font-size="31">${b}</text><circle cx="206" cy="322" r="67" fill="none" stroke="${fg}" stroke-width="2"/><path d="M139 322h134M206 255v134M160 276l94 94M160 370l94-94" stroke="${fg}" stroke-width="2"/><text x="105" y="435" fill="${fg}" font-family="sans-serif" font-size="11" letter-spacing="3">THE EVERYDAY COLLECTION</text></svg>`,
    );
  }
})();
