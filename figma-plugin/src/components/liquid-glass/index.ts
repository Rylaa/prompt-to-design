/**
 * iOS 26 Liquid Glass Component Library
 * Implements Apple's new Liquid Glass design language
 */

import {
  getLiquidGlassColors,
  getLiquidGlassEffects,
  Theme,
} from "../../tokens";

// ============================================================================
// Types
// ============================================================================

export type GlassMaterial = "thin" | "regular" | "thick" | "ultraThin";
export type GlassStyle = "light" | "dark" | "tinted";

export interface GlassOptions {
  theme?: Theme;
  material?: GlassMaterial;
  style?: GlassStyle;
  tintColor?: string;
}

// ============================================================================
// Utility Functions (shared by all components)
// ============================================================================

function getBlurRadius(material: GlassMaterial, theme: Theme): number {
  const effects = getLiquidGlassEffects(theme);
  switch (material) {
    case "ultraThin":
      return 10;
    case "thin":
      return effects.thinMaterialBlur;
    case "regular":
      return effects.regularMaterialBlur;
    case "thick":
      return effects.thickMaterialBlur;
    default:
      return effects.regularMaterialBlur;
  }
}

function getGlassOpacity(style: GlassStyle, theme: Theme): number {
  const effects = getLiquidGlassEffects(theme);
  if (style === "tinted") {
    return effects.accentTintOpacity;
  }
  return theme === "light" ? effects.lightGlassOpacity : effects.darkGlassOpacity;
}

// Apply glass material effects to a frame
export function applyGlassMaterial(
  frame: FrameNode,
  options: GlassOptions = {}
): void {
  const {
    theme = "light",
    material = "regular",
    style = "light",
    tintColor,
  } = options;

  const colors = getLiquidGlassColors(theme);
  const effects = getLiquidGlassEffects(theme);
  const blurRadius = getBlurRadius(material, theme);
  const opacity = getGlassOpacity(style, theme);

  // Determine fill color based on style
  let fillColor = style === "dark" ? colors.glassDark.rgb : colors.glassLight.rgb;
  if (style === "tinted" && tintColor) {
    // Parse hex color
    const hex = tintColor.replace("#", "");
    fillColor = {
      r: parseInt(hex.substring(0, 2), 16) / 255,
      g: parseInt(hex.substring(2, 4), 16) / 255,
      b: parseInt(hex.substring(4, 6), 16) / 255,
    };
  } else if (style === "tinted") {
    fillColor = colors.glassAccent.rgb;
  }

  // Apply semi-transparent fill
  frame.fills = [
    {
      type: "SOLID",
      color: fillColor,
      opacity: opacity,
    },
  ];

  // Apply effects: blur + shadow + specular highlight
  frame.effects = [
    // Background blur
    {
      type: "BACKGROUND_BLUR",
      blurType: "NORMAL",
      radius: blurRadius,
      visible: true,
    } as const,
    // Drop shadow for depth
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: effects.glassShadowOpacity },
      offset: { x: 0, y: effects.glassShadowOffsetY },
      radius: effects.glassShadowBlur,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    },
    // Inner glow / specular highlight
    {
      type: "INNER_SHADOW",
      color: { r: 1, g: 1, b: 1, a: effects.specularOpacity },
      offset: { x: 0, y: 1 },
      radius: 0,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    },
  ];
}

// ============================================================================
// Re-export components from individual modules
// ============================================================================

export { createLiquidGlassButton, type LiquidGlassButtonOptions } from "./button";
export { createLiquidGlassTabBar, type LiquidGlassTabBarOptions, type LiquidGlassTabBarItem } from "./tab-bar";
export { createLiquidGlassNavBar, type LiquidGlassNavBarOptions } from "./navigation-bar";
export { createLiquidGlassCard, type LiquidGlassCardOptions } from "./card";
export { createLiquidGlassToggle, type LiquidGlassToggleOptions } from "./toggle";
export { createLiquidGlassSidebar, type LiquidGlassSidebarOptions, type LiquidGlassSidebarItem } from "./sidebar";
export { createLiquidGlassFloatingPanel, type LiquidGlassFloatingPanelOptions } from "./floating-panel";
export { createLiquidGlassModal, type LiquidGlassModalOptions, type LiquidGlassModalAction } from "./modal";
export { createLiquidGlassSearchBar, type LiquidGlassSearchBarOptions } from "./search-bar";
export { createLiquidGlassToolbar, type LiquidGlassToolbarOptions, type LiquidGlassToolbarItem } from "./toolbar";

// ============================================================================
// Component Registry
// ============================================================================

// We need local references for the registry object
import { createLiquidGlassButton as _button } from "./button";
import { createLiquidGlassTabBar as _tabBar } from "./tab-bar";
import { createLiquidGlassNavBar as _navBar } from "./navigation-bar";
import { createLiquidGlassCard as _card } from "./card";
import { createLiquidGlassToggle as _toggle } from "./toggle";
import { createLiquidGlassSidebar as _sidebar } from "./sidebar";
import { createLiquidGlassFloatingPanel as _floatingPanel } from "./floating-panel";
import { createLiquidGlassModal as _modal } from "./modal";
import { createLiquidGlassSearchBar as _searchBar } from "./search-bar";
import { createLiquidGlassToolbar as _toolbar } from "./toolbar";

export const liquidGlassComponents: Record<string, Function> = {
  button: _button,
  "tab-bar": _tabBar,
  "navigation-bar": _navBar,
  card: _card,
  toggle: _toggle,
  sidebar: _sidebar,
  "floating-panel": _floatingPanel,
  modal: _modal,
  "search-bar": _searchBar,
  toolbar: _toolbar,
};

// Helper to create component by name
export async function createLiquidGlassComponent(
  componentName: string,
  options: Record<string, unknown> = {}
): Promise<SceneNode | null> {
  const createFn = liquidGlassComponents[componentName];
  if (!createFn) {
    console.error(`Unknown Liquid Glass component: ${componentName}`);
    return null;
  }
  return createFn(options);
}

// List all available components
export function listLiquidGlassComponents(): string[] {
  return Object.keys(liquidGlassComponents);
}
