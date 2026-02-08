/**
 * shadcn Alert Component
 * Variants: default, destructive
 */

import {
  getShadcnColors,
  shadcnSpacing,
  shadcnTypography,
  getFigmaFontStyle,
  Theme,
} from "../../tokens";
import { resolveThemeFromOptions } from "../../tokens/theme-helpers";

export type AlertVariant = "default" | "destructive";

export interface AlertOptions {
  title?: string;
  description?: string;
  variant?: AlertVariant;
  width?: number;
  theme?: Theme;
}

export async function createShadcnAlert(
  options: AlertOptions = {}
): Promise<FrameNode> {
  const {
    title = "Heads up!",
    description = "You can add components to your app using the cli.",
    variant = "default",
    width = 400,
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const colors = getShadcnColors(theme);
  const isDestructive = variant === "destructive";

  // Create alert frame
  const alert = figma.createFrame();
  alert.name = `Alert/${variant}`;
  alert.layoutMode = "HORIZONTAL";
  alert.primaryAxisSizingMode = "FIXED";
  alert.counterAxisSizingMode = "AUTO";
  alert.resize(width, 80);
  alert.paddingTop = shadcnSpacing.alertPadding;
  alert.paddingBottom = shadcnSpacing.alertPadding;
  alert.paddingLeft = shadcnSpacing.alertPadding;
  alert.paddingRight = shadcnSpacing.alertPadding;
  alert.itemSpacing = 12;
  alert.cornerRadius = 8;

  // Set background and border
  alert.fills = [{ type: "SOLID", color: colors.background.rgb }];
  alert.strokes = [
    {
      type: "SOLID",
      color: isDestructive ? colors.destructive.rgb : colors.border.rgb,
    },
  ];
  alert.strokeWeight = 1;

  // Add icon
  const icon = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  icon.fontName = { family: "Inter", style: "Regular" };
  icon.characters = isDestructive ? "⚠" : "ℹ";
  icon.fontSize = 16;
  icon.fills = [
    {
      type: "SOLID",
      color: isDestructive ? colors.destructive.rgb : colors.foreground.rgb,
    },
  ];
  alert.appendChild(icon);

  // Create content container
  const content = figma.createFrame();
  content.name = "AlertContent";
  content.layoutMode = "VERTICAL";
  content.layoutSizingVertical = "HUG";
  // layoutSizingHorizontal = "FILL" is set after appendChild
  content.layoutGrow = 1;
  content.itemSpacing = 4;
  content.fills = [];

  // Add title
  if (title) {
    const titleText = figma.createText();
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      titleText.fontName = { family: "Inter", style: "Medium" };
    } catch (e) {
      titleText.fontName = { family: "Inter", style: "Regular" };
    }
    titleText.characters = title;
    titleText.fontSize = 14;
    titleText.fills = [
      {
        type: "SOLID",
        color: isDestructive ? colors.destructive.rgb : colors.foreground.rgb,
      },
    ];
    titleText.layoutAlign = "STRETCH";
    content.appendChild(titleText);
  }

  // Add description
  if (description) {
    const descText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    descText.fontName = { family: "Inter", style: "Regular" };
    descText.characters = description;
    descText.fontSize = 14;
    descText.fills = [
      {
        type: "SOLID",
        color: isDestructive
          ? colors.destructive.rgb
          : colors.mutedForeground.rgb,
      },
    ];
    descText.layoutAlign = "STRETCH";
    descText.textAutoResize = "HEIGHT";
    content.appendChild(descText);
  }

  alert.appendChild(content);
  content.layoutSizingHorizontal = "FILL";

  return alert;
}

export async function createShadcnToast(
  options: AlertOptions = {}
): Promise<FrameNode> {
  const {
    title = "Scheduled: Catch up",
    description = "Friday, February 10, 2023 at 5:57 PM",
    variant = "default",
    width = 360,
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const colors = getShadcnColors(theme);
  const isDestructive = variant === "destructive";

  // Create toast frame
  const toast = figma.createFrame();
  toast.name = `Toast/${variant}`;
  toast.layoutMode = "VERTICAL";
  toast.primaryAxisSizingMode = "AUTO";
  toast.counterAxisSizingMode = "FIXED";
  toast.resize(width, 80);
  toast.paddingTop = 16;
  toast.paddingBottom = 16;
  toast.paddingLeft = 16;
  toast.paddingRight = 16;
  toast.itemSpacing = 4;
  toast.cornerRadius = 8;

  // Set background with border and shadow
  toast.fills = [{ type: "SOLID", color: colors.background.rgb }];
  toast.strokes = [{ type: "SOLID", color: colors.border.rgb }];
  toast.strokeWeight = 1;
  toast.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 4 },
      radius: 12,
      spread: -2,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  // Add title
  if (title) {
    const titleText = figma.createText();
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
      titleText.fontName = { family: "Inter", style: "Semi Bold" };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      titleText.fontName = { family: "Inter", style: "Medium" };
    }
    titleText.characters = title;
    titleText.fontSize = 14;
    titleText.fills = [
      {
        type: "SOLID",
        color: isDestructive ? colors.destructive.rgb : colors.foreground.rgb,
      },
    ];
    titleText.layoutAlign = "STRETCH";
    toast.appendChild(titleText);
  }

  // Add description
  if (description) {
    const descText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    descText.fontName = { family: "Inter", style: "Regular" };
    descText.characters = description;
    descText.fontSize = 14;
    descText.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];
    descText.layoutAlign = "STRETCH";
    descText.textAutoResize = "HEIGHT";
    toast.appendChild(descText);
  }

  return toast;
}
