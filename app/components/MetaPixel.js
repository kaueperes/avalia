'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { fbTrack } from '@/lib/pixel';

export default function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    fbTrack('PageView');
  }, [pathname, searchParams]);

  return null;
}
