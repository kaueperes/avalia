'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, phCapture, phIdentify } from '@/lib/posthog';

export default function PostHogTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initPostHog();
    try {
      const stored = localStorage.getItem('user');
      if (stored) phIdentify(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    phCapture('$pageview', { path: pathname });
  }, [pathname, searchParams]);

  return null;
}
