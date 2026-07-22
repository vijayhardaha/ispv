'use client';

import type { ComponentPropsWithoutRef, JSX, ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn(
          'w-full max-w-2xl border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#18181b]',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
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
 *
 * @returns {JSX.Element} Rendered action buttons.
 */
export function ModalActions({ onClose }: { onClose: () => void }): JSX.Element {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit">Save</Button>
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
 * Styled select dropdown for admin forms.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes.
 *
 * @returns {JSX.Element} Rendered select.
 */
export function Select({ className, ...props }: ComponentPropsWithoutRef<'select'>): JSX.Element {
  return <select className={cn(inputBase, className)} {...props} />;
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
