'use client';

import { useEffect, type JSX } from 'react';

import { FilterBar } from '@/components/shared/FilterBar';
import { Pagination } from '@/components/shared/Pagination';
import { VideoCard } from '@/components/shared/VideoCard';
import { SORT_OPTIONS } from '@/lib/helpers/filterVideos';
import type { FilterState, SortOption } from '@/lib/helpers/filterVideos';
import type { VideoEntry } from '@/lib/videos';

/**
 * Props for the shared video grid section with filter bar, sort controls, and pagination.
 *
 * @type {VideoGridSectionProps}
 * @property {FilterState} state - Current filter values.
 * @property {(state: FilterState) => void} setState - Updates the filter state.
 * @property {number} total - Total number of filtered videos.
 * @property {string[]} allTags - Available tags for filtering.
 * @property {{ slug: string; name: string }[]} allLocations - Available locations for filtering.
 * @property {VideoEntry[]} paged - Videos for the current page.
 * @property {number} totalPages - Total number of pages.
 * @property {number} safePage - Current page clamped to valid range.
 * @property {(video: VideoEntry, playlist: VideoEntry[]) => void} onPlay - Opens the reel player.
 * @property {boolean} [loading] - Whether videos are still loading.
 */
export interface VideoGridSectionProps {
  state: FilterState;
  setState: (state: FilterState) => void;
  total: number;
  allTags: string[];
  allLocations: { slug: string; name: string }[];
  paged: VideoEntry[];
  totalPages: number;
  safePage: number;
  onPlay: (video: VideoEntry, playlist: VideoEntry[]) => void;
  loading?: boolean;
}

/**
 * Sort-by dropdown with label.
 *
 * @param {object} props - Component properties.
 * @param {SortOption} props.sort - Currently active sort option.
 * @param {(sort: SortOption) => void} props.onSortChange - Callback when sort selection changes.
 *
 * @returns {JSX.Element} Rendered sort controls.
 */
function SortControls({
  sort,
  onSortChange,
}: {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase">
        Sort by
      </label>
      <select
        id="sort-select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="font-body border-2 border-black bg-white px-2 py-1 text-xs focus:ring-2 focus:ring-yellow-500 focus:outline-none"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Renders a skeleton placeholder card matching VideoCard dimensions.
 *
 * @returns {JSX.Element} A single skeleton card.
 */
function SkeletonCard(): JSX.Element {
  return (
    <div className="relative aspect-9/16 overflow-hidden border-2 border-black bg-gray-200">
      <div className="absolute inset-0 animate-pulse bg-linear-to-b from-gray-300 to-gray-200" />
      <div className="absolute right-0 bottom-0 left-0 space-y-2 p-3">
        <div className="size-3/4 animate-pulse rounded bg-gray-300" />
        <div className="h-2 w-1/2 animate-pulse rounded bg-gray-300" />
      </div>
    </div>
  );
}

/**
 * Shared video grid section with filter bar, sort controls, status line, video cards, pagination, and loading skeleton.
 * Used by both the videos archive page and category pages.
 * Pagination is URL-driven via Link components (?page=N).
 *
 * @param {VideoGridSectionProps} props - Filter state, video data, and callbacks.
 *
 * @returns {JSX.Element} Rendered video grid section.
 */
export function VideoGridSection({
  state,
  setState,
  total,
  allTags,
  allLocations,
  paged,
  totalPages,
  safePage,
  onPlay,
  loading = false,
}: VideoGridSectionProps): JSX.Element {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [safePage]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <FilterBar state={state} setState={setState} total={total} allTags={allTags} allLocations={allLocations} />

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-[10px] tracking-widest text-black/60 uppercase">
              Page {safePage} of {totalPages} · {total} videos
            </div>
            <SortControls sort={state.sort} onSortChange={(sort) => setState({ ...state, sort, page: 1 })} />
          </div>

          {paged.length === 0 ? (
            <div className="mt-10 border-2 border-dashed border-black/40 p-12 text-center">
              <div className="font-display text-2xl font-extrabold uppercase">Nothing matched</div>
              <p className="mt-1 text-black/60">Try a different search term or fewer tags.</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {paged.map((v) => (
                <VideoCard key={v.id} video={v} onPlay={(video) => onPlay(video, paged)} />
              ))}
            </div>
          )}

          <Pagination page={safePage} totalPages={totalPages} />
        </>
      )}
    </section>
  );
}
