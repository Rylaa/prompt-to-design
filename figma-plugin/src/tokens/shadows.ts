/**
 * Design Token System - Shadows
 * Shadow presets for depth and elevation
 */

import { hexToRgb } from "./colors";

export interface ShadowToken {
  type: "DROP_SHADOW" | "INNER_SHADOW";
  color: { r: number; g: number; b: number; a: number };
  offset: { x: number; y: number };
  blur: number;
  spread: number;
}

export interface ShadowPreset {
  name: string;
  shadows: ShadowToken[];
}

// Helper to create shadow token
function createShadow(
  offsetX: number,
  offsetY: number,
  blur: number,
  spread: number,
  colorHex: string,
  opacity: number,
  type: "DROP_SHADOW" | "INNER_SHADOW" = "DROP_SHADOW"
): ShadowToken {
  const rgb = hexToRgb(colorHex);
  return {
    type,
    color: { ...rgb, a: opacity },
    offset: { x: offsetX, y: offsetY },
    blur,
    spread,
  };
}

// shadcn Shadow Presets
export const shadcnShadows: Record<string, ShadowPreset> = {
  sm: {
    name: "Shadow SM",
    shadows: [createShadow(0, 1, 2, 0, "#000000", 0.05)],
  },
  default: {
    name: "Shadow Default",
    shadows: [
      createShadow(0, 1, 3, 0, "#000000", 0.1),
      createShadow(0, 1, 2, -1, "#000000", 0.1),
    ],
  },
  md: {
    name: "Shadow MD",
    shadows: [
      createShadow(0, 4, 6, -1, "#000000", 0.1),
      createShadow(0, 2, 4, -2, "#000000", 0.1),
    ],
  },
  lg: {
    name: "Shadow LG",
    shadows: [
      createShadow(0, 10, 15, -3, "#000000", 0.1),
      createShadow(0, 4, 6, -4, "#000000", 0.1),
    ],
  },
  xl: {
    name: "Shadow XL",
    shadows: [
      createShadow(0, 20, 25, -5, "#000000", 0.1),
      createShadow(0, 8, 10, -6, "#000000", 0.1),
    ],
  },
  "2xl": {
    name: "Shadow 2XL",
    shadows: [createShadow(0, 25, 50, -12, "#000000", 0.25)],
  },
  inner: {
    name: "Shadow Inner",
    shadows: [createShadow(0, 2, 4, 0, "#000000", 0.05, "INNER_SHADOW")],
  },
  none: {
    name: "No Shadow",
    shadows: [],
  },
};

// iOS Shadow Presets (based on Apple HIG)
export const iosShadowsLight: Record<string, ShadowPreset> = {
  // Card shadow
  card: {
    name: "iOS Card",
    shadows: [
      createShadow(0, 0.5, 0, 0, "#000000", 0.04),
      createShadow(0, 0, 0, 0.5, "#000000", 0.08),
    ],
  },
  // Modal/Sheet shadow
  modal: {
    name: "iOS Modal",
    shadows: [createShadow(0, -3, 15, 0, "#000000", 0.15)],
  },
  // Navigation bar shadow
  navBar: {
    name: "iOS Navigation Bar",
    shadows: [createShadow(0, 0.5, 0, 0, "#000000", 0.3)],
  },
  // Tab bar shadow
  tabBar: {
    name: "iOS Tab Bar",
    shadows: [createShadow(0, -0.5, 0, 0, "#000000", 0.3)],
  },
  // Button pressed state
  buttonPressed: {
    name: "iOS Button Pressed",
    shadows: [createShadow(0, 1, 2, 0, "#000000", 0.1, "INNER_SHADOW")],
  },
  // Floating button
  floatingButton: {
    name: "iOS Floating Button",
    shadows: [
      createShadow(0, 4, 8, 0, "#000000", 0.12),
      createShadow(0, 2, 4, 0, "#000000", 0.08),
    ],
  },
  // Menu/Popover
  menu: {
    name: "iOS Menu",
    shadows: [
      createShadow(0, 10, 40, 0, "#000000", 0.2),
      createShadow(0, 2, 6, 0, "#000000", 0.1),
    ],
  },
  // Action sheet
  actionSheet: {
    name: "iOS Action Sheet",
    shadows: [createShadow(0, -5, 20, 0, "#000000", 0.15)],
  },
};

export const iosShadowsDark: Record<string, ShadowPreset> = {
  card: {
    name: "iOS Card Dark",
    shadows: [
      createShadow(0, 0.5, 0, 0, "#000000", 0.2),
      createShadow(0, 0, 0, 0.5, "#000000", 0.3),
    ],
  },
  modal: {
    name: "iOS Modal Dark",
    shadows: [createShadow(0, -3, 20, 0, "#000000", 0.4)],
  },
  navBar: {
    name: "iOS Navigation Bar Dark",
    shadows: [createShadow(0, 0.5, 0, 0, "#000000", 0.5)],
  },
  tabBar: {
    name: "iOS Tab Bar Dark",
    shadows: [createShadow(0, -0.5, 0, 0, "#000000", 0.5)],
  },
  buttonPressed: {
    name: "iOS Button Pressed Dark",
    shadows: [createShadow(0, 1, 2, 0, "#000000", 0.2, "INNER_SHADOW")],
  },
  floatingButton: {
    name: "iOS Floating Button Dark",
    shadows: [
      createShadow(0, 4, 12, 0, "#000000", 0.3),
      createShadow(0, 2, 6, 0, "#000000", 0.2),
    ],
  },
  menu: {
    name: "iOS Menu Dark",
    shadows: [
      createShadow(0, 10, 50, 0, "#000000", 0.5),
      createShadow(0, 2, 8, 0, "#000000", 0.3),
    ],
  },
  actionSheet: {
    name: "iOS Action Sheet Dark",
    shadows: [createShadow(0, -5, 30, 0, "#000000", 0.4)],
  },
};

// macOS Shadow Presets
export const macOSShadowsLight: Record<string, ShadowPreset> = {
  // Window shadow
  window: {
    name: "macOS Window",
    shadows: [
      createShadow(0, 20, 60, 0, "#000000", 0.2),
      createShadow(0, 10, 20, 0, "#000000", 0.1),
    ],
  },
  // Floating panel
  panel: {
    name: "macOS Panel",
    shadows: [
      createShadow(0, 10, 30, 0, "#000000", 0.15),
      createShadow(0, 5, 10, 0, "#000000", 0.08),
    ],
  },
  // Menu shadow
  menu: {
    name: "macOS Menu",
    shadows: [
      createShadow(0, 5, 20, 0, "#000000", 0.15),
      createShadow(0, 0, 0, 0.5, "#000000", 0.05),
    ],
  },
  // Tooltip shadow
  tooltip: {
    name: "macOS Tooltip",
    shadows: [createShadow(0, 2, 8, 0, "#000000", 0.12)],
  },
  // Popover shadow
  popover: {
    name: "macOS Popover",
    shadows: [
      createShadow(0, 4, 16, 0, "#000000", 0.12),
      createShadow(0, 0, 0, 0.5, "#000000", 0.08),
    ],
  },
  // Button focus ring (not a shadow but similar)
  focusRing: {
    name: "macOS Focus Ring",
    shadows: [createShadow(0, 0, 0, 3, "#007AFF", 0.5)],
  },
  // Sidebar item hover
  sidebarHover: {
    name: "macOS Sidebar Hover",
    shadows: [],
  },
  // Dock shadow
  dock: {
    name: "macOS Dock",
    shadows: [createShadow(0, 2, 10, 0, "#000000", 0.2)],
  },
};

export const macOSShadowsDark: Record<string, ShadowPreset> = {
  window: {
    name: "macOS Window Dark",
    shadows: [
      createShadow(0, 20, 80, 0, "#000000", 0.5),
      createShadow(0, 10, 30, 0, "#000000", 0.3),
    ],
  },
  panel: {
    name: "macOS Panel Dark",
    shadows: [
      createShadow(0, 10, 40, 0, "#000000", 0.4),
      createShadow(0, 5, 15, 0, "#000000", 0.2),
    ],
  },
  menu: {
    name: "macOS Menu Dark",
    shadows: [
      createShadow(0, 5, 25, 0, "#000000", 0.4),
      createShadow(0, 0, 0, 0.5, "#000000", 0.15),
    ],
  },
  tooltip: {
    name: "macOS Tooltip Dark",
    shadows: [createShadow(0, 2, 10, 0, "#000000", 0.3)],
  },
  popover: {
    name: "macOS Popover Dark",
    shadows: [
      createShadow(0, 4, 20, 0, "#000000", 0.3),
      createShadow(0, 0, 0, 0.5, "#000000", 0.2),
    ],
  },
  focusRing: {
    name: "macOS Focus Ring Dark",
    shadows: [createShadow(0, 0, 0, 3, "#0A84FF", 0.5)],
  },
  sidebarHover: {
    name: "macOS Sidebar Hover Dark",
    shadows: [],
  },
  dock: {
    name: "macOS Dock Dark",
    shadows: [createShadow(0, 2, 15, 0, "#000000", 0.4)],
  },
};

// Helper to get shadow by platform and theme
export function getShadow(
  platform: "shadcn" | "ios" | "macos",
  theme: "light" | "dark",
  name: string
): ShadowPreset | undefined {
  switch (platform) {
    case "shadcn":
      return shadcnShadows[name];
    case "ios":
      return theme === "light" ? iosShadowsLight[name] : iosShadowsDark[name];
    case "macos":
      return theme === "light"
        ? macOSShadowsLight[name]
        : macOSShadowsDark[name];
    default:
      return undefined;
  }
}

// Convert shadow tokens to Figma effects
export function shadowsToFigmaEffects(shadows: ShadowToken[]): Effect[] {
  return shadows.map((shadow) => ({
    type: shadow.type,
    color: shadow.color,
    offset: shadow.offset,
    radius: shadow.blur,
    spread: shadow.spread,
    visible: true,
    blendMode: "NORMAL" as BlendMode,
  }));
}
