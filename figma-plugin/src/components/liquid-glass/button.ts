/**
 * Liquid Glass Button Component
 */

import { getLiquidGlassColors, Theme } from "../../tokens";
import { applyGlassMaterial, GlassStyle } from "./index";

export interface LiquidGlassButtonOptions {
  text?: string;
  variant?: "primary" | "secondary" | "tinted";
  size?: "small" | "medium" | "large";
  theme?: Theme;
  iconName?: string;
}

export async function createLiquidGlassButton(
  options: LiquidGlassButtonOptions = {}
): Promise<FrameNode> {
  const {
    text = "Button",
    variant = "primary",
    size = "medium",
    theme = "light",
  } = options;

  const colors = getLiquidGlassColors(theme);

  // Size configurations
  const sizes = {
    small: { height: 32, paddingX: 12, fontSize: 14, radius: 16 },
    medium: { height: 44, paddingX: 20, fontSize: 17, radius: 22 },
    large: { height: 54, paddingX: 28, fontSize: 17, radius: 27 },
  };
  const sizeConfig = sizes[size];

  const button = figma.createFrame();
  button.name = `LiquidGlass Button - ${variant}`;
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";
  button.paddingLeft = sizeConfig.paddingX;
  button.paddingRight = sizeConfig.paddingX;
  button.primaryAxisSizingMode = "AUTO";
  button.counterAxisSizingMode = "FIXED";
  button.resize(100, sizeConfig.height);
  button.cornerRadius = sizeConfig.radius;

  // Apply glass material based on variant
  const glassStyle: GlassStyle = variant === "tinted" ? "tinted" : (theme === "light" ? "light" : "dark");
  applyGlassMaterial(button, {
    theme,
    material: "regular",
    style: glassStyle,
    tintColor: variant === "tinted" ? colors.liquidBlue.hex : undefined,
  });

  // Add subtle stroke
  button.strokes = [
    {
      type: "SOLID",
      color: theme === "light"
        ? { r: 1, g: 1, b: 1 }
        : { r: 1, g: 1, b: 1 },
      opacity: theme === "light" ? 0.3 : 0.15,
    },
  ];
  button.strokeWeight = 0.5;

  // Text
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  const label = figma.createText();
  label.fontName = { family: "Inter", style: "Medium" };
  label.characters = text;
  label.fontSize = sizeConfig.fontSize;

  // Text color
  if (variant === "primary") {
    label.fills = [{ type: "SOLID", color: colors.liquidBlue.rgb }];
  } else if (variant === "tinted") {
    label.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  } else {
    label.fills = [{ type: "SOLID", color: colors.labelOnGlass.rgb }];
  }

  button.appendChild(label);
  return button;
}
