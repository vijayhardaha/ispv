'use client';

import type { JSX, ReactNode } from 'react';

import { ToastProvider } from '@/components/Toast';

/**
 *
 * @param root0
 * @param root0.children
 */
export function Providers({ children }: { children: ReactNode }): JSX.Element {
  return <ToastProvider>{children}</ToastProvider>;
}
