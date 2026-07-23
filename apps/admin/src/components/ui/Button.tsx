'use client';

import type { JSX } from 'react';

import { cn } from '@/lib/cn';

const variantStyles = {
  primary: 'border-2 border-black bg-yellow-400 text-black hover:bg-yellow-300',
  secondary: 'border-2 border-black bg-white text-black hover:bg-gray-100',
  danger: 'border-2 border-black bg-red-500 text-white hover:bg-red-600',
  'danger-ghost': 'border-2 border-black bg-red-500 text-white hover:bg-red-600',
  'danger-outline': 'border-2 border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white',
  ghost: 'text-black hover:text-red-500',
} as const;

const sizeStyles = { default: 'px-4 py-2 text-sm', sm: 'px-3 py-1 text-xs', xs: 'px-2 py-1 text-xs' } as const;

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

/**
 * Reusable button component with admin-specific variants and sizes.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {ButtonVariant} [props.variant] - Visual variant.
 * @param {ButtonSize} [props.size] - Size variant.
 * @param {boolean} [props.loading] - Show loading spinner and disable.
 * @param {boolean} [props.disabled] - Native disabled attribute.
 * @param {import('react').ReactNode} [props.children] - Button content.
 *
 * @returns {JSX.Element} Rendered button element.
 */
export function Button({
  className,
  variant = 'primary',
  size = 'default',
  loading = false,
  children,
  disabled,
  ...props
}: React.ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}): JSX.Element {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 font-bold uppercase transition-colors',
        'disabled:pointer-events-none disabled:opacity-40',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
