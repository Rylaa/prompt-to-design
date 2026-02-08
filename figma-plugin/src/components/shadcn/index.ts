/**
 * shadcn Component Library
 * Re-exports all shadcn components
 */

// Import all component creators
import { createShadcnButton, type ButtonOptions, type ButtonVariant, type ButtonSize } from "./button";
import { createShadcnInput, createShadcnTextarea, type InputOptions, type InputVariant } from "./input";
import { createShadcnCard, createCardHeader, createCardContent, createCardFooter, type CardOptions } from "./card";
import { createShadcnBadge, type BadgeOptions, type BadgeVariant } from "./badge";
import { createShadcnAvatar, createAvatarGroup, type AvatarOptions, type AvatarSize, type AvatarStatus } from "./avatar";
import { createShadcnCheckbox, createShadcnRadio, type CheckboxOptions } from "./checkbox";
import { createShadcnSwitch, type SwitchOptions } from "./switch";
import { createShadcnProgress, createShadcnSlider, createShadcnSkeleton, type ProgressOptions } from "./progress";
import { createShadcnAlert, createShadcnToast, type AlertOptions, type AlertVariant } from "./alert";
import { createShadcnTabs, createShadcnSeparator, type TabsOptions } from "./tabs";
import { createShadcnDialog, createShadcnSheet, type DialogOptions } from "./dialog";
import { createShadcnSelect, createShadcnDropdownMenu, type SelectOptions } from "./select";
import { createShadcnTooltip, createShadcnPopover, type TooltipOptions, type PopoverOptions } from "./tooltip";
import { createShadcnTable, createShadcnDataTable, type TableOptions } from "./table";
import { createShadcnAccordion, createShadcnCollapsible, type AccordionOptions, type CollapsibleOptions } from "./accordion";
import { createShadcnBreadcrumb, type BreadcrumbOptions, type BreadcrumbItem } from "./breadcrumb";
import { createShadcnPagination, type PaginationOptions } from "./pagination";

// Re-export all
export {
  createShadcnButton, type ButtonOptions, type ButtonVariant, type ButtonSize,
  createShadcnInput, createShadcnTextarea, type InputOptions, type InputVariant,
  createShadcnCard, createCardHeader, createCardContent, createCardFooter, type CardOptions,
  createShadcnBadge, type BadgeOptions, type BadgeVariant,
  createShadcnAvatar, createAvatarGroup, type AvatarOptions, type AvatarSize, type AvatarStatus,
  createShadcnCheckbox, createShadcnRadio, type CheckboxOptions,
  createShadcnSwitch, type SwitchOptions,
  createShadcnProgress, createShadcnSlider, createShadcnSkeleton, type ProgressOptions,
  createShadcnAlert, createShadcnToast, type AlertOptions, type AlertVariant,
  createShadcnTabs, createShadcnSeparator, type TabsOptions,
  createShadcnDialog, createShadcnSheet, type DialogOptions,
  createShadcnSelect, createShadcnDropdownMenu, type SelectOptions,
  createShadcnTooltip, createShadcnPopover, type TooltipOptions, type PopoverOptions,
  createShadcnTable, createShadcnDataTable, type TableOptions,
  createShadcnAccordion, createShadcnCollapsible, type AccordionOptions, type CollapsibleOptions,
  createShadcnBreadcrumb, type BreadcrumbOptions, type BreadcrumbItem,
  createShadcnPagination, type PaginationOptions,
};

// Component registry for dynamic lookup
export const shadcnComponents: Record<string, Function> = {
  button: createShadcnButton,
  input: createShadcnInput,
  textarea: createShadcnTextarea,
  card: createShadcnCard,
  badge: createShadcnBadge,
  avatar: createShadcnAvatar,
  "avatar-group": createAvatarGroup,
  checkbox: createShadcnCheckbox,
  radio: createShadcnRadio,
  switch: createShadcnSwitch,
  progress: createShadcnProgress,
  slider: createShadcnSlider,
  skeleton: createShadcnSkeleton,
  alert: createShadcnAlert,
  toast: createShadcnToast,
  tabs: createShadcnTabs,
  separator: createShadcnSeparator,
  dialog: createShadcnDialog,
  sheet: createShadcnSheet,
  select: createShadcnSelect,
  "dropdown-menu": createShadcnDropdownMenu,
  tooltip: createShadcnTooltip,
  popover: createShadcnPopover,
  table: createShadcnTable,
  "data-table": createShadcnDataTable,
  accordion: createShadcnAccordion,
  collapsible: createShadcnCollapsible,
  breadcrumb: createShadcnBreadcrumb,
  pagination: createShadcnPagination,
};

// Helper to create shadcn component by name
export async function createShadcnComponent(
  componentName: string,
  options: Record<string, unknown> = {}
): Promise<SceneNode | null> {
  const createFn = shadcnComponents[componentName];
  if (!createFn) {
    console.error(`Unknown shadcn component: ${componentName}`);
    return null;
  }
  return createFn(options);
}

// List all available shadcn components
export function listShadcnComponents(): string[] {
  return Object.keys(shadcnComponents);
}
