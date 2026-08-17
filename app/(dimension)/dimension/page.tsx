import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Dimension',
  description: 'Gaming, esports, and whatever tech has my attention.',
};

export const revalidate = 86400; // ISR: refresh feeds daily

type LeetCode = { solved: number; ranking: number | null };
type GitHub = { repos: number; followers: number };

async function getLeetCode(): Promise<LeetCode | null> {
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `query($u:String!){matchedUser(username:$u){profile{ranking} submitStats{acSubmissionNum{difficulty count}}}}`,
        variables: { u: site.handles.leetcode },
      }),
      next: { revalidate: 86400 },
    });
    const j = await res.json();
    const m = j?.data?.matchedUser;
    if (!m) return null;
    const all = m.submitStats.acSubmissionNum.find((x: { difficulty: string }) => x.difficulty === 'All');
    return { solved: all?.count ?? 0, ranking: m.profile?.ranking ?? null };
  } catch {
    return null;
  }
}

async function getGitHub(): Promise<GitHub | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${site.handles.github}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const j = await res.json();
    return { repos: j.public_repos ?? 0, followers: j.followers ?? 0 };
  } catch {
    return null;
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[color:var(--color-hair)] bg-surface p-5">
      <div className="font-mono text-3xl text-accent">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

export default async function DimensionPage() {
  const [lc, gh] = await Promise.all([getLeetCode(), getGitHub()]);

  return (
    <main id="main" className="container-x py-24">
      <div className="flex items-center justify-between">
        <p className="kicker">Dimension · Warp</p>
        <Link href="/" className="text-sm text-accent">
          ← Prime
        </Link>
      </div>

      <h1
        className="mt-8 font-semibold"
        style={{ fontSize: 'var(--text-h2)', letterSpacing: 'var(--tracking-h2)' }}
      >
        Off the clock.
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Ex-esports on PC — ranked #4 on the Apex Legends Asia server, plus
        Valorant. These days: shipping code, chasing new tech, and the occasional
        ranked grind.
      </p>

      {/* Live stats — a failed feed hides its own card, never renders "no data". */}
      {(lc || gh) && (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {lc && <Stat label="LeetCode solved" value={String(lc.solved)} />}
          {lc?.ranking && <Stat label="LeetCode rank" value={`#${lc.ranking.toLocaleString()}`} />}
          {gh && <Stat label="Public repos" value={String(gh.repos)} />}
          {gh && <Stat label="GitHub followers" value={String(gh.followers)} />}
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <a
          href={site.links.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[8px] border border-[color:var(--color-hair)] bg-surface p-6 transition-colors hover:border-accent"
        >
          <p className="font-semibold text-ink">GOB Gaming</p>
          <p className="mt-1 text-sm text-muted">Gameplay on YouTube →</p>
        </a>
        <a
          href={site.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[8px] border border-[color:var(--color-hair)] bg-surface p-6 transition-colors hover:border-accent"
        >
          <p className="font-semibold text-ink">GitHub</p>
          <p className="mt-1 text-sm text-muted">What I&apos;m building →</p>
        </a>
        <a
          href={site.links.leetcode}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[8px] border border-[color:var(--color-hair)] bg-surface p-6 transition-colors hover:border-accent"
        >
          <p className="font-semibold text-ink">LeetCode</p>
          <p className="mt-1 text-sm text-muted">The grind →</p>
        </a>
      </div>
    </main>
  );
}
