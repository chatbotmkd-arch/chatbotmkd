// Type augmentation for Radix UI components to accept className and other HTML attributes
// This is needed because newer Radix UI versions changed their type definitions

import "react";

declare module "@radix-ui/react-accordion" {
  interface AccordionSingleProps {
    className?: string;
    children?: React.ReactNode;
  }
  interface AccordionMultipleProps {
    className?: string;
    children?: React.ReactNode;
  }
  interface AccordionItemProps {
    className?: string;
    children?: React.ReactNode;
  }
  interface AccordionTriggerProps {
    className?: string;
    children?: React.ReactNode;
  }
  interface AccordionContentProps {
    className?: string;
    children?: React.ReactNode;
  }
}

declare module "@radix-ui/react-alert-dialog" {
  interface AlertDialogOverlayProps { className?: string; }
  interface AlertDialogContentProps { className?: string; children?: React.ReactNode; }
  interface AlertDialogTitleProps { className?: string; children?: React.ReactNode; }
  interface AlertDialogDescriptionProps { className?: string; children?: React.ReactNode; }
  interface AlertDialogActionProps { className?: string; children?: React.ReactNode; }
  interface AlertDialogCancelProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-avatar" {
  interface AvatarProps { className?: string; children?: React.ReactNode; }
  interface AvatarImageProps { className?: string; }
  interface AvatarFallbackProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-checkbox" {
  interface CheckboxProps { className?: string; children?: React.ReactNode; }
  interface CheckboxIndicatorProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-collapsible" {
  interface CollapsibleProps { className?: string; children?: React.ReactNode; }
  interface CollapsibleTriggerProps { className?: string; children?: React.ReactNode; }
  interface CollapsibleContentProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-context-menu" {
  interface ContextMenuContentProps { className?: string; children?: React.ReactNode; }
  interface ContextMenuItemProps { className?: string; children?: React.ReactNode; }
  interface ContextMenuCheckboxItemProps { className?: string; children?: React.ReactNode; }
  interface ContextMenuRadioItemProps { className?: string; children?: React.ReactNode; }
  interface ContextMenuLabelProps { className?: string; children?: React.ReactNode; }
  interface ContextMenuSeparatorProps { className?: string; }
  interface ContextMenuSubTriggerProps { className?: string; children?: React.ReactNode; }
  interface ContextMenuSubContentProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-dialog" {
  interface DialogOverlayProps { className?: string; }
  interface DialogContentProps { className?: string; children?: React.ReactNode; }
  interface DialogTitleProps { className?: string; children?: React.ReactNode; }
  interface DialogDescriptionProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-dropdown-menu" {
  interface DropdownMenuContentProps { className?: string; children?: React.ReactNode; }
  interface DropdownMenuItemProps { className?: string; children?: React.ReactNode; }
  interface DropdownMenuCheckboxItemProps { className?: string; children?: React.ReactNode; }
  interface DropdownMenuRadioItemProps { className?: string; children?: React.ReactNode; }
  interface DropdownMenuLabelProps { className?: string; children?: React.ReactNode; }
  interface DropdownMenuSeparatorProps { className?: string; }
  interface DropdownMenuSubTriggerProps { className?: string; children?: React.ReactNode; }
  interface DropdownMenuSubContentProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-hover-card" {
  interface HoverCardContentProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-label" {
  interface LabelProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-menubar" {
  interface MenubarMenuProps { className?: string; children?: React.ReactNode; }
  interface MenubarTriggerProps { className?: string; children?: React.ReactNode; }
  interface MenubarContentProps { className?: string; children?: React.ReactNode; }
  interface MenubarItemProps { className?: string; children?: React.ReactNode; }
  interface MenubarSeparatorProps { className?: string; }
  interface MenubarLabelProps { className?: string; children?: React.ReactNode; }
  interface MenubarCheckboxItemProps { className?: string; children?: React.ReactNode; }
  interface MenubarRadioItemProps { className?: string; children?: React.ReactNode; }
  interface MenubarSubTriggerProps { className?: string; children?: React.ReactNode; }
  interface MenubarSubContentProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-navigation-menu" {
  interface NavigationMenuProps { className?: string; children?: React.ReactNode; }
  interface NavigationMenuListProps { className?: string; children?: React.ReactNode; }
  interface NavigationMenuTriggerProps { className?: string; children?: React.ReactNode; }
  interface NavigationMenuContentProps { className?: string; children?: React.ReactNode; }
  interface NavigationMenuLinkProps { className?: string; children?: React.ReactNode; }
  interface NavigationMenuViewportProps { className?: string; }
  interface NavigationMenuIndicatorProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-popover" {
  interface PopoverContentProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-progress" {
  interface ProgressProps { className?: string; children?: React.ReactNode; }
  interface ProgressIndicatorProps { className?: string; style?: React.CSSProperties; }
}

declare module "@radix-ui/react-radio-group" {
  interface RadioGroupProps { className?: string; children?: React.ReactNode; }
  interface RadioGroupItemProps { className?: string; children?: React.ReactNode; }
  interface RadioGroupIndicatorProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-scroll-area" {
  interface ScrollAreaProps { className?: string; children?: React.ReactNode; }
  interface ScrollAreaViewportProps { className?: string; children?: React.ReactNode; }
  interface ScrollAreaScrollbarProps { className?: string; children?: React.ReactNode; }
  interface ScrollAreaThumbProps { className?: string; }
}

declare module "@radix-ui/react-select" {
  interface SelectTriggerProps { className?: string; children?: React.ReactNode; }
  interface SelectContentProps { className?: string; children?: React.ReactNode; }
  interface SelectItemProps { className?: string; children?: React.ReactNode; }
  interface SelectLabelProps { className?: string; children?: React.ReactNode; }
  interface SelectSeparatorProps { className?: string; }
  interface SelectScrollUpButtonProps { className?: string; children?: React.ReactNode; }
  interface SelectScrollDownButtonProps { className?: string; children?: React.ReactNode; }
  interface SelectViewportProps { className?: string; children?: React.ReactNode; }
  interface SelectItemIndicatorProps { className?: string; children?: React.ReactNode; }
  interface SelectValueProps { className?: string; placeholder?: string; }
}

declare module "@radix-ui/react-separator" {
  interface SeparatorProps { className?: string; }
}

declare module "@radix-ui/react-slider" {
  interface SliderProps { className?: string; children?: React.ReactNode; }
  interface SliderTrackProps { className?: string; children?: React.ReactNode; }
  interface SliderRangeProps { className?: string; }
  interface SliderThumbProps { className?: string; }
}

declare module "@radix-ui/react-switch" {
  interface SwitchProps { className?: string; children?: React.ReactNode; }
  interface SwitchThumbProps { className?: string; }
}

declare module "@radix-ui/react-tabs" {
  interface TabsListProps { className?: string; children?: React.ReactNode; }
  interface TabsTriggerProps { className?: string; children?: React.ReactNode; }
  interface TabsContentProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-toast" {
  interface ToastProps { className?: string; children?: React.ReactNode; }
  interface ToastActionProps { className?: string; children?: React.ReactNode; }
  interface ToastCloseProps { className?: string; children?: React.ReactNode; }
  interface ToastTitleProps { className?: string; children?: React.ReactNode; }
  interface ToastDescriptionProps { className?: string; children?: React.ReactNode; }
  interface ToastViewportProps { className?: string; }
}

declare module "@radix-ui/react-toggle" {
  interface ToggleProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-toggle-group" {
  interface ToggleGroupSingleProps { className?: string; children?: React.ReactNode; }
  interface ToggleGroupMultipleProps { className?: string; children?: React.ReactNode; }
  interface ToggleGroupItemProps { className?: string; children?: React.ReactNode; }
}

declare module "@radix-ui/react-tooltip" {
  interface TooltipContentProps { className?: string; children?: React.ReactNode; }
  interface TooltipTriggerProps { className?: string; children?: React.ReactNode; }
}
