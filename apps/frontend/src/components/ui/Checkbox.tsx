'use client';

import { type ComponentPropsWithoutRef, type JSX, type Ref } from 'react';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Brutalist checkbox with offset shadow, hard borders, and uppercase label.
 *
 * The native input stays visually hidden for accessibility; a styled box with
 * a checkmark renders in its place. Matches the button/card shadow language.
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
 * @returns {JSX.Element} Rendered brutalist checkbox with label.
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
    <label
      htmlFor={id}
      className={cn('group inline-flex cursor-pointer items-center gap-2', disabled && 'cursor-not-allowed', className)}
    >
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
          'grid h-5 w-5 shrink-0 place-items-center border-2 border-black bg-white transition-all duration-200',
          'shadow-brutal-sm',
          'group-hover:shadow-brutal group-hover:-translate-x-0.5 group-hover:-translate-y-0.5',
          'peer-checked:bg-yellow-400',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-yellow-500 peer-focus-visible:ring-offset-2',
          'peer-disabled:cursor-not-allowed peer-disabled:opacity-40'
        )}
      >
        <Check
          className={cn('size-4 text-black transition-opacity duration-200', checked ? 'opacity-100' : 'opacity-0')}
          strokeWidth={3.5}
        />
      </span>
      {label && (
        <span className={cn('font-display text-xs font-bold tracking-tight uppercase', labelClassName)}>{label}</span>
      )}
    </label>
  );
}
