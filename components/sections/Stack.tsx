import { interviewable, familiar } from '@/lib/content/stack';
import { FlipCard } from '@/components/sections/FlipCard';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function Stack() {
  return (
    <section id="stack" className="section">
      <div className="container-x">
        <SectionHeading
          kicker="Stack"
          title="Grouped by what I'd be trusted with."
          sub="Flip a card for what it is and which projects I used it in — not an alphabetised keyword dump."
        />

        <p className="kicker mt-10 mb-4">Interviewable — grill me on these</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {interviewable.map((s, i) => (
            <Reveal key={s.name} delay={i * 25}>
              <FlipCard {...s} />
            </Reveal>
          ))}
        </div>

        <p className="kicker mt-14 mb-4">Familiar with — used, not claiming depth</p>
        <Reveal>
          <div className="flex flex-wrap gap-2">
            {familiar.map((f) => (
              <span key={f} className="chip">
                {f}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
