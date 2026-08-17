import { getFeaturedWork, getInProgressWork } from '@/lib/content/work';
import { WorkCard } from '@/components/sections/WorkCard';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function Work() {
  const featured = getFeaturedWork();
  const inProgress = getInProgressWork();

  return (
    <section id="work" className="section">
      <div className="container-x">
        <SectionHeading
          kicker="Work"
          title="Shipped systems, measured — including the ugly numbers."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {featured.map((w, i) => (
            <Reveal key={w.slug} delay={i * 60} className="h-full">
              <WorkCard work={w} />
            </Reveal>
          ))}
        </div>

        {/* In-progress projects — one muted line, not a card (§5.5c). */}
        {inProgress.map((w) => (
          <p key={w.slug} className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
            <span className="font-mono text-[color:var(--color-accent)]">
              Currently building
            </span>
            {w.statusDate ? ` · since ${w.statusDate}` : ''}
            {' — '}
            <span className="font-medium text-ink">{w.title}</span>. {w.tagline}
          </p>
        ))}
      </div>
    </section>
  );
}
