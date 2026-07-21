import type { HTMLAttributes, JSX } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'default' | 'saffron' | 'green' | 'navy' | 'sun' | 'pink' | 'lime';

const toneClasses: Record<Tone, string> = {
  default: 'bg-white',
  saffron: 'bg-orange-500 text-white',
  green: 'bg-blue-600 text-white',
  navy: 'bg-[#0a0a0c] text-white',
  sun: 'bg-yellow-400 text-black',
  pink: 'bg-orange-500 text-white',
  lime: 'bg-yellow-400 text-black',
};

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
        'shadow-brutal border-[3px] border-black',
        toneClasses[tone],
        hover && 'hover:shadow-brutal-lg transition-all hover:-translate-x-[2px] hover:-translate-y-[2px]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
