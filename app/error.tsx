'use client';

import Link from 'next/link';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main
      id="main"
      className="container-x flex min-h-dvh flex-col items-center justify-center py-32 text-center"
    >
      <p className="kicker mb-4">Error</p>
      <h1 className="font-semibold" style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--tracking-h2)' }}>
        Something went off.
      </h1>
      <p className="mt-4 max-w-md text-muted">A hiccup on my end, not yours.</p>
      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
        >
          Try again
        </button>
        <Link href="/" className="text-sm text-accent">
          Back home
        </Link>
      </div>
    </main>
  );
}
