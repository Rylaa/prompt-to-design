/**
 * Apple iOS Button Component
 * Styles: filled, tinted, gray, plain
 */

import {
  getIOSColors,
  iosSpacing,
  iosTypography,
  getFigmaFontStyle,
  Theme,
} from "../../tokens";

export type IOSButtonStyle = "filled" | "tinted" | "gray" | "plain";
export type IOSButtonSize = "small" | "medium" | "large";

export interface IOSButtonOptions {
  text?: string;
  style?: IOSButtonStyle;
  size?: IOSButtonSize;
  icon?: string;
  disabled?: boolean;
  theme?: Theme;
}

function getButtonColors(style: IOSButtonStyle, theme: Theme) {
  const colors = getIOSColors(theme);

  switch (style) {
    case "filled":
      return {
        background: colors.systemBlue.hex,
        foreground: "#FFFFFF",
      };
    case "tinted":
      return {
        background: theme === "light"
          ? "rgba(0, 122, 255, 0.15)"
          : "rgba(10, 132, 255, 0.25)",
        foreground: colors.systemBlue.hex,
      };
    case "gray":
      return {
        background: colors.systemGray5.hex,
        foreground: colors.systemBlue.hex,
      };
    case "plain":
      return {
        background: "transparent",
        foreground: colors.systemBlue.hex,
      };
    default:
      return {
        background: colors.systemBlue.hex,
        foreground: "#FFFFFF",
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

export async function createIOSButton(
  options: IOSButtonOptions = {}
): Promise<FrameNode> {
  const {
    text = "Button",
    style = "filled",
    size = "medium",
    icon,
    disabled = false,
    theme = "light",
  } = options;

  const buttonColors = getButtonColors(style, theme);
  const colors = getIOSColors(theme);

  // Size configurations
  const sizeConfig = {
    small: { height: 28, paddingX: 12, fontSize: 15 },
    medium: { height: 44, paddingX: 16, fontSize: 17 },
    large: { height: 50, paddingX: 20, fontSize: 17 },
  };

  const config = sizeConfig[size];

  // Create button frame
  const button = figma.createFrame();
  button.name = `iOS Button/${style}`;
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";
  button.primaryAxisSizingMode = "AUTO";
  button.counterAxisSizingMode = "FIXED";
  button.resize(100, config.height);
  button.paddingLeft = config.paddingX;
  button.paddingRight = config.paddingX;
  button.itemSpacing = 6;
  button.cornerRadius = style === "filled" ? 12 : 8;

  // Set background
  if (buttonColors.background === "transparent") {
    button.fills = [];
  } else if (buttonColors.background.startsWith("rgba")) {
    // Handle tinted background
    const blueRgb = hexToRgb(colors.systemBlue.hex);
    button.fills = [
      {
        type: "SOLID",
        color: blueRgb,
        opacity: theme === "light" ? 0.15 : 0.25,
      },
    ];
  } else {
    button.fills = [
      {
        type: "SOLID",
        color: hexToRgb(buttonColors.background),
        opacity: disabled ? 0.5 : 1,
      },
    ];
  }

  // Add icon if provided
  if (icon) {
    const iconText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    iconText.fontName = { family: "Inter", style: "Regular" };
    iconText.characters = icon;
    iconText.fontSize = config.fontSize;
    iconText.fills = [
      {
        type: "SOLID",
        color: hexToRgb(buttonColors.foreground),
        opacity: disabled ? 0.5 : 1,
      },
    ];
    button.appendChild(iconText);
  }

  // Add text
  const textNode = figma.createText();
  const typography = iosTypography.body;

  try {
    await figma.loadFontAsync({
      family: "SF Pro Text",
      style: getFigmaFontStyle(typography.weight),
    });
    textNode.fontName = {
      family: "SF Pro Text",
      style: getFigmaFontStyle(typography.weight),
    };
  } catch (e) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    textNode.fontName = { family: "Inter", style: "Regular" };
  }

  textNode.characters = text;
  textNode.fontSize = config.fontSize;
  textNode.fills = [
    {
      type: "SOLID",
      color: hexToRgb(buttonColors.foreground),
      opacity: disabled ? 0.5 : 1,
    },
  ];

  button.appendChild(textNode);

  return button;
}
