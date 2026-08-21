'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { NAV_LINKS } from '@/components/nav/links';
import { MobileMenu } from '@/components/nav/MobileMenu';
import { site } from '@/lib/site';

/**
 * Frosted 48px nav. Hides on scroll-down past 120px, returns on scroll-up.
 * 1px accent scroll-progress line. Scroll handler only writes (direct DOM,
 * no per-frame React re-render); one rAF gate.
 */
export function Nav() {
  const barRef = useRef<HTMLElement>(null);
  const progRef = useRef<HTMLSpanElement>(null);
  const lastY = useRef(0);
  const hidden = useRef(false);
  const ticking = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, y / max) : 0;
        if (progRef.current) progRef.current.style.transform = `scaleX(${p})`;

        const down = y > lastY.current;
        if (y > 120 && down && !hidden.current) {
          hidden.current = true;
          barRef.current?.style.setProperty('transform', 'translateY(-100%)');
        } else if ((!down || y <= 120) && hidden.current) {
          hidden.current = false;
          barRef.current?.style.setProperty('transform', 'translateY(0)');
        }
        lastY.current = y;
        ticking.current = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        ref={barRef}
        className="nav-frost hairline-b fixed inset-x-0 top-0 z-50 h-12"
      >
        <div className="container-x flex h-12 items-center justify-between">
          <Link href="/#top" className="text-sm font-semibold tracking-tight text-ink">
            {site.name}
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {site.hasResume && (
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-accent/60 px-3 py-1.5 text-[13px] text-ink transition-colors hover:bg-accent/10"
              >
                Résumé
              </a>
            )}
            <Link
              href="/dimension"
              className="text-[13px] font-medium text-accent"
              aria-label="Enter Dimension"
            >
              Dimension
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center md:hidden"
              aria-label="Open menu"
            >
              <span className="relative block h-[10px] w-5">
                <span className="absolute left-0 top-0 h-px w-5 bg-ink" />
                <span className="absolute bottom-0 left-0 h-px w-5 bg-ink" />
              </span>
            </button>
          </div>
        </div>

        <span
          ref={progRef}
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent"
          style={{ transform: 'scaleX(0)' }}
          aria-hidden="true"
        />
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
