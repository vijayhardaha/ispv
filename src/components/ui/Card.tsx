import type { HTMLAttributes, JSX } from 'react';

import { type Tone, toneMap } from '@/constants/colors';
import { cn } from '@/lib/cn';

/**
 * Card container with optional tone colour and hover effect.
 *
 * @param {object} props - Card properties.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {Tone} [props.tone] - Background colour tone.
 * @param {boolean} [props.hover] - Enable hover lift effect.
 * @param {object} props.children - Card content.
 *
 * @returns {JSX.Element} Rendered card container.
 */
export function Card({
  className,
  tone = 'default',
  hover = false,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone; hover?: boolean }): JSX.Element {
  return (
    <div
      className={cn(
        'shadow-brutal border-2 border-black',
        toneMap[tone],
        hover && 'hover:shadow-brutal-lg transition-all hover:-translate-x-[2px] hover:-translate-y-[2px]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
