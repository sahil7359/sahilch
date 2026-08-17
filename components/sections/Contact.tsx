import { site } from '@/lib/site';
import { features } from '@/lib/env';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { ContactForm } from '@/components/sections/ContactForm';

export function Contact() {
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(
    'Reaching out from your portfolio',
  )}&body=${encodeURIComponent('Hi Sahil,\n\n')}`;

  return (
    <section id="contact" className="section">
      <div className="container-x">
        <SectionHeading
          kicker="Contact"
          title="Let's talk."
          sub="Messages come straight to my inbox and I reply myself."
        />
        <Reveal>
          {features.tickets ? (
            <ContactForm email={site.email} />
          ) : (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={mailto}
                className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
              >
                Email me
              </a>
              <a
                href={site.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[color:var(--color-hair)] px-6 py-3 text-sm text-ink transition-colors hover:border-accent"
              >
                LinkedIn
              </a>
              <a
                href={site.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[color:var(--color-hair)] px-6 py-3 text-sm text-ink transition-colors hover:border-accent"
              >
                GitHub
              </a>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
