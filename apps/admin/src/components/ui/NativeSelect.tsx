'use client';

import type { ComponentPropsWithoutRef, JSX } from 'react';

import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

/** Size variants for the NativeSelect (default is md). */
type NativeSelectSize = 'sm' | 'default';

/**
 * Props for the NativeSelect component.
 *
 * @type {NativeSelectProps}
 * @property {NativeSelectSize} [size] - Size variant (sm or default).
 * @property {string} [className] - Additional CSS classes for the wrapper element.
 */
interface NativeSelectProps extends Omit<ComponentPropsWithoutRef<'select'>, 'size'> {
  size?: NativeSelectSize;
}

/**
 * Styled native select with a chevron icon, matching the admin design language.
 * Use when a real form control is required — unlike the Radix Select, this
 * renders an actual `<select>` element that participates in form submission.
 *
 * @param {NativeSelectProps} props - Component properties.
 *
 * @returns {JSX.Element} Rendered native select wrapper.
 */
export function NativeSelect({ className, size = 'default', ...props }: NativeSelectProps): JSX.Element {
  return (
    <div
      className={cn('group/native-select relative w-fit has-[select:disabled]:opacity-50', className)}
      data-size={size}
    >
      <select
        data-size={size}
        className={cn(
          'h-9 w-full min-w-0 appearance-none rounded-md border border-gray-300 bg-white py-1 pr-8 pl-2.5 text-sm transition-colors outline-none select-none',
          'focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30',
          'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
          'data-[size=sm]:h-7 data-[size=sm]:px-2 data-[size=sm]:text-xs'
        )}
        {...props}
      />
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-gray-400 select-none"
        aria-hidden="true"
      />
    </div>
  );
}

/**
 * Native option element with consistent dropdown colors.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes for the option element.
 *
 * @returns {JSX.Element} Rendered option element.
 */
export function NativeSelectOption({ className, ...props }: ComponentPropsWithoutRef<'option'>): JSX.Element {
  return <option className={cn('bg-[Canvas] text-[CanvasText]', className)} {...props} />;
}

/**
 * Native option group element with consistent dropdown colors.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes for the optgroup element.
 *
 * @returns {JSX.Element} Rendered optgroup element.
 */
export function NativeSelectOptGroup({ className, ...props }: ComponentPropsWithoutRef<'optgroup'>): JSX.Element {
  return <optgroup className={cn('bg-[Canvas] text-[CanvasText]', className)} {...props} />;
}
