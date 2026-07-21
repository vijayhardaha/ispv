import { useEffect, useRef, useState, type JSX } from 'react';

import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

import { getCategoryById, type VideoEntry } from '@/data/videos';
import { cn, formatNumber, timeAgo, extractInstagramId } from '@/lib/utils';

/**
 * Props for the ReelPlayer component.
 *
 * @type {ReelPlayerProps}
 * @property {VideoEntry[]} videos - List of videos to play through.
 * @property {number} [startIndex=0] - Index of the video to start on.
 * @property {boolean} open - Whether the player overlay is visible.
 * @property {() => void} onClose - Callback to close the player.
 */
interface ReelPlayerProps {
  videos: VideoEntry[];
  startIndex?: number;
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen snap-scroll reel player with keyboard and scroll navigation.
 *
 * @param {ReelPlayerProps} props - Player properties.
 *
 * @returns {JSX.Element | null} Rendered full-screen overlay, or null when closed.
 */
export function ReelPlayer({ videos, startIndex = 0, open, onClose }: ReelPlayerProps): JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(startIndex);
  const [muted, setMuted] = useState(true);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  // Snap to startIndex when opened
  useEffect(() => {
    if (open && containerRef.current) {
      const top = startIndex * containerRef.current.clientHeight;
      containerRef.current.scrollTo({ top, behavior: 'auto' });
      setActive(startIndex);
    }
  }, [open, startIndex]);

  // Track active reel via scroll
  useEffect(() => {
    if (!open) return;
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(el.scrollTop / el.clientHeight);
        if (i !== active) setActive(Math.max(0, Math.min(videos.length - 1, i)));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, videos.length]);

  // Keyboard: arrows + esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown' || e.key === 'j') {
        scrollToIndex(Math.min(active + 1, videos.length - 1));
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        scrollToIndex(Math.max(active - 1, 0));
      }
      if (e.key === 'm') setMuted((m) => !m);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active, videos.length]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  function scrollToIndex(i: number) {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: i * el.clientHeight, behavior: 'smooth' });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <button
        onClick={onClose}
        aria-label="Close player"
        className="shadow-brutal-sm absolute top-4 right-4 z-20 border-[3px] border-black bg-white p-2 hover:bg-orange-500 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative flex h-full w-full items-stretch justify-center">
        {/* Side rail — quick scroll on desktop */}
        <div className="absolute top-1/2 left-4 z-20 hidden -translate-y-1/2 flex-col gap-2 md:flex">
          <button
            disabled={active === 0}
            onClick={() => scrollToIndex(active - 1)}
            className="shadow-brutal-sm border-[3px] border-black bg-orange-500 p-2 transition hover:-translate-y-0.5 disabled:opacity-40"
            aria-label="Previous reel"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <div className="border-[3px] border-black bg-white px-2 py-1 text-center font-mono text-[10px] font-bold">
            {active + 1}/{videos.length}
          </div>
          <button
            disabled={active === videos.length - 1}
            onClick={() => scrollToIndex(active + 1)}
            className="shadow-brutal-sm border-[3px] border-black bg-orange-500 p-2 transition hover:translate-y-0.5 disabled:opacity-40"
            aria-label="Next reel"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        {/* Phone-frame container */}
        <div className="relative h-full w-full max-w-105 bg-black">
          <div ref={containerRef} className="snap-reel relative h-full w-full">
            {videos.map((v, i) => (
              <ReelItem
                key={v.id}
                video={v}
                active={i === active}
                liked={!!likes[v.id]}
                muted={muted}
                onLike={() => setLikes((p) => ({ ...p, [v.id]: !p[v.id] }))}
                onToggleMute={() => setMuted((m) => !m)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReelItem({
  video,
  active,
}: {
  video: VideoEntry;
  active: boolean;
  liked: boolean;
  muted: boolean;
  onLike: () => void;
  onToggleMute: () => void;
}) {
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const id = extractInstagramId(video.url);
  const cat = getCategoryById(video.category);
  // We only mount the active reel's iframe so it actually plays.
  return (
    <div className="snap-reel-item relative h-full w-full bg-black">
      {/* Background thumbnail fills 9:16 */}
      <img
        src={video.thumbnail}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-90"
        loading="lazy"
      />
      <div className="from-ink/95 via-ink/40 to-ink/20 absolute inset-0 bg-linear-to-t" />

      {/* Active iframe (only when in view) */}
      {active && id && (
        <iframe
          title={video.title}
          src={`https://www.instagram.com/p/${id}/embed/`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => setEmbedLoaded(true)}
          className={cn(
            'absolute inset-0 h-full w-full border-0 transition-opacity duration-300',
            embedLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}

      {/* Top badge bar: full-width with gradient shadow */}
      <div className="absolute inset-x-0 top-0 z-10 bg-linear-to-b from-black/80 via-black/40 to-transparent pb-8 pt-3 pl-3 pr-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 border-2 border-black bg-orange-500 px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
            {cat?.label ?? video.category}
          </span>
          <span className="inline-flex items-center gap-1 border-2 border-black bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
            {video.city}, {video.state}
          </span>
        </div>
      </div>
    </div>
  );
}
