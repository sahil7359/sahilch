'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * The single scroll-reveal primitive. Fires once (unobserves after entering),
 * and is genuinely off under prefers-reduced-motion. Animates opacity+transform
 * only, from a slot that already occupies its final space (no layout shift).
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-in');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const t = window.setTimeout(() => el.classList.add('is-in'), delay);
            io.unobserve(el);
            return () => window.clearTimeout(t);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={cn('reveal', className)}>
      {children}
    </div>
  );
}
