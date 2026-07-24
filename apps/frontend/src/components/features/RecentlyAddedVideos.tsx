'use client';

import { type JSX } from 'react';

import { VideoCard } from '@/components/shared/VideoCard';
import { useReelPlayer } from '@/hooks/useReelPlayer';
import type { VideoEntry } from '@/lib/videos';

/**
 * Client component wrapping VideoCard + useReelPlayer for the recently-added
 * video grid on the categories page.
 *
 * @param {object} props - Component props.
 * @param {VideoEntry[]} props.videos - Videos to display.
 *
 * @returns {JSX.Element} Rendered video grid.
 */
export function RecentlyAddedVideos({ videos }: { videos: VideoEntry[] }): JSX.Element {
  const { play } = useReelPlayer();

  if (videos.length === 0) {
    return <></>;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h3 className="font-display text-xl font-extrabold uppercase">Recently added</h3>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        {videos.slice(0, 12).map((v) => (
          <VideoCard key={v.id} video={v} onPlay={(video) => play(video, videos)} />
        ))}
      </div>
    </section>
  );
}
