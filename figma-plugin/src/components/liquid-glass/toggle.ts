/**
 * Liquid Glass Toggle (Control Center) Component
 */

import { getLiquidGlassColors, Theme } from "../../tokens";
import { applyGlassMaterial } from "./index";

export interface LiquidGlassToggleOptions {
  icon?: string;
  label?: string;
  isActive?: boolean;
  size?: number;
  theme?: Theme;
}

export async function createLiquidGlassToggle(
  options: LiquidGlassToggleOptions = {}
): Promise<FrameNode> {
  const {
    icon = "W",
    label = "Wi-Fi",
    isActive = true,
    size = 62,
    theme = "light",
  } = options;

  const colors = getLiquidGlassColors(theme);

  const toggle = figma.createFrame();
  toggle.name = `LiquidGlass Toggle - ${label}`;
  toggle.layoutMode = "VERTICAL";
  toggle.primaryAxisSizingMode = "FIXED";
  toggle.counterAxisSizingMode = "FIXED";
  toggle.resize(size, size);
  toggle.cornerRadius = size / 4;
  toggle.primaryAxisAlignItems = "CENTER";
  toggle.counterAxisAlignItems = "CENTER";

  // Active state uses tinted glass, inactive uses regular
  if (isActive) {
    applyGlassMaterial(toggle, {
      theme,
      material: "regular",
      style: "tinted",
      tintColor: colors.liquidBlue.hex,
    });
  } else {
    applyGlassMaterial(toggle, { theme, material: "regular", style: theme === "light" ? "light" : "dark" });
  }

  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  // Icon
  const iconText = figma.createText();
  iconText.fontName = { family: "Inter", style: "Medium" };
  iconText.characters = icon;
  iconText.fontSize = 24;
  iconText.fills = [
    {
      type: "SOLID",
      color: isActive ? { r: 1, g: 1, b: 1 } : colors.labelOnGlass.rgb,
    },
  ];
  toggle.appendChild(iconText);

  return toggle;
}
