/**
 * shadcn Dialog Component
 */

import {
  getShadcnColors,
  shadcnSpacing,
  shadcnTypography,
  shadowsToFigmaEffects,
  shadcnShadows,
  getFigmaFontStyle,
  Theme,
} from "../../tokens";

export interface DialogOptions {
  title?: string;
  description?: string;
  width?: number;
  hasCloseButton?: boolean;
  theme?: Theme;
}

export async function createShadcnDialog(
  options: DialogOptions = {}
): Promise<FrameNode> {
  const {
    title = "Edit profile",
    description = "Make changes to your profile here. Click save when you're done.",
    width = shadcnSpacing.dialogMaxWidth,
    hasCloseButton = true,
    theme = "light",
  } = options;

  const colors = getShadcnColors(theme);

  // Create dialog frame
  const dialog = figma.createFrame();
  dialog.name = "Dialog";
  dialog.layoutMode = "VERTICAL";
  dialog.primaryAxisSizingMode = "AUTO";
  dialog.counterAxisSizingMode = "FIXED";
  dialog.resize(width, 200);
  dialog.cornerRadius = 8;
  dialog.fills = [{ type: "SOLID", color: colors.background.rgb }];
  dialog.strokes = [{ type: "SOLID", color: colors.border.rgb }];
  dialog.strokeWeight = 1;
  dialog.effects = shadowsToFigmaEffects(shadcnShadows.lg.shadows);

  // Create header
  const header = figma.createFrame();
  header.name = "DialogHeader";
  header.layoutMode = "VERTICAL";
  header.layoutSizingVertical = "HUG";
  // layoutSizingHorizontal = "FILL" is set after appendChild
  header.layoutAlign = "STRETCH";
  header.paddingTop = shadcnSpacing.dialogHeaderPadding;
  header.paddingBottom = 0;
  header.paddingLeft = shadcnSpacing.dialogHeaderPadding;
  header.paddingRight = shadcnSpacing.dialogHeaderPadding;
  header.itemSpacing = 8;
  header.fills = [];

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
    titleText.fontSize = 18;
    titleText.fills = [{ type: "SOLID", color: colors.foreground.rgb }];
    titleText.layoutAlign = "STRETCH";
    header.appendChild(titleText);
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
    header.appendChild(descText);
  }

  dialog.appendChild(header);
  header.layoutSizingHorizontal = "FILL";

  // Create content area
  const content = figma.createFrame();
  content.name = "DialogContent";
  content.layoutMode = "VERTICAL";
  content.layoutSizingVertical = "HUG";
  // layoutSizingHorizontal = "FILL" is set after appendChild
  content.layoutAlign = "STRETCH";
  content.paddingTop = shadcnSpacing.dialogPadding;
  content.paddingBottom = shadcnSpacing.dialogPadding;
  content.paddingLeft = shadcnSpacing.dialogPadding;
  content.paddingRight = shadcnSpacing.dialogPadding;
  content.itemSpacing = 16;
  content.fills = [];
  dialog.appendChild(content);
  content.layoutSizingHorizontal = "FILL";

  // Create footer
  const footer = figma.createFrame();
  footer.name = "DialogFooter";
  footer.layoutMode = "HORIZONTAL";
  // layoutSizingHorizontal = "FILL" is set after appendChild
  footer.layoutSizingVertical = "HUG";
  footer.layoutAlign = "STRETCH";
  footer.paddingTop = 0;
  footer.paddingBottom = shadcnSpacing.dialogFooterPadding;
  footer.paddingLeft = shadcnSpacing.dialogFooterPadding;
  footer.paddingRight = shadcnSpacing.dialogFooterPadding;
  footer.itemSpacing = 8;
  footer.fills = [];
  footer.primaryAxisAlignItems = "MAX";
  dialog.appendChild(footer);
  footer.layoutSizingHorizontal = "FILL";

  return dialog;
}

export async function createShadcnSheet(
  options: DialogOptions & { side?: "top" | "right" | "bottom" | "left" } = {}
): Promise<FrameNode> {
  const {
    title = "Sheet",
    description = "Sheet description goes here.",
    width = 400,
    side = "right",
    theme = "light",
  } = options;

  const colors = getShadcnColors(theme);
  const isVertical = side === "left" || side === "right";

  // Create sheet frame
  const sheet = figma.createFrame();
  sheet.name = `Sheet/${side}`;
  sheet.layoutMode = "VERTICAL";
  sheet.primaryAxisSizingMode = "AUTO";
  sheet.counterAxisSizingMode = "FIXED";
  sheet.resize(isVertical ? width : 600, isVertical ? 500 : 300);
  sheet.fills = [{ type: "SOLID", color: colors.background.rgb }];
  sheet.strokes = [{ type: "SOLID", color: colors.border.rgb }];
  sheet.strokeWeight = 1;
  sheet.effects = shadowsToFigmaEffects(shadcnShadows.xl.shadows);

  // Border radius based on side
  if (side === "left") {
    sheet.topRightRadius = 8;
    sheet.bottomRightRadius = 8;
  } else if (side === "right") {
    sheet.topLeftRadius = 8;
    sheet.bottomLeftRadius = 8;
  } else if (side === "top") {
    sheet.bottomLeftRadius = 8;
    sheet.bottomRightRadius = 8;
  } else if (side === "bottom") {
    sheet.topLeftRadius = 8;
    sheet.topRightRadius = 8;
  }

  // Create header
  const header = figma.createFrame();
  header.name = "SheetHeader";
  header.layoutMode = "VERTICAL";
  header.layoutSizingVertical = "HUG";
  // layoutSizingHorizontal = "FILL" is set after appendChild
  header.layoutAlign = "STRETCH";
  header.paddingTop = 24;
  header.paddingBottom = 0;
  header.paddingLeft = 24;
  header.paddingRight = 24;
  header.itemSpacing = 8;
  header.fills = [];

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
    titleText.fontSize = 18;
    titleText.fills = [{ type: "SOLID", color: colors.foreground.rgb }];
    titleText.layoutAlign = "STRETCH";
    header.appendChild(titleText);
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
    header.appendChild(descText);
  }

  sheet.appendChild(header);
  header.layoutSizingHorizontal = "FILL";

  // Create content area
  const content = figma.createFrame();
  content.name = "SheetContent";
  content.layoutMode = "VERTICAL";
  content.layoutSizingVertical = "HUG";
  // layoutSizingHorizontal = "FILL" is set after appendChild
  content.layoutAlign = "STRETCH";
  content.layoutGrow = 1;
  content.paddingTop = 24;
  content.paddingBottom = 24;
  content.paddingLeft = 24;
  content.paddingRight = 24;
  content.itemSpacing = 16;
  content.fills = [];
  sheet.appendChild(content);
  content.layoutSizingHorizontal = "FILL";

  return sheet;
}
