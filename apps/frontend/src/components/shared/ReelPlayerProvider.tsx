'use client';

import { useState, type ReactNode, type JSX } from 'react';

import { ReelPlayer } from '@/components/shared/ReelPlayer';
import type { VideoEntry } from '@/data/videos';
import { ReelPlayerContext } from '@/hooks/useReelPlayer';

/**
 * Context provider that manages reel player state and renders the global player overlay.
 *
 * @param {object} props - Component properties.
 * @param {ReactNode} props.children - Child components that can access the reel player context.
 *
 * @returns {JSX.Element} Provider wrapper with the reel player rendered.
 */
export function ReelPlayerProvider({ children }: { children: ReactNode }): JSX.Element {
  const [active, setActive] = useState<VideoEntry | null>(null);
  const [videosList, setVideosList] = useState<VideoEntry[]>([]);

  const play = (video: VideoEntry, list: VideoEntry[]) => {
    setActive(video);
    setVideosList(list);
  };
  const close = () => {
    setActive(null);
    setVideosList([]);
  };

  return (
    <ReelPlayerContext.Provider value={{ active, play, close, setActive }}>
      {children}
      <ReelPlayer
        open={!!active}
        videos={videosList}
        startIndex={active ? videosList.findIndex((v) => v.id === active.id) : 0}
        onClose={close}
      />
    </ReelPlayerContext.Provider>
  );
}
