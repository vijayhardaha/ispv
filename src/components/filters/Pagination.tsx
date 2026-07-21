import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = buildPageList(page, totalPages);
  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="nb-btn bg-white px-3 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            className="border-3 border-ink bg-white px-3 py-1.5 font-mono text-sm font-bold"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "border-3 border-ink px-3 py-1.5 font-mono text-sm font-bold transition-all",
              p === page
                ? "bg-saffron text-ink shadow-brutal-sm -translate-y-[1px]"
                : "bg-white hover:bg-saffron"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="nb-btn bg-white px-3 disabled:opacity-40"
        aria-label="Next page"
      >
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function buildPageList(page: number, total: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  const window = 1;
  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= page - window && i <= page + window)
    ) {
      out.push(i);
    } else if (out[out.length - 1] !== "…") {
      out.push("…");
    }
  }
  return out;
}