import { useEffect, useRef, useState, useCallback } from "react";
import { cn, formatNumber, timeAgo } from "@/lib/utils";
import { extractInstagramId } from "@/lib/utils";
import { getCategoryById, type VideoEntry } from "@/data/videos";
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
} from "lucide-react";

interface ReelPlayerProps {
  videos: VideoEntry[];
  startIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function ReelPlayer({ videos, startIndex = 0, open, onClose }: ReelPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(startIndex);
  const [muted, setMuted] = useState(true);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  // Snap to startIndex when opened
  useEffect(() => {
    if (open && containerRef.current) {
      const top = startIndex * containerRef.current.clientHeight;
      containerRef.current.scrollTo({ top, behavior: "auto" });
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
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, videos.length]);

  // Keyboard: arrows + esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "j") {
        scrollToIndex(Math.min(active + 1, videos.length - 1));
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        scrollToIndex(Math.max(active - 1, 0));
      }
      if (e.key === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active, videos.length]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  const scrollToIndex = useCallback((i: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: i * el.clientHeight, behavior: "smooth" });
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-md">
      <button
        onClick={onClose}
        aria-label="Close player"
        className="absolute right-4 top-4 z-20 border-3 border-ink bg-white p-2 shadow-brutal-sm hover:bg-hotpink hover:text-paper"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative flex h-full w-full items-stretch justify-center">
        {/* Side rail — quick scroll on desktop */}
        <div className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 md:flex">
          <button
            disabled={active === 0}
            onClick={() => scrollToIndex(active - 1)}
            className="border-3 border-ink bg-saffron p-2 shadow-brutal-sm transition hover:-translate-y-[2px] disabled:opacity-40"
            aria-label="Previous reel"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <div className="border-3 border-ink bg-white px-2 py-1 text-center font-mono text-[10px] font-bold">
            {active + 1}/{videos.length}
          </div>
          <button
            disabled={active === videos.length - 1}
            onClick={() => scrollToIndex(active + 1)}
            className="border-3 border-ink bg-saffron p-2 shadow-brutal-sm transition hover:translate-y-[2px] disabled:opacity-40"
            aria-label="Next reel"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        {/* Phone-frame container */}
        <div className="relative h-full w-full max-w-[420px] bg-ink">
          <div
            ref={containerRef}
            className="snap-reel relative h-full w-full"
          >
            {videos.map((v, i) => (
              <ReelItem
                key={v.id}
                video={v}
                active={i === active}
                liked={!!likes[v.id]}
                muted={muted}
                onLike={() =>
                  setLikes((p) => ({ ...p, [v.id]: !p[v.id] }))
                }
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
  liked,
  muted,
  onLike,
  onToggleMute,
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
    <div className="snap-reel-item relative h-full w-full bg-ink">
      {/* Background thumbnail fills 9:16 */}
      <img
        src={video.thumbnail}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-90"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-ink/20" />

      {/* Active iframe (only when in view) */}
      {active && id && (
        <iframe
          title={video.title}
          src={`https://www.instagram.com/p/${id}/embed/`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => setEmbedLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full border-0 transition-opacity duration-300",
            embedLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Top-left badge: category */}
      <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2">
        <span className="nb-badge bg-saffron text-ink">
          {cat?.label ?? video.category}
        </span>
        <span className="nb-badge bg-white text-ink">
          {video.city}, {video.state}
        </span>
      </div>

      {/* Top-right: mute toggle */}
      <button
        onClick={onToggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute right-3 top-3 z-10 border-3 border-ink bg-white p-2 shadow-brutal-sm hover:bg-saffron"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>

      {/* Right-side action rail */}
      <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-4">
        <ActionButton
          label={formatNumber(video.likes + (liked ? 1 : 0))}
          onClick={onLike}
        >
          <Heart
            className={cn(
              "h-6 w-6",
              liked && "fill-hotpink text-hotpink"
            )}
            strokeWidth={2.5}
          />
        </ActionButton>
        <ActionButton label="1.2K" onClick={() => {}}>
          <MessageCircle className="h-6 w-6" strokeWidth={2.5} />
        </ActionButton>
        <ActionButton label="Share" onClick={() => {}}>
          <Share2 className="h-6 w-6" strokeWidth={2.5} />
        </ActionButton>
        <a
          href={video.url}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1"
          aria-label="Open on Instagram"
        >
          <div className="border-3 border-ink bg-white p-2 shadow-brutal-sm">
            <ExternalLink className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="font-mono text-[10px] font-bold uppercase text-paper">
            Open
          </span>
        </a>
      </div>

      {/* Bottom info card */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4">
        <div className="border-3 border-ink bg-paper p-3 shadow-brutal">
          <div className="flex items-center gap-2">
            <span className="nb-badge bg-ink text-paper">
              @{video.submittedBy.replace(/^@/, "")}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink/60">
              {timeAgo(video.submittedAt)}
            </span>
            <span className="ml-auto flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-ink/60">
              <Eye className="h-3 w-3" /> {formatNumber(video.views)}
            </span>
          </div>
          <h3 className="mt-2 font-display text-base font-extrabold uppercase leading-tight">
            {video.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-ink/80">
            {video.description}
          </p>
          {video.hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {video.hashtags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="nb-chip bg-saffron border-ink"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1"
      aria-label={label}
    >
      <div className="border-3 border-ink bg-white p-2 shadow-brutal-sm">
        {children}
      </div>
      <span className="font-mono text-[10px] font-bold uppercase text-paper">
        {label}
      </span>
    </button>
  );
}