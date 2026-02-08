/**
 * Liquid Glass Card Component
 */

import { Theme } from "../../tokens";
import { applyGlassMaterial, GlassMaterial } from "./index";

export interface LiquidGlassCardOptions {
  width?: number;
  height?: number;
  padding?: number;
  cornerRadius?: number;
  theme?: Theme;
  material?: GlassMaterial;
}

export async function createLiquidGlassCard(
  options: LiquidGlassCardOptions = {}
): Promise<FrameNode> {
  const {
    width = 340,
    height,
    padding = 20,
    cornerRadius = 20,
    theme = "light",
    material = "regular",
  } = options;

  const card = figma.createFrame();
  card.name = "LiquidGlass Card";
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = height ? "FIXED" : "AUTO";
  card.counterAxisSizingMode = "FIXED";
  card.resize(width, height || 200);
  card.paddingTop = padding;
  card.paddingBottom = padding;
  card.paddingLeft = padding;
  card.paddingRight = padding;
  card.itemSpacing = 12;
  card.cornerRadius = cornerRadius;

  // Apply glass material
  applyGlassMaterial(card, { theme, material, style: theme === "light" ? "light" : "dark" });

  // Subtle stroke
  card.strokes = [
    {
      type: "SOLID",
      color: theme === "light"
        ? { r: 1, g: 1, b: 1 }
        : { r: 1, g: 1, b: 1 },
      opacity: theme === "light" ? 0.5 : 0.2,
    },
  ];
  card.strokeWeight = 1;

  return card;
}
