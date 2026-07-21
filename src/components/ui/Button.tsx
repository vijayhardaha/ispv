import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type Variant = 'primary' | 'dark' | 'light' | 'primary-outline' | 'dark-outline' | 'light-outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-6 py-3 text-sm',
  md: 'px-8 py-4 text-base',
  lg: 'px-10 py-4 text-lg',
};

const solids: Record<string, string> = {
  primary: 'bg-orange-500 text-white hover:bg-orange-500 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
  dark: 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
  light: 'bg-white text-zinc-900 hover:bg-zinc-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
};

const outlines: Record<string, string> = {
  'primary-outline':
    'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
  'dark-outline':
    'border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white hover:shadow-[4px_4px_0px_0px_rgba(234,179,8,1)]',
  'light-outline':
    'border-2 border-white text-white hover:bg-white hover:text-zinc-900 hover:shadow-[4px_4px_0px_0px_rgba(234,179,8,1)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    if (variant.endsWith('-outline')) {
      return (
        <button
          ref={ref}
          className={cn(
            'group inline-flex items-center justify-center bg-transparent px-8 py-4 font-bold tracking-wider uppercase transition-all duration-300',
            outlines[variant],
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {children}
        </button>
      );
    }

    const solid = solids[variant];
    return (
      <span className="relative inline-flex">
        <button
          ref={ref}
          className={cn(
            'group relative inline-flex items-center justify-center overflow-hidden border-2 border-transparent px-8 py-4 font-bold tracking-wider uppercase transition-all duration-300',
            solid,
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <span className="relative z-10">{children}</span>
          <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
        </button>
      </span>
    );
  }
);
Button.displayName = 'Button';
