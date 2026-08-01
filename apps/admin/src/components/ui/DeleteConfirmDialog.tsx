'use client';

import { useEffect, useState, type JSX } from 'react';

import { Box } from '@/components/ui/Box';
import { Button } from '@/components/ui/Button';

/**
 * Reusable confirmation dialog with loading state.
 * Supports trash, restore, and permanent-delete actions with contextual messaging.
 * Custom title and confirm button labels override the action-derived defaults.
 *
 * @param {object} props - Component properties.
 * @param {string} props.label - Entity name shown in the heading (e.g. "Video", "Category").
 * @param {'trash' | 'restore' | 'delete'} [props.action] - Type of action being confirmed.
 * @param {string} [props.message] - Custom confirmation message (overrides default).
 * @param {string} [props.title] - Custom heading text (overrides action-derived title).
 * @param {string} [props.confirmLabel] - Custom confirm button label (overrides action-derived label).
 * @param {() => void} props.onCancel - Cancel handler.
 * @param {() => Promise<void> | void} props.onConfirm - Confirm handler.
 *
 * @returns {JSX.Element} Rendered confirmation dialog.
 */
export function DeleteConfirmDialog({
  label,
  action = 'delete',
  message,
  title,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  label: string;
  action?: 'trash' | 'restore' | 'delete';
  message?: string;
  title?: string;
  confirmLabel?: string;
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

  const derivedTitle = isRestore ? `Restore ${label}?` : isTrash ? 'Move to Trash?' : `Delete ${label}?`;
  const defaultMessage = isRestore
    ? 'This video will reappear in the main list.'
    : isTrash
      ? 'This video will be hidden from the main list. You can restore it later from the Trashed view.'
      : 'This action cannot be undone. The video will be permanently removed.';
  const displayMessage = message ?? defaultMessage;
  const derivedLabel = isRestore ? 'Restore' : isTrash ? 'Move to Trash' : 'Delete';
  const displayTitle = title ?? derivedTitle;
  const displayConfirmLabel = confirmLabel ?? derivedLabel;
  const loadingLabel = loading
    ? confirmLabel
      ? `${confirmLabel}…`
      : isRestore
        ? 'Restoring…'
        : isTrash
          ? 'Moving to Trash…'
          : 'Deleting…'
    : displayConfirmLabel;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <Box className="my-auto w-full max-w-sm">
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-lg font-extrabold uppercase">{displayTitle}</h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-black/70">{displayMessage}</p>
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-200 px-4 py-3">
            <Button onClick={onCancel} variant="secondary" disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} variant={isRestore ? 'primary' : 'danger'} loading={loading}>
              {loadingLabel}
            </Button>
          </div>
        </Box>
      </div>
    </div>
  );
}
