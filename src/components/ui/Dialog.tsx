import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef, type JSX } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = forwardRef<
  ComponentRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

export const DialogContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    tone?: 'default' | 'saffron' | 'green' | 'navy' | 'sun' | 'pink' | 'lime';
  }
>(({ className, children, tone = 'default', ...props }, ref) => {
  const toneBg: Record<string, string> = {
    default: 'bg-gray-100',
    saffron: 'bg-orange-500',
    green: 'bg-blue-600 text-white',
    navy: 'bg-[#0a0a0c] text-white',
    sun: 'bg-yellow-400',
    pink: 'bg-orange-500 text-white',
    lime: 'bg-yellow-400',
  };
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2',
          'shadow-brutal-xl border-[3px] border-black',
          'max-h-[90vh] overflow-y-auto',
          'animate-snapIn',
          toneBg[tone],
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="shadow-brutal-sm absolute top-3 right-3 border-[3px] border-black bg-white p-1.5 transition-colors hover:bg-orange-500 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = 'DialogContent';

/**
 * Header section of the dialog with bottom border styling.
 *
 * @param {object} root0 - DialogHeader properties.
 * @param {string} [root0.className] - Additional CSS classes.
 *
 * @returns {JSX.Element} Rendered dialog header.
 */
export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div className={cn('border-b-[3px] border-black px-6 py-4', className)} {...props} />
  );
}

export const DialogTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('font-display text-2xl font-extrabold tracking-tight uppercase', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('font-mono text-xs tracking-wide uppercase opacity-80', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

/**
 * Body content area of the dialog.
 *
 * @param {object} root0 - DialogBody properties.
 * @param {string} [root0.className] - Additional CSS classes.
 *
 * @returns {JSX.Element} Rendered dialog body.
 */
export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div className={cn('px-6 py-5', className)} {...props} />
  );
}

/**
 * Footer section of the dialog with top border and action alignment.
 *
 * @param {object} root0 - DialogFooter properties.
 * @param {string} [root0.className] - Additional CSS classes.
 *
 * @returns {JSX.Element} Rendered dialog footer.
 */
export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-end gap-3 border-t-[3px] border-black bg-white px-6 py-4',
        className
      )}
      {...props}
    />
  );
}
