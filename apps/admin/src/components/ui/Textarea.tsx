'use client';

import type { ComponentPropsWithoutRef, JSX } from 'react';

import { inputBase } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

/**
 * Styled textarea for admin forms.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes.
 *
 * @returns {JSX.Element} Rendered textarea.
 */
export function Textarea({ className, ...props }: ComponentPropsWithoutRef<'textarea'>): JSX.Element {
  return <textarea className={cn(inputBase, 'px-3 py-2 text-sm', className)} rows={2} {...props} />;
}
