'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const ROLES = ['Recruiter', 'Hiring manager', 'Engineer', 'Founder', 'Student', 'Other'];

export function ResumeGate() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState('');
  const widget = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  // open on the shared event
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('open-resume-gate', onOpen);
    return () => window.removeEventListener('open-resume-gate', onOpen);
  }, []);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  // render Turnstile once the modal is open
  useEffect(() => {
    if (!open || !SITE_KEY) return;
    const render = () => {
      if (window.turnstile && widget.current && !rendered.current) {
        rendered.current = true;
        window.turnstile.render(widget.current, {
          sitekey: SITE_KEY,
          callback: (t: string) => setToken(t),
          'error-callback': () => setToken(''),
          'expired-callback': () => setToken(''),
          theme: 'dark',
        });
      }
    };
    if (document.getElementById('cf-turnstile-script')) {
      render();
    } else {
      const s = document.createElement('script');
      s.id = 'cf-turnstile-script';
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true;
      s.defer = true;
      s.onload = render;
      document.head.appendChild(s);
    }
  }, [open]);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setMsg('');
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: String(fd.get('name') ?? ''),
          role: String(fd.get('role') ?? ''),
          company: String(fd.get('company') ?? ''),
          consent: true,
          turnstileToken: token,
        }),
      });
      if (!res.ok) {
        setMsg(res.status === 403 ? 'Verification failed — reload and try again.' : 'Please check the fields and try again.');
        setStatus('error');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Sahil_Chakraborty_Resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setOpen(false);
    } catch {
      setMsg('Network hiccup — try again.');
      setStatus('error');
    }
  }

  const field =
    'w-full rounded-[12px] border border-[color:var(--color-hair)] bg-bg px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-accent';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgb(0 0 0 / 0.7)' }}>
      <div className="w-full max-w-md rounded-[20px] border border-[color:var(--color-hair)] bg-surface p-6" role="dialog" aria-modal="true" aria-label="Get the résumé">
        <div className="flex items-start justify-between">
          <div>
            <p className="kicker mb-1">Résumé</p>
            <h2 className="text-lg font-semibold text-ink">A couple of quick details</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-muted hover:text-ink">
            ✕
          </button>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          The résumé includes personal contact details, so Sahil likes to know who&apos;s
          reading it. Tell him a little about you and it downloads right away.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input name="name" required maxLength={100} placeholder="Your name" className={field} />
          <select name="role" required defaultValue="" className={field}>
            <option value="" disabled>
              Your role…
            </option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <input name="company" maxLength={120} placeholder="Company (optional)" className={field} />

          <label className="flex items-start gap-2 py-1 text-[12px] leading-relaxed text-muted">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--color-accent)]"
            />
            <span>
              I&apos;m requesting this résumé for a genuine professional purpose. I
              understand it contains personal contact information and agree not to
              republish or redistribute it. I consent to my name, role, company, and
              IP address being recorded for Sahil&apos;s reference.
            </span>
          </label>

          {SITE_KEY && <div ref={widget} />}
          {status === 'error' && <p className="text-sm text-accent">{msg}</p>}

          <button
            type="submit"
            disabled={!consent || status === 'sending'}
            className="w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-opacity disabled:opacity-40"
          >
            {status === 'sending' ? 'Preparing…' : 'Download résumé'}
          </button>
        </form>
      </div>
    </div>
  );
}
