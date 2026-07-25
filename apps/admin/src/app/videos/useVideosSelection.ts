'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

import type { VideoRecord } from '@/lib/db';

/**
 * Return type of the useVideosSelection hook.
 *
 * @type {UseVideosSelectionReturn}
 * @property {Set<string>} selectedIds - Set of selected video IDs.
 * @property {{ current: HTMLInputElement | null }} selectAllRef - Ref for the select-all checkbox.
 * @property {boolean} allSelected - Whether all visible videos are selected.
 * @property {(checked: boolean) => void} handleSelectAll - Toggle select-all.
 * @property {(id: string, checked: boolean) => void} handleSelectOne - Toggle a single selection.
 * @property {(ids: Set<string>) => void} setSelectedIds - Sets the selected video IDs.
 */
export interface UseVideosSelectionReturn {
  selectedIds: Set<string>;
  selectAllRef: { current: HTMLInputElement | null };
  allSelected: boolean;
  handleSelectAll: (checked: boolean) => void;
  handleSelectOne: (id: string, checked: boolean) => void;
  setSelectedIds: (ids: Set<string>) => void;
}

/**
 * Manages checkbox selection state for the videos table.
 *
 * @param {VideoRecord[]} videos - Current page of videos for select-all logic.
 *
 * @returns {UseVideosSelectionReturn} Selection state and handlers.
 */
export function useVideosSelection(videos: VideoRecord[]): UseVideosSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);
  const allSelected = videos.length > 0 && selectedIds.size === videos.length;

  /** Update the indeterminate state of the select-all checkbox. */
  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) {
      return;
    }
    const someSelected = selectedIds.size > 0 && selectedIds.size < videos.length;
    el.indeterminate = someSelected;
  }, [selectedIds, videos.length]);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(videos.map((v) => v.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [videos]
  );

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  return { selectedIds, selectAllRef, allSelected, handleSelectAll, handleSelectOne, setSelectedIds };
}
