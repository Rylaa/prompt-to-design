/**
 * Layout Factory
 * ALL frame creation MUST go through this module
 * Direct figma.createFrame() is FORBIDDEN
 */

import type {
  AutoLayoutConfig,
  LayoutSizingConfig,
  FillConfig,
  SpacingConfig,
  SemanticColorToken,
} from "./types";
import { spacing, radius } from "../tokens/spacing";
import { getShadcnColors, themeManager } from "../tokens";
import type { SpacingKey, RadiusKey } from "../tokens/spacing";

/**
 * Convert spacing key to pixel value
 */
export function resolveSpacing(key: SpacingKey | undefined): number {
  if (!key) return 0;
  return spacing[key] ?? 0;
}

/**
 * Convert radius key to pixel value
 */
export function resolveRadius(key: RadiusKey | undefined): number {
  if (!key) return 0;
  return radius[key] ?? 0;
}

/**
 * Convert semantic fill to Figma paint
 */
export function resolveFill(
  fill: FillConfig | undefined,
  theme?: "light" | "dark"
): Paint[] {
  if (!fill) return [];

  const resolvedTheme = theme ?? (themeManager.getTheme() === "light" ? "light" : "dark");

  if (fill.type === "SEMANTIC") {
    const colors = getShadcnColors(resolvedTheme);
    const colorToken = colors[fill.token as keyof typeof colors];
    if (colorToken && "rgb" in colorToken) {
      return [
        {
          type: "SOLID",
          color: colorToken.rgb,
          opacity: fill.opacity ?? 1,
        },
      ];
    }
    return [];
  }

  if (fill.type === "SOLID") {
    return [
      {
        type: "SOLID",
        color: fill.color,
        opacity: fill.opacity ?? 1,
      },
    ];
  }

  return [];
}

/**
 * Apply spacing config
 */
function applySpacing(frame: FrameNode, config: SpacingConfig): void {
  // Gap
  frame.itemSpacing = resolveSpacing(config.gap);

  // Padding - use shorthand if provided
  if (config.padding) {
    const p = resolveSpacing(config.padding);
    frame.paddingTop = p;
    frame.paddingRight = p;
    frame.paddingBottom = p;
    frame.paddingLeft = p;
  } else {
    frame.paddingTop = resolveSpacing(config.paddingTop);
    frame.paddingRight = resolveSpacing(config.paddingRight);
    frame.paddingBottom = resolveSpacing(config.paddingBottom);
    frame.paddingLeft = resolveSpacing(config.paddingLeft);
  }
}

/**
 * MAIN FACTORY FUNCTION
 * All frame creation should go through here
 */
export function createAutoLayout(config: AutoLayoutConfig): FrameNode {
  const frame = figma.createFrame();

  // Name
  frame.name = config.name ?? "Frame";

  // REQUIRED: Auto Layout active
  frame.layoutMode = config.direction;

  // Sizing modes
  frame.primaryAxisSizingMode =
    config.primaryAxisSizing === "FIXED" ? "FIXED" : "AUTO";
  frame.counterAxisSizingMode =
    config.counterAxisSizing === "FIXED" ? "FIXED" : "AUTO";

  // Alignment
  frame.primaryAxisAlignItems = config.primaryAxisAlign ?? "MIN";
  frame.counterAxisAlignItems = config.counterAxisAlign ?? "MIN";

  // Spacing
  applySpacing(frame, config.spacing);

  // Fill - if not specified, TRANSPARENT (Figma default is white, we override this)
  if (config.fill) {
    frame.fills = resolveFill(config.fill, config.theme);
  } else {
    frame.fills = []; // Transparent - for child frames
  }

  // Corner radius
  if (config.cornerRadius) {
    frame.cornerRadius = resolveRadius(config.cornerRadius);
  }

  // Explicit dimensions (only for FIXED)
  if (config.width && config.primaryAxisSizing === "FIXED") {
    frame.resize(config.width, frame.height);
  }
  if (config.height && config.counterAxisSizing === "FIXED") {
    frame.resize(frame.width, config.height);
  }

  // Handle FIXED sizing with explicit dimensions for both axes
  if (config.width && config.height) {
    if (config.direction === "HORIZONTAL") {
      // For HORIZONTAL: width is primary, height is counter
      if (config.primaryAxisSizing === "FIXED") {
        frame.resize(config.width, frame.height);
      }
      if (config.counterAxisSizing === "FIXED") {
        frame.resize(frame.width, config.height);
      }
    } else {
      // For VERTICAL: height is primary, width is counter
      if (config.primaryAxisSizing === "FIXED") {
        frame.resize(frame.width, config.height);
      }
      if (config.counterAxisSizing === "FIXED") {
        frame.resize(config.width, frame.height);
      }
    }
  }

  // Add to parent
  if (config.parent) {
    config.parent.appendChild(frame);
  } else {
    figma.currentPage.appendChild(frame);
  }

  return frame;
}

/**
 * Set layout sizing
 * FILL/HUG/FIXED for Auto Layout children
 */
export function setLayoutSizing(
  node: SceneNode,
  config: LayoutSizingConfig
): void {
  if (!("layoutSizingHorizontal" in node)) return;

  // Validate parent has auto-layout for FILL sizing
  if ((config.horizontal === "FILL" || config.vertical === "FILL") && node.parent) {
    if (!("layoutMode" in node.parent)) {
      console.warn(
        `[layout-factory] Cannot set FILL sizing: parent "${node.parent.name}" does not support auto-layout`
      );
      return; // Silently skip instead of error - factory is internal
    }
    if ((node.parent as FrameNode).layoutMode === "NONE") {
      console.warn(
        `[layout-factory] Cannot set FILL sizing: parent "${node.parent.name}" has layoutMode: NONE`
      );
      return; // Silently skip instead of error - factory is internal
    }
  }

  const n = node as FrameNode;

  if (config.horizontal) {
    n.layoutSizingHorizontal = config.horizontal;
  }

  if (config.vertical) {
    n.layoutSizingVertical = config.vertical;
  }
}

/**
 * Add Auto Layout to existing frame
 */
export function enableAutoLayout(
  frame: FrameNode,
  direction: "VERTICAL" | "HORIZONTAL",
  spacingConfig: SpacingConfig
): void {
  frame.layoutMode = direction;
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  applySpacing(frame, spacingConfig);
}

/**
 * Create semantic fill config helper
 */
export function semanticFill(
  token: SemanticColorToken,
  opacity?: number
): FillConfig {
  return {
    type: "SEMANTIC",
    token,
    opacity,
  };
}

/**
 * Create solid fill config helper
 */
export function solidFill(
  r: number,
  g: number,
  b: number,
  opacity?: number
): FillConfig {
  return {
    type: "SOLID",
    color: { r, g, b },
    opacity,
  };
}
