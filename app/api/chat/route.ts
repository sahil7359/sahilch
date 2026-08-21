import { z } from 'zod';
import { getAdminClient } from '@/lib/db/admin';
import { clientIp, hashIp } from '@/lib/utils/ip';
import { rateLimit } from '@/lib/ratelimit';
import { answerQuestion, type SourceChip } from '@/lib/ai/answer';
import { REFUSAL, type Reason } from '@/lib/ai/guard';
import { features } from '@/lib/env';
import { LIMITS } from '@/lib/ai/config';

export const runtime = 'nodejs';
export const maxDuration = 30;

const Body = z.object({ message: z.string(), sessionId: z.string().min(8).max(64) });

function sse(c: ReadableStreamDefaultController, obj: unknown) {
  c.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`));
}

export async function POST(req: Request) {
  if (!features.chat) return new Response('disabled', { status: 503 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response('bad request', { status: 400 });
  const { message, sessionId } = parsed.data;

  const ipHash = hashIp(clientIp(req.headers));
  const supabase = getAdminClient();
  const started = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  const stream = new ReadableStream({
    async start(controller) {
      const log = async (o: { answer: string | null; sources: SourceChip[]; top: number; refused: boolean; reason: Reason | null; cached: boolean; tin: number; tout: number }) => {
        try {
          await supabase.from('chat_turns').insert({
            session_id: sessionId, question: message.slice(0, 500), answer: o.answer,
            sources: o.sources, top_score: o.top, refused: o.refused, refusal_reason: o.reason,
            cached: o.cached, tokens_in: o.tin, tokens_out: o.tout, latency_ms: Date.now() - started,
          });
        } catch { /* logging never breaks the response */ }
      };
      const emitRefusal = async (reason: Reason, top = 0) => {
        sse(controller, { type: 'refusal', reason, copy: REFUSAL[reason] });
        sse(controller, { type: 'done' });
        controller.close();
        await log({ answer: null, sources: [], top, refused: true, reason, cached: false, tin: 0, tout: 0 });
      };

      try {
        // rate limit → session cap → daily budget (all before any model work)
        const rl = await rateLimit(`chat:${ipHash}`, LIMITS.ratePerWindow, LIMITS.rateWindowSec);
        if (!rl.ok) return void (await emitRefusal('rate_limited'));

        const sess = await supabase.from('chat_sessions').select('turns').eq('id', sessionId).maybeSingle();
        if (sess.data) {
          if (sess.data.turns >= LIMITS.sessionCap) return void (await emitRefusal('session_limit'));
          await supabase.from('chat_sessions').update({ turns: sess.data.turns + 1 }).eq('id', sessionId);
        } else {
          await supabase.from('chat_sessions').insert({ id: sessionId, ip_hash: ipHash, turns: 1 });
        }

        const budget = await supabase.from('daily_budget').select('tokens_used').eq('day', today).maybeSingle();
        if ((budget.data?.tokens_used ?? 0) >= LIMITS.dailyTokenCap) return void (await emitRefusal('budget'));

        // core pipeline (L1 → cache → retrieve → L2 → generate → L4)
        const result = await answerQuestion(supabase, message);

        if (result.kind === 'refusal') return void (await emitRefusal(result.reason, result.topSimilarity));

        for (const w of result.text.split(/(\s+)/)) sse(controller, { type: 'token', value: w });
        sse(controller, { type: 'sources', value: result.sources });
        sse(controller, { type: 'done' });
        controller.close();

        if (result.tin + result.tout > 0) {
          await supabase.rpc('consume_budget', { p_day: today, p_tokens: result.tin + result.tout, p_cap: LIMITS.dailyTokenCap });
        }
        await log({ answer: result.text, sources: result.sources, top: result.topSimilarity, refused: false, reason: null, cached: result.cached, tin: result.tin, tout: result.tout });
      } catch {
        sse(controller, { type: 'refusal', reason: 'post_check', copy: REFUSAL.post_check });
        sse(controller, { type: 'done' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive' },
  });
}
