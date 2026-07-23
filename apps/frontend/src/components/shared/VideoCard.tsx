import { type JSX } from 'react';

import { Eye, Play, MapPin } from 'lucide-react';

import { formatLocationLabel } from '@/helpers/formatLocation';
import { getThumbnailSrc } from '@/helpers/media';
import { cn } from '@/lib/cn';
import type { VideoEntry } from '@/lib/videos';

/**
 * Small uppercase label with border, used for category and featured tags.
 * Pass colors via `className` (e.g., `bg-yellow-400 text-black`).
 *
 * @param {object} props - Component properties.
 * @param {object} props.children - Badge content.
 * @param {string} [props.className] - Additional CSS classes for color/style overrides.
 *
 * @returns {JSX.Element} Rendered badge span.
 */
function Badge({ children, className }: { children: React.ReactNode; className?: string }): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border-2 border-black px-2.5 py-0.5 text-[8px] font-semibold',
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * Video thumbnail card with category badge, hover play overlay, and location label.
 *
 * @param {object} props - Component properties.
 * @param {VideoEntry} props.video - Video entry to display.
 * @param {(video: VideoEntry) => void} props.onPlay - Callback when the card is clicked.
 * @param {string} [props.className] - Additional CSS classes.
 *
 * @returns {JSX.Element} Rendered video card.
 */
export function VideoCard({
  video,
  onPlay,
  className,
}: {
  video: VideoEntry;
  onPlay: (video: VideoEntry) => void;
  className?: string;
}): JSX.Element {
  const thumbnailSrc = getThumbnailSrc(video.thumbnail);
  const locationLabel = formatLocationLabel(video.city, video.location ?? '');

  return (
    <button
      onClick={() => onPlay(video)}
      className={cn(
        'group relative block w-full cursor-pointer overflow-hidden border-2 border-zinc-900 bg-white text-left',
        'transition-all duration-300',
        'hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#18181b]',
        'aspect-9/16',
        className
      )}
    >
      <div className="relative h-full w-full overflow-hidden border-b-2 border-zinc-900 bg-zinc-100 transition-colors duration-300 group-hover:bg-red-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/10 to-transparent" />
      </div>

      <div className="absolute top-2 right-2 left-2 z-10 flex items-start justify-between gap-1">
        <Badge className="bg-yellow-400 text-xs text-black">{video.categoryName}</Badge>
        {video.featured && <Badge className="bg-red-500 text-white">Featured</Badge>}
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="rounded-full bg-white/80 p-4">
          <Play className="h-6 w-6 fill-black text-black" strokeWidth={2.5} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
        <div className="mt-1 flex items-center justify-between font-mono text-[10px] tracking-tight text-white/80 uppercase">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {locationLabel}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {video.viewCount}
          </span>
        </div>
      </div>
    </button>
  );
}
