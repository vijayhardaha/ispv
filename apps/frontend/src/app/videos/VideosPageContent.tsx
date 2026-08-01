'use client';

import { useEffect, useRef, useState, type JSX } from 'react';

import { PageHero } from '@/components/shared/PageHero';
import { VideoGridSection } from '@/components/shared/VideoGridSection';
import { useFilterState } from '@/hooks/useFilterState';
import { useReelPlayer } from '@/hooks/useReelPlayer';
import { getLocations, getTags } from '@/lib/db';
import { getPublishedVideos, type VideoEntry } from '@/lib/videos';

/**
 * Client-bound content for the videos page. Loads videos, renders filter bar, grid, and pagination.
 * Filters, sort, and pagination are read from and written to URL search params.
 * Wrapped in Suspense by the server parent.
 *
 * @returns {JSX.Element} Rendered videos page content.
 */
export function VideosPageContent(): JSX.Element {
  const [paged, setPaged] = useState<VideoEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allLocations, setAllLocations] = useState<{ slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { state, setFilter } = useFilterState();
  const { play } = useReelPlayer();
  const loadedStatic = useRef(false);

  useEffect(() => {
    if (!loadedStatic.current) {
      loadedStatic.current = true;
      Promise.all([getTags(), getLocations()]).then(([tags, locs]) => {
        setAllTags(tags);
        setAllLocations(locs.map((l) => ({ slug: l.slug, name: l.name })));
      });
    }

    let cancelled = false;
    getPublishedVideos({
      category: state.category,
      location: state.location,
      tag: state.tags[0],
      query: state.query,
      sort: state.sort,
      page: state.page,
      perPage: state.perPage,
    }).then((result) => {
      if (cancelled) return;
      setPaged(result.videos);
      setTotal(result.total);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [state]);

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
