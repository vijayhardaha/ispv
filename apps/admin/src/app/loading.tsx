import type { JSX } from 'react';

/**
 *
 */
export default function Loading(): JSX.Element {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin border-2 border-black border-t-yellow-400" />
        <p className="text-xs font-bold text-black/50 uppercase">Loading&hellip;</p>
      </div>
    </div>
  );
}
