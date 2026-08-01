'use client';

import { useState, useCallback } from 'react';

import { useToast } from '@/components/Toast';
import { STATUS_LABELS } from '@/constants/status';

/**
 * Return type of the useVideosActions hook.
 *
 * @type {UseVideosActionsReturn}
 * @property {{ id: string; action: 'trash' | 'restore' | 'delete' } | null} actionConfirm - Pending single action confirmation.
 * @property {boolean} bulkLoading - Whether a bulk operation is in progress.
 * @property {string} bulkAction - Currently selected bulk action value.
 * @property {{ action: string } | null} bulkConfirm - Pending bulk action confirmation.
 * @property {Set<string>} changingStatus - Video IDs whose status is being updated.
 * @property {string} actionConfirmLabel - Label for the delete confirmation dialog.
 * @property {(confirm: { id: string; action: 'trash' | 'restore' | 'delete' } | null) => void} setActionConfirm - Sets pending action.
 * @property {(action: string) => void} setBulkAction - Sets the selected bulk action.
 * @property {(confirm: { action: string } | null) => void} setBulkConfirm - Sets pending bulk confirmation.
 * @property {(id: string, action: 'trash' | 'restore' | 'delete') => Promise<void>} handleSingleAction - Execute single action.
 * @property {() => Promise<void>} handleApplyBulk - Execute or confirm bulk action.
 * @property {() => Promise<void>} handleConfirmBulk - Confirm and execute destructive bulk action.
 * @property {(id: string, newStatus: string) => Promise<void>} handleInlineStatusChange - Change a video's status inline.
 */
export interface UseVideosActionsReturn {
  actionConfirm: { id: string; action: 'trash' | 'restore' | 'delete' } | null;
  bulkLoading: boolean;
  bulkAction: string;
  bulkConfirm: { action: string } | null;
  changingStatus: Set<string>;
  actionConfirmLabel: string;
  setActionConfirm: (confirm: { id: string; action: 'trash' | 'restore' | 'delete' } | null) => void;
  setBulkAction: (action: string) => void;
  setBulkConfirm: (confirm: { action: string } | null) => void;
  handleSingleAction: (id: string, action: 'trash' | 'restore' | 'delete') => Promise<void>;
  handleApplyBulk: () => Promise<void>;
  handleConfirmBulk: () => Promise<void>;
  handleInlineStatusChange: (id: string, newStatus: string) => Promise<void>;
}

/**
 * Manages single, bulk, and inline status actions for the videos page.
 *
 * @param {() => void} loadData - Callback to reload videos after an action.
 * @param {Set<string>} selectedIds - Currently selected video IDs for bulk operations.
 * @param {(ids: Set<string>) => void} setSelectedIds - Clears selection after bulk operations.
 *
 * @returns {UseVideosActionsReturn} Action state and handlers.
 */
export function useVideosActions(
  loadData: () => void,
  selectedIds: Set<string>,
  setSelectedIds: (ids: Set<string>) => void
): UseVideosActionsReturn {
  const [actionConfirm, setActionConfirm] = useState<{ id: string; action: 'trash' | 'restore' | 'delete' } | null>(
    null
  );
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkConfirm, setBulkConfirm] = useState<{ action: string } | null>(null);
  const [changingStatus, setChangingStatus] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleSingleAction = useCallback(
    async (id: string, action: 'trash' | 'restore' | 'delete') => {
      const res = await fetch(`/api/auth/videos/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      setActionConfirm(null);

      if (res.ok) {
        const label = action === 'trash' ? 'trashed' : action === 'restore' ? 'restored' : 'permanently deleted';
        toast(`Video ${label}`, 'success');
        loadData();
      } else {
        const err = await res.json().catch(() => ({ error: 'Action failed' }));
        toast(err.error || 'Action failed', 'error');
      }
    },
    [toast, loadData]
  );

  const executeBulkAction = useCallback(
    async (action: string) => {
      setBulkLoading(true);
      const ids = Array.from(selectedIds);
      setBulkAction('');

      let body: Record<string, unknown>;

      if (action === 'trash' || action === 'restore' || action === 'delete') {
        body = { action, ids };
      } else {
        body = { action: 'update_status', ids, status: action };
      }

      const res = await fetch('/api/auth/videos/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setBulkLoading(false);

      if (res.ok) {
        const labels: Record<string, string> = { trash: 'trashed', restore: 'restored', delete: 'permanently deleted' };
        const label = labels[action] ?? `updated to ${STATUS_LABELS[action] ?? action}`;
        toast(`${ids.length} video(s) ${label}`, 'success');
        setSelectedIds(new Set());
        loadData();
      } else {
        const err = await res.json().catch(() => ({ error: 'Bulk operation failed' }));
        toast(err.error || 'Bulk operation failed', 'error');
      }
    },
    [selectedIds, toast, loadData, setSelectedIds]
  );

  const handleApplyBulk = useCallback(async () => {
    if (bulkAction === 'trash' || bulkAction === 'delete') {
      setBulkConfirm({ action: bulkAction });
    } else {
      await executeBulkAction(bulkAction);
    }
  }, [bulkAction, executeBulkAction]);

  const handleConfirmBulk = useCallback(async () => {
    if (!bulkConfirm) {
      return;
    }
    setBulkConfirm(null);
    await executeBulkAction(bulkConfirm.action);
  }, [bulkConfirm, executeBulkAction]);

  const handleInlineStatusChange = useCallback(
    async (id: string, newStatus: string) => {
      setChangingStatus((prev) => new Set(prev).add(id));
      const res = await fetch(`/api/auth/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setChangingStatus((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (res.ok) {
        toast(`Status updated to ${STATUS_LABELS[newStatus] ?? newStatus}`, 'success');
        loadData();
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to update status' }));
        toast(err.error || 'Failed to update status', 'error');
      }
    },
    [toast, loadData]
  );

  const actionConfirmLabel = 'Video';

  return {
    actionConfirm,
    bulkLoading,
    bulkAction,
    bulkConfirm,
    changingStatus,
    actionConfirmLabel,
    setActionConfirm,
    setBulkAction,
    setBulkConfirm,
    handleSingleAction,
    handleApplyBulk,
    handleConfirmBulk,
    handleInlineStatusChange,
  };
}
