/**
 * shadcn Badge Component
 * Variants: default, secondary, destructive, outline
 */

import {
  getShadcnColors,
  shadcnSpacing,
  shadcnTypography,
  getFigmaFontStyle,
  Theme,
} from "../../tokens";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeOptions {
  text?: string;
  variant?: BadgeVariant;
  theme?: Theme;
}

interface BadgeStyleConfig {
  background: string;
  foreground: string;
  border?: string;
}

function getBadgeStyles(
  variant: BadgeVariant,
  theme: Theme
): BadgeStyleConfig {
  const colors = getShadcnColors(theme);

  switch (variant) {
    case "default":
      return {
        background: colors.primary.hex,
        foreground: colors.primaryForeground.hex,
      };
    case "secondary":
      return {
        background: colors.secondary.hex,
        foreground: colors.secondaryForeground.hex,
      };
    case "destructive":
      return {
        background: colors.destructive.hex,
        foreground: colors.destructiveForeground.hex,
      };
    case "outline":
      return {
        background: "transparent",
        foreground: colors.foreground.hex,
        border: colors.border.hex,
      };
    default:
      return {
        background: colors.primary.hex,
        foreground: colors.primaryForeground.hex,
      };
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

export async function createShadcnBadge(
  options: BadgeOptions = {}
): Promise<FrameNode> {
  const { text = "Badge", variant = "default", theme = "light" } = options;

  const styles = getBadgeStyles(variant, theme);

  // Create badge frame
  const badge = figma.createFrame();
  badge.name = `Badge/${variant}`;
  badge.layoutMode = "HORIZONTAL";
  badge.primaryAxisAlignItems = "CENTER";
  badge.counterAxisAlignItems = "CENTER";
  badge.primaryAxisSizingMode = "AUTO";
  badge.counterAxisSizingMode = "AUTO";
  badge.paddingLeft = shadcnSpacing.badgePaddingX;
  badge.paddingRight = shadcnSpacing.badgePaddingX;
  badge.paddingTop = shadcnSpacing.badgePaddingY;
  badge.paddingBottom = shadcnSpacing.badgePaddingY;
  badge.cornerRadius = 9999; // pill shape

  // Set background
  if (styles.background === "transparent") {
    badge.fills = [];
  } else {
    badge.fills = [
      {
        type: "SOLID",
        color: hexToRgb(styles.background),
      },
    ];
  }

  // Set border for outline variant
  if (styles.border) {
    badge.strokes = [
      {
        type: "SOLID",
        color: hexToRgb(styles.border),
      },
    ];
    badge.strokeWeight = 1;
  }

  // Add text
  const textNode = figma.createText();
  const textStyle = shadcnTypography.small;

  try {
    await figma.loadFontAsync({
      family: textStyle.family,
      style: getFigmaFontStyle(textStyle.weight),
    });
    textNode.fontName = {
      family: textStyle.family,
      style: getFigmaFontStyle(textStyle.weight),
    };
  } catch (e) {
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    textNode.fontName = { family: "Inter", style: "Medium" };
  }

  textNode.characters = text;
  textNode.fontSize = 12;
  textNode.fills = [
    {
      type: "SOLID",
      color: hexToRgb(styles.foreground),
    },
  ];

  badge.appendChild(textNode);

  return badge;
}
