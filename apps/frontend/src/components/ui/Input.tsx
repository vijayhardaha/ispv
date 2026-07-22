import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type JSX } from 'react';

import { cn } from '@/lib/cn';

/**
 * Props for the Input component.
 *
 * @type {InputProps}
 * @property {boolean} [invalid] - Shows a red ring when true.
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/**
 * Styled text input with optional invalid state indicator.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, invalid, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'font-body w-full border-2 border-black bg-white px-3 py-2.5 placeholder:text-black/40 focus:ring-2 focus:ring-yellow-500 focus:outline-none',
      invalid && 'ring-hotpink ring-2',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

/**
 * Props for the Textarea component.
 *
 * @type {TextareaProps}
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

/**
 * Styled resizable textarea with consistent border and focus styles.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'font-body min-h-[100px] w-full resize-y border-2 border-black bg-white px-3 py-2.5 placeholder:text-black/40 focus:ring-2 focus:ring-yellow-500 focus:outline-none',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

/**
 * Label element for form fields with optional required indicator and hint text.
 *
 * @param {object} props - FieldLabel properties.
 * @param {string} [props.htmlFor] - ID of the associated form control.
 * @param {object} props.children - Label text content.
 * @param {boolean} [props.required] - Shows a red asterisk when true.
 * @param {string} [props.hint] - Optional hint text displayed beside the label.
 *
 * @returns {JSX.Element} Rendered label element.
 */
export function FieldLabel({
  htmlFor,
  children,
  required,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}): JSX.Element {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-1 text-sm font-bold">
      {children}
      {required && <span className="text-yellow-500"> *</span>}
      {hint && <span className="ml-2 font-normal text-black/50 normal-case">{hint}</span>}
    </label>
  );
}
