import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef, type ElementRef } from 'react';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/cn';

/**
 * Root select component that manages selection state.
 */
export const Select = SelectPrimitive.Root;

/**
 * Displays the currently selected value inside the trigger.
 */
export const SelectValue = SelectPrimitive.Value;

/**
 * Styled select trigger with border, chevron icon, and focus ring.
 */
export const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'font-body flex w-full items-center justify-between gap-2 border-2 border-black bg-white px-3 py-2.5 text-left placeholder:text-black/40 focus:ring-2 focus:ring-yellow-500 focus:outline-none',
      'data-placeholder:text-black/40',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 shrink-0" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

/**
 * Dropdown content panel rendered in a portal with snap-in animation.
 */
export const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        'relative z-50 max-h-72 min-w-40 overflow-hidden',
        'shadow-brutal border-2 border-black bg-white',
        'data-[state=open]:animate-snapIn',
        position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';

/**
 * Selectable item with check indicator and highlight styling.
 */
export const SelectItem = forwardRef<
  ComponentRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer items-center gap-2 px-3 py-2 select-none',
      'text-sm outline-none',
      'data-highlighted:bg-yellow-400 data-[state=checked]:bg-yellow-400 data-[state=checked]:text-black',
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <span className="ml-auto">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';
