import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      id="main"
      className="container-x flex min-h-dvh flex-col items-center justify-center py-32 text-center"
    >
      <p className="kicker mb-4">404</p>
      <h1 className="font-semibold" style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--tracking-h2)' }}>
        This one resolved into noise.
      </h1>
      <p className="mt-4 max-w-md text-muted">
        The page you&apos;re after isn&apos;t here — it may have moved, or never existed.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
      >
        Back home
      </Link>
    </main>
  );
}
