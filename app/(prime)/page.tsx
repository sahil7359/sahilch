import { site } from '@/lib/site';
import { Reveal } from '@/components/ui/Reveal';

// Phase 3 skeleton. The generative hero (Phase 5) and full sections (Phase 4)
// replace these stubs. The static hero below is the honest fallback identity.
export default function Home() {
  return (
    <>
      <section
        id="top"
        className="container-x flex min-h-dvh flex-col justify-center py-32"
      >
        <p className="kicker mb-6">
          {site.role} · {site.location} · open to {site.targets.join(' / ')}
        </p>
        <h1
          className="text-gradient max-w-4xl text-balance font-semibold"
          style={{
            fontSize: 'var(--text-hero)',
            letterSpacing: 'var(--tracking-hero)',
            lineHeight: 1.03,
          }}
        >
          Ships AI agents, not notebooks.
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted">
          Data engineer turned AI engineer who ships agents with guardrails,
          hard cost ceilings, and published numbers — including the ugly ones.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#work"
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
          >
            View the work
          </a>
          <a
            href={`mailto:${site.email}`}
            className="rounded-full border border-[color:var(--color-hair)] px-6 py-3 text-sm text-ink transition-colors hover:border-accent"
          >
            Get in touch
          </a>
        </div>
      </section>

      {/* Section stubs — filled in Phase 4. */}
      {(
        [
          ['work', 'Work'],
          ['stack', 'Stack'],
          ['experience', 'Experience'],
          ['certifications', 'Certifications'],
          ['contact', 'Contact'],
        ] as const
      ).map(([id, label]) => (
        <section key={id} id={id} className="section container-x">
          <Reveal>
            <p className="kicker mb-4">{label}</p>
            <p className="text-muted">Coming together in Phase 4.</p>
          </Reveal>
        </section>
      ))}
    </>
  );
}
