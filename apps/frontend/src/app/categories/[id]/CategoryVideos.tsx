'use client';

import type { JSX } from 'react';

import { VideoGridSection, type VideoGridSectionProps } from '@/components/shared/VideoGridSection';

/**
 * Props for the category videos grid with filter and pagination controls.
 *
 * @type {CategoryVideosProps}
 * @property {VideoGridSectionProps['state']} state - Current filter values.
 * @property {VideoGridSectionProps['setState']} setState - Updates the filter state.
 * @property {VideoGridSectionProps['total']} total - Total number of filtered videos.
 * @property {VideoGridSectionProps['allTags']} allTags - Available tags for filtering.
 * @property {VideoGridSectionProps['allLocations']} allLocations - Available locations for filtering.
 * @property {VideoGridSectionProps['paged']} paged - Videos for the current page.
 * @property {VideoGridSectionProps['totalPages']} totalPages - Total number of pages.
 * @property {VideoGridSectionProps['safePage']} safePage - Current page clamped to valid range.
 * @property {VideoGridSectionProps['onPlay']} onPlay - Opens the reel player.
 * @property {boolean} [loading] - Whether videos are still loading.
 */
export type CategoryVideosProps = Omit<VideoGridSectionProps, 'children'>;

/**
 * Video grid with filter bar and pagination for a single category.
 *
 * @param {CategoryVideosProps} props - Filter state, video data, and callbacks.
 *
 * @returns {JSX.Element} Rendered video grid section.
 */
export function CategoryVideos(props: CategoryVideosProps): JSX.Element {
  return <VideoGridSection {...props} />;
}
