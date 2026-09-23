import { Suspense } from 'react';
import { SearchResults } from '@/components/search-results';
import { LoadingState } from '@/components/ui';
export const metadata = { title: 'Explore the store' };
export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SearchResults />
    </Suspense>
  );
}
