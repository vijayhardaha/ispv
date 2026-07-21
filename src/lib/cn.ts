import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge.
 *
 * @param {...ClassValue} inputs - Class values to merge.
 *
 * @returns {string} Merged class string.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
