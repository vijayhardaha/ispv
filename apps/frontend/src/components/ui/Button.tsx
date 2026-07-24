'use client';

import type { ComponentProps, JSX } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const offsetVariants = cva(
  [
    // positioning
    'absolute inset-0 -z-10',
    // border
    'border-2',
    // offset + hover slide
    'translate-x-1.5 translate-y-1.5 transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0',
  ].join(' '),
  {
    variants: {
      color: {
        red: 'bg-red-700 border-destructive',
        yellow: 'bg-yellow-400 border-black',
        black: 'bg-black border-black',
      },
    },
    defaultVariants: { color: 'yellow' },
  }
);

const buttonVariants = cva(
  [
    // layout
    'group relative z-0 inline-flex cursor-pointer',
    // transition
    'transition-colors duration-300',
    // outline / focus
    'outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
    // disabled
    'disabled:pointer-events-none disabled:opacity-50',
    // invalid
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
  ].join(' '),
  {
    variants: {
      variant: {
        default: '',
        primary: '',
        light: '',
        'default-outline': '',
        'primary-outline': '',
        'light-outline': '',
      },
      size: { default: '', sm: '', lg: '', icon: 'p-0', 'icon-xs': 'p-0', 'icon-sm': 'p-0', 'icon-lg': 'p-0' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

const VARIANT_OFFSET_COLOR: Record<string, 'yellow' | 'black'> = {
  default: 'yellow',
  primary: 'black',
  light: 'black',
  'default-outline': 'yellow',
  'primary-outline': 'black',
  'light-outline': 'yellow',
};

const spanVariants = cva(
  [
    // positioning
    'relative z-10 inline-flex items-center justify-center gap-1.5 whitespace-nowrap border-2',
    // typography
    'font-display uppercase font-bold text-sm',
    // icons
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'text-secondary-foreground border-secondary bg-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary',
        primary: 'text-primary-foreground border-primary bg-primary hover:bg-black hover:text-white hover:border-black',
        light:
          'text-secondary border-secondary-foreground bg-secondary-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary',
        'default-outline':
          'text-secondary border-secondary bg-transparent hover:bg-secondary hover:text-secondary-foreground hover:border-secondary',
        'primary-outline':
          'text-primary border-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary',
        'light-outline': 'text-white border-white bg-transparent hover:bg-black hover:text-white hover:border-black',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-4',
        lg: 'h-13 px-8',
        icon: 'size-9',
        'icon-xs': 'size-6',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

/**
 * Spinning circle used as a loading indicator inside buttons.
 *
 * @returns {JSX.Element} Animated spinner element.
 */
function Spinner(): JSX.Element {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
      aria-hidden="true"
    />
  );
}

/**
 * Brutalist-styled button with variant sizes, optional offset shadow, loading spinner, and asChild support.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {string} [props.variant] - Visual variant (default, primary, light, or outline variants).
 * @param {string} [props.size] - Size variant (default, sm, lg, icon, icon-xs, icon-sm, icon-lg).
 * @param {boolean} [props.asChild] - Render as child element via Radix Slot.
 * @param {boolean} [props.shadow] - Show offset shadow behind the button.
 * @param {boolean} [props.loading] - Show loading spinner and disable interaction.
 * @param {boolean} [props.disabled] - Native disabled attribute.
 * @param {import('react').ReactNode} props.children - Button content.
 *
 * @returns {JSX.Element} Rendered button element.
 */
function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  shadow = false,
  loading = false,
  children,
  disabled,
  ...props
}: ComponentProps<'button'>
  & VariantProps<typeof buttonVariants> & { asChild?: boolean; shadow?: boolean; loading?: boolean }): JSX.Element {
  const classes = cn(buttonVariants({ variant, size, className }));
  const Comp = asChild ? Slot : 'button';
  const isDisabled = disabled || loading;

  if (asChild) {
    const asChildClasses = cn(classes, spanVariants({ variant, size }));
    return (
      <Comp
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={asChildClasses}
        disabled={isDisabled}
        {...props}
      >
        <span className={spanVariants({ variant, size })}>
          {loading && <Spinner />}
          {children}
        </span>
      </Comp>
    );
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(classes, loading && 'cursor-wait')}
      disabled={isDisabled}
      {...props}
    >
      {shadow && <div className={offsetVariants({ color: VARIANT_OFFSET_COLOR[variant!] })} aria-hidden="true" />}
      <span className={spanVariants({ variant, size })}>
        {loading && <Spinner />}
        {children}
      </span>
    </Comp>
  );
}

export { Button };
