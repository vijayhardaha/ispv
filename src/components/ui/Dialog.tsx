import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef, type JSX } from 'react';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { toneMap } from '@/constants/colors';
import { cn } from '@/lib/cn';

/**
 * Root dialog component that manages open/close state.
 */
export const Dialog = DialogPrimitive.Root;

/**
 * Element that triggers the dialog to open when clicked.
 */
export const DialogTrigger = DialogPrimitive.Trigger;

/**
 * Element that closes the dialog when clicked.
 */
export const DialogClose = DialogPrimitive.Close;

/**
 * Portal container that renders dialog content outside the DOM hierarchy.
 */
export const DialogPortal = DialogPrimitive.Portal;

/**
 * Semi-transparent backdrop overlay for the dialog.
 */
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

/**
 * Main dialog content panel with tone colour, close button, and portal rendering.
 */
export const DialogContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    tone?: 'default' | 'saffron' | 'green' | 'navy' | 'sun' | 'pink' | 'lime';
  }
>(({ className, children, tone = 'default', ...props }, ref) => {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2',
          'shadow-brutal-xl border-2 border-black',
          'max-h-[90vh] overflow-y-auto',
          'animate-snapIn',
          toneMap[tone],
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="shadow-brutal-sm absolute top-3 right-3 border-2 border-black bg-white p-1.5 transition-colors hover:bg-yellow-400 hover:text-white"
          aria-label="Close"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = 'DialogContent';

/**
 * Header section of the dialog with bottom border styling.
 *
 * @param {object} props - DialogHeader properties.
 * @param {string} [props.className] - Additional CSS classes.
 *
 * @returns {JSX.Element} Rendered dialog header.
 */
export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn('border-b-2 border-black px-6 py-4', className)} {...props} />;
}

/**
 * Dialog title rendered as a bold uppercase heading.
 */
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

/**
 * Dialog description rendered as small uppercase text.
 */
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
 * @param {object} props - DialogBody properties.
 * @param {string} [props.className] - Additional CSS classes.
 *
 * @returns {JSX.Element} Rendered dialog body.
 */
export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn('px-6 py-5', className)} {...props} />;
}

/**
 * Footer section of the dialog with top border and action alignment.
 *
 * @param {object} props - DialogFooter properties.
 * @param {string} [props.className] - Additional CSS classes.
 *
 * @returns {JSX.Element} Rendered dialog footer.
 */
export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-end gap-3 border-t-2 border-black bg-white px-6 py-4',
        className
      )}
      {...props}
    />
  );
}
