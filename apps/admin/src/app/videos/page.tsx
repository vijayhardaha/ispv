'use client';

import { Suspense, useState, type ComponentPropsWithoutRef, type JSX, type ReactNode } from 'react';

import { ChevronDown, ChevronUp, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import type { StatusCount } from '@/app/videos/useVideosLoader';
import { useVideosPageState } from '@/app/videos/useVideosPageState';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { VideoFormModal } from '@/components/VideoFormModal';
import { CATEGORIES, type CategoryRecord } from '@/constants/categories';
import { TAG_VARIANTS, type TagVariant } from '@/constants/colors';
import { LOCATIONS } from '@/constants/locations';
import { STATUS_LABELS, BULK_STATUS_OPTIONS } from '@/constants/status';
import type { VideoRecord } from '@/lib/db';
import { cn, displayVideoUrl } from '@/lib/utils';

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
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add Video
      </Button>
    </header>
  );
}

/**
 * Status tab links with per-status counts (e.g. "All (9) | Published (9)").
 *
 * Each tab is a plain link carrying the `status` URL param, so the page
 * reloads data from the URL instead of using local state.
 *
 * @param {object} props - Component properties.
 * @param {string} props.status - Currently active status filter value.
 * @param {StatusCount[]} props.statusCounts - Per-status counts for the tabs.
 *
 * @returns {JSX.Element} Rendered status tab links.
 */
function StatusTabs({ status, statusCounts }: { status: string; statusCounts: StatusCount[] }): JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildHref = (tabStatus: string): string => {
    const params = new URLSearchParams(searchParams.toString());
    if (tabStatus) {
      params.set('status', tabStatus);
    } else {
      params.delete('status');
    }
    params.delete('page');
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <nav className="flex flex-wrap items-center gap-1" aria-label="Video status filters">
      {statusCounts.map((s) => {
        const active = (s.status === '' && status === '') || (s.status !== '' && status === s.status);
        const isTrashed = s.status === 'trashed';
        return (
          <Link
            key={s.status}
            href={buildHref(s.status)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'border border-gray-300 px-3 py-1 text-xs font-semibold transition-colors',
              active
                ? isTrashed
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-purple-600 bg-purple-600 text-white'
                : isTrashed
                  ? 'bg-white text-red-600 hover:bg-red-50'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
            )}
          >
            {STATUS_LABELS[s.status]} ({s.count})
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Toolbar row with bulk actions, filter dropdowns, and pagination on the right.
 *
 * Bulk action dropdown + Apply, then category/location selects + Filter/Reset
 * buttons. The right side shows the results count and pagination.
 *
 * @param {object} props - Component properties.
 * @param {string} props.bulkAction - Currently selected bulk action value.
 * @param {boolean} props.hasSelection - Whether any row is checked.
 * @param {boolean} props.bulkLoading - Whether a bulk operation is in progress.
 * @param {boolean} props.isTrashed - Whether the trashed filter is active.
 * @param {string} props.category - Currently applied category filter value.
 * @param {string} props.location - Currently applied location filter value.
 * @param {number} props.page - Current active page.
 * @param {number} props.totalPages - Total number of pages.
 * @param {number} props.totalCount - Total item count across all pages.
 * @param {number} props.perPage - Items per page.
 * @param {(action: string) => void} props.onBulkActionChange - Callback when bulk action selection changes.
 * @param {() => void} props.onApplyBulk - Callback to execute the selected bulk action.
 * @param {(category: string, location: string) => void} props.onApplyFilters - Callback to apply filter dropdowns.
 * @param {() => void} props.onReset - Callback to clear all filters.
 *
 * @returns {JSX.Element} Rendered toolbar row.
 */
function VideosToolbar({
  bulkAction,
  hasSelection,
  bulkLoading,
  isTrashed,
  category,
  location,
  page,
  totalPages,
  totalCount,
  perPage,
  onBulkActionChange,
  onApplyBulk,
  onApplyFilters,
  onReset,
}: {
  bulkAction: string;
  hasSelection: boolean;
  bulkLoading: boolean;
  isTrashed: boolean;
  category: string;
  location: string;
  page: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  onBulkActionChange: (action: string) => void;
  onApplyBulk: () => void;
  onApplyFilters: (category: string, location: string) => void;
  onReset: () => void;
}): JSX.Element {
  const [draftCategory, setDraftCategory] = useState(category);
  const [draftLocation, setDraftLocation] = useState(location);
  const [prevCategory, setPrevCategory] = useState(category);
  const [prevLocation, setPrevLocation] = useState(location);

  // Re-sync staged filter values when the URL changes externally
  // (reset, back/forward) without clobbering in-progress selections.
  if (category !== prevCategory) {
    setPrevCategory(category);
    setDraftCategory(category);
  }
  if (location !== prevLocation) {
    setPrevLocation(location);
    setDraftLocation(location);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-gray-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Select
            variant="bulk"
            name="bulk_action"
            id="bulk_action"
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
                <option value="trash">Move to trash</option>
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
            variant={bulkAction === 'delete' || bulkAction === 'trash' ? 'danger' : 'primary'}
            disabled={!bulkAction || !hasSelection || bulkLoading}
            loading={bulkLoading}
            onClick={onApplyBulk}
          >
            Apply
          </Button>
        </div>

        <span className="h-6 w-px bg-gray-200" aria-hidden="true" />

        <div className="flex items-center gap-2">
          <Select
            variant="filter"
            name="category"
            id="category-filter"
            value={draftCategory}
            onChange={(e) => setDraftCategory(e.target.value)}
            aria-label="Category filter"
            placeholder="All categories"
            options={CATEGORIES.map((c) => ({ value: c.slug, label: c.name }))}
          />
          <Select
            variant="filter"
            name="location"
            id="location-filter"
            value={draftLocation}
            onChange={(e) => setDraftLocation(e.target.value)}
            aria-label="Location filter"
            placeholder="All locations"
            options={LOCATIONS.map((l) => ({ value: l.slug, label: l.name }))}
          />
          <Button onClick={() => onApplyFilters(draftCategory, draftLocation)}>
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Filter
          </Button>
          <Button variant="secondary" onClick={onReset}>
            Reset
          </Button>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} totalCount={totalCount} perPage={perPage} />
    </div>
  );
}

/**
 * Category badge group rendering one colour chip per assigned category.
 *
 * @param {object} props - Component properties.
 * @param {string[] | null} props.categories - Category slug list, or null.
 *
 * @returns {JSX.Element} Rendered category badges or en-dash fallback.
 */
function CategoryBadge({ categories }: { categories: string[] | null }): JSX.Element {
  const list = (categories ?? [])
    .map((slug) => CATEGORIES.find((c) => c.slug === slug))
    .filter((cat): cat is CategoryRecord => Boolean(cat));
  if (list.length === 0) {
    return <span className="text-sm text-black/40">–</span>;
  }
  return (
    <div className="flex max-w-48 flex-wrap gap-1">
      {list.map((cat) => (
        <span
          key={cat.slug}
          className={cn(
            'inline-block px-2 py-0.5 text-xs font-semibold',
            TAG_VARIANTS[cat.color as TagVariant] ?? 'bg-gray-200 text-black'
          )}
        >
          {cat.name}
        </span>
      ))}
    </div>
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
      size="sm"
      name="status"
      id={`status-${video.id}`}
      value={video.status}
      disabled={changingStatus.has(video.id)}
      className={cn(
        video.status === 'published'
          ? 'border-green-600 bg-green-600 text-white'
          : video.status === 'draft'
            ? 'border-gray-300 bg-gray-100 text-gray-800'
            : video.status === 'rejected'
              ? 'border-red-600 bg-red-600 text-white'
              : 'border-purple-600 bg-purple-600 text-white'
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
 * Compact text-style action button for table row actions.
 *
 * Renders a link-styled button with a WordPress-style text-link look: no
 * decoration by default, underline only on hover. The `danger` flag switches
 * the text to red for destructive actions.
 *
 * @param {object} props - Component properties.
 * @param {import('react').ReactNode} props.children - Button label.
 * @param {() => void} props.onClick - Click handler.
 * @param {boolean} [props.danger] - Use red text styling for destructive actions.
 *
 * @returns {JSX.Element} Rendered row action button.
 */
function RowActionButton({
  children,
  onClick,
  danger = false,
}: {
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}): JSX.Element {
  return (
    <Button
      type="button"
      variant="link"
      onClick={onClick}
      className={cn('text-xs font-semibold', danger ? 'text-red-600 hover:text-red-700' : 'hover:text-purple-600')}
    >
      {children}
    </Button>
  );
}

/**
 * Row action links for a video — Edit/Trash in active view, Restore/Purge in trashed view.
 *
 * WordPress-style text links shown under the URL when the row is hovered.
 *
 * @param {object} props - Component properties.
 * @param {VideoRecord} props.video - The video record.
 * @param {boolean} props.isTrashed - Whether the trashed filter is active.
 * @param {(video: VideoRecord) => void} props.onEdit - Callback to open edit modal.
 * @param {(id: string, action: 'trash' | 'restore' | 'delete') => void} props.onAction - Callback for trash/restore/delete actions.
 *
 * @returns {JSX.Element} Rendered row action links.
 */
function VideoRowActions({
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
      <>
        <RowActionButton onClick={() => onAction(video.id, 'restore')}>Restore</RowActionButton>
        <RowActionButton danger onClick={() => onAction(video.id, 'delete')}>
          Purge
        </RowActionButton>
      </>
    );
  }

  return (
    <>
      <RowActionButton onClick={() => onEdit(video)}>Edit</RowActionButton>
      <RowActionButton danger onClick={() => onAction(video.id, 'trash')}>
        Trash
      </RowActionButton>
    </>
  );
}

/**
 * Resolves a location slug to its display name from the LOCATIONS constant.
 *
 * @param {string | null} location - Location slug, or null.
 *
 * @returns {string} Location display name, or en-dash if unknown/null.
 */
function getLocationName(location: string | null): string {
  if (!location) {
    return '\u2013';
  }
  return LOCATIONS.find((l) => l.slug === location)?.name ?? location;
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
 * Sortable table header button with asc/desc indicator and a faint chevron hint on hover.
 *
 * @param {object} props - Component properties.
 * @param {string} props.label - Column display label.
 * @param {string} props.sortKey - Column key used in the URL sort param.
 * @param {string} props.sort - Currently active sort column key.
 * @param {'asc' | 'desc'} props.dir - Currently active sort direction.
 * @param {(column: string) => void} props.onSort - Callback to update the sort column.
 *
 * @returns {JSX.Element} Rendered sortable header cell.
 */
function SortableTh({
  label,
  sortKey,
  sort,
  dir,
  onSort,
}: {
  label: string;
  sortKey: string;
  sort: string;
  dir: 'asc' | 'desc';
  onSort: (column: string) => void;
}): JSX.Element {
  const active = sort === sortKey;
  const Icon = active ? (dir === 'asc' ? ChevronUp : ChevronDown) : ChevronUp;

  return (
    <th
      className="px-3 py-2 text-sm font-bold"
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn('group inline-flex items-center gap-1 hover:text-purple-600', active && 'text-purple-700')}
      >
        {label}
        <Icon
          className={cn(
            'h-3.5 w-3.5 transition-opacity',
            active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40 group-focus-visible:opacity-40'
          )}
          aria-hidden="true"
        />
      </button>
    </th>
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
 * @param {string} props.sort - Currently active sort column key.
 * @param {'asc' | 'desc'} props.dir - Currently active sort direction.
 * @param {(column: string) => void} props.onSort - Callback to update the sort column.
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
  sort,
  dir,
  onSort,
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
  sort: string;
  dir: 'asc' | 'desc';
  onSort: (column: string) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onEdit: (video: VideoRecord) => void;
  onAction: (id: string, action: 'trash' | 'restore' | 'delete') => void;
  onInlineStatusChange: (id: string, newStatus: string) => void;
}): JSX.Element {
  const colCount = isTrashed ? 11 : 10;

  return (
    <div className="overflow-x-auto border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="w-10 px-3 py-2">
              <Checkbox
                ref={selectAllRef}
                name="select_all"
                id="select_all"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                aria-label="Select all videos"
              />
            </th>
            <th className="w-16 px-3 py-2 text-sm font-bold">Thumb</th>
            <th className="px-3 py-2 text-sm font-bold">URL</th>
            <SortableTh label="City" sortKey="city" sort={sort} dir={dir} onSort={onSort} />
            <SortableTh label="Location" sortKey="location" sort={sort} dir={dir} onSort={onSort} />
            <SortableTh label="Category" sortKey="category" sort={sort} dir={dir} onSort={onSort} />
            <th className="px-3 py-2 text-sm font-bold">Tags</th>
            <SortableTh label="Status" sortKey="status" sort={sort} dir={dir} onSort={onSort} />
            <SortableTh label="Created" sortKey="created" sort={sort} dir={dir} onSort={onSort} />
            <SortableTh label="Posted" sortKey="posted" sort={sort} dir={dir} onSort={onSort} />
            {isTrashed && <th className="w-32 px-3 py-2 text-sm font-bold">Trashed At</th>}
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
        'group border-b border-gray-100 hover:bg-gray-100',
        selected ? 'bg-purple-100' : 'odd:bg-white even:bg-gray-50/70',
        isTrashed && 'opacity-70'
      )}
    >
      <Td>
        <Checkbox
          name="select_video"
          id={`select-${video.id}`}
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
      <Td className="max-w-50 font-semibold">
        <a
          href={displayVideoUrl(video)}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate underline hover:text-purple-600"
        >
          {video.video_id ?? '\u2013'}
        </a>
        <div className="mt-1 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100">
          <VideoRowActions video={video} isTrashed={isTrashed} onEdit={onEdit} onAction={onAction} />
        </div>
      </Td>
      <Td className="text-gray-800">{video.city ?? '\u2013'}</Td>
      <Td>{getLocationName(video.location)}</Td>
      <Td>
        <CategoryBadge categories={video.categories} />
      </Td>
      <Td className="max-w-40 truncate text-gray-600">{video.tags?.length ? video.tags.join(', ') : '\u2013'}</Td>
      <Td>
        <StatusCell
          video={video}
          isTrashed={isTrashed}
          changingStatus={changingStatus}
          onChange={onInlineStatusChange}
        />
      </Td>
      <Td>{formatDate(video.created_at)}</Td>
      <Td>{formatDate(video.video_post_date)}</Td>
      {isTrashed && <Td className="text-gray-500">{formatDate(video.trashed_at)}</Td>}
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
    perPage,
    totalCount,
    actionConfirmLabel,
    page,
    status,
    statusCounts,
    category,
    location,
    sort,
    dir,
    setSort,
    setEditVideo,
    setShowAdd,
    setBulkAction,
    setActionConfirm,
    setBulkConfirm,
    applyFilters,
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
    <section aria-labelledby="videos-heading">
      <VideosPageHeader isTrashed={isTrashed} onAdd={() => setShowAdd(true)} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <StatusTabs status={status} statusCounts={statusCounts} />
        <SearchInput placeholder="Search videos…" />
      </div>

      <VideosToolbar
        bulkAction={bulkAction}
        hasSelection={selectedIds.size > 0}
        bulkLoading={bulkLoading}
        isTrashed={isTrashed}
        category={category}
        location={location}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        perPage={perPage}
        onBulkActionChange={(action) => setBulkAction(action)}
        onApplyBulk={handleApplyBulk}
        onApplyFilters={applyFilters}
        onReset={handleReset}
      />

      <VideosTable
        videos={videos}
        isTrashed={isTrashed}
        allSelected={allSelected}
        selectedIds={selectedIds}
        selectAllRef={selectAllRef}
        changingStatus={changingStatus}
        sort={sort}
        dir={dir}
        onSort={setSort}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onEdit={(video) => setEditVideo(video)}
        onAction={(id, action) => setActionConfirm({ id, action })}
        onInlineStatusChange={handleInlineStatusChange}
      />

      <Pagination className="mt-4" page={page} totalPages={totalPages} totalCount={totalCount} perPage={perPage} />

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
          label="Video"
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
