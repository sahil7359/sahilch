import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

// Gradient placeholders until real photos land in public/hobbies/ (swap-ready).
const hobbies = [
  {
    title: 'Riding',
    line: 'The peace I feel — bikes mostly, sometimes the car.',
    grad: 'linear-gradient(135deg, #2a1c10, #b5651d 58%, #120d08)',
  },
  {
    title: 'Gaming',
    line: 'Ex-esports on PC — Apex Legends (#4, Asia server) and Valorant.',
    grad: 'linear-gradient(135deg, #250a3a, #7a1fff 55%, #0a0a1a)',
  },
  {
    title: 'Finding new tech',
    line: "On the frontier — quantization, transformers, whatever's next.",
    grad: 'linear-gradient(135deg, #062626, #1fb5a5 55%, #071616)',
  },
];

export function Hobbies() {
  return (
    <section id="hobbies" className="section-tight">
      <div className="container-x">
        <SectionHeading kicker="Off the clock" title="Three things I actually do." />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {hobbies.map((h, i) => (
            <Reveal key={h.title} delay={i * 60}>
              <div className="group relative h-72 overflow-hidden rounded-[20px] border border-[color:var(--color-hair)]">
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
                  style={{ background: h.grad }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-500 group-hover:from-black/70"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-xl font-semibold text-white">{h.title}</h3>
                  <p className="mt-1 text-sm text-white/75">{h.line}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
