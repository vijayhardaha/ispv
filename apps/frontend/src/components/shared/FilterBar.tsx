'use client';

import { useCallback, useState, type FormEvent, type JSX } from 'react';

import { ChevronDown, ChevronRight, MapPin, Search, X } from 'lucide-react';

import { TagChips } from '@/components/shared/TagChips';
import type { FilterState } from '@/lib/helpers/filterVideos';

/**
 * Search, location, and tag filter bar for the video archive.
 * All filter changes are written to URL search params via setFilter.
 *
 * @param {object} props - Component properties.
 * @param {FilterState} props.state - Current filter state read from the URL.
 * @param {(param: string, value: string) => void} props.setFilter - Updates a URL search param and resets page.
 * @param {number} props.total - Total number of filtered results.
 * @param {string[]} props.allTags - All available tags for the filter chips (capped at 100).
 * @param {Array<{ slug: string; name: string }>} [props.allLocations] - All available locations for the location dropdown.
 *
 * @returns {JSX.Element} Rendered filter bar.
 */
export function FilterBar({
  state,
  setFilter,
  total,
  allTags,
  allLocations = [],
}: {
  state: FilterState;
  setFilter: (param: string, value: string) => void;
  total: number;
  allTags: string[];
  allLocations?: { slug: string; name: string }[];
}): JSX.Element {
  const [showTags, setShowTags] = useState(false);
  const [searchValue, setSearchValue] = useState(state.query);
  const [prevUrlQuery, setPrevUrlQuery] = useState(state.query);
  const tagChips = allTags.slice(0, 100);

  // Re-sync from the URL when it changes externally (reset, back/forward).
  // Uses the render-time adjustment pattern so it never clobbers typing:
  // while typing, the URL param is untouched and this branch does not run.
  if (state.query !== prevUrlQuery) {
    setPrevUrlQuery(state.query);
    setSearchValue(state.query);
  }

  const commitSearch = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setFilter('q', searchValue);
    },
    [searchValue, setFilter]
  );

  const selectTag = useCallback(
    (tag: string) => {
      setFilter('tag', state.tags.includes(tag) ? '' : tag);
    },
    [state.tags, setFilter]
  );

  return (
    <div className="shadow-brutal border-2 border-black bg-white p-4 md:p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-8">
          <label
            htmlFor="filter-search"
            className="font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase"
          >
            Search
          </label>
          <form role="search" onSubmit={commitSearch} className="relative mt-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-black/50" />
            <input
              id="filter-search"
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by city, hashtag, or title…"
              className="font-body w-full border-2 border-black bg-white px-3 py-2.5 pr-9 pl-9 placeholder:text-black/40 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => {
                  setSearchValue('');
                  setFilter('q', '');
                }}
                className="absolute top-1/2 right-2 -translate-y-1/2 border-2 border-black bg-white p-1 hover:bg-yellow-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="size-3" />
              </button>
            )}
          </form>
        </div>
        <div className="md:col-span-4">
          <label
            htmlFor="filter-location"
            className="font-mono text-[10px] font-bold tracking-widest text-black/60 uppercase"
          >
            Location
          </label>
          <div className="relative mt-1">
            <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-black/50" />
            <select
              id="filter-location"
              value={state.location}
              onChange={(e) => setFilter('location', e.target.value === 'all' ? '' : e.target.value)}
              className="font-body w-full appearance-none border-2 border-black bg-white px-3 py-2.5 pr-9 pl-9 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            >
              <option value="all">All locations</option>
              {allLocations.map((loc) => (
                <option key={loc.slug} value={loc.slug}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t-2 border-black pt-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTags((o) => !o)}
            className="inline-flex cursor-pointer items-center gap-1 font-mono text-[10px] font-bold tracking-widest text-black/70 uppercase hover:text-yellow-500"
            aria-expanded={showTags}
            aria-controls="filter-tags-section"
          >
            {showTags ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            {showTags ? 'Hide Tags' : 'Show Tags'}
          </button>
          {state.tags.length > 0 && (
            <button
              onClick={() => setFilter('tag', '')}
              className="ml-auto font-mono text-[10px] font-bold uppercase underline hover:text-yellow-500"
            >
              Clear
            </button>
          )}
        </div>
        {showTags && (
          <div id="filter-tags-section" className="mt-2">
            <TagChips tags={tagChips} selected={state.tags} onSelect={selectTag} emptyMessage="No tags available" />
          </div>
        )}
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
