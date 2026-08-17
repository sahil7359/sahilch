import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllWork, getWork } from '@/lib/content/work';
import { MetricsStrip } from '@/components/ui/MetricsStrip';

export function generateStaticParams() {
  return getAllWork().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return {};
  return { title: work.title, description: work.tagline };
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[color:var(--color-hair)] pt-6">
      <p className="kicker mb-3">{label}</p>
      <p className="max-w-2xl leading-relaxed text-ink/90">{children}</p>
    </div>
  );
}

export default async function WorkDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();

  return (
    <article className="container-x max-w-3xl py-28">
      <Link href="/#work" className="text-sm text-muted transition-colors hover:text-ink">
        ← Work
      </Link>

      <header className="mt-8">
        <p className="kicker mb-3">
          {work.status === 'in-progress'
            ? `In progress${work.statusDate ? ` · since ${work.statusDate}` : ''}`
            : 'Shipped'}
        </p>
        <h1
          className="font-semibold"
          style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--tracking-h2)', lineHeight: 1.1 }}
        >
          {work.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{work.tagline}</p>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {work.stack.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
          {work.repo && (
            <a href={work.repo} target="_blank" rel="noopener noreferrer" className="text-accent">
              View code →
            </a>
          )}
          {work.demo && (
            <a href={work.demo} target="_blank" rel="noopener noreferrer" className="text-accent">
              Live demo →
            </a>
          )}
        </div>
      </header>

      <div className="mt-12 space-y-8">
        {work.problem && <Block label="Problem">{work.problem}</Block>}
        {work.approach && <Block label="Approach">{work.approach}</Block>}
        {work.tradeoff && <Block label="The tradeoff">{work.tradeoff}</Block>}

        {work.metrics.length > 0 && (
          <div className="border-t border-[color:var(--color-hair)] pt-6">
            <p className="kicker mb-4">Measured</p>
            <MetricsStrip metrics={work.metrics} variant="full" />
          </div>
        )}

        {work.limitations.length > 0 && (
          <div className="border-t border-[color:var(--color-hair)] pt-6">
            <p className="kicker mb-4">Known limitations</p>
            <ul className="space-y-3">
              {work.limitations.map((l, i) => (
                <li key={i} className="max-w-2xl leading-relaxed text-ink/90">
                  {l}
                </li>
              ))}
            </ul>
          </div>
        )}

        {work.body && (
          <div className="border-t border-[color:var(--color-hair)] pt-6">
            {work.body.split(/\n\n+/).map((para, i) => (
              <p key={i} className="mt-4 max-w-2xl leading-relaxed text-muted first:mt-0">
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
