import 'server-only';
import { Resend } from 'resend';
import { env } from '@/lib/env';
import { site } from '@/lib/site';

// Without a verified custom domain, Resend sends from its shared domain and
// delivery to arbitrary recipients is limited. Failures never fail the request
// (the ticket row is the source of truth); a pending row is retried.
const FROM = 'Sahil Portfolio <onboarding@resend.dev>';

function sanitizeHeader(s: string): string {
  return s.replace(/[\r\n]+/g, ' ').slice(0, 120);
}

function resend(): Resend | null {
  return env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
}

type Ticket = { ref: string; name: string; email: string; subject: string; message: string };

/** Notify Sahil. Reply-To is the validated sender so he can reply directly. */
export async function sendNotification(t: Ticket) {
  const client = resend();
  if (!client) throw new Error('email not configured');
  const esc = (v: string) => v.replace(/</g, '&lt;');
  return client.emails.send({
    from: FROM,
    to: site.email,
    replyTo: t.email,
    subject: `[${t.ref}] ${sanitizeHeader(t.subject)}`,
    html: `<div style="font-family:system-ui;line-height:1.6">
      <p><strong>New message via portfolio</strong> — ${esc(t.ref)}</p>
      <p><strong>From:</strong> ${esc(t.name)} &lt;${esc(t.email)}&gt;</p>
      <p><strong>Subject:</strong> ${esc(t.subject)}</p>
      <hr/><p style="white-space:pre-wrap">${esc(t.message)}</p></div>`,
  });
}

/** Optional acknowledgement to the sender. */
export async function sendAutoReply(t: Ticket) {
  const client = resend();
  if (!client) throw new Error('email not configured');
  return client.emails.send({
    from: FROM,
    to: t.email,
    subject: `Got your message — ${t.ref}`,
    html: `<div style="font-family:system-ui;line-height:1.6">
      <p>Hi ${t.name.replace(/</g, '&lt;')},</p>
      <p>Thanks for reaching out — your message reached Sahil and he'll reply
      himself. Reference <strong>${t.ref}</strong>.</p>
      <p>— Sahil's portfolio</p></div>`,
  });
}
