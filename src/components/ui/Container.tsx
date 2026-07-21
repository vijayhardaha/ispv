import type { HTMLAttributes, JSX } from 'react';
import { cn } from '@/lib/utils';

/**
 * Max-width centered container with consistent horizontal padding.
 *
 * @param {object} props - Container properties.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {object} props.children - Container content.
 *
 * @returns {JSX.Element} Rendered container wrapper.
 */
export function Container({ className, children, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div className={cn('mx-auto max-w-7xl px-4 md:px-6', className)} {...props}>
      {children}
    </div>
  );
}
