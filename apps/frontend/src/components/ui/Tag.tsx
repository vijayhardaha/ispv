import type { JSX, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Map of variant names to Tailwind background/text color classes for the Tag component.
 */
const TAG_VARIANTS = {
  blue: 'bg-blue-600 text-white',
  yellow: 'bg-yellow-400 text-black',
  red: 'bg-red-500 text-white',
  green: 'bg-green-600 text-white',
  black: 'bg-black text-white',
  white: 'bg-white text-black',
} as const;

export type TagVariant = keyof typeof TAG_VARIANTS;

/**
 * Rotated small uppercase label with background color variant and optional icon.
 *
 * @param {object} props - Component properties.
 * @param {TagVariant} [props.variant] - Color variant.
 * @param {string} props.text - Label text.
 * @param {ReactNode} [props.icon] - Optional icon element to render before text.
 * @param {string} [props.className] - Additional CSS classes.
 *
 * @returns {JSX.Element} Rendered tag element.
 */
export function Tag({
  variant = 'blue',
  text,
  icon,
  className,
}: {
  variant?: TagVariant;
  text: string;
  icon?: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'mb-4 inline-flex -rotate-2 items-center justify-center gap-1 px-3 py-1 text-xs font-bold tracking-widest uppercase',
        TAG_VARIANTS[variant],
        className
      )}
    >
      {icon}
      {text}
    </div>
  );
}
