/**
 * Apple macOS Component Library
 * Re-exports all macOS components
 */

// Import all components
import { createMacOSWindow, createMacOSTitleBar, createMacOSSidebar, type WindowOptions, type WindowVariant } from "./window";
import { createMacOSButton, createMacOSCheckbox, createMacOSTextField, type MacOSButtonOptions, type MacOSButtonStyle } from "./button";
import {
  createMacOSToolbar,
  createMacOSSegmentedControl,
  createMacOSPopUpButton,
  createMacOSRadio,
  createMacOSSlider,
  createMacOSTableView,
  type ToolbarOptions,
  type MacOSSegmentedControlOptions,
  type PopUpButtonOptions,
  type MacOSRadioOptions,
  type MacOSSliderOptions,
  type TableViewOptions,
} from "./controls";

// Re-export all
export {
  createMacOSWindow, createMacOSTitleBar, createMacOSSidebar, type WindowOptions, type WindowVariant,
  createMacOSButton, createMacOSCheckbox, createMacOSTextField, type MacOSButtonOptions, type MacOSButtonStyle,
  createMacOSToolbar, type ToolbarOptions,
  createMacOSSegmentedControl, type MacOSSegmentedControlOptions,
  createMacOSPopUpButton, type PopUpButtonOptions,
  createMacOSRadio, type MacOSRadioOptions,
  createMacOSSlider, type MacOSSliderOptions,
  createMacOSTableView, type TableViewOptions,
};

// Component registry for dynamic lookup
export const macosComponents: Record<string, Function> = {
  window: createMacOSWindow,
  "title-bar": createMacOSTitleBar,
  sidebar: createMacOSSidebar,
  button: createMacOSButton,
  checkbox: createMacOSCheckbox,
  "text-field": createMacOSTextField,
  toolbar: createMacOSToolbar,
  "segmented-control": createMacOSSegmentedControl,
  "pop-up-button": createMacOSPopUpButton,
  radio: createMacOSRadio,
  slider: createMacOSSlider,
  "table-view": createMacOSTableView,
};

// Helper to create macOS component by name
export async function createMacOSComponent(
  componentName: string,
  options: Record<string, unknown> = {}
): Promise<SceneNode | null> {
  const createFn = macosComponents[componentName];
  if (!createFn) {
    console.error(`Unknown macOS component: ${componentName}`);
    return null;
  }
  return createFn(options);
}

// List all available macOS components
export function listMacOSComponents(): string[] {
  return Object.keys(macosComponents);
}
