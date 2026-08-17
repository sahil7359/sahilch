'use client';

import { useState } from 'react';
import type { StackItem } from '@/lib/content/stack';

export function FlipCard({ name, blurb, projects }: StackItem) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      className="flip"
      data-flipped={flipped}
      onClick={() => setFlipped((f) => !f)}
      aria-label={`${name}. ${blurb} Used in ${projects.join(', ')}.`}
    >
      <span className="flip-inner">
        <span className="flip-face">
          <span className="text-sm font-semibold text-ink">{name}</span>
          <span className="text-[11px] text-muted">flip →</span>
        </span>
        <span className="flip-face flip-back">
          <span className="text-[12.5px] leading-snug text-ink">{blurb}</span>
          {projects.length > 0 && (
            <span className="mt-auto pt-2 font-mono text-[10.5px] text-accent">
              {projects.join(' · ')}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
