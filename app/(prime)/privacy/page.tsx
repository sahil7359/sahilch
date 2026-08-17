import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How this site handles data.',
};

export default function Privacy() {
  return (
    <article className="container-x max-w-2xl py-28">
      <Link href="/" className="text-sm text-muted hover:text-ink">
        ← Home
      </Link>
      <h1
        className="mt-8 font-semibold"
        style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--tracking-h2)' }}
      >
        Privacy
      </h1>
      <div className="mt-8 space-y-5 leading-relaxed text-muted">
        <p>
          This site keeps almost nothing. There are no tracking cookies, no
          analytics that fingerprint you, and no third-party advertising pixels.
        </p>
        <p>
          If you send a message through the contact form, the form is protected
          by Cloudflare Turnstile (a privacy-preserving alternative to CAPTCHA)
          and by a rate limit. To run that rate limit, your IP address is
          hashed with a secret salt before it is stored — the raw IP is never
          kept. Your name, email, subject, and message are stored so Sahil can
          reply, and are used for nothing else.
        </p>
        <p>
          Email notifications are sent through Resend. Nothing you submit is sold
          or shared with anyone beyond delivering your message.
        </p>
        <p>
          Want your message deleted? Email Sahil and it&apos;s gone.
        </p>
      </div>
    </article>
  );
}
