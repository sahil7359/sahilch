import { LIMITS } from '@/lib/ai/config';
import type { Hit } from '@/lib/ai/retrieve';

export type Reason =
  | 'invalid'
  | 'rate_limited'
  | 'session_limit'
  | 'budget'
  | 'injection'
  | 'low_score'
  | 'off_topic'
  | 'post_check';

// injection === off_topic copy on purpose: confirming a detected attack is free
// information for the attacker.
export const REFUSAL: Record<Reason, string> = {
  low_score: "I don't have anything on that. If it's important, message Sahil directly - he'll answer himself.",
  off_topic: "I only cover Sahil's work and background. Happy to answer anything in that space.",
  injection: "I only cover Sahil's work and background. Happy to answer anything in that space.",
  rate_limited: "You've asked quite a few - give it a few minutes, or send a message and skip the queue.",
  budget: 'The assistant is off for today. Send a message and Sahil will reply himself.',
  post_check: "I'd rather not guess on that one. Message Sahil directly.",
  invalid: "That's a bit short to work with - ask me something about Sahil's work.",
  session_limit: "That's a good run of questions. Send Sahil a message to keep the conversation going.",
};

const INJECTION = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)/i,
  /disregard\s+(your|the)\s+(instructions?|rules?|system)/i,
  /(reveal|show|print|repeat|output)\s+(your|the)\s+(system\s+)?(prompt|instructions?)/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /\bDAN\b|jailbreak|developer\s+mode|sudo\s+mode/i,
  /act\s+as\s+(if\s+)?(you|a|an)\b/i,
  /new\s+(instructions?|persona|role)\s*:/i,
  /<\|?(im_start|system|endoftext)\|?>/i,
];

// zero-width / joiner / BOM characters, built from codepoints to keep the source
// free of invisible characters.
const ZERO_WIDTH = new RegExp('[\\u200B-\\u200D\\u2060\\uFEFF]');

/** L1 - cheap, code-only checks before anything expensive runs. */
export function preFilter(input: string): { ok: boolean; reason?: Reason } {
  const q = input.trim();
  if (q.length < LIMITS.minInputChars || q.length > LIMITS.maxInputChars) return { ok: false, reason: 'invalid' };
  if (ZERO_WIDTH.test(q)) return { ok: false, reason: 'injection' };
  const nonLatin = [...q].filter((ch) => ch.codePointAt(0)! > 127).length / q.length;
  if (nonLatin > 0.3) return { ok: false, reason: 'injection' };
  // A 40+ char CONTIGUOUS base64-ish run (no spaces) is an encoded blob; natural
  // questions have spaces, so this runs on the original string.
  if (/[A-Za-z0-9+/]{40,}={0,2}/.test(q)) return { ok: false, reason: 'injection' };
  for (const re of INJECTION) if (re.test(q)) return { ok: false, reason: 'injection' };
  return { ok: true };
}

const SYSTEM_SIGNATURES = [
  'You are the assistant for Sahil',
  'GROUNDING',
  'Answer ONLY using the CONTEXT',
  'CONTEXT:',
  'REFUSE, in one sentence',
];
const FIRST_PERSON_AS_SAHIL = /\bI\s+(work|built|build|hold|have\s+a|studied|fine-tuned|shipped|am\s+a|am\s+an|earned)\b|\bmy\s+(degree|role|job|cgpa|project|internship|certification|experience)\b/i;
const SENSITIVE = /\bsalary\b|\bphone\s*number\b|\+\d{10,}|\b\d{10}\b/i;

/**
 * L4 - code post-check on the generated answer. ok=false discards the answer in
 * favour of a generic refusal.
 */
export function postCheck(answer: string, hits: Hit[]): { ok: boolean; reason?: Reason } {
  const a = answer.trim();
  if (!a) return { ok: false, reason: 'post_check' };

  for (const sig of SYSTEM_SIGNATURES) if (a.includes(sig)) return { ok: false, reason: 'post_check' };
  if (FIRST_PERSON_AS_SAHIL.test(a)) return { ok: false, reason: 'post_check' };
  if (SENSITIVE.test(a)) return { ok: false, reason: 'post_check' };

  // No number/year/percent/decimal that isn't present verbatim in the context.
  const hitsText = hits.map((h) => h.content).join(' ');
  const nums = a.match(/\d+\.\d+|\d{4}|\d+%|\d{2,}/g) ?? [];
  for (const n of nums) {
    if (!hitsText.includes(n)) return { ok: false, reason: 'post_check' };
  }
  return { ok: true };
}

/** Truncate to ~600 tokens at a sentence boundary. */
export function clampLength(answer: string, maxTokens = 600): string {
  const words = answer.split(/\s+/);
  if (words.length <= maxTokens / 1.33) return answer;
  const truncated = words.slice(0, Math.floor(maxTokens / 1.33)).join(' ');
  const lastStop = Math.max(truncated.lastIndexOf('. '), truncated.lastIndexOf('? '), truncated.lastIndexOf('! '));
  return lastStop > 0 ? truncated.slice(0, lastStop + 1) : truncated;
}
