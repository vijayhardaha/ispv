'use client';

import { type ComponentPropsWithoutRef, type JSX } from 'react';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Reusable checkbox input with simple, border-based styling.
 * The native input stays visually hidden for accessibility; a styled box
 * with a checkmark renders in its place.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes for the label wrapper.
 * @param {import('react').ReactNode} [props.label] - Optional label text rendered next to the box.
 * @param {boolean} [props.checked] - Whether the checkbox is checked.
 * @param {import('react').ChangeEventHandler<HTMLInputElement>} [props.onChange] - Change handler.
 * @param {boolean} [props.disabled] - Whether the checkbox is disabled.
 *
 * @returns {JSX.Element} Rendered checkbox with label.
 */
export function Checkbox({
  className,
  label,
  checked,
  onChange,
  disabled,
  ...props
}: ComponentPropsWithoutRef<'input'> & { label?: string }): JSX.Element {
  return (
    <label className={cn('group inline-flex cursor-pointer items-center gap-2', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <span
        className={cn(
          'grid h-5 w-5 shrink-0 place-items-center border border-gray-300 bg-white',
          'transition-colors peer-checked:border-purple-600 peer-checked:bg-purple-600 peer-checked:[&_svg]:opacity-100',
          'group-hover:border-gray-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-40',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-purple-500 peer-focus-visible:ring-offset-1'
        )}
      >
        <Check className="h-3.5 w-3.5 text-white opacity-0 transition-opacity" strokeWidth={3.5} />
      </span>
      {label && <span className="text-sm font-bold uppercase">{label}</span>}
    </label>
  );
}
