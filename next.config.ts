import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  // Catalog assets are already compressed and bundled locally. Serving them
  // directly avoids runtime image processing and keeps the demo self-contained.
  images: { unoptimized: true },
};
export default config;
