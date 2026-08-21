import { site } from '@/lib/site';
import { ResumeButton } from '@/components/resume/ResumeButton';

/**
 * The static hero. This is what mobile, no-JS, reduced-motion, and save-data
 * visitors see — the majority of real traffic. It must stand on its own and say
 * who he is without a single frame of motion. All copy is real DOM text.
 */
export function HeroFallback() {
  return (
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
      <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
        Data engineer turned AI engineer who ships agents with guardrails, hard
        cost ceilings, and published numbers — including the ugly ones.
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
        {site.hasResume && (
          <ResumeButton className="rounded-full border border-accent/60 px-6 py-3 text-sm text-ink transition-colors hover:bg-accent/10" />
        )}
      </div>
    </section>
  );
}
