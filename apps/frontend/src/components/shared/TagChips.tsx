'use client';

import type { JSX } from 'react';

import { cn } from '@/lib/cn';

/**
 * Selectable tag chip buttons for filtering by hashtag or category.
 *
 * @param {object} props - Component properties.
 * @param {string[]} props.tags - Available tags to display as chips.
 * @param {string[]} props.selected - Currently selected tags.
 * @param {(tag: string) => void} props.onSelect - Callback when a tag chip is clicked.
 * @param {string} [props.emptyMessage] - Message shown when no tags are available.
 *
 * @returns {JSX.Element} Rendered tag chip list or empty message.
 */
export function TagChips({
  tags,
  selected,
  onSelect,
  emptyMessage,
}: {
  tags: string[];
  selected: string[];
  onSelect: (tag: string) => void;
  emptyMessage?: string;
}): JSX.Element {
  if (tags.length === 0 && emptyMessage) {
    return <span className="font-mono text-[10px] tracking-widest text-black/40 uppercase">{emptyMessage}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <button
          key={t}
          onClick={() => onSelect(t)}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1 border-2 border-black px-2.5 py-1 font-mono text-xs font-bold uppercase transition-all',
            selected.includes(t)
              ? 'shadow-brutal-sm bg-yellow-400 text-black'
              : 'bg-white hover:-translate-y-px hover:bg-yellow-400 hover:text-white'
          )}
        >
          #{t}
        </button>
      ))}
    </div>
  );
}
