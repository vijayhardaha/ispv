'use client';

import { useState, type JSX } from 'react';

import Image from 'next/image';

import { cn } from '@/lib/cn';
import { extractInstagramId } from '@/lib/instagram';
import type { VideoEntry } from '@/lib/videos';

/**
 * Single reel item displaying an embedded Instagram video with thumbnail overlay.
 *
 * @param {object} props - Component properties.
 * @param {VideoEntry} props.video - Video entry to render.
 * @param {boolean} props.active - Whether this item is currently in view.
 *
 * @returns {JSX.Element} Rendered reel item.
 */
export function ReelItem({ video, active }: { video: VideoEntry; active: boolean }): JSX.Element {
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const id = extractInstagramId(video.url);

  return (
    <div className="snap-reel-item relative h-full w-full bg-black">
      <Image src={video.thumbnail} alt="" fill sizes="100vw" className="object-cover opacity-90" />
      <div className="from-ink/95 via-ink/40 to-ink/20 absolute inset-0 bg-linear-to-t" />

      {active && id && (
        <iframe
          title={`Reel ${video.id}`}
          src={`https://www.instagram.com/p/${id}/embed/`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => {
            setEmbedLoaded(true);
            // Increment view count via admin public endpoint
            const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin-app.vercel.app';
            fetch(`${adminUrl}/api/public/views`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ video_id: video.id }),
            }).catch(() => {});
          }}
          className={cn(
            'absolute inset-0 h-full w-full border-0 transition-opacity duration-300',
            embedLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}

      <div className="absolute inset-x-0 top-0 z-10 bg-linear-to-b from-black via-black/40 to-transparent pt-3 pr-3 pb-8 pl-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 border-2 border-black bg-yellow-400 px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
            {video.categoryName}
          </span>
          <span className="inline-flex items-center gap-1 border-2 border-black bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
            {video.city}, {video.location}
          </span>
        </div>
      </div>
    </div>
  );
}
