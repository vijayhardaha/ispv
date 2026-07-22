import type { JSX } from 'react';

import { type Tone, toneMap } from '@/constants/colors';
import { cn } from '@/lib/cn';

/**
 * Small inline badge with configurable tone.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {Tone} [props.tone] - Colour tone.
 * @param {object} props.children - Badge content.
 *
 * @returns {JSX.Element} Rendered badge element.
 */
export function Badge({
  className,
  tone = 'default',
  children,
}: {
  className?: string;
  tone?: Tone;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border-2 border-black px-2.5 py-0.5 font-mono text-xs font-bold uppercase',
        toneMap[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
