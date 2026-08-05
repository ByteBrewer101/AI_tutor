"use client"

import { Select as SelectPrimitive } from "@base-ui/react/select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

function Select({ className, ...props }) {
  return <SelectPrimitive.Root data-slot="select" className={className} {...props} />
}

function SelectTrigger({ className, children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'w-full flex items-center justify-between gap-2 bg-transparent border-b border-walnut/40 focus:border-pine',
        'font-body text-base py-1.5 outline-none text-ink cursor-pointer transition-colors duration-150',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="shrink-0 text-walnut" data-slot="select-icon">
        <ChevronDown size={16} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectValue({ className, ...props }) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('truncate', className)}
      {...props}
    />
  )
}

function SelectPortal({ ...props }) {
  return <SelectPrimitive.Portal data-slot="select-portal" {...props} />
}

function SelectPositioner({ className, ...props }) {
  return (
    <SelectPrimitive.Positioner
      data-slot="select-positioner"
      side="bottom"
      align="start"
      sideOffset={4}
      positionMethod="fixed"
      alignItemWithTrigger={false}
      className={cn('z-50 outline-none', className)}
      {...props}
    />
  )
}

function SelectPopup({ className, children, ...props }) {
  return (
    <SelectPortal>
      <SelectPositioner>
        <SelectPrimitive.Popup
          data-slot="select-popup"
          className={cn(
            'min-w-[--anchor-width] bg-popover border border-walnut/20 rounded-[2px] shadow-hard p-1',
            'text-sm text-popover-foreground outline-none',
            className
          )}
          {...props}
        >
          <SelectPrimitive.List data-slot="select-list" className="outline-none">
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPositioner>
    </SelectPortal>
  )
}

function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-[2px] font-body text-base cursor-pointer',
        'outline-none select-none transition-colors',
        'data-highlighted:bg-pine/10 data-highlighted:text-pine',
        'data-selected:font-medium data-selected:text-ink',
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator
        data-slot="select-item-indicator"
        className="shrink-0 text-pine"
      >
        <Check size={14} />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText data-slot="select-item-text" className="truncate">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectPositioner,
  SelectPopup,
  SelectItem,
}
