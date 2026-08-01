'use client';

import { useEffect, useRef, useState } from 'react';

import { getLocations, getTags } from '@/lib/db';

/**
 * Return type of the useFilterOptions hook.
 *
 * @type {UseFilterOptionsReturn}
 * @property {{ slug: string; name: string }[]} allLocations - All available locations for filtering.
 * @property {string[]} allTags - All unique tags across videos for filtering.
 */
export interface UseFilterOptionsReturn {
  allLocations: { slug: string; name: string }[];
  allTags: string[];
}

/**
 * Loads the static filter options (locations and tags) once on mount.
 *
 * @returns {UseFilterOptionsReturn} Location and tag options for filter bars.
 */
export function useFilterOptions(): UseFilterOptionsReturn {
  const [allLocations, setAllLocations] = useState<{ slug: string; name: string }[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const loadedStatic = useRef(false);

  useEffect(() => {
    if (!loadedStatic.current) {
      loadedStatic.current = true;
      Promise.all([getLocations(), getTags()]).then(([locs, tags]) => {
        setAllLocations(locs.map((l) => ({ slug: l.slug, name: l.name })));
        setAllTags(tags);
      });
    }
  }, []);

  return { allLocations, allTags };
}
