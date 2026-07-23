import type { ComponentPropsWithoutRef, JSX } from 'react';

import { cn } from '@/lib/cn';

const boxBase = 'border-2 border-black bg-white shadow-[8px_8px_0px_0px_#18181b]';

/**
 * Reusable brutalism card container with consistent border, background, and shadow.
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
