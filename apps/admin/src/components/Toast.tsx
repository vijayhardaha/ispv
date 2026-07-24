'use client';

import { createContext, useCallback, useContext, useState, type JSX, type ReactNode } from 'react';

/** Type of toast notification indicating success or error. */
type ToastType = 'success' | 'error';

/**
 * A single toast notification entry.
 *
 * @type {Toast}
 * @property {number} id - Auto-incremented unique identifier.
 * @property {string} message - Notification message text.
 * @property {ToastType} type - Visual type (success or error).
 */
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

/**
 * Context value providing the toast notification function.
 *
 * @type {ToastContextValue}
 * @property {(message: string, type?: ToastType) => void} toast - Function to show a toast.
 */
interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

let nextId = 0;

/**
 * Provides toast notification context to child components.
 *
 * @param {{ children: ReactNode }} props - Component properties.
 * @param {ReactNode} props.children - Child components to wrap.
 *
 * @returns {JSX.Element} Wrapped component tree.
 */
export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed right-4 bottom-4 z-[100] flex flex-col gap-2" aria-live="polite" role="status">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up border-2 border-black px-4 py-2 text-sm font-bold uppercase shadow-[4px_4px_0px_0px_#18181b] ${
              t.type === 'success' ? 'bg-green-400 text-black' : 'bg-red-400 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access the toast notification function.
 *
 * @returns {ToastContextValue} Object with toast function.
 */
export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
