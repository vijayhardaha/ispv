'use client';

import { type ComponentPropsWithoutRef, type JSX, type Ref } from 'react';

import { Check, Minus } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Reusable checkbox input with simple, border-based styling.
 * The native input stays visually hidden for accessibility; a styled box
 * with a checkmark (or dash for indeterminate state) renders in its place.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes for the label wrapper.
 * @param {import('react').ReactNode} [props.label] - Optional label text rendered next to the box.
 * @param {string} [props.labelClassName] - Additional CSS classes for the label text.
 * @param {boolean} [props.checked] - Whether the checkbox is checked.
 * @param {import('react').ChangeEventHandler<HTMLInputElement>} [props.onChange] - Change handler.
 * @param {boolean} [props.disabled] - Whether the checkbox is disabled.
 * @param {string} [props.id] - Unique ID linking the input to its label.
 * @param {import('react').Ref<HTMLInputElement>} [props.ref] - Ref forwarded to the native input.
 *
 * @returns {JSX.Element} Rendered checkbox with label.
 */
export function Checkbox({
  className,
  label,
  labelClassName,
  checked,
  onChange,
  disabled,
  id,
  ref,
  ...props
}: ComponentPropsWithoutRef<'input'> & {
  label?: string;
  labelClassName?: string;
  ref?: Ref<HTMLInputElement>;
}): JSX.Element {
  return (
    <label htmlFor={id} className={cn('group inline-flex cursor-pointer items-center gap-2', className)}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      <span
        className={cn(
          'grid h-5 w-5 shrink-0 place-items-center rounded-sm border border-gray-300 bg-white',
          'transition-colors peer-checked:border-purple-600 peer-checked:bg-purple-600',
          'peer-indeterminate:border-purple-600 peer-indeterminate:bg-purple-600',
          'peer-checked:[&_.cb-check]:opacity-100 peer-indeterminate:[&_.cb-minus]:opacity-100',
          'group-hover:border-gray-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-40',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-purple-500 peer-focus-visible:ring-offset-1'
        )}
      >
        <Check
          className="cb-check col-start-1 row-start-1 h-3.5 w-3.5 text-white opacity-0 transition-opacity"
          strokeWidth={3.5}
        />
        <Minus
          className="cb-minus col-start-1 row-start-1 h-3.5 w-3.5 text-white opacity-0 transition-opacity"
          strokeWidth={3.5}
        />
      </span>
      {label && <span className={cn('text-sm', labelClassName)}>{label}</span>}
    </label>
  );
}
