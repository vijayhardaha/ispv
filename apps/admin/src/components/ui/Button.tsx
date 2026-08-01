'use client';

import type { ComponentPropsWithoutRef, JSX } from 'react';

import { cn } from '@/lib/utils';

const variantStyles = {
  primary: 'border border-purple-600 bg-purple-600 text-white hover:bg-purple-700 hover:border-purple-700',
  secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100',
  danger: 'border border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700',
  'danger-ghost': 'border border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700',
  'danger-outline': 'border border-red-300 bg-transparent text-red-600 hover:bg-red-50 hover:border-red-400',
  link: 'text-gray-700 hover:text-purple-600 hover:underline hover:underline-offset-2',
} as const;

const sizeStyles = { sm: 'h-7 px-1.5 text-xs', md: 'h-9 px-2.5 text-sm', lg: 'h-11 px-3.5 text-base' } as const;

/** Visual style variants for the Button component. */
type ButtonVariant = keyof typeof variantStyles;

/** Size variants for the Button component (md is default). */
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
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}: ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}): JSX.Element {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-colors',
        'disabled:pointer-events-none disabled:opacity-40',
        variantStyles[variant],
        variant === 'link' ? 'h-auto px-0' : sizeStyles[size],
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
