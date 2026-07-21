import { cn } from '@/lib/utils';
import type { JSX } from 'react';

/**
 * Small inline badge with configurable tone.
 *
 * @param {object} root0 - Component properties.
 * @param {string} [root0.className] - Additional CSS classes.
 * @param {'default' | 'saffron' | 'green' | 'navy' | 'sun' | 'pink' | 'lime'} root0.tone - Colour tone.
 * @param {object} root0.children - Badge content.
 *
 * @returns {JSX.Element} Rendered badge element.
 */
export function Badge({
  className,
  tone = 'default',
  children,
}: {
  className?: string;
  tone?: 'default' | 'saffron' | 'green' | 'navy' | 'sun' | 'pink' | 'lime';
  children: React.ReactNode;
}): JSX.Element {
  const toneClasses: Record<string, string> = {
    default: 'bg-white',
    saffron: 'bg-orange-500 text-white',
    green: 'bg-blue-600 text-white',
    navy: 'bg-[#0a0a0c] text-white',
    sun: 'bg-yellow-400 text-black',
    pink: 'bg-orange-500 text-white',
    lime: 'bg-yellow-400 text-black',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border-2 border-black px-2.5 py-0.5 font-mono text-xs font-bold uppercase',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
