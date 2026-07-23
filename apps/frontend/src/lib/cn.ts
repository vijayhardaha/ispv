import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes
 * to avoid conflicts and redundancies.
 *
 * @param {ClassValue[]} inputs - A list of class name inputs, which can include strings,
 * arrays, or objects. These inputs are processed by `clsx` to handle conditional
 * class names and then merged by `twMerge` to resolve Tailwind CSS conflicts.
 *
 * @returns {string} - A single string of combined and merged class names.
 *
 * @example
 * cn('px-4', { 'hidden': isHidden }, ['text-gray-500', 'md:text-black'])
 * // -> 'px-4 text-gray-500 md:text-black' (after twMerge resolves conflicts)
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
