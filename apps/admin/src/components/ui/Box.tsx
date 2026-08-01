import type { ComponentPropsWithoutRef, JSX } from 'react';

import { cn } from '@/lib/utils';

const boxBase = 'rounded-none border border-gray-200 bg-white';

/**
 * Reusable card container with a subtle border and neutral background.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes to extend or override.
 * @param {import('react').ReactNode} [props.children] - Card content.
 *
 * @returns {JSX.Element} Rendered card container.
 */
export function Box({ className, children, ...props }: ComponentPropsWithoutRef<'div'>): JSX.Element {
  return (
    <div className={cn(boxBase, className)} {...props}>
      {children}
    </div>
  );
}
