'use client';

import { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { HeroFallback } from '@/components/hero/HeroFallback';

// The canvas hero is dynamically imported with ssr:false, so mobile / no-JS /
// reduced-motion / save-data visitors never download it — they keep the static
// poster. This is the fallback matrix (§5.4).
const GenerativeHero = dynamic(
  () => import('@/components/hero/GenerativeHero').then((m) => m.GenerativeHero),
  { ssr: false },
);

function subscribe(cb: () => void) {
  const desktop = window.matchMedia('(min-width: 768px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  desktop.addEventListener('change', cb);
  reduced.addEventListener('change', cb);
  return () => {
    desktop.removeEventListener('change', cb);
    reduced.removeEventListener('change', cb);
  };
}

function shouldEnhance() {
  const desktop = window.matchMedia('(min-width: 768px)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  const saveData = nav.connection?.saveData ?? false;
  return desktop && !reduced && !saveData;
}

export function Hero() {
  // Server + hydration render the fallback (false); the client swaps to the
  // canvas after mount. No setState-in-effect, no hydration mismatch.
  const enhanced = useSyncExternalStore(subscribe, shouldEnhance, () => false);
  return enhanced ? <GenerativeHero /> : <HeroFallback />;
}
