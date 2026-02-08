/**
 * Liquid Glass Toolbar Component
 */

import { getLiquidGlassColors, Theme } from "../../tokens";
import { applyGlassMaterial, GlassMaterial } from "./index";

export interface LiquidGlassToolbarItem {
  icon: string;
  label?: string;
  isActive?: boolean;
  isDisabled?: boolean;
}

export interface LiquidGlassToolbarOptions {
  items?: LiquidGlassToolbarItem[];
  width?: number;
  theme?: Theme;
  material?: GlassMaterial;
  showLabels?: boolean;
}

export async function createLiquidGlassToolbar(
  options: LiquidGlassToolbarOptions = {}
): Promise<FrameNode> {
  const {
    items = [
      { icon: "B", label: "Bold" },
      { icon: "I", label: "Italic" },
      { icon: "U", label: "Underline" },
      { icon: "S", label: "Strike" },
      { icon: "L", label: "Link", isActive: true },
    ],
    width = 390,
    theme = "light",
    material = "thin",
    showLabels = false,
  } = options;

  const colors = getLiquidGlassColors(theme);

  const toolbar = figma.createFrame();
  toolbar.name = "LiquidGlass Toolbar";
  toolbar.layoutMode = "HORIZONTAL";
  toolbar.primaryAxisSizingMode = "FIXED";
  toolbar.counterAxisSizingMode = "AUTO";
  toolbar.resize(width, 44);
  toolbar.paddingLeft = 16;
  toolbar.paddingRight = 16;
  toolbar.paddingTop = 8;
  toolbar.paddingBottom = 8;
  toolbar.itemSpacing = 8;
  toolbar.counterAxisAlignItems = "CENTER";

  // Apply glass material
  applyGlassMaterial(toolbar, { theme, material, style: theme === "light" ? "light" : "dark" });

  // Top border
  toolbar.strokes = [
    {
      type: "SOLID",
      color: colors.separatorOnGlass.rgb,
      opacity: 0.3,
    },
  ];
  toolbar.strokeWeight = 0.5;
  toolbar.strokeTopWeight = 0.5;
  toolbar.strokeBottomWeight = 0;
  toolbar.strokeLeftWeight = 0;
  toolbar.strokeRightWeight = 0;

  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  for (const item of items) {
    const toolItem = figma.createFrame();
    toolItem.name = `Tool-${item.label || item.icon}`;
    toolItem.layoutMode = showLabels ? "VERTICAL" : "HORIZONTAL";
    toolItem.primaryAxisSizingMode = "AUTO";
    toolItem.counterAxisSizingMode = "AUTO";
    toolItem.paddingLeft = 10;
    toolItem.paddingRight = 10;
    toolItem.paddingTop = 4;
    toolItem.paddingBottom = 4;
    toolItem.itemSpacing = 2;
    toolItem.primaryAxisAlignItems = "CENTER";
    toolItem.counterAxisAlignItems = "CENTER";
    toolItem.cornerRadius = 8;

    // Background for active state
    if (item.isActive) {
      toolItem.fills = [
        {
          type: "SOLID",
          color: colors.liquidBlue.rgb,
          opacity: 0.15,
        },
      ];
    } else {
      toolItem.fills = [];
    }

    // Icon
    const iconText = figma.createText();
    iconText.fontName = { family: "Inter", style: "Medium" };
    iconText.characters = item.icon;
    iconText.fontSize = 18;

    const iconColor = item.isDisabled
      ? colors.secondaryLabelOnGlass.rgb
      : item.isActive
        ? colors.liquidBlue.rgb
        : colors.labelOnGlass.rgb;
    iconText.fills = [{ type: "SOLID", color: iconColor, opacity: item.isDisabled ? 0.5 : 1 }];
    toolItem.appendChild(iconText);

    // Label
    if (showLabels && item.label) {
      const label = figma.createText();
      label.fontName = { family: "Inter", style: "Regular" };
      label.characters = item.label;
      label.fontSize = 10;
      label.fills = [
        {
          type: "SOLID",
          color: item.isActive ? colors.liquidBlue.rgb : colors.secondaryLabelOnGlass.rgb,
          opacity: item.isDisabled ? 0.5 : 1,
        },
      ];
      toolItem.appendChild(label);
    }

    toolbar.appendChild(toolItem);
  }

  return toolbar;
}
