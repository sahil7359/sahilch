'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function ContactForm({ email }: { email: string }) {
  // Idempotency key generated once on mount — double-clicks and retries collapse
  // to one ticket.
  const [idem] = useState(() => crypto.randomUUID());
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [token, setToken] = useState('');
  const widget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY) return;
    const render = () => {
      if (window.turnstile && widget.current && !widget.current.hasChildNodes()) {
        window.turnstile.render(widget.current, {
          sitekey: SITE_KEY,
          callback: (t: string) => setToken(t),
          'error-callback': () => setToken(''),
          'expired-callback': () => setToken(''),
          theme: 'dark',
        });
      }
    };
    const existing = document.getElementById('cf-turnstile-script');
    if (existing) {
      render();
      return;
    }
    const s = document.createElement('script');
    s.id = 'cf-turnstile-script';
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    s.defer = true;
    s.onload = render;
    document.head.appendChild(s);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setMsg('');
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      subject: String(fd.get('subject') ?? ''),
      message: String(fd.get('message') ?? ''),
      website: String(fd.get('website') ?? ''),
      turnstileToken: token,
      idempotencyKey: idem,
    };
    try {
      const res = await fetch('/api/ticket', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setStatus('sent');
        return;
      }
      if (res.status === 429) setMsg("You've sent a few — give it a few minutes, or email me directly.");
      else if (res.status === 403) setMsg('Verification failed — reload the page and try again.');
      else if (res.status === 400) setMsg('Please check the fields and try again.');
      else setMsg(`Something went off on my end. Email me directly at ${email}.`);
      setStatus('error');
    } catch {
      setMsg(`Network hiccup — email me directly at ${email}.`);
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="mt-8 rounded-[16px] border border-[color:var(--color-hair)] bg-surface p-6">
        <p className="font-semibold text-ink">Message sent.</p>
        <p className="mt-1 text-sm text-muted">
          It reached my inbox and I&apos;ll reply myself. Thanks for reaching out.
        </p>
      </div>
    );
  }

  const field =
    'w-full rounded-[12px] border border-[color:var(--color-hair)] bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-accent';

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="sr-only">Name</label>
          <input id="name" name="name" required maxLength={100} placeholder="Your name" className={field} />
        </div>
        <div>
          <label htmlFor="email" className="sr-only">Email</label>
          <input id="email" name="email" type="email" required maxLength={200} placeholder="Your email" className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="sr-only">Subject</label>
        <input id="subject" name="subject" required maxLength={150} placeholder="Subject" className={field} />
      </div>
      <div>
        <label htmlFor="message" className="sr-only">Message</label>
        <textarea id="message" name="message" required minLength={10} maxLength={4000} rows={5} placeholder="What's on your mind?" className={field} />
      </div>

      {/* Honeypot — hidden from humans, tempting to bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {SITE_KEY && <div ref={widget} />}

      {status === 'error' && <p className="text-sm text-accent">{msg}</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
