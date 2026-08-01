'use client';

import { useState, type JSX } from 'react';

import { Eye } from 'lucide-react';

import { getCategoryBadges } from '@/lib/helpers/categories';
import { formatLocationLabel } from '@/lib/helpers/formatLocation';
import { getThumbnailSrc } from '@/lib/helpers/media';
import { cn, extractInstagramId } from '@/lib/utils';
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
  const thumbnailSrc = getThumbnailSrc(video.thumbnail);
  const { visibleCategories, extraCount } = getCategoryBadges(video);

  const deduplicated = formatLocationLabel(video.city, video.location ?? '');

  return (
    <div className="snap-reel-item relative h-full w-full bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumbnailSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-32 bg-linear-to-t from-black/95 via-black/30 to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-28 bg-linear-to-b from-black/95 via-black/10 to-transparent" />

      {active && id && (
        <iframe
          title={`Reel ${video.id}`}
          src={`https://www.instagram.com/p/${id}/embed/`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => {
            setEmbedLoaded(true);
            // Increment view count via admin public endpoint
            const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
            if (!adminUrl) return;
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

      <div className="absolute inset-x-0 top-0 z-10 pt-3 pr-3 pb-8 pl-3">
        <div className="flex flex-wrap items-center gap-2">
          {visibleCategories.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 border-2 border-black bg-yellow-400 px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase"
            >
              {name}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="inline-flex items-center gap-1 border-2 border-black bg-zinc-900 px-2.5 py-0.5 font-mono text-xs font-bold text-white uppercase">
              +{extraCount}
            </span>
          )}
          <span className="inline-flex items-center gap-1 border-2 border-black bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
            {deduplicated}
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 pr-3 pb-3 pl-3">
        <div className="flex justify-end font-mono text-[10px] tracking-tight text-white/80 uppercase">
          <span className="flex items-center gap-1">
            <Eye className="size-3" />
            {video.viewCount}
          </span>
        </div>
      </div>
    </div>
  );
}
