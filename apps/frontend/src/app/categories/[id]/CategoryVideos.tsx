'use client';

import type { JSX } from 'react';

import { FilterBar } from '@/components/shared/FilterBar';
import { Pagination } from '@/components/shared/Pagination';
import { VideoCard } from '@/components/shared/VideoCard';
import type { FilterState } from '@/lib/frontend-schemas';
import type { VideoEntry } from '@/lib/videos';

/**
 * Props for the category videos grid with filter and pagination controls.
 *
 * @type {CategoryVideosProps}
 * @property {FilterState} state - Current filter values.
 * @property {(state: FilterState) => void} setState - Updates the filter state.
 * @property {number} total - Total number of filtered videos.
 * @property {string[]} allTags - Available tags for filtering.
 * @property {{ slug: string; name: string }[]} allLocations - Available locations for filtering.
 * @property {VideoEntry[]} paged - Videos for the current page.
 * @property {number} totalPages - Total number of pages.
 * @property {number} safePage - Current page clamped to valid range.
 * @property {(video: VideoEntry, playlist: VideoEntry[]) => void} onPlay - Opens the reel player.
 * @property {(page: number) => void} onChangePage - Navigates to a different page.
 */
export interface CategoryVideosProps {
  state: FilterState;
  setState: (state: FilterState) => void;
  total: number;
  allTags: string[];
  allLocations: { slug: string; name: string }[];
  paged: VideoEntry[];
  totalPages: number;
  safePage: number;
  onPlay: (video: VideoEntry, playlist: VideoEntry[]) => void;
  onChangePage: (page: number) => void;
}

/**
 * Video grid with filter bar and pagination for a single category.
 *
 * @param {CategoryVideosProps} props - Filter state, video data, and callbacks.
 *
 * @returns {JSX.Element} Rendered video grid section.
 */
export function CategoryVideos({
  state,
  setState,
  total,
  allTags,
  allLocations,
  paged,
  totalPages,
  safePage,
  onPlay,
  onChangePage,
}: CategoryVideosProps): JSX.Element {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <FilterBar state={state} setState={setState} total={total} allTags={allTags} allLocations={allLocations} />
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {paged.map((v) => (
          <VideoCard key={v.id} video={v} onPlay={(video) => onPlay(video, paged)} />
        ))}
      </div>
      <Pagination
        page={safePage}
        totalPages={totalPages}
        onChange={(p) => {
          onChangePage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </section>
  );
}
