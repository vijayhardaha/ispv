'use client';

import { type JSX } from 'react';

import { PageHero } from '@/components/shared/PageHero';
import { VideoGridSection } from '@/components/shared/VideoGridSection';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { useFilterState } from '@/hooks/useFilterState';
import { usePagedVideos } from '@/hooks/usePagedVideos';
import { useReelPlayer } from '@/hooks/useReelPlayer';

/**
 * Client-bound content for the videos page. Loads videos, renders filter bar, grid, and pagination.
 * Filters, sort, and pagination are read from and written to URL search params.
 * Wrapped in Suspense by the server parent.
 *
 * @returns {JSX.Element} Rendered videos page content.
 */
export function VideosPageContent(): JSX.Element {
  const { state, setFilter } = useFilterState();
  const { play } = useReelPlayer();
  const { paged, total, loading } = usePagedVideos(state);
  const { allTags, allLocations } = useFilterOptions();

  const totalPages = Math.max(1, Math.ceil(total / state.perPage));
  const safePage = Math.min(state.page, totalPages);

  return (
    <div className="bg-gray-100">
      <PageHero breadcrumb="All Videos" title="The Full Archive">
        <p className="mt-2 text-white/80">
          Every reel we have on file. Use the search, tags, and category filters to narrow it down.
        </p>
      </PageHero>

      <VideoGridSection
        state={state}
        setFilter={setFilter}
        total={total}
        allTags={allTags}
        allLocations={allLocations}
        paged={paged}
        totalPages={totalPages}
        safePage={safePage}
        onPlay={play}
        loading={loading}
      />
    </div>
  );
}
