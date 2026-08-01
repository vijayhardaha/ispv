import type { ComponentPropsWithoutRef, JSX } from 'react';

import { cn } from '@/lib/utils';

/**
 * Centered container with consistent horizontal padding and max-width.
 * Spreads all additional props to the underlying `<div>`.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {object} props.children - Container content.
 *
 * @returns {JSX.Element} Rendered container div.
 */
export function Container({ className, children, ...props }: ComponentPropsWithoutRef<'div'>): JSX.Element {
  return (
    <div className={cn('mx-auto px-6', className)} {...props}>
      {children}
    </div>
  );
}

Container.displayName = 'Container';
