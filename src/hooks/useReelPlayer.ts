'use client';

import { createContext, useContext } from 'react';

import type { VideoEntry } from '@/data/videos';

/**
 * Shape of the reel player context value.
 *
 * @type {ReelPlayerContextValue}
 * @property {VideoEntry | null} active - Currently playing video.
 * @property {(video: VideoEntry, list: VideoEntry[]) => void} play - Opens the player with a video and its list.
 * @property {() => void} close - Closes the player.
 * @property {(video: VideoEntry | null) => void} setActive - Directly sets the active video.
 */
export interface ReelPlayerContextValue {
  active: VideoEntry | null;
  play: (video: VideoEntry, list: VideoEntry[]) => void;
  close: () => void;
  setActive: (video: VideoEntry | null) => void;
}

/**
 * React context providing reel player state and controls to descendant components.
 */
export const ReelPlayerContext = createContext<ReelPlayerContextValue>({
  active: null,
  play: () => {},
  close: () => {},
  setActive: () => {},
});

/**
 * Hook to access the reel player context for opening, closing, and navigating videos.
 *
 * @returns {ReelPlayerContextValue} Reel player context value.
 *
 * @throws {Error} When used outside of ReelPlayerProvider.
 */
export function useReelPlayer(): ReelPlayerContextValue {
  const ctx = useContext(ReelPlayerContext);
  if (!ctx) throw new Error('useReelPlayer must be used within ReelPlayerProvider');
  return ctx;
}
