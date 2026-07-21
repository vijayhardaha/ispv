import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = (
  variant = 'default',
  size = 'default'
) => {
  const base = 'inline-flex items-center justify-center font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60';

  const variants = {
    default: 'bg-orange-500 text-black border-2 border-black hover:bg-orange-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    destructive: 'bg-red-600 text-white border-2 border-black hover:bg-red-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    outline: 'border-2 border-black bg-white text-black hover:bg-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    secondary: 'bg-zinc-900 text-white border-2 border-black hover:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
    ghost: 'hover:bg-black/10 border-2 border-transparent',
    link: 'border-2 border-transparent underline-offset-4 hover:underline',
  } as const;

  const sizes = {
    default: 'px-8 py-4 text-sm',
    sm: 'px-6 py-3 text-xs',
    lg: 'px-10 py-5 text-base',
    icon: 'p-2',
  } as const;

  return cn(base, variants[variant as keyof typeof variants], sizes[size as keyof typeof sizes]);
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return <button className={cn(buttonVariants(variant, size), className)} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
