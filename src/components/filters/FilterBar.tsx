import { useMemo, type JSX } from 'react';

import { Search, X, Filter } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Dropdown';
import { SORT_OPTIONS, ALL_TAGS, type SortKey, type VideoCategory, CATEGORIES } from '@/data/videos';
import { cn } from '@/lib/utils';

/**
 * Filter state for video search and browsing.
 *
 * @type {FilterState}
 * @property {string} query - Search query string.
 * @property {SortKey} sort - Current sort order.
 * @property {VideoCategory} category - Selected category filter.
 * @property {string[]} tags - Active tag filters.
 * @property {number} page - Current page number.
 * @property {number} perPage - Number of results per page.
 */
export interface FilterState {
  query: string;
  sort: SortKey;
  category: VideoCategory;
  tags: string[];
  page: number;
  perPage: number;
}

/**
 * Search, sort, and tag filter bar for the video archive.
 *
 * @param {object} props - Component properties.
 * @param {FilterState} props.state - Current filter state.
 * @param {(s: FilterState) => void} props.setState - Callback to update filter state.
 * @param {number} props.total - Total number of results after filtering.
 *
 * @returns {JSX.Element} Rendered filter bar with search, sort, per-page, and tag controls.
 */
export function FilterBar({
  state,
  setState,
  total,
}: {
  state: FilterState;
  setState: (s: FilterState) => void;
  total: number;
}): JSX.Element {
  const tagChips = useMemo(() => {
    if (state.category === 'all') return ALL_TAGS;
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
      tags: state.tags.includes(tag) ? state.tags.filter((t) => t !== tag) : [...state.tags, tag],
      page: 1,
    });
  };

  return (
    <div className="shadow-brutal border-[3px] border-black bg-white p-4 md:p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-6">
          <label className="font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase">Search</label>
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-black/50" />
            <input
              value={state.query}
              onChange={(e) => setState({ ...state, query: e.target.value, page: 1 })}
              placeholder="Search by city, hashtag, or title…"
              className="font-body w-full border-[3px] border-black bg-white px-3 py-2.5 pr-9 pl-9 placeholder:text-black/40 focus:ring-2 focus:ring-orange-600 focus:outline-none"
            />
            {state.query && (
              <button
                onClick={() => setState({ ...state, query: '', page: 1 })}
                className="absolute top-1/2 right-2 -translate-y-1/2 border-2 border-black bg-white p-1 hover:bg-orange-500 hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase">Sort</label>
          <Select value={state.sort} onValueChange={(v) => setState({ ...state, sort: v as SortKey, page: 1 })}>
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
          <label className="font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase">Per page</label>
          <Select
            value={String(state.perPage)}
            onValueChange={(v) => setState({ ...state, perPage: Number(v), page: 1 })}
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

      <div className="mt-4 border-t-[3px] border-black pt-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-mono text-[10px] font-bold tracking-widest text-black/70 uppercase">Tags</span>
          {state.tags.length > 0 && (
            <button
              onClick={() => setState({ ...state, tags: [], page: 1 })}
              className="ml-auto font-mono text-[10px] font-bold uppercase underline hover:text-orange-600"
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
                'hover:-translate-y1px inline-flex cursor-pointer items-center gap-1 border-2 border-black bg-white px-2.5 py-1 font-mono text-xs font-bold uppercase transition-all hover:bg-orange-500 hover:text-white',
                state.tags.includes(t)
                  && 'hover:text-white-active shadow-brutal-sm inline-flex cursor-pointer items-center gap-1 border-2 border-black bg-white px-2.5 py-1 font-mono text-xs font-bold uppercase transition-all hover:-translate-y-px hover:bg-orange-500'
              )}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-widest text-black/60 uppercase">
        <span>
          {total} {total === 1 ? 'result' : 'results'} found
        </span>
        {state.tags.length > 0 && (
          <span>
            {state.tags.length} tag{state.tags.length > 1 ? 's' : ''} active
          </span>
        )}
      </div>
    </div>
  );
}
