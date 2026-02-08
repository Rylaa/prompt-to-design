/**
 * shadcn Breadcrumb Component
 * Items with separator, active item bold
 */

import {
  getShadcnColors,
  shadcnSpacing,
  shadcnTypography,
  getFigmaFontStyle,
  Theme,
} from "../../tokens";
import { resolveThemeFromOptions } from "../../tokens/theme-helpers";

export interface BreadcrumbItem {
  label: string;
  active?: boolean;
}

export interface BreadcrumbOptions {
  items?: BreadcrumbItem[];
  separator?: "/" | ">" | "chevron";
  theme?: Theme;
}

export async function createShadcnBreadcrumb(
  options: BreadcrumbOptions = {}
): Promise<FrameNode> {
  const {
    items = [
      { label: "Home" },
      { label: "Products" },
      { label: "Details", active: true },
    ],
    separator = "/",
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const colors = getShadcnColors(theme);

  // Create breadcrumb container
  const container = figma.createFrame();
  container.name = "Breadcrumb";
  container.layoutMode = "HORIZONTAL";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "AUTO";
  container.counterAxisAlignItems = "CENTER";
  container.itemSpacing = 8;
  container.fills = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isActive = item.active ?? (i === items.length - 1);

    // Create item text
    const textNode = figma.createText();
    const typo = shadcnTypography.small;

    try {
      const fontStyle = isActive
        ? getFigmaFontStyle(600)
        : getFigmaFontStyle(typo.weight);
      await figma.loadFontAsync({ family: typo.family, style: fontStyle });
      textNode.fontName = { family: typo.family, style: fontStyle };
    } catch {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      textNode.fontName = { family: "Inter", style: "Regular" };
    }

    textNode.characters = item.label;
    textNode.fontSize = typo.size;
    textNode.fills = [
      {
        type: "SOLID",
        color: isActive ? colors.foreground.rgb : colors.mutedForeground.rgb,
      },
    ];

    container.appendChild(textNode);

    // Add separator between items (not after last)
    if (i < items.length - 1) {
      const sepText = figma.createText();
      try {
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        sepText.fontName = { family: "Inter", style: "Regular" };
      } catch {
        // fallback already loaded
      }

      const sepChar = separator === "chevron" ? "›" : separator;
      sepText.characters = sepChar;
      sepText.fontSize = typo.size;
      sepText.fills = [
        {
          type: "SOLID",
          color: colors.mutedForeground.rgb,
        },
      ];

      container.appendChild(sepText);
    }
  }

  return container;
}
