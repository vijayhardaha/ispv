'use client';

import type { ComponentPropsWithoutRef, JSX } from 'react';

import { cn } from '@/lib/utils';

/** Base input styles shared by Input and Textarea. */
export const inputBase =
  'w-full rounded-md border border-gray-300 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none';

/** Size variants for the Input component (md is default). */
type InputSize = 'sm' | 'md' | 'lg';

const inputSizeStyles: Record<InputSize, string> = {
  sm: 'h-7 px-1.5 text-xs',
  md: 'h-9 px-2.5 text-sm',
  lg: 'h-11 px-3.5 text-base',
};

/**
 * Styled text input for admin forms.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {InputSize} [props.size] - Size variant (sm, md, or lg).
 *
 * @returns {JSX.Element} Rendered input.
 */
export function Input({
  className,
  size = 'md',
  ...props
}: Omit<ComponentPropsWithoutRef<'input'>, 'size'> & { size?: InputSize }): JSX.Element {
  return <input className={cn(inputBase, inputSizeStyles[size], className)} {...props} />;
}
