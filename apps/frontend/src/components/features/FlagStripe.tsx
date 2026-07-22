import type { JSX } from 'react';

import Image from 'next/image';

import { cn } from '@/lib/cn';

/**
 * Renders the Ashoka Chakra SVG icon with optional size override.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes.
 *
 * @returns {JSX.Element} Rendered chakra image element.
 */
export function Chakra({ className }: { className?: string }): JSX.Element {
  return <Image src="/chakra.svg" width={24} height={24} className={cn('h-6 w-6', className)} alt="" aria-hidden />;
}
