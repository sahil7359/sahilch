import type { SupabaseClient } from '@supabase/supabase-js';
import { embed } from '@/lib/ai/embed';
import { retrieve } from '@/lib/ai/retrieve';
import { cacheLookup, cacheStore } from '@/lib/ai/cache';
import { buildMessages } from '@/lib/ai/prompt';
import { preFilter, postCheck, clampLength, type Reason } from '@/lib/ai/guard';
import { CHAT_MODEL, GROQ_URL, GENERATION, RETRIEVAL } from '@/lib/ai/config';

export type SourceChip = { source: string; heading: string | null; url: string | null };

/**
 * gpt-oss emits typographic characters (fancy hyphens, smart quotes, nbsp); fold
 * them to ASCII so verbatim-number matching and rendering behave. Done by
 * codepoint to keep the source free of invisible characters.
 */
function toAscii(s: string): string {
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c >= 0x2010 && c <= 0x2015) out += '-';
    else if (c === 0x2018 || c === 0x2019) out += "'";
    else if (c === 0x201c || c === 0x201d) out += '"';
    else if (c === 0x2026) out += '...';
    else if (c === 0x00a0) out += ' ';
    else out += ch;
  }
  return out;
}

export type AnswerResult =
  | { kind: 'answer'; text: string; sources: SourceChip[]; topSimilarity: number; tin: number; tout: number; cached: boolean }
  | { kind: 'refusal'; reason: Reason; topSimilarity: number };

/**
 * The full L1 to L2 to generate to L4 core, shared by the chat route and the eval
 * harness so what CI measures is exactly what ships. Session/rate/budget/
 * streaming live in the route; this is the retrieval + generation + guard core.
 */
export async function answerQuestion(supabase: SupabaseClient, question: string): Promise<AnswerResult> {
  const l1 = preFilter(question);
  if (!l1.ok) return { kind: 'refusal', reason: l1.reason!, topSimilarity: 0 };

  const qvec = (await embed([question], 'retrieval.query'))[0]!;

  const cached = await cacheLookup(supabase, qvec);
  if (cached) {
    return { kind: 'answer', text: cached.answer, sources: (cached.sources as SourceChip[]) ?? [], topSimilarity: 1, tin: 0, tout: 0, cached: true };
  }

  const { hits, topSimilarity } = await retrieve(supabase, question);
  if (!hits.length || topSimilarity < RETRIEVAL.l2Threshold) {
    return { kind: 'refusal', reason: 'low_score', topSimilarity };
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: buildMessages(question, hits),
      temperature: GENERATION.temperature,
      max_tokens: GENERATION.maxOutputTokens,
      reasoning_effort: GENERATION.reasoningEffort,
      stream: false,
    }),
  });
  if (!res.ok) return { kind: 'refusal', reason: 'post_check', topSimilarity };

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
    usage?: { prompt_tokens: number; completion_tokens: number };
  };
  const answer = clampLength(toAscii(data.choices[0]?.message?.content ?? '').trim());
  const tin = data.usage?.prompt_tokens ?? 0;
  const tout = data.usage?.completion_tokens ?? 0;

  const l4 = postCheck(answer, hits);
  if (!l4.ok) return { kind: 'refusal', reason: 'post_check', topSimilarity };

  const sources: SourceChip[] = hits.map((h) => ({ source: h.source, heading: h.heading, url: h.url }));
  await cacheStore(supabase, question, qvec, answer, sources);
  return { kind: 'answer', text: answer, sources, topSimilarity, tin, tout, cached: false };
}
