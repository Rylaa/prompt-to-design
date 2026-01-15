/**
 * Component Library - Main Entry
 * Re-exports all component libraries
 */

// Re-export all component libraries
export * from "./shadcn";
export * from "./apple-ios";
export * from "./apple-macos";
export * from "./liquid-glass";

// Import component registries
import { shadcnComponents, createShadcnComponent, listShadcnComponents } from "./shadcn";
import { iosComponents, createIOSComponent, listIOSComponents } from "./apple-ios";
import { macosComponents, createMacOSComponent, listMacOSComponents } from "./apple-macos";
import { liquidGlassComponents, createLiquidGlassComponent, listLiquidGlassComponents } from "./liquid-glass";

// Library types
export type ComponentLibrary = "shadcn" | "ios" | "macos" | "liquid-glass";

// Unified component registry
export const componentLibraries: Record<ComponentLibrary, Record<string, Function>> = {
  shadcn: shadcnComponents,
  ios: iosComponents,
  macos: macosComponents,
  "liquid-glass": liquidGlassComponents,
};

// Helper to create component from any library
export async function createComponent(
  library: ComponentLibrary,
  componentName: string,
  options: Record<string, unknown> = {}
): Promise<SceneNode | null> {
  switch (library) {
    case "shadcn":
      return createShadcnComponent(componentName, options);
    case "ios":
      return createIOSComponent(componentName, options);
    case "macos":
      return createMacOSComponent(componentName, options);
    case "liquid-glass":
      return createLiquidGlassComponent(componentName, options);
    default:
      console.error(`Unknown library: ${library}`);
      return null;
  }
}

// List all components from a library
export function listComponents(library?: ComponentLibrary): Record<string, string[]> {
  if (library) {
    switch (library) {
      case "shadcn":
        return { shadcn: listShadcnComponents() };
      case "ios":
        return { ios: listIOSComponents() };
      case "macos":
        return { macos: listMacOSComponents() };
      case "liquid-glass":
        return { "liquid-glass": listLiquidGlassComponents() };
      default:
        return {};
    }
  }

  return {
    shadcn: listShadcnComponents(),
    ios: listIOSComponents(),
    macos: listMacOSComponents(),
    "liquid-glass": listLiquidGlassComponents(),
  };
}

// Get component info
export interface ComponentInfo {
  library: ComponentLibrary;
  name: string;
  available: boolean;
}

export function getComponentInfo(
  library: ComponentLibrary,
  componentName: string
): ComponentInfo {
  const components = componentLibraries[library];
  return {
    library,
    name: componentName,
    available: componentName in components,
  };
}
