import { cn } from "@/lib/utils";

// Horizontal tri-colour stripe used in headers, footers, dividers.
export function FlagStripe({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-2 w-full overflow-hidden border-3 border-ink",
        className
      )}
      role="img"
      aria-label="Indian flag tri-colour"
    >
      <div className="h-full flex-1 bg-saffron" />
      <div className="h-full flex-1 bg-white" />
      <div className="h-full flex-1 bg-indiaGreen" />
    </div>
  );
}

export function Chakra({ className }: { className?: string }) {
  // Simple 24-spoke Ashoka Chakra, SVG.
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-6 w-6", className)}
      aria-hidden
    >
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        return (
          <line
            key={i}
            x1="50"
            y1="6"
            x2="50"
            y2="94"
            stroke="currentColor"
            strokeWidth="2"
            transform={`rotate(${angle} 50 50)`}
          />
        );
      })}
    </svg>
  );
}

export function FlagPill({
  text,
  tone,
  className,
}: {
  text: string;
  tone: "saffron" | "white" | "green" | "navy";
  className?: string;
}) {
  const map: Record<string, string> = {
    saffron: "bg-saffron",
    white: "bg-white",
    green: "bg-indiaGreen text-paper",
    navy: "bg-navy text-paper",
  };
  return (
    <span
      className={cn(
        "border-3 border-ink px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
        map[tone],
        className
      )}
    >
      {text}
    </span>
  );
}