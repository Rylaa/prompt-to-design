/**
 * Layout Factory
 * Tüm frame oluşturma BU modülden geçmek ZORUNDA
 * Raw figma.createFrame() YASAK
 */

import type {
  AutoLayoutConfig,
  LayoutSizingConfig,
  FillConfig,
  SpacingConfig,
  SemanticColorToken,
} from "./types";
import { spacing, radius } from "../tokens/spacing";
import { getShadcnColors } from "../tokens";
import type { SpacingKey, RadiusKey } from "../tokens/spacing";

/**
 * Spacing key'i pixel değerine çevir
 */
export function resolveSpacing(key: SpacingKey | undefined): number {
  if (!key) return 0;
  return spacing[key] ?? 0;
}

/**
 * Radius key'i pixel değerine çevir
 */
export function resolveRadius(key: RadiusKey | undefined): number {
  if (!key) return 0;
  return radius[key] ?? 0;
}

/**
 * Semantic fill'i Figma paint'e çevir
 */
export function resolveFill(
  fill: FillConfig | undefined,
  theme: "light" | "dark" = "light"
): Paint[] {
  if (!fill) return [];

  if (fill.type === "SEMANTIC") {
    const colors = getShadcnColors(theme);
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
 * Spacing config'i uygula
 */
function applySpacing(frame: FrameNode, config: SpacingConfig): void {
  // Gap
  frame.itemSpacing = resolveSpacing(config.gap);

  // Padding - shorthand varsa onu kullan
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
 * ANA FACTORY FONKSİYONU
 * Tüm frame oluşturma buradan geçmeli
 */
export function createAutoLayout(config: AutoLayoutConfig): FrameNode {
  const frame = figma.createFrame();

  // İsim
  frame.name = config.name ?? "Frame";

  // ZORUNLU: Auto Layout aktif
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

  // Fill
  if (config.fill) {
    frame.fills = resolveFill(config.fill, config.theme);
  }

  // Corner radius
  if (config.cornerRadius) {
    frame.cornerRadius = resolveRadius(config.cornerRadius);
  }

  // Explicit dimensions (sadece FIXED için)
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

  // Parent'a ekle
  if (config.parent) {
    config.parent.appendChild(frame);
  } else {
    figma.currentPage.appendChild(frame);
  }

  return frame;
}

/**
 * Layout sizing ayarla
 * Auto Layout child'ları için FILL/HUG/FIXED
 */
export function setLayoutSizing(
  node: SceneNode,
  config: LayoutSizingConfig
): void {
  if (!("layoutSizingHorizontal" in node)) return;

  const n = node as FrameNode;

  if (config.horizontal) {
    n.layoutSizingHorizontal = config.horizontal;
  }

  if (config.vertical) {
    n.layoutSizingVertical = config.vertical;
  }
}

/**
 * Mevcut frame'e Auto Layout ekle
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
