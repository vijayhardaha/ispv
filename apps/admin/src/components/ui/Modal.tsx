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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Box className={cn('w-full max-w-2xl p-6', className)}>{children}</Box>
    </div>
  );
}

/**
 * Modal title with Edit/Add prefix handling.
 *
 * @param {object} props - Component properties.
 * @param {boolean} [props.editing] - Whether editing (shows "Edit") or adding (shows "Add").
 * @param {string} props.children - Entity name.
 *
 * @returns {JSX.Element} Rendered title.
 */
export function ModalTitle({ editing = false, children }: { editing?: boolean; children: string }): JSX.Element {
  return (
    <h2 className="mb-4 text-xl font-extrabold uppercase">
      {editing ? 'Edit' : 'Add'} {children}
    </h2>
  );
}

/**
 * Modal action footer with Cancel and Save buttons.
 *
 * @param {object} props - Component properties.
 * @param {() => void} props.onClose - Cancel handler.
 * @param {boolean} [props.loading] - Show loading spinner on Save button.
 *
 * @returns {JSX.Element} Rendered action buttons.
 */
export function ModalActions({ onClose, loading = false }: { onClose: () => void; loading?: boolean }): JSX.Element {
  return (
    <div className="flex justify-end gap-2 pt-2">
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

const inputBase = 'w-full border-2 border-black px-3 py-2 text-sm';

/**
 * Styled text input for admin forms.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes.
 *
 * @returns {JSX.Element} Rendered input.
 */
export function Input({ className, ...props }: ComponentPropsWithoutRef<'input'>): JSX.Element {
  return <input className={cn(inputBase, className)} {...props} />;
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
  return <textarea className={cn(inputBase, className)} rows={2} {...props} />;
}

/**
 * Reusable form field wrapper with label.
 *
 * @param {object} props - Component properties.
 * @param {string} props.label - Field label text.
 * @param {ReactNode} props.children - Form control.
 *
 * @returns {JSX.Element} Rendered field wrapper.
 */
export function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase">{label}</label>
      {children}
    </div>
  );
}
