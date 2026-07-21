import { useState, type JSX } from 'react';

import { Eye, Heart, Play, MapPin } from 'lucide-react';

import { getCategoryById, type VideoEntry } from '@/data/videos';
import { cn, formatNumber, timeAgo } from '@/lib/utils';

/**
 * Props for the VideoCard component.
 *
 * @type {VideoCardProps}
 * @property {VideoEntry} video - The video data to display.
 * @property {(video: VideoEntry) => void} onPlay - Callback when the card is clicked.
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Card size variant.
 * @property {string} [className] - Additional CSS classes.
 */
interface VideoCardProps {
  video: VideoEntry;
  onPlay: (video: VideoEntry) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'aspect-[9/16]', md: 'aspect-[9/16]', lg: 'aspect-[9/16]' };

/**
 * Clickable video card with thumbnail, category badge, and engagement stats.
 *
 * @param {VideoCardProps} props - Card properties.
 *
 * @returns {JSX.Element} Rendered video card with hover effects.
 */
export function VideoCard({ video, onPlay, size = 'md', className }: VideoCardProps): JSX.Element {
  const [imgError, setImgError] = useState(false);
  const cat = getCategoryById(video.category);

  return (
    <button
      onClick={() => onPlay(video)}
      className={cn(
        'group relative block w-full overflow-hidden border-2 border-zinc-900 bg-white text-left',
        'transition-all duration-300',
        'hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#18181b]',
        sizeMap[size],
        className
      )}
    >
      <div className="relative h-full w-full overflow-hidden border-b-2 border-zinc-900 bg-zinc-100 transition-colors duration-300 group-hover:bg-red-50">
        {!imgError ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            onError={() => setImgError(true)}
            loading="lazy"
            className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/80">
            <Play className="h-10 w-10 text-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-transparent" />
      </div>

      {/* Top badges */}
      <div className="absolute top-2 right-2 left-2 z-10 flex items-start justify-between gap-1">
        <span className="inline-flex items-center gap-1 border-2 border-black bg-orange-500 px-2.5 py-0.5 font-mono text-xs font-bold text-white uppercase">
          {cat?.label ?? video.category}
        </span>
        {video.featured && (
          <span className="inline-flex items-center gap-1 border-2 border-black bg-red-500 px-2.5 py-0.5 font-mono text-xs font-bold text-white uppercase">
            ★ Featured
          </span>
        )}
      </div>

      {/* Center play button on hover */}
      <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <div className="shadow-brutal-lg animate-wiggle border-[3px] border-black bg-orange-500 p-4">
          <Play className="h-8 w-8 fill-black text-black" strokeWidth={2.5} />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
        <h3 className="font-display line-clamp-2 text-sm leading-tight font-extrabold text-white uppercase md:text-base">
          {video.title}
        </h3>
        <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] tracking-wider text-white/80 uppercase">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {video.city}
          </span>
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              <Eye className="h-3 w-3" /> {formatNumber(video.views)}
            </span>
            <span className="flex items-center gap-0.5">
              <Heart className="h-3 w-3" /> {formatNumber(video.likes)}
            </span>
          </span>
        </div>
        <div className="mt-1 font-mono text-[9px] tracking-widest text-white/60 uppercase">
          {timeAgo(video.submittedAt)} · @{video.submittedBy.replace(/^@/, '')}
        </div>
      </div>
    </button>
  );
}
