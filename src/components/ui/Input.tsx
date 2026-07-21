import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type JSX } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, invalid, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'font-body w-full border-[3px] border-black bg-white px-3 py-2.5 placeholder:text-black/40 focus:ring-2 focus:ring-orange-600 focus:outline-none',
      invalid && 'ring-hotpink ring-2',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'font-body min-h-[100px] w-full resize-y border-[3px] border-black bg-white px-3 py-2.5 placeholder:text-black/40 focus:ring-2 focus:ring-orange-600 focus:outline-none',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

/**
 * Label element for form fields with optional required indicator and hint text.
 *
 * @param {object} root0 - FieldLabel properties.
 * @param {string} [root0.htmlFor] - ID of the associated form control.
 * @param {object} root0.children - Label text content.
 * @param {boolean} [root0.required] - Shows a red asterisk when true.
 * @param {string} [root0.hint] - Optional hint text displayed beside the label.
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
    <label htmlFor={htmlFor} className="block font-mono text-[11px] font-bold tracking-wider text-black/70 uppercase">
      {children}
      {required && <span className="text-orange-600"> *</span>}
      {hint && <span className="ml-2 font-normal text-black/50 normal-case">{hint}</span>}
    </label>
  );
}
