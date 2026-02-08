/**
 * Liquid Glass Modal Component
 */

import { getLiquidGlassColors, Theme } from "../../tokens";
import { applyGlassMaterial, GlassMaterial } from "./index";

export interface LiquidGlassModalAction {
  label: string;
  variant?: "default" | "primary" | "destructive";
}

export interface LiquidGlassModalOptions {
  title?: string;
  message?: string;
  actions?: LiquidGlassModalAction[];
  width?: number;
  theme?: Theme;
  material?: GlassMaterial;
}

export async function createLiquidGlassModal(
  options: LiquidGlassModalOptions = {}
): Promise<FrameNode> {
  const {
    title = "Alert",
    message = "This is a modal message.",
    actions = [
      { label: "Cancel", variant: "default" },
      { label: "Confirm", variant: "primary" },
    ],
    width = 300,
    theme = "light",
    material = "thick",
  } = options;

  const colors = getLiquidGlassColors(theme);

  const modal = figma.createFrame();
  modal.name = "LiquidGlass Modal";
  modal.layoutMode = "VERTICAL";
  modal.primaryAxisSizingMode = "AUTO";
  modal.counterAxisSizingMode = "FIXED";
  modal.resize(width, 180);
  modal.cornerRadius = 24;
  modal.paddingTop = 24;
  modal.paddingBottom = 16;
  modal.paddingLeft = 20;
  modal.paddingRight = 20;
  modal.itemSpacing = 16;
  modal.counterAxisAlignItems = "CENTER";

  // Apply glass material with thick blur
  applyGlassMaterial(modal, { theme, material, style: theme === "light" ? "light" : "dark" });

  // Border
  modal.strokes = [
    {
      type: "SOLID",
      color: theme === "light" ? { r: 1, g: 1, b: 1 } : { r: 1, g: 1, b: 1 },
      opacity: theme === "light" ? 0.6 : 0.2,
    },
  ];
  modal.strokeWeight = 1;

  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  // Title
  const titleText = figma.createText();
  titleText.fontName = { family: "Inter", style: "Bold" };
  titleText.characters = title;
  titleText.fontSize = 17;
  titleText.textAlignHorizontal = "CENTER";
  titleText.fills = [{ type: "SOLID", color: colors.labelOnGlass.rgb }];
  modal.appendChild(titleText);

  // Message
  const messageText = figma.createText();
  messageText.fontName = { family: "Inter", style: "Regular" };
  messageText.characters = message;
  messageText.fontSize = 14;
  messageText.textAlignHorizontal = "CENTER";
  messageText.resize(width - 40, messageText.height);
  messageText.textAutoResize = "HEIGHT";
  messageText.fills = [{ type: "SOLID", color: colors.secondaryLabelOnGlass.rgb }];
  modal.appendChild(messageText);

  // Separator
  const separator = figma.createFrame();
  separator.name = "Separator";
  separator.resize(width - 40, 0.5);
  separator.fills = [
    {
      type: "SOLID",
      color: colors.separatorOnGlass.rgb,
      opacity: 0.3,
    },
  ];
  modal.appendChild(separator);

  // Actions row
  const actionsRow = figma.createFrame();
  actionsRow.name = "Actions";
  actionsRow.layoutMode = "HORIZONTAL";
  actionsRow.primaryAxisSizingMode = "FIXED";
  actionsRow.counterAxisSizingMode = "AUTO";
  actionsRow.resize(width - 40, 44);
  actionsRow.itemSpacing = 12;
  actionsRow.fills = [];
  actionsRow.primaryAxisAlignItems = "CENTER";

  for (const action of actions) {
    const button = figma.createFrame();
    button.name = `Action-${action.label}`;
    button.layoutMode = "HORIZONTAL";
    button.layoutGrow = 1;
    button.counterAxisSizingMode = "AUTO";
    button.primaryAxisAlignItems = "CENTER";
    button.counterAxisAlignItems = "CENTER";
    button.paddingTop = 10;
    button.paddingBottom = 10;
    button.cornerRadius = 12;

    // Style based on variant
    if (action.variant === "primary") {
      button.fills = [
        {
          type: "SOLID",
          color: colors.liquidBlue.rgb,
          opacity: 0.15,
        },
      ];
    } else if (action.variant === "destructive") {
      button.fills = [
        {
          type: "SOLID",
          color: colors.liquidRed.rgb,
          opacity: 0.15,
        },
      ];
    } else {
      button.fills = [];
    }

    const buttonLabel = figma.createText();
    buttonLabel.fontName = { family: "Inter", style: "Medium" };
    buttonLabel.characters = action.label;
    buttonLabel.fontSize = 16;

    if (action.variant === "primary") {
      buttonLabel.fills = [{ type: "SOLID", color: colors.liquidBlue.rgb }];
    } else if (action.variant === "destructive") {
      buttonLabel.fills = [{ type: "SOLID", color: colors.liquidRed.rgb }];
    } else {
      buttonLabel.fills = [{ type: "SOLID", color: colors.labelOnGlass.rgb }];
    }

    button.appendChild(buttonLabel);
    actionsRow.appendChild(button);
  }

  modal.appendChild(actionsRow);

  return modal;
}
