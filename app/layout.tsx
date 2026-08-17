import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { site } from '@/lib/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description:
    'Data engineer turned AI engineer who ships agents with guardrails, hard cost ceilings, and published numbers — including the ugly ones.',
  openGraph: {
    type: 'website',
    title: `${site.name} — ${site.role}`,
    description: 'Ships production AI agents — RAG, guardrails, evaluations.',
    url: site.url,
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.role}`,
    description: 'Ships production AI agents — RAG, guardrails, evaluations.',
    images: ['/api/og'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: site.role,
    url: site.url,
    sameAs: [site.links.github, site.links.linkedin],
    address: { '@type': 'PostalAddress', addressLocality: 'Kolkata', addressCountry: 'IN' },
    alumniOf: 'Kalinga Institute of Industrial Technology',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${site.name} — ${site.role}`,
    url: site.url,
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
