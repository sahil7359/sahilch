import Link from 'next/link';
import { site } from '@/lib/site';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="hairline-b border-t border-b-0 border-t-[color:var(--color-hair)]">
      <div className="container-x flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">{site.name}</p>
          <p className="mt-1 text-[13px] text-muted">
            {site.tagline} · {site.location}
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted">
          <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
            GitHub
          </a>
          <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
            LinkedIn
          </a>
          <a href={`mailto:${site.email}`} className="hover:text-ink">
            Email
          </a>
          <Link href="/dimension" className="text-accent">
            Dimension
          </Link>
        </nav>
      </div>
      <div className="container-x pb-8">
        <p className="text-[11px] text-muted">© {year} {site.name}. Built with Next.js — the site itself is the largest project here.</p>
      </div>
    </footer>
  );
}
