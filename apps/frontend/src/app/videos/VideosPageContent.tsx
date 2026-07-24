'use client';

import { useEffect, useState, type JSX } from 'react';

import { PageHero } from '@/components/shared/PageHero';
import { VideoGridSection } from '@/components/shared/VideoGridSection';
import { useFilterState } from '@/hooks/useFilterState';
import { useReelPlayer } from '@/hooks/useReelPlayer';
import { getLocations, getTags } from '@/lib/db';
import { getAllVideosFromDb, type VideoEntry } from '@/lib/videos';

/**
 * Client-bound content for the videos page. Loads videos, renders filter bar, grid, and pagination.
 * Wrapped in Suspense by the server parent.
 *
 * @returns {JSX.Element} Rendered videos page content.
 */
export function VideosPageContent(): JSX.Element {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allLocations, setAllLocations] = useState<{ slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { play } = useReelPlayer();

  useEffect(() => {
    Promise.all([getAllVideosFromDb(), getTags(), getLocations()]).then(([data, tags, locs]) => {
      setVideos(data);
      setAllTags(tags);
      setAllLocations(locs.map((l) => ({ slug: l.slug, name: l.name })));
      setLoading(false);
    });
  }, []);

  const { state, setState, filtered, total } = useFilterState({ videos });

  const totalPages = Math.max(1, Math.ceil(total / state.perPage));
  const safePage = Math.min(state.page, totalPages);
  const paged = filtered.slice((safePage - 1) * state.perPage, safePage * state.perPage);

  return (
    <div className="bg-gray-100">
      <PageHero breadcrumb="All Videos" title="The Full Archive">
        <p className="mt-2 text-white/80">
          Every reel we have on file. Use the search, tags, and category filters to narrow it down.
        </p>
      </PageHero>

      <VideoGridSection
        state={state}
        setState={setState}
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
