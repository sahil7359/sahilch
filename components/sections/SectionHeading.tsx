import { Reveal } from '@/components/ui/Reveal';

export function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal>
      <p className="kicker mb-3">{kicker}</p>
      <h2
        className="max-w-3xl font-semibold text-balance"
        style={{
          fontSize: 'var(--text-h2)',
          letterSpacing: 'var(--tracking-h2)',
          lineHeight: 1.1,
        }}
      >
        {title}
      </h2>
      {sub && <p className="mt-4 max-w-2xl text-muted">{sub}</p>}
    </Reveal>
  );
}
