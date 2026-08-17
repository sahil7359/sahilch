import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dimension',
  description: 'Gaming and personal exploration.',
};

// Phase 8 builds the real Dimension (YouTube feed, LeetCode/GitHub live stats,
// the editable notepad). This is the route stub.
export default function DimensionPage() {
  return (
    <main id="main" className="container-x flex min-h-dvh flex-col justify-center py-32">
      <p className="kicker mb-6">Dimension</p>
      <h1
        className="font-semibold"
        style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--tracking-h2)' }}
      >
        Warp online.
      </h1>
      <p className="mt-6 max-w-xl text-muted">
        Gaming, esports, and whatever tech has my attention. Coming together in Phase 8.
      </p>
      <Link href="/" className="mt-10 text-sm text-accent">
        ← Back to the main site
      </Link>
    </main>
  );
}
