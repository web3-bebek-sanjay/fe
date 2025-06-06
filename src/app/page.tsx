import { Suspense } from 'react';
import { HomeClient } from '@/components/HomeClient';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function Home() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HomeClient />
    </Suspense>
  );
}
