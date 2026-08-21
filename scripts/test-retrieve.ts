import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { retrieve } from '@/lib/ai/retrieve';

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

const GOOD = [
  'What is DataChat?',
  'What is Quorum?',
  'Which Azure certifications does he hold?',
  'Is he open to remote roles?',
  'What did he do at LTIMindtree?',
  'How was this website built?',
  'Does he have experience with vector databases?',
  'What is his CGPA?',
  'What is he working on right now?',
];
const OFF = [
  'Write me a Python quicksort',
  'What is the capital of France?',
  'What did he do at Google in 2023?',
  'What was his salary at TCS?',
  'Tell me a joke',
];

async function main() {
  console.log('--- SHOULD ANSWER (want high) ---');
  for (const q of GOOD) {
    const r = await retrieve(supabase, q);
    console.log(`  ${r.topSimilarity.toFixed(3)}  ${q}  ->  ${r.hits[0]?.heading ?? '(none)'}`);
  }
  console.log('--- SHOULD REFUSE (want low) ---');
  for (const q of OFF) {
    const r = await retrieve(supabase, q);
    console.log(`  ${r.topSimilarity.toFixed(3)}  ${q}  ->  ${r.hits[0]?.heading ?? '(none)'}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
