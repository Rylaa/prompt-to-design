/**
 * shadcn Button Component
 * Variants: default, destructive, outline, secondary, ghost, link
 * Sizes: default, sm, lg, icon
 */

import {
  getShadcnColors,
  shadcnSpacing,
  shadcnTypography,
  shadcnShadows,
  colorTokenToPaint,
  getFigmaFontStyle,
  Theme,
} from "../../tokens";
import { resolveThemeFromOptions } from "../../tokens/theme-helpers";

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonOptions {
  text?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  theme?: Theme;
}

interface ButtonStyleConfig {
  background: string;
  foreground: string;
  border?: string;
  hoverBackground?: string;
}

function getButtonStyles(
  variant: ButtonVariant,
  theme: Theme
): ButtonStyleConfig {
  const colors = getShadcnColors(theme);

  switch (variant) {
    case "default":
      return {
        background: colors.primary.hex,
        foreground: colors.primaryForeground.hex,
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
        border: colors.input.hex,
      };
    case "secondary":
      return {
        background: colors.secondary.hex,
        foreground: colors.secondaryForeground.hex,
      };
    case "ghost":
      return {
        background: "transparent",
        foreground: colors.foreground.hex,
      };
    case "link":
      return {
        background: "transparent",
        foreground: colors.primary.hex,
      };
    default:
      return {
        background: colors.primary.hex,
        foreground: colors.primaryForeground.hex,
      };
  }
}

function getSizeConfig(
  size: ButtonSize
): { height: number; paddingX: number; paddingY: number; fontSize: number } {
  switch (size) {
    case "sm":
      return {
        height: shadcnSpacing.buttonHeightSm,
        paddingX: shadcnSpacing.buttonPaddingSm,
        paddingY: 0,
        fontSize: shadcnTypography.buttonSm.size,
      };
    case "lg":
      return {
        height: shadcnSpacing.buttonHeightLg,
        paddingX: shadcnSpacing.buttonPaddingLg,
        paddingY: 0,
        fontSize: shadcnTypography.buttonLg.size,
      };
    case "icon":
      return {
        height: shadcnSpacing.buttonHeightIcon,
        paddingX: 0,
        paddingY: 0,
        fontSize: shadcnTypography.button.size,
      };
    default:
      return {
        height: shadcnSpacing.buttonHeightDefault,
        paddingX: shadcnSpacing.buttonPaddingDefault,
        paddingY: 0,
        fontSize: shadcnTypography.button.size,
      };
  }
}

export async function createShadcnButton(
  options: ButtonOptions = {}
): Promise<FrameNode> {
  const {
    text = "Button",
    variant = "default",
    size = "default",
    icon,
    disabled = false,
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const styles = getButtonStyles(variant, theme);
  const sizeConfig = getSizeConfig(size);
  const colors = getShadcnColors(theme);

  // Create button frame
  const button = figma.createFrame();
  button.name = `Button/${variant}`;
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";
  button.primaryAxisSizingMode = "AUTO";
  button.counterAxisSizingMode = "FIXED";
  button.resize(
    size === "icon" ? sizeConfig.height : 100,
    sizeConfig.height
  );
  button.paddingLeft = size === "icon" ? 0 : sizeConfig.paddingX;
  button.paddingRight = size === "icon" ? 0 : sizeConfig.paddingX;
  button.itemSpacing = 8;
  button.cornerRadius = 6;

  // Set background
  if (styles.background === "transparent") {
    button.fills = [];
  } else {
    button.fills = [
      {
        type: "SOLID",
        color: {
          r: parseInt(styles.background.slice(1, 3), 16) / 255,
          g: parseInt(styles.background.slice(3, 5), 16) / 255,
          b: parseInt(styles.background.slice(5, 7), 16) / 255,
        },
        opacity: disabled ? 0.5 : 1,
      },
    ];
  }

  // Set border for outline variant
  if (styles.border) {
    button.strokes = [
      {
        type: "SOLID",
        color: {
          r: parseInt(styles.border.slice(1, 3), 16) / 255,
          g: parseInt(styles.border.slice(3, 5), 16) / 255,
          b: parseInt(styles.border.slice(5, 7), 16) / 255,
        },
      },
    ];
    button.strokeWeight = 1;
  }

  // Add icon if provided (for icon variant or leading icon)
  if (icon && size === "icon") {
    const iconText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    iconText.fontName = { family: "Inter", style: "Regular" };
    iconText.characters = icon;
    iconText.fontSize = 16;
    iconText.fills = [
      {
        type: "SOLID",
        color: {
          r: parseInt(styles.foreground.slice(1, 3), 16) / 255,
          g: parseInt(styles.foreground.slice(3, 5), 16) / 255,
          b: parseInt(styles.foreground.slice(5, 7), 16) / 255,
        },
      },
    ];
    button.appendChild(iconText);
  } else {
    // Add text
    const textNode = figma.createText();
    const fontStyle = getFigmaFontStyle(shadcnTypography.button.weight);

    try {
      await figma.loadFontAsync({
        family: shadcnTypography.button.family,
        style: fontStyle,
      });
      textNode.fontName = {
        family: shadcnTypography.button.family,
        style: fontStyle,
      };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      textNode.fontName = { family: "Inter", style: "Medium" };
    }

    textNode.characters = text;
    textNode.fontSize = sizeConfig.fontSize;
    textNode.fills = [
      {
        type: "SOLID",
        color: {
          r: parseInt(styles.foreground.slice(1, 3), 16) / 255,
          g: parseInt(styles.foreground.slice(3, 5), 16) / 255,
          b: parseInt(styles.foreground.slice(5, 7), 16) / 255,
        },
        opacity: disabled ? 0.5 : 1,
      },
    ];

    // Add underline for link variant
    if (variant === "link") {
      textNode.textDecoration = "UNDERLINE";
    }

    button.appendChild(textNode);
  }

  return button;
}
