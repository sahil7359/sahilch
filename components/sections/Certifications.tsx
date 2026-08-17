import { certifications } from '@/lib/content/certifications';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export function Certifications() {
  return (
    <section id="certifications" className="section">
      <div className="container-x">
        <SectionHeading kicker="Certifications" title="Verifiable, dated, real." />

        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {certifications.map((c, i) => (
            <Reveal key={c.credId} delay={i * 25}>
              <div className="flex h-full flex-col rounded-[16px] border border-[color:var(--color-hair)] bg-surface p-5">
                <p className="font-semibold leading-snug text-ink">{c.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {c.issuer} · {c.date}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <span className="font-mono text-[11px] text-muted">ID {c.credId}</span>
                  {c.verifyUrl && (
                    <a
                      href={c.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] font-medium text-accent"
                    >
                      Verify →
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
