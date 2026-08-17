import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminClient } from '@/lib/db/admin';
import { rateLimit } from '@/lib/ratelimit';
import { clientIp, hashIp } from '@/lib/utils/ip';
import { sendNotification, sendAutoReply } from '@/lib/email/send';
import { env, features } from '@/lib/env';

export const runtime = 'nodejs';

const Body = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().max(200).regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
  subject: z.string().trim().min(1).max(150),
  message: z.string().trim().min(10).max(4000),
  turnstileToken: z.string().optional(),
  idempotencyKey: z.string().min(8).max(64),
  website: z.string().optional(), // honeypot — must be empty
});

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true; // not configured → skip (dev)
  if (!token) return false;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
  });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

export async function POST(req: Request) {
  if (!features.tickets) {
    return NextResponse.json({ error: 'disabled' }, { status: 503 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation' }, { status: 400 });
  }
  const b = parsed.data;

  // Honeypot: a filled hidden field is a bot. Look like success, insert nothing.
  if (b.website && b.website.length > 0) {
    return NextResponse.json({ ref: 'SC-0000-0000', status: 'received' }, { status: 201 });
  }

  const ip = clientIp(req.headers);
  const ipHash = hashIp(ip);

  const turnstileOk = await verifyTurnstile(b.turnstileToken, ip);
  if (!turnstileOk) {
    return NextResponse.json({ error: 'turnstile_failed' }, { status: 403 });
  }

  const rl = await rateLimit(`ticket:${ipHash}`, 5, 600);
  if (!rl.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const supabase = getAdminClient();

  // Idempotency: if this key already exists, surface the existing ref as success.
  const existing = await supabase.from('tickets').select('ref').eq('idempotency_key', b.idempotencyKey).maybeSingle();
  if (existing.data?.ref) {
    return NextResponse.json({ ref: existing.data.ref, status: 'received' }, { status: 201 });
  }

  const refRes = await supabase.rpc('next_ticket_ref');
  const ref = typeof refRes.data === 'string' ? refRes.data : `SC-${new Date().getFullYear()}-0000`;

  const insert = await supabase
    .from('tickets')
    .insert({
      ref,
      name: b.name,
      email: b.email,
      subject: b.subject,
      message: b.message,
      idempotency_key: b.idempotencyKey,
      ip_hash: ipHash,
      user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
      referrer: req.headers.get('referer')?.slice(0, 300) ?? null,
    })
    .select('ref')
    .single();

  if (insert.error) {
    // Unique violation on idempotency_key = a race with a duplicate → success.
    if (insert.error.code === '23505') {
      const dup = await supabase.from('tickets').select('ref').eq('idempotency_key', b.idempotencyKey).maybeSingle();
      return NextResponse.json({ ref: dup.data?.ref ?? ref, status: 'received' }, { status: 201 });
    }
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }

  const finalRef = insert.data.ref;

  // Emails must never fail the request. A pending row is retried by a job.
  const results = await Promise.allSettled([
    sendNotification({ ref: finalRef, name: b.name, email: b.email, subject: b.subject, message: b.message }),
    sendAutoReply({ ref: finalRef, name: b.name, email: b.email, subject: b.subject, message: b.message }),
  ]);
  const notified = results[0].status === 'fulfilled';
  await supabase
    .from('tickets')
    .update({ delivery: notified ? 'sent' : 'pending', status: notified ? 'notified' : 'received' })
    .eq('ref', finalRef);

  return NextResponse.json({ ref: finalRef, status: 'received' }, { status: 201 });
}
