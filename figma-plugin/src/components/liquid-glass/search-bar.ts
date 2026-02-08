/**
 * Liquid Glass Search Bar Component
 */

import { getLiquidGlassColors, Theme } from "../../tokens";
import { applyGlassMaterial, GlassMaterial } from "./index";

export interface LiquidGlassSearchBarOptions {
  placeholder?: string;
  value?: string;
  width?: number;
  theme?: Theme;
  material?: GlassMaterial;
  showCancelButton?: boolean;
}

export async function createLiquidGlassSearchBar(
  options: LiquidGlassSearchBarOptions = {}
): Promise<FrameNode> {
  const {
    placeholder = "Search",
    value = "",
    width = 358,
    theme = "light",
    material = "thin",
    showCancelButton = false,
  } = options;

  const colors = getLiquidGlassColors(theme);

  const container = figma.createFrame();
  container.name = "LiquidGlass SearchBar";
  container.layoutMode = "HORIZONTAL";
  container.primaryAxisSizingMode = "FIXED";
  container.counterAxisSizingMode = "AUTO";
  container.resize(width, 36);
  container.itemSpacing = 8;
  container.counterAxisAlignItems = "CENTER";
  container.fills = [];

  // Search field
  const searchField = figma.createFrame();
  searchField.name = "SearchField";
  searchField.layoutMode = "HORIZONTAL";
  searchField.layoutGrow = 1;
  searchField.counterAxisSizingMode = "FIXED";
  searchField.resize(width - (showCancelButton ? 70 : 0), 36);
  searchField.paddingLeft = 10;
  searchField.paddingRight = 10;
  searchField.itemSpacing = 6;
  searchField.counterAxisAlignItems = "CENTER";
  searchField.cornerRadius = 10;

  // Apply glass material
  applyGlassMaterial(searchField, { theme, material, style: theme === "light" ? "light" : "dark" });

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  // Search icon
  const searchIcon = figma.createText();
  searchIcon.fontName = { family: "Inter", style: "Regular" };
  searchIcon.characters = "\uD83D\uDD0D";
  searchIcon.fontSize = 14;
  searchIcon.fills = [{ type: "SOLID", color: colors.secondaryLabelOnGlass.rgb }];
  searchField.appendChild(searchIcon);

  // Text (placeholder or value)
  const text = figma.createText();
  text.fontName = { family: "Inter", style: "Regular" };
  text.characters = value || placeholder;
  text.fontSize = 17;
  text.layoutGrow = 1;
  text.fills = [
    {
      type: "SOLID",
      color: value ? colors.labelOnGlass.rgb : colors.secondaryLabelOnGlass.rgb,
    },
  ];
  searchField.appendChild(text);

  // Clear button (if has value)
  if (value) {
    const clearButton = figma.createFrame();
    clearButton.name = "ClearButton";
    clearButton.resize(18, 18);
    clearButton.cornerRadius = 9;
    clearButton.fills = [
      {
        type: "SOLID",
        color: colors.separatorOnGlass.rgb,
        opacity: 0.5,
      },
    ];

    const clearIcon = figma.createText();
    clearIcon.fontName = { family: "Inter", style: "Medium" };
    clearIcon.characters = "\u00D7";
    clearIcon.fontSize = 14;
    clearIcon.fills = [
      {
        type: "SOLID",
        color: theme === "light" ? { r: 1, g: 1, b: 1 } : { r: 0, g: 0, b: 0 },
      },
    ];
    clearButton.appendChild(clearIcon);
    clearIcon.x = (18 - clearIcon.width) / 2;
    clearIcon.y = (18 - clearIcon.height) / 2;

    searchField.appendChild(clearButton);
  }

  container.appendChild(searchField);

  // Cancel button
  if (showCancelButton) {
    const cancelButton = figma.createText();
    cancelButton.fontName = { family: "Inter", style: "Regular" };
    cancelButton.characters = "Cancel";
    cancelButton.fontSize = 17;
    cancelButton.fills = [{ type: "SOLID", color: colors.liquidBlue.rgb }];
    container.appendChild(cancelButton);
  }

  return container;
}
