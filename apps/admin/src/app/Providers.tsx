'use client';

import type { JSX, ReactNode } from 'react';

import { Toaster, type DefaultToastOptions } from 'react-hot-toast';

/** Flat, borderless toast styling matching the admin design system. */
const TOAST_OPTIONS: DefaultToastOptions = {
  style: {
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#111827',
    fontSize: '14px',
    boxShadow: 'none',
  },
  success: { iconTheme: { primary: '#7c3aed', secondary: '#ffffff' } },
  error: { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
};

/**
 * Wraps the application with react-hot-toast notification rendering.
 *
 * @param {{ children: ReactNode }} props - Component properties.
 * @param {ReactNode} props.children - Child components to wrap.
 *
 * @returns {JSX.Element} Wrapped component tree.
 */
export function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <>
      {children}
      <Toaster position="top-center" toastOptions={TOAST_OPTIONS} />
    </>
  );
}
