import { useEffect, useRef, useState, type JSX } from 'react';

import { X, ChevronUp, ChevronDown } from 'lucide-react';

import type { VideoEntry } from '@/lib/videos';
import { ReelItem } from '@/components/shared/ReelItem';

/**
 * Props for the ReelPlayer component.
 *
 * @type {ReelPlayerProps}
 * @property {VideoEntry[]} videos - List of videos to play through.
 * @property {number} [startIndex] - Index of the video to start on.
 * @property {boolean} open - Whether the player is visible.
 * @property {() => void} onClose - Callback to close the player.
 */
interface ReelPlayerProps {
  videos: VideoEntry[];
  startIndex?: number;
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen reel player with snap scrolling, keyboard navigation, and Instagram embeds.
 *
 * @param {ReelPlayerProps} props - Player properties.
 * @param {VideoEntry[]} props.videos - List of videos to play through.
 * @param {number} [props.startIndex] - Index of the video to start on.
 * @param {boolean} props.open - Whether the player is visible.
 * @param {() => void} props.onClose - Callback to close the player.
 *
 * @returns {JSX.Element | null} Rendered reel player, or null when closed.
 */
export function ReelPlayer({ videos, startIndex = 0, open, onClose }: ReelPlayerProps): JSX.Element | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [active, setActive] = useState(startIndex);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (open && containerRef.current) {
      const top = startIndex * containerRef.current.clientHeight;
      containerRef.current.scrollTo({ top, behavior: 'auto' });
      setActive(startIndex);
    }
  }, [open, startIndex]);

  useEffect(() => {
    if (!open) return;
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const current = activeRef.current;
        const i = Math.round(el.scrollTop / el.clientHeight);
        if (i !== current) setActive(Math.max(0, Math.min(videos.length - 1, i)));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [open, videos.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'ArrowDown' || e.key === 'j') {
        scrollToIndex(getNextIndex(1));
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        scrollToIndex(getNextIndex(-1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, active, videos.length]);

  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  function getNextIndex(delta: number) {
    return Math.min(Math.max(active + delta, 0), videos.length - 1);
  }

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
        className="shadow-brutal-sm absolute top-4 right-4 z-20 border-2 border-black bg-white p-2 hover:bg-yellow-400 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative flex h-full w-full items-stretch justify-center">
        <div className="absolute top-1/2 left-4 z-20 hidden -translate-y-1/2 flex-col gap-2 md:flex">
          <button
            disabled={active === 0}
            onClick={() => scrollToIndex(active - 1)}
            className="shadow-brutal-sm border-2 border-black bg-yellow-400 p-2 transition hover:-translate-y-0.5 disabled:opacity-40"
            aria-label="Previous reel"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <div className="border-2 border-black bg-white px-2 py-1 text-center font-mono text-[10px] font-bold">
            {active + 1}/{videos.length}
          </div>
          <button
            disabled={active === videos.length - 1}
            onClick={() => scrollToIndex(active + 1)}
            className="shadow-brutal-sm border-2 border-black bg-yellow-400 p-2 transition hover:translate-y-0.5 disabled:opacity-40"
            aria-label="Next reel"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        <div className="relative aspect-9/16 h-full bg-black">
          <div ref={containerRef} className="snap-reel relative h-full w-full">
            {videos.map((v, i) => (
              <ReelItem key={v.id} video={v} active={i === active} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
