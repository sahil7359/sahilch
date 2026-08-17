'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * The single requestAnimationFrame loop on the page. Lenis owns it; everything
 * else subscribes. Smooth wheel only — never smooth touch (native momentum wins).
 * Destroyed entirely under prefers-reduced-motion.
 */
export function LenisProvider() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.6,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
