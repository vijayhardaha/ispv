import { useState, type JSX } from 'react';

import { Play, MapPin } from 'lucide-react';
import Image from 'next/image';

import { getCategoryById, type VideoEntry } from '@/data/videos';
import { cn } from '@/lib/cn';

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
        'inline-flex items-center gap-1 border-2 border-black px-2.5 py-0.5 font-mono text-xs font-bold uppercase',
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
  const [imgError, setImgError] = useState(false);
  const cat = getCategoryById(video.category);

  return (
    <button
      onClick={() => onPlay(video)}
      className={cn(
        'group relative block w-full overflow-hidden border-2 border-zinc-900 bg-white text-left',
        'transition-all duration-300',
        'hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#18181b]',
        'aspect-9/16',
        className
      )}
    >
      <div className="relative h-full w-full overflow-hidden border-b-2 border-zinc-900 bg-zinc-100 transition-colors duration-300 group-hover:bg-red-50">
        {!imgError ? (
          <Image
            src={video.thumbnail}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            onError={() => setImgError(true)}
            className="object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/80">
            <Play className="h-10 w-10 text-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-transparent" />
      </div>

      <div className="absolute top-2 right-2 left-2 z-10 flex items-start justify-between gap-1">
        <Badge className="bg-yellow-400 text-black">{cat?.label ?? video.category}</Badge>
        {video.featured && <Badge className="bg-red-500 text-white">Featured</Badge>}
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="border-2 border-black bg-white/80 p-3">
          <Play className="h-6 w-6 fill-black text-black" strokeWidth={2.5} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
        <div className="mt-1 font-mono text-[10px] tracking-tight text-white/80 uppercase">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {video.city}
          </span>
        </div>
      </div>
    </button>
  );
}
