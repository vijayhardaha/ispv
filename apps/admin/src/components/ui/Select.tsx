'use client';

import type { ComponentPropsWithoutRef, JSX } from 'react';

import { cn } from '@/lib/utils';

/**
 * Visual style variants for the Select component.
 *
 * - `form`: Full-width select for modal forms.
 * - `filter`: Compact select for page-level filters.
 * - `bulk`: Extra-compact select for bulk action toolbars.
 * - `inline`: Minimal select for inline table editing.
 *
 * @type {SelectVariant}
 */
type SelectVariant = 'form' | 'filter' | 'bulk' | 'inline';

const variantStyles: Record<SelectVariant, string> = {
  form: 'w-full border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none',
  filter:
    'border border-gray-300 bg-white font-semibold focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none',
  bulk: 'border border-gray-300 bg-white font-semibold focus:border-purple-500 focus:outline-none',
  inline:
    'border border-gray-300 bg-white font-semibold disabled:pointer-events-none disabled:opacity-50 focus:border-purple-500 focus:outline-none',
};

/** Size variants for the Select component (md is default). */
type SelectSize = 'sm' | 'md' | 'lg';

const sizeStyles: Record<SelectSize, string> = {
  sm: 'h-7 px-1.5 text-xs',
  md: 'h-8 px-2.5 text-sm',
  lg: 'h-10 px-3.5 text-base',
};

/**
 * Props for the Select component.
 *
 * @type {SelectProps}
 * @property {SelectVariant} [variant] - Visual style variant.
 * @property {SelectSize} [size] - Size variant (sm, md, or lg).
 * @property {{ value: string; label: string }[]} [options] - Array of option objects.
 * @property {string} [placeholder] - Optional placeholder option text (rendered as first option with empty value).
 */
interface SelectProps extends Omit<ComponentPropsWithoutRef<'select'>, 'size'> {
  variant?: SelectVariant;
  size?: SelectSize;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

/**
 * Reusable select dropdown with admin-specific variants.
 * Accepts either an `options` array or children for custom option layouts (e.g. optgroup).
 *
 * @param {SelectProps} props - Component properties.
 *
 * @returns {JSX.Element} Rendered select element.
 */
export function Select({
  className,
  variant = 'form',
  size = 'md',
  options,
  placeholder,
  children,
  ...props
}: SelectProps): JSX.Element {
  return (
    <select className={cn(variantStyles[variant], sizeStyles[size], className)} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options
        ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        : children}
    </select>
  );
}
