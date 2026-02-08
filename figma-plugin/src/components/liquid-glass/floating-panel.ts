/**
 * Liquid Glass Floating Panel Component
 */

import { getLiquidGlassColors, Theme } from "../../tokens";
import { applyGlassMaterial, GlassMaterial } from "./index";

export interface LiquidGlassFloatingPanelOptions {
  title?: string;
  width?: number;
  height?: number;
  theme?: Theme;
  material?: GlassMaterial;
  showHandle?: boolean;
}

export async function createLiquidGlassFloatingPanel(
  options: LiquidGlassFloatingPanelOptions = {}
): Promise<FrameNode> {
  const {
    title = "Panel",
    width = 320,
    height = 400,
    theme = "light",
    material = "regular",
    showHandle = true,
  } = options;

  const colors = getLiquidGlassColors(theme);

  const panel = figma.createFrame();
  panel.name = "LiquidGlass FloatingPanel";
  panel.layoutMode = "VERTICAL";
  panel.primaryAxisSizingMode = "FIXED";
  panel.counterAxisSizingMode = "FIXED";
  panel.resize(width, height);
  panel.cornerRadius = 20;
  panel.clipsContent = true;

  // Apply glass material
  applyGlassMaterial(panel, { theme, material, style: theme === "light" ? "light" : "dark" });

  // Border
  panel.strokes = [
    {
      type: "SOLID",
      color: theme === "light" ? { r: 1, g: 1, b: 1 } : { r: 1, g: 1, b: 1 },
      opacity: theme === "light" ? 0.5 : 0.2,
    },
  ];
  panel.strokeWeight = 1;

  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  // Header
  const header = figma.createFrame();
  header.name = "Header";
  header.layoutMode = "VERTICAL";
  header.primaryAxisSizingMode = "AUTO";
  header.counterAxisSizingMode = "FIXED";
  header.resize(width, 56);
  header.paddingTop = 12;
  header.paddingBottom = 12;
  header.paddingLeft = 16;
  header.paddingRight = 16;
  header.itemSpacing = 8;
  header.counterAxisAlignItems = "CENTER";
  header.fills = [];

  // Drag handle
  if (showHandle) {
    const handle = figma.createFrame();
    handle.name = "DragHandle";
    handle.resize(36, 5);
    handle.cornerRadius = 2.5;
    handle.fills = [
      {
        type: "SOLID",
        color: colors.separatorOnGlass.rgb,
        opacity: 0.5,
      },
    ];
    header.appendChild(handle);
  }

  // Title
  const titleText = figma.createText();
  titleText.fontName = { family: "Inter", style: "Bold" };
  titleText.characters = title;
  titleText.fontSize = 17;
  titleText.fills = [{ type: "SOLID", color: colors.labelOnGlass.rgb }];
  header.appendChild(titleText);

  panel.appendChild(header);

  // Separator
  const separator = figma.createFrame();
  separator.name = "Separator";
  separator.resize(width, 0.5);
  separator.fills = [
    {
      type: "SOLID",
      color: colors.separatorOnGlass.rgb,
      opacity: 0.3,
    },
  ];
  panel.appendChild(separator);

  // Content area
  const content = figma.createFrame();
  content.name = "Content";
  content.layoutMode = "VERTICAL";
  content.layoutGrow = 1;
  content.counterAxisSizingMode = "FIXED";
  content.resize(width, height - 56);
  content.paddingTop = 16;
  content.paddingBottom = 16;
  content.paddingLeft = 16;
  content.paddingRight = 16;
  content.itemSpacing = 12;
  content.fills = [];
  panel.appendChild(content);

  return panel;
}
