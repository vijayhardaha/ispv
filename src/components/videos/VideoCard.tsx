import { useState } from "react";
import { cn, formatNumber, timeAgo } from "@/lib/utils";
import { getCategoryById, type VideoEntry } from "@/data/videos";
import { Badge } from "@/components/ui/Badge";
import { Eye, Heart, Play, MapPin } from "lucide-react";

interface VideoCardProps {
  video: VideoEntry;
  onPlay: (video: VideoEntry) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "aspect-[9/14]",
  md: "aspect-[9/13]",
  lg: "aspect-[9/12]",
};

export function VideoCard({
  video,
  onPlay,
  size = "md",
  className,
}: VideoCardProps) {
  const [imgError, setImgError] = useState(false);
  const cat = getCategoryById(video.category);
  const tone = (cat?.color as
    | "saffron"
    | "navy"
    | "sun"
    | "pink"
    | "lime"
    | "green"
    | undefined) ?? "saffron";

  return (
    <button
      onClick={() => onPlay(video)}
      className={cn(
        "group relative block w-full overflow-hidden border-3 border-ink bg-white text-left shadow-brutal",
        "transition-all duration-150",
        "hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg",
        sizeMap[size],
        className
      )}
    >
      <div className="absolute inset-0">
        {!imgError ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            onError={() => setImgError(true)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-ink/80">
            <Play className="h-10 w-10 text-paper" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-transparent" />
      </div>

      {/* Top badges */}
      <div className="absolute left-2 right-2 top-2 z-10 flex items-start justify-between gap-1">
        <Badge tone={tone}>{cat?.label ?? video.category}</Badge>
        {video.featured && (
          <Badge tone="pink">★ Featured</Badge>
        )}
      </div>

      {/* Center play button on hover */}
      <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <div className="border-3 border-ink bg-saffron p-4 shadow-brutal-lg animate-wiggle">
          <Play className="h-8 w-8 fill-ink text-ink" strokeWidth={2.5} />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
        <h3 className="line-clamp-2 font-display text-sm font-extrabold uppercase leading-tight text-paper md:text-base">
          {video.title}
        </h3>
        <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-paper/80">
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
        <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-paper/60">
          {timeAgo(video.submittedAt)} · @{video.submittedBy.replace(/^@/, "")}
        </div>
      </div>
    </button>
  );
}