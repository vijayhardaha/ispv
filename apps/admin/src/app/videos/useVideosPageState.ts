'use client';

import { useEffect, useState, useCallback } from 'react';

import { useVideosActions, type UseVideosActionsReturn } from '@/app/videos/useVideosActions';
import { useVideosLoader, type UseVideosLoaderReturn } from '@/app/videos/useVideosLoader';
import { useVideosSelection, type UseVideosSelectionReturn } from '@/app/videos/useVideosSelection';
import type { VideoRecord } from '@/lib/types';

/**
 * UI state for modals on the videos page.
 *
 * @type {UseVideosModalState}
 * @property {VideoRecord | null} editVideo - Video being edited, or null.
 * @property {boolean} showAdd - Whether the add-video modal is open.
 * @property {(video: VideoRecord | null) => void} setEditVideo - Sets the video being edited.
 * @property {(show: boolean) => void} setShowAdd - Opens or closes the add-video modal.
 */
export interface UseVideosModalState {
  editVideo: VideoRecord | null;
  showAdd: boolean;
  setEditVideo: (video: VideoRecord | null) => void;
  setShowAdd: (show: boolean) => void;
}

/**
 * Combined return type of the useVideosPageState hook.
 */
export interface UseVideosPageStateReturn
  extends UseVideosLoaderReturn, UseVideosSelectionReturn, UseVideosActionsReturn, UseVideosModalState {}

/**
 * Compose all videos page state hooks into a single API.
 *
 * @returns {UseVideosPageStateReturn} All state values, setters, and action handlers.
 */
export function useVideosPageState(): UseVideosPageStateReturn {
  const [editVideo, setEditVideo] = useState<VideoRecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const loader = useVideosLoader();
  const selection = useVideosSelection(loader.videos);
  const { loadData } = loader;
  const { setSelectedIds } = selection;
  const loadWithClear = useCallback(() => {
    loadData();
    setSelectedIds(new Set());
  }, [loadData, setSelectedIds]);

  const actions = useVideosActions(loadWithClear, selection.selectedIds, selection.setSelectedIds);

  // Trigger loading on mount and when URL params (status/search/page) change.
  // Uses loadWithClear so selection is cleared whenever data refreshes.
  useEffect(() => {
    const timer = setTimeout(() => loadWithClear(), 0);
    return () => clearTimeout(timer);
  }, [loadWithClear]);

  return {
    // Loader
    videos: loader.videos,
    totalCount: loader.totalCount,
    isTrashed: loader.isTrashed,
    totalPages: loader.totalPages,
    page: loader.page,
    goToPage: loader.goToPage,
    status: loader.status,
    search: loader.search,
    setStatus: loader.setStatus,
    handleReset: loader.handleReset,
    loadData: loadWithClear,

    // Selection
    selectedIds: selection.selectedIds,
    selectAllRef: selection.selectAllRef,
    allSelected: selection.allSelected,
    handleSelectAll: selection.handleSelectAll,
    handleSelectOne: selection.handleSelectOne,
    setSelectedIds: selection.setSelectedIds,

    // Actions
    actionConfirm: actions.actionConfirm,
    bulkLoading: actions.bulkLoading,
    bulkAction: actions.bulkAction,
    bulkConfirm: actions.bulkConfirm,
    changingStatus: actions.changingStatus,
    actionConfirmLabel: actions.actionConfirmLabel,
    setActionConfirm: actions.setActionConfirm,
    setBulkAction: actions.setBulkAction,
    setBulkConfirm: actions.setBulkConfirm,
    handleSingleAction: actions.handleSingleAction,
    handleApplyBulk: actions.handleApplyBulk,
    handleConfirmBulk: actions.handleConfirmBulk,
    handleInlineStatusChange: actions.handleInlineStatusChange,

    // Modal state
    editVideo,
    showAdd,
    setEditVideo,
    setShowAdd,
  };
}
