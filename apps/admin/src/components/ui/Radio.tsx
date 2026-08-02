'use client';

import { type ComponentPropsWithoutRef, type JSX } from 'react';

import { cn } from '@/lib/utils';

/**
 * Reusable radio input with simple, border-based styling.
 * The native input stays visually hidden for accessibility; a styled circle
 * with an inner dot renders in its place.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes for the label wrapper.
 * @param {import('react').ReactNode} [props.label] - Optional label text rendered next to the circle.
 * @param {string} [props.labelClassName] - Additional CSS classes for the label text.
 * @param {boolean} [props.checked] - Whether the radio is selected.
 * @param {import('react').ChangeEventHandler<HTMLInputElement>} [props.onChange] - Change handler.
 * @param {boolean} [props.disabled] - Whether the radio is disabled.
 * @param {string} [props.id] - Unique ID linking the input to its label.
 *
 * @returns {JSX.Element} Rendered radio with label.
 */
export function Radio({
  className,
  label,
  labelClassName,
  checked,
  onChange,
  disabled,
  id,
  ...props
}: ComponentPropsWithoutRef<'input'> & { label?: string; labelClassName?: string }): JSX.Element {
  return (
    <label htmlFor={id} className={cn('group inline-flex cursor-pointer items-center gap-1.5', className)}>
      <input
        id={id}
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <span
        className={cn(
          'grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gray-300 bg-white',
          'transition-colors peer-checked:border-pink-600 peer-checked:[&_span]:opacity-100',
          'group-hover:border-gray-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-40',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-pink-500 peer-focus-visible:ring-offset-1'
        )}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-pink-600 opacity-0 transition-opacity" />
      </span>
      {label && <span className={cn('text-sm', labelClassName)}>{label}</span>}
    </label>
  );
}
