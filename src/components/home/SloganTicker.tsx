import { SLOGANS } from "@/data/slogans";

export function SloganTicker() {
  // Duplicate the slogans so the marquee loops seamlessly.
  const items = [...SLOGANS, ...SLOGANS];
  return (
    <div className="border-y-3 border-ink bg-navy py-3 text-paper">
      <div className="mx-auto flex max-w-[100vw] overflow-hidden">
        <div className="flex shrink-0 animate-marquee items-center gap-8 px-4">
          {items.map((s, i) => (
            <span
              key={i}
              className="flex shrink-0 items-center gap-3 font-display text-sm font-bold uppercase tracking-wider md:text-base"
            >
              <span className="text-saffron">★</span>
              {s}
              <span className="text-saffron">★</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}