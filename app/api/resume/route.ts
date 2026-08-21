import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { getAdminClient } from '@/lib/db/admin';
import { clientIp } from '@/lib/utils/ip';
import { verifyTurnstile } from '@/lib/turnstile';

export const runtime = 'nodejs';

const Body = z.object({
  name: z.string().trim().min(1).max(100),
  role: z.string().trim().min(1).max(60),
  company: z.string().trim().max(120).optional(),
  consent: z.literal(true),
  turnstileToken: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'validation' }, { status: 400 });
  const b = parsed.data;

  const ip = clientIp(req.headers);
  if (!(await verifyTurnstile(b.turnstileToken, ip))) {
    return NextResponse.json({ error: 'turnstile_failed' }, { status: 403 });
  }

  // Access log for Sahil's tracking (consent recorded). Never blocks the download.
  try {
    await getAdminClient().from('resume_requests').insert({
      name: b.name,
      role: b.role,
      company: b.company ?? null,
      ip,
      user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
      referrer: req.headers.get('referer')?.slice(0, 300) ?? null,
      consented: true,
    });
  } catch {
    /* logging must not block the résumé */
  }

  let pdf: Buffer;
  try {
    pdf = await readFile(path.join(process.cwd(), 'content', 'resume.pdf'));
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 500 });
  }

  return new Response(new Uint8Array(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': 'inline; filename="Sahil_Chakraborty_Resume.pdf"',
      'cache-control': 'no-store',
    },
  });
}
