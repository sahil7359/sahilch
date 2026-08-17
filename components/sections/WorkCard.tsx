import Link from 'next/link';
import type { WorkMeta } from '@/lib/content/work';
import { MetricsStrip } from '@/components/ui/MetricsStrip';
import { cn } from '@/lib/utils/cn';

export function WorkCard({ work }: { work: WorkMeta }) {
  const entry = work.tier === 'entry';
  return (
    <article className={cn('work-card flex h-full flex-col', entry && 'work-card--entry')}>
      <div className="flex items-start justify-between gap-4">
        <h3
          className="font-semibold leading-tight"
          style={{ fontSize: 'var(--text-h3)' }}
        >
          <Link href={`/work/${work.slug}`} className="transition-colors hover:text-accent">
            {work.title}
          </Link>
        </h3>
        {entry && <span className="chip shrink-0">early</span>}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted">{work.tagline}</p>

      {work.metrics.length > 0 && (
        <div className="mt-5 border-t border-[color:var(--color-hair)] pt-4">
          <MetricsStrip metrics={work.metrics} variant="compact" />
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-1.5">
        {work.stack.slice(0, 6).map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-4 pt-6 text-[13px]">
        <Link href={`/work/${work.slug}`} className="font-medium text-accent">
          Details →
        </Link>
        {work.repo && (
          <a href={work.repo} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-ink">
            Code
          </a>
        )}
        {work.demo && (
          <a href={work.demo} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-ink">
            Live demo
          </a>
        )}
      </div>
    </article>
  );
}
