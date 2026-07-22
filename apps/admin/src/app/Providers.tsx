'use client';

import type { JSX, ReactNode } from 'react';

import { ToastProvider } from '@/components/Toast';

/**
 * Wraps the application with toast notification context.
 *
 * @param {{ children: ReactNode }} props - Component properties.
 * @param {ReactNode} props.children - Child components to wrap.
 *
 * @returns {JSX.Element} Wrapped component tree.
 */
export function Providers({ children }: { children: ReactNode }): JSX.Element {
  return <ToastProvider>{children}</ToastProvider>;
}
