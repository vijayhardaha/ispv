'use client';

import { Suspense, type ComponentPropsWithoutRef, type JSX } from 'react';

import { useVideosPageState } from '@/app/videos/useVideosPageState';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { VideoFormModal } from '@/components/VideoFormModal';
import { CATEGORIES } from '@/constants/categories';
import { TAG_VARIANTS, type TagVariant } from '@/constants/colors';
import { LOCATIONS } from '@/constants/locations';
import { STATUSES, STATUS_LABELS, BULK_STATUS_OPTIONS } from '@/constants/status';
import { cn } from '@/lib/cn';
import { displayVideoUrl } from '@/lib/instagram';
import type { VideoRecord } from '@/lib/types';

/**
 * Videos management page with filtering, pagination, bulk operations, and CRUD.
 *
 * @returns {JSX.Element} Rendered videos page.
 */
export default function VideosPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading...</div>}>
      <VideosPageContent />
    </Suspense>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

/**
 * Page header with title and Add Video button.
 *
 * @param {object} props - Component properties.
 * @param {boolean} props.isTrashed - Whether the trashed filter is active.
 * @param {() => void} props.onAdd - Callback to open the add-video modal.
 *
 * @returns {JSX.Element} Rendered header section.
 */
function VideosPageHeader({ isTrashed, onAdd }: { isTrashed: boolean; onAdd: () => void }): JSX.Element {
  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 id="videos-heading" className="text-3xl font-extrabold uppercase">
        Videos
      </h1>
      <Button onClick={onAdd} disabled={isTrashed}>
        + Add Video
      </Button>
    </header>
  );
}

/**
 * Filter bar with search input, status select, and reset button.
 *
 * @param {object} props - Component properties.
 * @param {string} props.status - Currently selected status filter value.
 * @param {(newStatus: string) => void} props.onStatusChange - Callback when status filter changes.
 * @param {() => void} props.onReset - Callback to clear all filters.
 *
 * @returns {JSX.Element} Rendered filter bar.
 */
function VideosFilterBar({
  status,
  onStatusChange,
  onReset,
}: {
  status: string;
  onStatusChange: (newStatus: string) => void;
  onReset: () => void;
}): JSX.Element {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-row items-center gap-3">
        <SearchInput placeholder="Search videos…" />
        <Select
          variant="filter"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Status filter"
          options={STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
        />
      </div>
      <Button onClick={onReset} variant="danger-outline">
        Reset
      </Button>
    </div>
  );
}

/**
 * Bulk actions toolbar shown when one or more videos are selected.
 *
 * @param {object} props - Component properties.
 * @param {number} props.selectedCount - Number of currently selected videos.
 * @param {string} props.bulkAction - Currently selected bulk action value.
 * @param {boolean} props.bulkLoading - Whether a bulk operation is in progress.
 * @param {boolean} props.isTrashed - Whether the trashed filter is active.
 * @param {(action: string) => void} props.onBulkActionChange - Callback when bulk action selection changes.
 * @param {() => void} props.onApplyBulk - Callback to execute the selected bulk action.
 * @param {() => void} props.onClear - Callback to clear all selections.
 *
 * @returns {JSX.Element} Rendered bulk actions toolbar.
 */
function BulkActionsToolbar({
  selectedCount,
  bulkAction,
  bulkLoading,
  isTrashed,
  onBulkActionChange,
  onApplyBulk,
  onClear,
}: {
  selectedCount: number;
  bulkAction: string;
  bulkLoading: boolean;
  isTrashed: boolean;
  onBulkActionChange: (action: string) => void;
  onApplyBulk: () => void;
  onClear: () => void;
}): JSX.Element {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-yellow-100 px-4 py-3">
      <span className="text-sm font-bold uppercase">{selectedCount} selected</span>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          variant="bulk"
          value={bulkAction}
          onChange={(e) => onBulkActionChange(e.target.value)}
          disabled={bulkLoading}
        >
          <option value="">Bulk action…</option>
          {isTrashed ? (
            <>
              <option value="restore">Restore</option>
              <option value="delete">Permanently Delete</option>
            </>
          ) : (
            <>
              <option value="trash">Trash</option>
              <optgroup label="Change status to…">
                {BULK_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </optgroup>
            </>
          )}
        </Select>

        <Button
          size="sm"
          variant={bulkAction === 'delete' || bulkAction === 'trash' ? 'danger' : 'primary'}
          disabled={!bulkAction || bulkLoading}
          loading={bulkLoading}
          onClick={onApplyBulk}
        >
          Apply
        </Button>

        <Button size="sm" variant="secondary" disabled={bulkLoading} onClick={onClear}>
          Clear
        </Button>
      </div>
    </div>
  );
}

/**
 * Category badge with colour chip.
 *
 * @param {object} props - Component properties.
 * @param {string | null} props.category - Category value reference.
 *
 * @returns {JSX.Element} Rendered category badge or en-dash fallback.
 */
function CategoryBadge({ category }: { category: string | null }): JSX.Element {
  const cat = CATEGORIES.find((c) => c.slug === category);
  if (!cat) {
    return <span className="text-sm text-black/40">–</span>;
  }
  return (
    <span
      className={cn(
        'inline-block border border-black px-2 py-0.5 text-xs font-bold uppercase',
        TAG_VARIANTS[cat.color as TagVariant] ?? 'bg-gray-200 text-black'
      )}
    >
      {cat.name}
    </span>
  );
}

/**
 * Status cell — inline dropdown for active videos, static badge for trashed.
 *
 * @param {object} props - Component properties.
 * @param {VideoRecord} props.video - The video record.
 * @param {boolean} props.isTrashed - Whether the trashed filter is active.
 * @param {Set<string>} props.changingStatus - Set of video IDs whose status is being updated.
 * @param {(id: string, newStatus: string) => void} props.onChange - Callback when status changes.
 *
 * @returns {JSX.Element} Rendered status cell.
 */
function StatusCell({
  video,
  isTrashed,
  changingStatus,
  onChange,
}: {
  video: VideoRecord;
  isTrashed: boolean;
  changingStatus: Set<string>;
  onChange: (id: string, newStatus: string) => void;
}): JSX.Element {
  if (isTrashed) {
    return (
      <span className="inline-block border border-black bg-gray-800 px-2 py-0.5 text-sm font-bold text-white uppercase">
        Trashed
      </span>
    );
  }

  return (
    <Select
      variant="inline"
      value={video.status}
      disabled={changingStatus.has(video.id)}
      className={cn(
        video.status === 'published'
          ? 'bg-green-500 text-white'
          : video.status === 'draft'
            ? 'bg-gray-400'
            : video.status === 'rejected'
              ? 'bg-red-500 text-white'
              : 'bg-yellow-400'
      )}
      onChange={(e) => onChange(video.id, e.target.value)}
    >
      {BULK_STATUS_OPTIONS.map((s) => (
        <option key={s} value={s} className="bg-white text-black">
          {STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}

/**
 * Action buttons for a video row — Edit/Trash in active view, Restore/Purge in trashed view.
 *
 * @param {object} props - Component properties.
 * @param {VideoRecord} props.video - The video record.
 * @param {boolean} props.isTrashed - Whether the trashed filter is active.
 * @param {(video: VideoRecord) => void} props.onEdit - Callback to open edit modal.
 * @param {(id: string, action: 'trash' | 'restore' | 'delete') => void} props.onAction - Callback for trash/restore/delete actions.
 *
 * @returns {JSX.Element} Rendered action buttons.
 */
function VideoActions({
  video,
  isTrashed,
  onEdit,
  onAction,
}: {
  video: VideoRecord;
  isTrashed: boolean;
  onEdit: (video: VideoRecord) => void;
  onAction: (id: string, action: 'trash' | 'restore' | 'delete') => void;
}): JSX.Element {
  if (isTrashed) {
    return (
      <div className="flex gap-1">
        <Button onClick={() => onAction(video.id, 'restore')} variant="secondary" size="xs">
          Restore
        </Button>
        <Button onClick={() => onAction(video.id, 'delete')} variant="danger-ghost" size="xs">
          Purge
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <Button onClick={() => onEdit(video)} variant="secondary" size="xs">
        Edit
      </Button>
      <Button onClick={() => onAction(video.id, 'trash')} variant="danger-ghost" size="xs">
        Trash
      </Button>
    </div>
  );
}

/**
 * Formats an ISO date string to a 12-hour display (e.g., "12 May 2024 \u004011:30 AM").
 *
 * @param {string | null | undefined} dateStr - The ISO date string to format.
 *
 * @returns {string} The formatted date, or en-dash if the input is null/undefined.
 */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) {
    return '\u2013';
  }
  try {
    const d = new Date(dateStr);
    const datePart = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
    const timePart = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
    return `${datePart} @${timePart}`;
  } catch {
    return '\u2013';
  }
}

/**
 * Table cell with consistent padding and font size.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes to extend.
 * @param {import('react').ReactNode} [props.children] - Cell content.
 *
 * @returns {JSX.Element} Rendered table cell.
 */
function Td({ className, children, ...props }: ComponentPropsWithoutRef<'td'>): JSX.Element {
  return (
    <td className={cn('px-3 py-2 text-sm', className)} {...props}>
      {children}
    </td>
  );
}

/**
 * Full videos table with header and body rows.
 *
 * @param {object} props - Component properties.
 * @param {VideoRecord[]} props.videos - Videos to display.
 * @param {boolean} props.isTrashed - Whether the trashed filter is active.
 * @param {boolean} props.allSelected - Whether all visible videos are selected.
 * @param {Set<string>} props.selectedIds - Set of selected video IDs.
 * @param {{ current: HTMLInputElement | null }} props.selectAllRef - Ref object for the select-all checkbox.
 * @param {Set<string>} props.changingStatus - Set of video IDs whose status is being updated.
 * @param {(checked: boolean) => void} props.onSelectAll - Callback when select-all checkbox toggles.
 * @param {(id: string, checked: boolean) => void} props.onSelectOne - Callback when a single checkbox toggles.
 * @param {(video: VideoRecord) => void} props.onEdit - Callback to open edit modal.
 * @param {(id: string, action: 'trash' | 'restore' | 'delete') => void} props.onAction - Callback for trash/restore/delete.
 * @param {(id: string, newStatus: string) => void} props.onInlineStatusChange - Callback for inline status change.
 *
 * @returns {JSX.Element} Rendered table.
 */
function VideosTable({
  videos,
  isTrashed,
  allSelected,
  selectedIds,
  selectAllRef,
  changingStatus,
  onSelectAll,
  onSelectOne,
  onEdit,
  onAction,
  onInlineStatusChange,
}: {
  videos: VideoRecord[];
  isTrashed: boolean;
  allSelected: boolean;
  selectedIds: Set<string>;
  selectAllRef: { current: HTMLInputElement | null };
  changingStatus: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onEdit: (video: VideoRecord) => void;
  onAction: (id: string, action: 'trash' | 'restore' | 'delete') => void;
  onInlineStatusChange: (id: string, newStatus: string) => void;
}): JSX.Element {
  const colCount = isTrashed ? 12 : 11;

  return (
    <div className="overflow-x-auto border-2 border-black bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b-2 border-black bg-gray-100">
          <tr>
            <th className="w-10 px-3 py-2">
              <input
                ref={selectAllRef}
                type="checkbox"
                className="h-4 w-4 cursor-pointer accent-yellow-500"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                aria-label="Select all videos"
              />
            </th>
            <th className="w-16 px-3 py-2 text-sm font-bold uppercase">Thumb</th>
            <th className="px-3 py-2 text-sm font-bold uppercase">URL</th>
            <th className="w-28 px-3 py-2 text-sm font-bold uppercase">City</th>
            <th className="px-3 py-2 text-sm font-bold uppercase">Category</th>
            <th className="px-3 py-2 text-sm font-bold uppercase">Tags</th>
            <th className="w-24 px-3 py-2 text-sm font-bold uppercase">Status</th>
            <th className="w-28 px-3 py-2 text-sm font-bold uppercase">Created</th>
            <th className="w-28 px-3 py-2 text-sm font-bold uppercase">Updated</th>
            <th className="w-28 px-3 py-2 text-sm font-bold uppercase">Posted</th>
            {isTrashed && <th className="w-32 px-3 py-2 text-sm font-bold uppercase">Trashed At</th>}
            <th className="w-36 px-3 py-2 text-sm font-bold uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {videos.length === 0 ? (
            <tr>
              <Td colSpan={colCount} className="py-8 text-center text-black/50">
                {isTrashed ? 'No trashed videos' : 'No videos found'}
              </Td>
            </tr>
          ) : (
            videos.map((v) => (
              <VideoRow
                key={v.id}
                video={v}
                isTrashed={isTrashed}
                selected={selectedIds.has(v.id)}
                changingStatus={changingStatus}
                onSelectOne={onSelectOne}
                onEdit={onEdit}
                onAction={onAction}
                onInlineStatusChange={onInlineStatusChange}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── VideoRow sub-component ───────────────────────────────────────────────────

/**
 * A single table row for a video entry.
 *
 * @param {object} props - Component properties.
 * @param {VideoRecord} props.video - Video record to display.
 * @param {boolean} props.isTrashed - Whether the trashed filter is active.
 * @param {boolean} props.selected - Whether this video is selected.
 * @param {Set<string>} props.changingStatus - Set of video IDs whose status is being updated.
 * @param {(id: string, checked: boolean) => void} props.onSelectOne - Callback when checkbox toggles.
 * @param {(video: VideoRecord) => void} props.onEdit - Callback to open edit modal.
 * @param {(id: string, action: 'trash' | 'restore' | 'delete') => void} props.onAction - Callback for trash/restore/delete.
 * @param {(id: string, newStatus: string) => void} props.onInlineStatusChange - Callback for inline status change.
 *
 * @returns {JSX.Element} Rendered table row.
 */
function VideoRow({
  video,
  isTrashed,
  selected,
  changingStatus,
  onSelectOne,
  onEdit,
  onAction,
  onInlineStatusChange,
}: {
  video: VideoRecord;
  isTrashed: boolean;
  selected: boolean;
  changingStatus: Set<string>;
  onSelectOne: (id: string, checked: boolean) => void;
  onEdit: (video: VideoRecord) => void;
  onAction: (id: string, action: 'trash' | 'restore' | 'delete') => void;
  onInlineStatusChange: (id: string, newStatus: string) => void;
}): JSX.Element {
  return (
    <tr
      className={cn(
        'border-b border-black/10 hover:bg-yellow-50',
        selected && 'bg-yellow-100',
        isTrashed && 'opacity-80'
      )}
    >
      <Td>
        <input
          type="checkbox"
          className="h-4 w-4 cursor-pointer accent-yellow-500"
          checked={selected}
          onChange={(e) => onSelectOne(video.id, e.target.checked)}
          aria-label={`Select video ${video.video_id ?? video.video_url}`}
        />
      </Td>
      <Td>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnail_url ?? '/sample.svg'}
          alt=""
          loading="lazy"
          className="h-10 w-10 border border-black object-cover"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            if (!el.src.endsWith('/sample.svg')) {
              el.src = '/sample.svg';
            }
          }}
        />
      </Td>
      <Td className="max-w-50 truncate font-bold">
        <a
          href={displayVideoUrl(video)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-yellow-500"
        >
          {video.video_id ?? '\u2013'}
        </a>
      </Td>
      <Td>{video.city ?? '\u2013'}</Td>
      <Td>
        <CategoryBadge category={video.category} />
      </Td>
      <Td className="max-w-40 truncate">{video.tags?.length ? video.tags.join(', ') : '\u2013'}</Td>
      <Td>
        <StatusCell
          video={video}
          isTrashed={isTrashed}
          changingStatus={changingStatus}
          onChange={onInlineStatusChange}
        />
      </Td>
      <Td>{formatDate(video.created_at)}</Td>
      <Td>{formatDate(video.updated_at)}</Td>
      <Td>{formatDate(video.video_post_date)}</Td>
      {isTrashed && <Td className="text-black/60">{formatDate(video.trashed_at)}</Td>}
      <Td>
        <VideoActions video={video} isTrashed={isTrashed} onEdit={onEdit} onAction={onAction} />
      </Td>
    </tr>
  );
}

// ─── Main page content ───────────────────────────────────────────────────────

/**
 * Inner component that uses the useVideosPageState hook for state management.
 *
 * @returns {JSX.Element} Rendered videos page content with table, filters, and modals.
 */
function VideosPageContent(): JSX.Element {
  const {
    videos,
    editVideo,
    showAdd,
    actionConfirm,
    selectedIds,
    bulkLoading,
    bulkAction,
    bulkConfirm,
    changingStatus,
    selectAllRef,
    allSelected,
    isTrashed,
    totalPages,
    actionConfirmLabel,
    page,
    goToPage,
    status,
    setEditVideo,
    setShowAdd,
    setBulkAction,
    setActionConfirm,
    setSelectedIds,
    setBulkConfirm,
    setStatus,
    handleReset,
    handleSelectAll,
    handleSelectOne,
    handleSingleAction,
    handleApplyBulk,
    handleConfirmBulk,
    handleInlineStatusChange,
    loadData,
  } = useVideosPageState();

  return (
    <section className="py-8" aria-labelledby="videos-heading">
      <VideosPageHeader isTrashed={isTrashed} onAdd={() => setShowAdd(true)} />

      <VideosFilterBar status={status} onStatusChange={setStatus} onReset={handleReset} />

      {selectedIds.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.size}
          bulkAction={bulkAction}
          bulkLoading={bulkLoading}
          isTrashed={isTrashed}
          onBulkActionChange={(action) => setBulkAction(action)}
          onApplyBulk={handleApplyBulk}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      <VideosTable
        videos={videos}
        isTrashed={isTrashed}
        allSelected={allSelected}
        selectedIds={selectedIds}
        selectAllRef={selectAllRef}
        changingStatus={changingStatus}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onEdit={(video) => setEditVideo(video)}
        onAction={(id, action) => setActionConfirm({ id, action })}
        onInlineStatusChange={handleInlineStatusChange}
      />

      {!isTrashed && <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />}

      {actionConfirm && (
        <DeleteConfirmDialog
          label={actionConfirmLabel}
          action={actionConfirm.action}
          onCancel={() => setActionConfirm(null)}
          onConfirm={() => handleSingleAction(actionConfirm.id, actionConfirm.action)}
        />
      )}

      {bulkConfirm && (
        <DeleteConfirmDialog
          label={bulkConfirm.action === 'delete' ? 'Permanently Delete' : bulkConfirm.action === 'trash' ? 'Trash' : ''}
          action={bulkConfirm.action as 'trash' | 'delete'}
          onCancel={() => setBulkConfirm(null)}
          onConfirm={handleConfirmBulk}
        />
      )}

      {showAdd && (
        <VideoFormModal
          categories={CATEGORIES}
          locations={LOCATIONS}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            loadData();
          }}
        />
      )}

      {editVideo && (
        <VideoFormModal
          video={editVideo}
          categories={CATEGORIES}
          locations={LOCATIONS}
          onClose={() => setEditVideo(null)}
          onSaved={() => {
            setEditVideo(null);
            loadData();
          }}
        />
      )}
    </section>
  );
}
