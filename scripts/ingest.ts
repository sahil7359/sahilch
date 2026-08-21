/**
 * Ingest the corpus: chunk (heading-aware), strip provenance tags, embed
 * (passage), and insert into documents. Idempotent — clears and re-inserts.
 * A leaked tag aborts the run. Run: pnpm ingest
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { embed } from '@/lib/ai/embed';
import { EMBEDDING_VERSION } from '@/lib/ai/config';

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

const CORPUS = join('content', 'corpus');
const stripTags = (s: string) => s.replace(/\[[^\]]+\]/g, '');
const hasTag = (s: string) => /\[[^\]]+\]/.test(s);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });
}

type Chunk = { source: string; heading: string; content: string; tokens: number };

function chunkFile(file: string): Chunk[] {
  const source = file.replace(/\\/g, '/').replace('content/corpus/', '').replace(/\.md$/, '');
  const out: Chunk[] = [];
  let heading = '';
  let buf: string[] = [];
  const flush = () => {
    if (!buf.length) return;
    const content = stripTags(buf.join(' ')).replace(/\s+/g, ' ').trim();
    if (content) {
      out.push({ source, heading, content, tokens: Math.ceil(content.split(/\s+/).length * 1.33) });
    }
    buf = [];
  };
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const t = raw.trim();
    if (t.startsWith('## ')) {
      flush();
      heading = t.slice(3).trim();
    } else if (t.startsWith('# ')) {
      // file title — skip
    } else if (t) {
      buf.push(t);
    }
  }
  flush();
  return out;
}

async function main() {
  const files = walk(CORPUS);
  const chunks = files.flatMap(chunkFile);

  const leaked = chunks.filter((c) => hasTag(c.content) || hasTag(c.heading));
  if (leaked.length) {
    console.error(`ABORT: ${leaked.length} chunks still contain a provenance tag`);
    leaked.slice(0, 5).forEach((c) => console.error('  ' + c.content.slice(0, 80)));
    process.exit(1);
  }
  console.log(`${chunks.length} chunks from ${files.length} files, 0 tags leaked`);

  await supabase.from('documents').delete().neq('id', 0);

  const BATCH = 32;
  let done = 0;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const vecs = await embed(batch.map((c) => `${c.heading}. ${c.content}`), 'retrieval.passage');
    const rows = batch.map((c, j) => ({
      source: c.source,
      heading: c.heading,
      content: c.content,
      token_count: c.tokens,
      embedding: vecs[j],
      embedding_version: EMBEDDING_VERSION,
      chunk_index: i + j,
    }));
    const { error } = await supabase.from('documents').insert(rows);
    if (error) {
      console.error('INSERT ERROR:', error.message);
      process.exit(1);
    }
    done += rows.length;
    console.log(`  embedded + inserted ${done}/${chunks.length}`);
  }

  const { count } = await supabase.from('documents').select('*', { count: 'exact', head: true });
  console.log(`Done. documents rows: ${count} @ ${EMBEDDING_VERSION}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
