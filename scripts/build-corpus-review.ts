/**
 * Builds docs/corpus-review.md — a flat, sortable table of every factual claim
 * the agent can make, so the review checkpoint is scannable. Numbers, dates,
 * employers, and titles sort first. Also flags any untagged factual line (R1).
 * Run: pnpm tsx scripts/build-corpus-review.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CORPUS = join('content', 'corpus');
const TAG = /\[[^\]]+\]/g;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });
}

type Claim = { text: string; source: string; file: string; priority: number };

const HOT = /\d|January|February|March|April|May|June|July|August|September|October|November|December|TCS|Tata|LTIMindtree|KIIT|Microsoft|IBM|Vanderbilt|GUVI|Groq|Azure|Fabric|Engineer|Intern|Associate|NDCG|accuracy|percent/i;

const claims: Claim[] = [];
const untagged: string[] = [];

for (const file of walk(CORPUS)) {
  const rel = file.replace(/\\/g, '/');
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const tags = line.match(TAG);
    if (!tags) {
      untagged.push(`${rel}: ${line}`);
      continue;
    }
    const text = line.replace(TAG, '').replace(/\s+/g, ' ').trim();
    claims.push({ text, source: tags.join(' '), file: rel, priority: HOT.test(text) ? 0 : 1 });
  }
}

claims.sort((a, b) => a.priority - b.priority);

let md = `# Corpus review — every claim the agent can make\n\n`;
md += `**${claims.length} claims.** Rows with numbers, dates, titles and company names are first — read those hardest. `;
md += `Tell me any row number that's off and what it should say, or a row to cut.\n\n`;
md += `| # | Claim | Source |\n|---|---|---|\n`;
claims.forEach((c, i) => {
  md += `| ${i + 1} | ${c.text} | ${c.source} |\n`;
});
if (untagged.length) {
  md += `\n## ⚠ Untagged lines (must fix before ingest)\n\n`;
  untagged.forEach((u) => (md += `- ${u}\n`));
}

writeFileSync(join('docs', 'corpus-review.md'), md);
console.log(`Wrote docs/corpus-review.md — ${claims.length} claims, ${untagged.length} untagged.`);
if (untagged.length) {
  console.log('UNTAGGED (R1 violation):');
  untagged.forEach((u) => console.log('  ' + u));
  process.exit(1);
}
