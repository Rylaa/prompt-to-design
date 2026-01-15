/**
 * Apple iOS Component Library
 * Re-exports all iOS components
 */

// Import all components
import { createIOSButton, type IOSButtonOptions, type IOSButtonStyle, type IOSButtonSize } from "./button";
import { createIOSNavigationBar, createIOSSearchBar, type NavBarOptions, type NavBarVariant } from "./navigation-bar";
import { createIOSTabBar, type TabBarOptions, type TabBarItem } from "./tab-bar";
import { createIOSCell, createIOSToggle, createIOSList, type CellOptions, type ListOptions, type CellStyle, type ListStyle } from "./list";
import {
  createIOSSegmentedControl,
  createIOSStepper,
  createIOSSlider,
  createIOSPicker,
  createIOSTextField,
  createIOSActivityIndicator,
  type SegmentedControlOptions,
  type StepperOptions,
  type IOSSliderOptions,
  type PickerOptions,
  type TextFieldOptions,
  type ActivityIndicatorOptions,
} from "./controls";
import {
  createIOSActionSheet,
  createIOSAlert,
  type ActionSheetOptions,
  type AlertDialogOptions,
} from "./action-sheet";

// Re-export all
export {
  createIOSButton, type IOSButtonOptions, type IOSButtonStyle, type IOSButtonSize,
  createIOSNavigationBar, createIOSSearchBar, type NavBarOptions, type NavBarVariant,
  createIOSTabBar, type TabBarOptions, type TabBarItem,
  createIOSCell, createIOSToggle, createIOSList, type CellOptions, type ListOptions, type CellStyle, type ListStyle,
  createIOSSegmentedControl, type SegmentedControlOptions,
  createIOSStepper, type StepperOptions,
  createIOSSlider, type IOSSliderOptions,
  createIOSPicker, type PickerOptions,
  createIOSTextField, type TextFieldOptions,
  createIOSActivityIndicator, type ActivityIndicatorOptions,
  createIOSActionSheet, type ActionSheetOptions,
  createIOSAlert, type AlertDialogOptions,
};

// Component registry for dynamic lookup
export const iosComponents: Record<string, Function> = {
  button: createIOSButton,
  "navigation-bar": createIOSNavigationBar,
  "search-bar": createIOSSearchBar,
  "tab-bar": createIOSTabBar,
  cell: createIOSCell,
  toggle: createIOSToggle,
  list: createIOSList,
  "segmented-control": createIOSSegmentedControl,
  stepper: createIOSStepper,
  slider: createIOSSlider,
  picker: createIOSPicker,
  "text-field": createIOSTextField,
  "activity-indicator": createIOSActivityIndicator,
  "action-sheet": createIOSActionSheet,
  alert: createIOSAlert,
};

// Helper to create iOS component by name
export async function createIOSComponent(
  componentName: string,
  options: Record<string, unknown> = {}
): Promise<SceneNode | null> {
  const createFn = iosComponents[componentName];
  if (!createFn) {
    console.error(`Unknown iOS component: ${componentName}`);
    return null;
  }
  return createFn(options);
}

// List all available iOS components
export function listIOSComponents(): string[] {
  return Object.keys(iosComponents);
}
