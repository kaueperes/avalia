'use client';
import { useEffect } from 'react';
import { initPostHog, phIdentify } from '@/lib/posthog';

// Pageview/pageleave de SPA ficam a cargo do próprio SDK (capture_pageview:
// 'history_change' em lib/posthog.js) — não precisa disparar manualmente aqui.
export default function PostHogTracker() {
  useEffect(() => {
    initPostHog();
    try {
      const stored = localStorage.getItem('user');
      if (stored) phIdentify(JSON.parse(stored));
    } catch {}
  }, []);

  return null;
}
