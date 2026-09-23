import type { Metadata } from 'next';
import { StoreProvider } from '@/components/store';
import { Footer, Header } from '@/components/header';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'ShopSwift — Your everyday, upgraded.', template: '%s | ShopSwift' },
  description:
    'Thoughtfully picked everyday finds. Explore the ShopSwift demo marketplace, from tech and home to your next great read.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
