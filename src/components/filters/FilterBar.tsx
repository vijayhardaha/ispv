import { useMemo } from "react";
import { Search, X, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Dropdown";
import { SORT_OPTIONS, ALL_TAGS, type SortKey, type VideoCategory, CATEGORIES } from "@/data/videos";
import { cn } from "@/lib/utils";

export interface FilterState {
  query: string;
  sort: SortKey;
  category: VideoCategory;
  tags: string[];
  page: number;
  perPage: number;
}

export function FilterBar({
  state,
  setState,
  total,
}: {
  state: FilterState;
  setState: (s: FilterState) => void;
  total: number;
}) {
  const tagChips = useMemo(() => {
    if (state.category === "all") return ALL_TAGS;
    return Array.from(
      new Set(
        CATEGORIES.find((c) => c.id === state.category)
          ? ALL_TAGS // mock: show all tags; in a real app we'd filter
          : ALL_TAGS
      )
    );
  }, [state.category]);

  const toggleTag = (tag: string) => {
    setState({
      ...state,
      tags: state.tags.includes(tag)
        ? state.tags.filter((t) => t !== tag)
        : [...state.tags, tag],
      page: 1,
    });
  };

  return (
    <div className="nb-card bg-white p-4 md:p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-6">
          <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
            Search
          </label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/50" />
            <input
              value={state.query}
              onChange={(e) =>
                setState({ ...state, query: e.target.value, page: 1 })
              }
              placeholder="Search by city, hashtag, or title…"
              className="nb-input pl-9 pr-9"
            />
            {state.query && (
              <button
                onClick={() => setState({ ...state, query: "", page: 1 })}
                className="absolute right-2 top-1/2 -translate-y-1/2 border-2 border-ink bg-white p-1 hover:bg-hotpink hover:text-paper"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
            Sort
          </label>
          <Select
            value={state.sort}
            onValueChange={(v) =>
              setState({ ...state, sort: v as SortKey, page: 1 })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Newest first" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3">
          <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60">
            Per page
          </label>
          <Select
            value={String(state.perPage)}
            onValueChange={(v) =>
              setState({ ...state, perPage: Number(v), page: 1 })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[6, 12, 18, 24, 36].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 border-t-3 border-ink pt-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/70">
            Tags
          </span>
          {state.tags.length > 0 && (
            <button
              onClick={() => setState({ ...state, tags: [], page: 1 })}
              className="ml-auto font-mono text-[10px] font-bold uppercase underline hover:text-hotpink"
            >
              Clear
            </button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tagChips.map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={cn(
                "nb-tag",
                state.tags.includes(t) && "nb-tag-active shadow-brutal-sm"
              )}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/60">
        <span>
          {total} {total === 1 ? "result" : "results"} found
        </span>
        {state.tags.length > 0 && (
          <span>
            {state.tags.length} tag{state.tags.length > 1 ? "s" : ""} active
          </span>
        )}
      </div>
    </div>
  );
}