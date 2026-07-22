"use client";

import type { JSX, ReactNode } from "react";

import { ToastProvider } from "@/components/Toast";

export function Providers({ children }: { children: ReactNode }): JSX.Element {
  return <ToastProvider>{children}</ToastProvider>;
}
