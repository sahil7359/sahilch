import type { SourceChip } from '@/components/chat/useChatStream';

const LABELS: Record<string, string> = {
  bio: 'About',
  experience: 'Experience',
  education: 'Education',
  certifications: 'Certifications',
  skills: 'Skills',
  faq: 'FAQ',
  'projects/datachat': 'DataChat',
  'projects/quorum': 'Quorum',
  'projects/portfolio': 'This site',
  'projects/yardstick': 'Yardstick',
  'projects/flan-t5-finetuning': 'Fine-tuning',
};

export function SourceChips({ sources }: { sources?: SourceChip[] }) {
  if (!sources?.length) return null;
  const seen = new Set<string>();
  const unique = sources.filter((s) => (seen.has(s.source) ? false : (seen.add(s.source), true)));

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {unique.map((s) => (
        <span key={s.source} className="chip">
          {LABELS[s.source] ?? s.source}
        </span>
      ))}
    </div>
  );
}
