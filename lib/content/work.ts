import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type Metric = { label: string; value: string; method: string };

export type WorkMeta = {
  slug: string;
  title: string;
  tagline: string;
  status: 'shipped' | 'in-progress';
  statusDate?: string; // e.g. "Aug 2026"
  tier: 'headline' | 'entry';
  order: number;
  featured: boolean; // renders as a full card in the grid
  stack: string[];
  repo?: string;
  demo?: string;
  metrics: Metric[]; // [] = the metrics strip does not render (absent state)
  limitations: string[];
  problem: string;
  approach: string;
  tradeoff: string;
  body: string; // optional extra prose (markdown-ish paragraphs)
};

const WORK_DIR = path.join(process.cwd(), 'content', 'work');

function parseFile(file: string): WorkMeta {
  const raw = fs.readFileSync(path.join(WORK_DIR, file), 'utf8');
  const { data, content } = matter(raw);
  const slug = file.replace(/\.mdx?$/, '');
  return {
    slug,
    title: String(data.title ?? slug),
    tagline: String(data.tagline ?? ''),
    status: data.status === 'in-progress' ? 'in-progress' : 'shipped',
    statusDate: data.statusDate ? String(data.statusDate) : undefined,
    tier: data.tier === 'entry' ? 'entry' : 'headline',
    order: Number(data.order ?? 99),
    featured: data.featured !== false,
    stack: Array.isArray(data.stack) ? data.stack.map(String) : [],
    repo: data.repo ? String(data.repo) : undefined,
    demo: data.demo ? String(data.demo) : undefined,
    metrics: Array.isArray(data.metrics)
      ? data.metrics.map((m: Record<string, unknown>) => ({
          label: String(m.label ?? ''),
          value: String(m.value ?? ''),
          method: String(m.method ?? ''),
        }))
      : [],
    limitations: Array.isArray(data.limitations)
      ? data.limitations.map(String)
      : [],
    problem: String(data.problem ?? ''),
    approach: String(data.approach ?? ''),
    tradeoff: String(data.tradeoff ?? ''),
    body: content.trim(),
  };
}

let cache: WorkMeta[] | null = null;

export function getAllWork(): WorkMeta[] {
  if (cache) return cache;
  const files = fs
    .readdirSync(WORK_DIR)
    .filter((f) => /\.mdx?$/.test(f));
  cache = files.map(parseFile).sort((a, b) => a.order - b.order);
  return cache;
}

/** Projects that render as full cards in the grid (shipped + featured). */
export function getFeaturedWork(): WorkMeta[] {
  return getAllWork().filter((w) => w.featured && w.status === 'shipped');
}

/** In-progress projects — rendered as a single muted line below the grid. */
export function getInProgressWork(): WorkMeta[] {
  return getAllWork().filter((w) => w.status === 'in-progress');
}

export function getWork(slug: string): WorkMeta | undefined {
  return getAllWork().find((w) => w.slug === slug);
}
