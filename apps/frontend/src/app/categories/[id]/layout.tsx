import type { JSX, ReactNode } from 'react';

import type { Metadata } from 'next';

import { getCategoryByValue } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';

/**
 * Props for the category layout, receiving route params.
 *
 * @type {CategoryLayoutProps}
 * @property {ReactNode} children - The page content to render.
 * @property {Promise<{ id: string }>} params - Route parameters containing the category slug.
 */
interface CategoryLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Generates metadata for a category page based on the category slug.
 *
 * @param {CategoryLayoutProps} props - Layout props with route params.
 * @param {Promise<{ id: string }>} props.params - Route parameters (category slug).
 *
 * @returns {Promise<Metadata>} Metadata object for the category page.
 */
export async function generateMetadata({ params }: CategoryLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const cat = await getCategoryByValue(id);
  const title = cat?.name ?? 'Category';
  const description = cat?.description ?? 'Browse videos in this protest category.';

  return buildMetadata({ title, description, path: `/categories/${id}` });
}

/**
 * Wraps the category page with metadata generation.
 *
 * @param {CategoryLayoutProps} props - Layout props.
 *
 * @returns {JSX.Element} Rendered children.
 */
export default function CategoryLayout({ children }: CategoryLayoutProps): JSX.Element {
  return <>{children}</>;
}
