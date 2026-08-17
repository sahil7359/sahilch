import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { getAdminClient } from '@/lib/db/admin';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

const DELIVERY: Record<string, string> = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.bounced': 'bounced',
  'email.delivery_delayed': 'pending',
  'email.complained': 'bounced',
};

export async function POST(req: Request) {
  const secret = env.RESEND_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const payload = await req.text();
  const headers = {
    'svix-id': req.headers.get('svix-id') ?? '',
    'svix-timestamp': req.headers.get('svix-timestamp') ?? '',
    'svix-signature': req.headers.get('svix-signature') ?? '',
  };

  let event: { type?: string; data?: { subject?: string } };
  try {
    event = new Webhook(secret).verify(payload, headers) as typeof event;
  } catch {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  const delivery = event.type ? DELIVERY[event.type] : undefined;
  const subject = event.data?.subject ?? '';
  const ref = subject.match(/\b(SC-\d{4}-\d{4})\b/)?.[1];

  if (delivery && ref) {
    await getAdminClient()
      .from('tickets')
      .update({ delivery, updated_at: new Date().toISOString() })
      .eq('ref', ref);
  }

  return NextResponse.json({ ok: true });
}
