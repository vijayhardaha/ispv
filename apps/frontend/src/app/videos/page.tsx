'use client';

import { Suspense, useEffect, useState, type JSX } from 'react';

import { breadcrumbSchema, collectionPageSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';

import { FilterBar } from '@/components/shared/FilterBar';
import { Pagination } from '@/components/shared/Pagination';
import { VideoCard } from '@/components/shared/VideoCard';
import { useFilterState } from '@/hooks/useFilterState';
import { useReelPlayer } from '@/hooks/useReelPlayer';
import { getLocations, getTags } from '@/lib/db';
import { buildBreadcrumbs, globalSchema } from '@/lib/schema';
import { siteUrl } from '@/lib/seo';
import { getAllVideosFromDb, type VideoEntry } from '@/lib/videos';

const title = 'All Videos — Full Archive';
const description =
  'Browse every reel in the Indian Students Protest Vault archive. Search by city, category, or hashtag and filter to find specific protest recordings.';
const path = '/videos';
const rootUrl = siteUrl();

const schemaData = [
  ...globalSchema(),
  collectionPageSchema({ rootUrl, path }, { name: title, description }),
  breadcrumbSchema({ rootUrl, items: buildBreadcrumbs(path, 'All Videos') }),
];

/**
 * Full video archive page with search, filtering, pagination, and reel player.
 *
 * @returns {JSX.Element} Rendered videos page.
 */
export default function VideosPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100" />}>
      <VideosPageInner />
    </Suspense>
  );
}

/**
 * Inner component that loads videos from the database and renders the filter bar, grid, and pagination.
 *
 * @returns {JSX.Element} Rendered videos page content.
 */
function VideosPageInner(): JSX.Element {
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

  const { state, setState, filtered } = useFilterState({ videos });

  const totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));
  const safePage = Math.min(state.page, totalPages);
  const paged = filtered.slice((safePage - 1) * state.perPage, safePage * state.perPage);

  return (
    <div className="bg-gray-100">
      <JsonLd data={schemaData} />
      <section className="border-b-2 border-black bg-black py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="font-mono text-[10px] tracking-widest text-yellow-500 uppercase">/ All Videos</div>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight uppercase md:text-6xl">
            The Full Archive
          </h1>
          <p className="mt-2 text-white/80">
            Every reel we have on file. Use the search, tags, and category filters to narrow it down.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <FilterBar
          state={state}
          setState={setState}
          total={filtered.length}
          allTags={allTags}
          allLocations={allLocations}
        />

        {loading ? (
          <div className="mt-10 flex items-center justify-center py-20">
            <div className="text-sm font-bold text-black/50 uppercase">Loading videos...</div>
          </div>
        ) : (
          <>
            <div className="mt-6 flex items-center justify-between">
              <div className="text-[10px] tracking-widest text-black/60 uppercase">
                Page {safePage} of {totalPages} · {filtered.length} videos
              </div>
            </div>

            {paged.length === 0 ? (
              <div className="mt-10 border-2 border-dashed border-black/40 p-12 text-center">
                <div className="font-display text-2xl font-extrabold uppercase">Nothing matched</div>
                <p className="mt-1 text-black/60">Try a different search term or fewer tags.</p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                {paged.map((v) => (
                  <VideoCard key={v.id} video={v} onPlay={(video) => play(video, paged)} />
                ))}
              </div>
            )}

            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={(p) => {
                setState({ ...state, page: p });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}
