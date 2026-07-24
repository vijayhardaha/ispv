import { type JSX } from 'react';

/**
 * Skeleton placeholder matching VideoCard dimensions and layout.
 * Used in the homepage loading state while category section videos are fetched.
 *
 * @returns {JSX.Element} Animated skeleton card.
 */
export function VideoCardSkeleton(): JSX.Element {
  return (
    <div className="aspect-9/16 w-full animate-pulse overflow-hidden border-2 border-zinc-900 bg-white">
      <div className="relative h-full w-full border-b-2 border-zinc-900 bg-zinc-200" />
      <div className="absolute top-2 right-2 left-2 flex gap-1">
        <div className="h-4 w-16 border-2 border-zinc-900 bg-zinc-300" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-full bg-zinc-300/60 p-4">
          <div className="h-6 w-6" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 border border-zinc-900 bg-zinc-300" />
          <div className="h-3 w-12 border border-zinc-900 bg-zinc-300" />
        </div>
      </div>
    </div>
  );
}
