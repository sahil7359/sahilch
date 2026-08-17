'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { NAV_LINKS } from '@/components/nav/links';
import { site } from '@/lib/site';

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col bg-bg/95 md:hidden"
      style={{ backdropFilter: 'blur(20px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <nav className="flex flex-1 flex-col justify-center gap-2 px-8">
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="py-3 text-3xl font-semibold text-ink"
            style={{
              animation: 'menu-in 400ms var(--ease-out) both',
              animationDelay: `${i * 40}ms`,
            }}
          >
            {link.label}
          </a>
        ))}
        <Link
          href="/dimension"
          onClick={onClose}
          className="mt-6 py-3 text-3xl font-semibold text-accent"
          style={{
            animation: 'menu-in 400ms var(--ease-out) both',
            animationDelay: `${NAV_LINKS.length * 40}ms`,
          }}
        >
          Dimension →
        </Link>
      </nav>
      <div className="px-8 py-8 text-sm text-muted">
        <a href={site.links.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <span className="px-2">·</span>
        <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
      </div>
    </div>
  );
}
