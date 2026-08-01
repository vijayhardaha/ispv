'use client';

import { useEffect, type ComponentPropsWithoutRef, type JSX, type ReactNode } from 'react';

import { Box } from '@/components/ui/Box';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/* ── Modal shell ─────────────────────────────────────────────── */

/**
 * Modal backdrop overlay with centered card wrapper.
 *
 * @param {object} props - Component properties.
 * @param {ReactNode} props.children - Modal content.
 * @param {() => void} props.onClose - Click-outside handler.
 * @param {string} [props.className] - Additional CSS classes for the card.
 *
 * @returns {JSX.Element} Rendered modal overlay.
 */
export function ModalOverlay({
  children,
  onClose,
  className,
}: {
  children: ReactNode;
  onClose: () => void;
  className?: string;
}): JSX.Element {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <Box className={cn('my-auto w-full max-w-2xl', className)}>{children}</Box>
      </div>
    </div>
  );
}

/**
 * Modal header section with title and bottom border.
 *
 * @param {object} props - Component properties.
 * @param {boolean} [props.editing] - Whether editing (shows "Edit") or adding (shows "Add").
 * @param {string} props.children - Entity name.
 *
 * @returns {JSX.Element} Rendered title.
 */
export function ModalTitle({ editing = false, children }: { editing?: boolean; children: string }): JSX.Element {
  return (
    <div className="border-b border-gray-200 px-4 py-3">
      <h2 className="text-lg font-extrabold uppercase">
        {editing ? 'Edit' : 'Add'} {children}
      </h2>
    </div>
  );
}

/**
 * Modal footer section with Cancel and Save buttons and top border.
 *
 * @param {object} props - Component properties.
 * @param {() => void} props.onClose - Cancel handler.
 * @param {boolean} [props.loading] - Show loading spinner on Save button.
 *
 * @returns {JSX.Element} Rendered action buttons.
 */
export function ModalActions({ onClose, loading = false }: { onClose: () => void; loading?: boolean }): JSX.Element {
  return (
    <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
      <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button type="submit" loading={loading}>
        {loading ? 'Saving…' : 'Save'}
      </Button>
    </div>
  );
}

/* ── Form controls ───────────────────────────────────────────── */

const inputBase =
  'w-full border border-gray-300 placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none';

/** Size variants for the Input component (md is default). */
type InputSize = 'sm' | 'md' | 'lg';

const inputSizeStyles: Record<InputSize, string> = {
  sm: 'h-7 px-1.5 text-xs',
  md: 'h-8 px-2.5 text-sm',
  lg: 'h-10 px-3.5 text-base',
};

/**
 * Styled text input for admin forms.
 *
 * @param {object} props - Component properties.
 * @param {InputSize} [props.size] - Size variant (sm, md, or lg).
 * @param {string} [props.className] - Additional CSS classes.
 *
 * @returns {JSX.Element} Rendered input.
 */
export function Input({
  className,
  size = 'md',
  ...props
}: Omit<ComponentPropsWithoutRef<'input'>, 'size'> & { size?: InputSize }): JSX.Element {
  return <input className={cn(inputBase, inputSizeStyles[size], className)} {...props} />;
}

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

/**
 * Reusable form field wrapper with label.
 *
 * @param {object} props - Component properties.
 * @param {string} props.label - Field label text.
 * @param {string} [props.htmlFor] - ID of the control the label points to.
 * @param {ReactNode} props.children - Form control.
 *
 * @returns {JSX.Element} Rendered field wrapper.
 */
export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-bold uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}
