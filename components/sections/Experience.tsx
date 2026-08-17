import { timeline } from '@/lib/content/experience';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container-x">
        <SectionHeading
          kicker="Experience"
          title="From data engineering into AI/ML."
          sub="Outcomes and ownership — not a list of responsibilities."
        />

        <ol className="mt-12 border-l border-[color:var(--color-hair)]">
          {timeline.map((item, i) => (
            <Reveal key={`${item.org}-${i}`} delay={i * 60}>
              <li className="relative pb-10 pl-8 last:pb-0">
                <span
                  className="absolute left-0 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent"
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-semibold" style={{ fontSize: 'var(--text-h3)' }}>
                    {item.role}
                  </h3>
                  <span className="font-mono text-[12px] text-muted">{item.period}</span>
                </div>
                <p className="mt-1 text-sm text-accent">{item.org}</p>

                {item.points.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {item.points.map((p, j) => (
                      <li key={j} className="max-w-2xl text-sm leading-relaxed text-muted">
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
                {item.note && (
                  <p className="mt-2 font-mono text-[13px] text-ink">{item.note}</p>
                )}
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
