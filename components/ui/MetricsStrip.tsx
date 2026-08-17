import type { Metric } from '@/lib/content/work';

/**
 * The metrics strip (§5.5a). Mono, tabular figures. Three states are handled by
 * the caller: measured (number + method), "Not measured" (literal text), and
 * absent (empty array → this renders nothing). Never a bar, gauge, or ring.
 */
export function MetricsStrip({
  metrics,
  variant = 'full',
}: {
  metrics: Metric[];
  variant?: 'full' | 'compact';
}) {
  if (!metrics.length) return null;
  const list = variant === 'compact' ? metrics.slice(0, 3) : metrics;

  return (
    <dl className={`font-mono ${variant === 'compact' ? 'space-y-2' : 'space-y-4'}`}>
      {list.map((m) => (
        <div key={m.label}>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[11px] uppercase tracking-wide text-muted">
              {m.label}
            </dt>
            <dd className="text-right text-sm tabular-nums text-ink">
              {m.value}
            </dd>
          </div>
          {variant === 'full' && m.method && (
            <dd className="mt-1 text-[12px] leading-snug text-muted">
              {m.method}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}
