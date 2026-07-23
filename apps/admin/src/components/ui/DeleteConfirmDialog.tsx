'use client';

import { useEffect, useState, type JSX } from 'react';

import { Box } from '@/components/ui/Box';
import { Button } from '@/components/ui/Button';

/**
 * Reusable confirmation dialog with loading state.
 * Supports trash, restore, and permanent-delete actions with contextual messaging.
 *
 * @param {object} props - Component properties.
 * @param {string} props.label - Entity name shown in the heading (e.g. "Video", "Category").
 * @param {'trash' | 'restore' | 'delete'} [props.action] - Type of action being confirmed.
 * @param {() => void} props.onCancel - Cancel handler.
 * @param {() => Promise<void> | void} props.onConfirm - Confirm handler.
 *
 * @returns {JSX.Element} Rendered confirmation dialog.
 */
export function DeleteConfirmDialog({
  label,
  action = 'delete',
  onCancel,
  onConfirm,
}: {
  label: string;
  action?: 'trash' | 'restore' | 'delete';
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}): JSX.Element {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const isTrash = action === 'trash';
  const isRestore = action === 'restore';

  const title = isRestore ? `Restore ${label}?` : isTrash ? `Trash ${label}?` : `Delete ${label}?`;
  const message = isRestore
    ? 'This video will reappear in the main list.'
    : isTrash
      ? 'This video will be hidden from the main list. You can restore it later from the Trashed view.'
      : 'This action cannot be undone. The video will be permanently removed.';
  const buttonLabel = isRestore ? 'Restore' : isTrash ? 'Trash' : loading ? 'Deleting…' : 'Delete';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Box className="w-full max-w-sm p-6">
        <h2 className="mb-2 text-lg font-extrabold uppercase">{title}</h2>
        <p className="mb-4 text-sm text-black/70">{message}</p>
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} variant="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant={isRestore ? 'primary' : 'danger'} loading={loading}>
            {loading ? (isRestore ? 'Restoring…' : isTrash ? 'Trashing…' : 'Deleting…') : buttonLabel}
          </Button>
        </div>
      </Box>
    </div>
  );
}
