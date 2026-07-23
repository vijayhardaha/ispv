'use client';

import type { JSX } from 'react';

import type { FilterState } from '@/lib/schemas';
import { FilterBar } from '@/components/shared/FilterBar';
import { Pagination } from '@/components/shared/Pagination';
import { VideoCard } from '@/components/shared/VideoCard';
import type { VideoEntry } from '@/lib/videos';

export interface CategoryVideosProps {
  state: FilterState;
  setState: (state: FilterState) => void;
  total: number;
  allTags: string[];
  allLocations: string[];
  paged: VideoEntry[];
  totalPages: number;
  safePage: number;
  onPlay: (video: VideoEntry, playlist: VideoEntry[]) => void;
  onChangePage: (page: number) => void;
}

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
