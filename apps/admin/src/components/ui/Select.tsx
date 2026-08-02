'use client';

import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/utils';

/** Root select component that manages selection state. */
export const Select = SelectPrimitive.Root;

/** Groups related select items, typically with a label. */
export const SelectGroup = SelectPrimitive.Group;

/**
 * Displays the currently selected value inside the trigger.
 * The value node is marked with a data-slot so the trigger can apply
 * truncation styles (min-w-0 flex-1 truncate) via child selectors.
 *
 * @param {object} props - Component properties.
 *
 * @returns {JSX.Element} Rendered selected value.
 */
export const SelectValue = forwardRef<
  ComponentRef<typeof SelectPrimitive.Value>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>((props, ref) => <SelectPrimitive.Value ref={ref} data-slot="select-value" {...props} />);
SelectValue.displayName = 'SelectValue';

/** Size variants for the SelectTrigger. */
type SelectSize = 'sm' | 'default';

/**
 * Styled select trigger with border, chevron icon, and focus ring.
 * Accepts a `size` prop for compact (`sm`) or default sizing.
 *
 * @param {object} props - Component properties.
 * @param {SelectSize} [props.size] - Trigger size variant (sm or default).
 * @param {string} [props.className] - Additional CSS classes to merge onto the trigger.
 *
 * @returns {JSX.Element} Rendered select trigger.
 */
export const SelectTrigger = forwardRef<
  ComponentRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { size?: SelectSize }
>(({ className, size = 'default', children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    data-size={size}
    className={cn(
      'flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white text-sm transition-colors outline-none select-none',
      'text-left *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:truncate',
      'data-placeholder:text-gray-400',
      'focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30',
      'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
      'data-[size=default]:h-9 data-[size=default]:px-2.5',
      'data-[size=sm]:h-7 data-[size=sm]:px-2 data-[size=sm]:text-xs',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 shrink-0 opacity-70" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

/**
 * Dropdown content panel rendered in a portal with a subtle pop animation.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes to merge onto the content.
 * @param {import('react').ReactNode} props.children - Select items or groups.
 * @param {'popper' | 'item-aligned'} [props.position] - Position strategy for the content.
 *
 * @returns {JSX.Element} Rendered select content panel.
 */
export const SelectContent = forwardRef<
  ComponentRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        'relative z-50 max-h-72 min-w-36 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg',
        'data-[state=open]:animate-select-pop',
        position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
        className
      )}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        data-position={position}
        className={cn('p-1', position === 'popper' && 'w-full min-w-[--radix-select-trigger-width]')}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';

/**
 * Selectable item with check indicator and highlight styling.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes to merge onto the item.
 * @param {import('react').ReactNode} props.children - Item label content.
 *
 * @returns {JSX.Element} Rendered select item.
 */
export const SelectItem = forwardRef<
  ComponentRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-none select-none',
      'data-highlighted:bg-pink-50 data-highlighted:text-pink-700',
      'data-disabled:pointer-events-none data-disabled:opacity-50',
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4 text-pink-600" />
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';

/**
 * Label for a group of select items.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes to merge onto the label.
 *
 * @returns {JSX.Element} Rendered select group label.
 */
export const SelectLabel = forwardRef<
  ComponentRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1 text-xs font-semibold text-gray-500', className)}
    {...props}
  />
));
SelectLabel.displayName = 'SelectLabel';

/**
 * Horizontal divider between select items.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes to merge onto the separator.
 *
 * @returns {JSX.Element} Rendered select separator.
 */
export const SelectSeparator = forwardRef<
  ComponentRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-gray-200', className)} {...props} />
));
SelectSeparator.displayName = 'SelectSeparator';

/**
 * Scroll-up button shown when the select content overflows.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes to merge onto the button.
 *
 * @returns {JSX.Element} Rendered scroll-up button.
 */
export const SelectScrollUpButton = forwardRef<
  ComponentRef<typeof SelectPrimitive.ScrollUpButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center bg-white py-1', className)}
    {...props}
  >
    <ChevronUp className="size-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = 'SelectScrollUpButton';

/**
 * Scroll-down button shown when the select content overflows.
 *
 * @param {object} props - Component properties.
 * @param {string} [props.className] - Additional CSS classes to merge onto the button.
 *
 * @returns {JSX.Element} Rendered scroll-down button.
 */
export const SelectScrollDownButton = forwardRef<
  ComponentRef<typeof SelectPrimitive.ScrollDownButton>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center bg-white py-1', className)}
    {...props}
  >
    <ChevronDown className="size-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = 'SelectScrollDownButton';
