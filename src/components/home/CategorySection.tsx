'use client';

import { useState, type JSX } from 'react';

import { ReelPlayer } from '@/components/videos/ReelPlayer';
import { VideoCard } from '@/components/videos/VideoCard';
import { type VideoEntry, CATEGORIES, type VideoCategory } from '@/data/videos';

/**
 * Section displaying videos for a single category with optional "View All" link.
 *
 * @param {object} props - Component properties.
 * @param {VideoCategory} props.category - The category ID to display.
 * @param {VideoEntry[]} props.videos - Videos belonging to this category.
 *
 * @returns {JSX.Element} Rendered category section with video grid.
 */
export function CategorySection({ category, videos }: { category: VideoCategory; videos: VideoEntry[] }): JSX.Element {
  const [activeVideo, setActiveVideo] = useState<VideoEntry | null>(null);
  const cat = CATEGORIES.find((c) => c.id === category);

  if (!cat) return <></>;

  const items = videos.slice(0, 6);

  return (
    <section className="border-b-[3px] border-black bg-gray-100 py-12 md:py-16" id={`section-${cat.id}`}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-16 flex flex-col items-end justify-between border-b-4 border-zinc-900 pb-6 md:flex-row">
          <div>
            <div className="mb-4 inline-block -rotate-2 bg-blue-600 px-3 py-1 text-xs font-bold tracking-widest text-white uppercase">
              Category
            </div>
            <h2 className="text-4xl font-bold tracking-tighter uppercase md:text-5xl">{cat.label}</h2>
          </div>
          <div className="mt-4 max-w-xs border-l-2 border-red-500 pl-4 text-sm text-zinc-600 md:mt-0">
            {cat.description}
            <div className="mt-1 font-mono text-[10px] tracking-widest text-black/60 uppercase">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {items.map((v) => (
            <VideoCard key={v.id} video={v} onPlay={setActiveVideo} />
          ))}
          {items.length === 0 && (
            <div className="col-span-full border-[3px] border-dashed border-black/40 p-8 text-center font-mono text-sm text-black/50 uppercase">
              No videos in this category yet — be the first to submit.
            </div>
          )}
        </div>
      </div>

      <ReelPlayer
        open={!!activeVideo}
        startIndex={activeVideo ? items.findIndex((v) => v.id === activeVideo.id) : 0}
        videos={items}
        onClose={() => setActiveVideo(null)}
      />
    </section>
  );
}
