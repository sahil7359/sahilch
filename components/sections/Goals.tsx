import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function Goals() {
  return (
    <section id="goals" className="section-tight">
      <div className="container-x">
        <SectionHeading kicker="Goals · Aug 2026" title="Where this is heading." />
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <Reveal>
            <div>
              <p className="kicker mb-3">Next three months</p>
              <p className="max-w-lg leading-relaxed text-muted">
                Shipping Yardstick, interviewing, a published fine-tune, deeper
                document-RAG, and picking up a new stack.
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div>
              <p className="kicker mb-3">In twelve months</p>
              <p className="max-w-lg leading-relaxed text-ink">
                Building higher-value AI systems — bigger scope, greater impact,
                steeper learning.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
