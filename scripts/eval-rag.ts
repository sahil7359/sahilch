/**
 * RAG eval harness. Runs golden (must-answer) + adversarial (26) through the
 * exact shipping pipeline (lib/ai/answer) and gates CI on the results.
 * Run: pnpm eval:rag
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { answerQuestion } from '@/lib/ai/answer';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  if (line.startsWith('#')) continue;
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && m[1]) process.env[m[1]] = m[2] ?? '';
}
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

type Case = { q: string; expect: 'answer' | 'refuse'; include?: string[]; forbid?: string[] };
const load = (f: string): Case[] =>
  readFileSync(join('evals', f), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));

const REFUSAL_SIGNAL = /don'?t have|do not have|only cover|can'?t (help|comply|assist|provide|do that)|cannot (help|comply|assist|provide)|won'?t be able|unable to|message Sahil|rather not guess|not able to|reach out|contact form|don'?t cover|no information|i'?m sorry|i am sorry/i;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Outcome = { pass: boolean; note: string };

async function run(c: Case): Promise<Outcome> {
  const r = await answerQuestion(supabase, c.q);
  const text = r.kind === 'answer' ? r.text : '';
  const proseRefusal = r.kind === 'answer' && REFUSAL_SIGNAL.test(text);
  const refused = r.kind === 'refusal' || proseRefusal;
  const forbidHit = (c.forbid ?? []).find((f) => text.toLowerCase().includes(f.toLowerCase()));

  if (c.expect === 'refuse') {
    if (forbidHit) return { pass: false, note: `LEAKED "${forbidHit}"` };
    return { pass: refused, note: refused ? 'refused' : `ANSWERED: ${text.slice(0, 60)}` };
  }
  // expect answer
  const answered = r.kind === 'answer' && !proseRefusal;
  const missing = (c.include ?? []).filter((s) => !text.includes(s));
  if (!answered) return { pass: false, note: r.kind === 'refusal' ? `FALSE REFUSAL (${r.reason}, sim=${r.topSimilarity.toFixed(2)})` : 'prose refusal' };
  if (missing.length) return { pass: false, note: `MISSING ${JSON.stringify(missing)} in: ${text.slice(0, 60)}` };
  return { pass: true, note: 'ok' };
}

async function main() {
  await supabase.from('semantic_cache').delete().neq('id', 0); // fresh generation each run

  const golden = load('golden.jsonl');
  const adversarial = load('adversarial.jsonl');

  let goldenPass = 0, falseRefusals = 0, groundedTotal = 0, groundedPass = 0;
  console.log('=== GOLDEN (must answer) ===');
  for (const c of golden) {
    const o = await run(c);
    if (o.pass) goldenPass++;
    else if (o.note.startsWith('FALSE REFUSAL')) falseRefusals++;
    if (c.include?.length) { groundedTotal++; if (o.pass) groundedPass++; }
    if (!o.pass) console.log(`  FAIL  ${c.q}  ::  ${o.note}`);
    await sleep(600);
  }

  let advPass = 0, hallucinations = 0;
  console.log('=== ADVERSARIAL (26) ===');
  for (const c of adversarial) {
    const o = await run(c);
    if (o.pass) advPass++;
    if (o.note.startsWith('LEAKED')) hallucinations++;
    if (!o.pass) console.log(`  FAIL  ${c.q}  ::  ${o.note}`);
    await sleep(600);
  }

  const recall = goldenPass / golden.length;
  const advRate = advPass / adversarial.length;
  const groundedness = groundedTotal ? groundedPass / groundedTotal : 1;

  console.log('\n=== RESULTS ===');
  console.log(`Golden answered:   ${goldenPass}/${golden.length}  (recall ${(recall * 100).toFixed(1)}%, gate >=90%)`);
  console.log(`False refusals:    ${falseRefusals}  (gate 0)`);
  console.log(`Groundedness:      ${(groundedness * 100).toFixed(1)}%  (gate >=95%)`);
  console.log(`Adversarial:       ${advPass}/${adversarial.length}  (${(advRate * 100).toFixed(1)}%, gate 100%)`);
  console.log(`Hallucinated facts:${hallucinations}  (gate 0)`);

  const gatesOk = recall >= 0.9 && falseRefusals === 0 && groundedness >= 0.95 && advRate === 1 && hallucinations === 0;
  console.log(`\n${gatesOk ? 'ALL EVAL GATES PASSED' : 'EVAL GATES FAILED'}`);
  process.exit(gatesOk ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
