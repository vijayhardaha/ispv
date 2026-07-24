'use client';

import type { ComponentPropsWithoutRef, JSX } from 'react';

import { cn } from '@/lib/cn';

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
  form: 'w-full border-2 border-black px-3 py-2 text-sm',
  filter: 'border-2 border-black bg-white px-3 py-2 text-sm font-bold uppercase',
  bulk: 'border-2 border-black bg-white px-2 py-1 text-xs font-bold uppercase',
  inline:
    'border border-black px-1.5 py-0.5 text-xs font-bold uppercase disabled:pointer-events-none disabled:opacity-50',
};

/**
 * Props for the Select component.
 *
 * @type {SelectProps}
 * @property {SelectVariant} [variant] - Visual style variant.
 * @property {{ value: string; label: string }[]} [options] - Array of option objects.
 * @property {string} [placeholder] - Optional placeholder option text (rendered as first option with empty value).
 */
interface SelectProps extends ComponentPropsWithoutRef<'select'> {
  variant?: SelectVariant;
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
  options,
  placeholder,
  children,
  ...props
}: SelectProps): JSX.Element {
  return (
    <select className={cn(variantStyles[variant], className)} {...props}>
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
