'use client';

import { useState, type JSX } from 'react';

import { Button } from '@/components/ui/Button';

/**
 * Reusable delete confirmation dialog with loading state.
 *
 * @param {object} props - Component properties.
 * @param {string} props.label - Entity name shown in the heading (e.g. "Video", "Category").
 * @param {() => void} props.onCancel - Cancel handler.
 * @param {() => Promise<void> | void} props.onConfirm - Confirm delete handler.
 *
 * @returns {JSX.Element} Rendered confirmation dialog.
 */
export function DeleteConfirmDialog({
  label,
  onCancel,
  onConfirm,
}: {
  label: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}): JSX.Element {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#18181b]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-lg font-extrabold uppercase">Delete {label}?</h2>
        <p className="mb-4 text-sm text-black/70">This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} variant="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="danger" loading={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
