/**
 * shadcn Tooltip & Popover Components
 */

import {
  getShadcnColors,
  Theme,
} from "../../tokens";

export type TooltipSide = "top" | "right" | "bottom" | "left";

export interface TooltipOptions {
  content?: string;
  triggerText?: string;
  side?: TooltipSide;
  theme?: Theme;
}

export async function createShadcnTooltip(
  options: TooltipOptions = {}
): Promise<FrameNode> {
  const {
    content = "Add to library",
    triggerText = "Hover",
    side = "top",
    theme = "light",
  } = options;

  const colors = getShadcnColors(theme);

  const container = figma.createFrame();
  container.name = "Tooltip";
  container.layoutMode = "VERTICAL";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "AUTO";
  container.itemSpacing = 8;
  container.counterAxisAlignItems = "CENTER";
  container.fills = [];

  // Tooltip content
  const tooltip = figma.createFrame();
  tooltip.name = "TooltipContent";
  tooltip.layoutMode = "HORIZONTAL";
  tooltip.primaryAxisSizingMode = "AUTO";
  tooltip.counterAxisSizingMode = "AUTO";
  tooltip.paddingLeft = 12;
  tooltip.paddingRight = 12;
  tooltip.paddingTop = 6;
  tooltip.paddingBottom = 6;
  tooltip.cornerRadius = 6;
  tooltip.fills = [{ type: "SOLID", color: colors.primary.rgb }];

  const tooltipText = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  tooltipText.fontName = { family: "Inter", style: "Medium" };
  tooltipText.characters = content;
  tooltipText.fontSize = 12;
  tooltipText.fills = [{ type: "SOLID", color: colors.primaryForeground.rgb }];
  tooltip.appendChild(tooltipText);

  // Arrow
  const arrow = figma.createPolygon();
  arrow.name = "Arrow";
  arrow.pointCount = 3;
  arrow.resize(10, 6);
  arrow.fills = [{ type: "SOLID", color: colors.primary.rgb }];

  // Trigger
  const trigger = figma.createFrame();
  trigger.name = "TooltipTrigger";
  trigger.layoutMode = "HORIZONTAL";
  trigger.primaryAxisSizingMode = "AUTO";
  trigger.counterAxisSizingMode = "AUTO";
  trigger.paddingLeft = 16;
  trigger.paddingRight = 16;
  trigger.paddingTop = 8;
  trigger.paddingBottom = 8;
  trigger.cornerRadius = 6;
  trigger.fills = [{ type: "SOLID", color: colors.secondary.rgb }];

  const triggerLabel = figma.createText();
  triggerLabel.fontName = { family: "Inter", style: "Medium" };
  triggerLabel.characters = triggerText;
  triggerLabel.fontSize = 14;
  triggerLabel.fills = [{ type: "SOLID", color: colors.secondaryForeground.rgb }];
  trigger.appendChild(triggerLabel);

  // Arrange based on side
  if (side === "top" || side === "bottom") {
    container.layoutMode = "VERTICAL";
    if (side === "top") {
      container.appendChild(tooltip);
      arrow.rotation = 180;
      container.appendChild(arrow);
      container.appendChild(trigger);
    } else {
      container.appendChild(trigger);
      container.appendChild(arrow);
      container.appendChild(tooltip);
    }
  } else {
    container.layoutMode = "HORIZONTAL";
    if (side === "left") {
      container.appendChild(tooltip);
      arrow.rotation = 90;
      container.appendChild(arrow);
      container.appendChild(trigger);
    } else {
      container.appendChild(trigger);
      arrow.rotation = -90;
      container.appendChild(arrow);
      container.appendChild(tooltip);
    }
  }

  return container;
}

export interface PopoverOptions {
  title?: string;
  description?: string;
  triggerText?: string;
  width?: number;
  theme?: Theme;
}

export async function createShadcnPopover(
  options: PopoverOptions = {}
): Promise<FrameNode> {
  const {
    title = "Dimensions",
    description = "Set the dimensions for the layer.",
    triggerText = "Open popover",
    width = 280,
    theme = "light",
  } = options;

  const colors = getShadcnColors(theme);

  const container = figma.createFrame();
  container.name = "Popover";
  container.layoutMode = "VERTICAL";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "AUTO";
  container.itemSpacing = 8;
  container.fills = [];

  // Trigger button
  const trigger = figma.createFrame();
  trigger.name = "PopoverTrigger";
  trigger.layoutMode = "HORIZONTAL";
  trigger.primaryAxisSizingMode = "AUTO";
  trigger.counterAxisSizingMode = "AUTO";
  trigger.paddingLeft = 16;
  trigger.paddingRight = 16;
  trigger.paddingTop = 8;
  trigger.paddingBottom = 8;
  trigger.cornerRadius = 6;
  trigger.fills = [{ type: "SOLID", color: colors.primary.rgb }];

  const triggerLabel = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  triggerLabel.fontName = { family: "Inter", style: "Medium" };
  triggerLabel.characters = triggerText;
  triggerLabel.fontSize = 14;
  triggerLabel.fills = [{ type: "SOLID", color: colors.primaryForeground.rgb }];
  trigger.appendChild(triggerLabel);

  container.appendChild(trigger);

  // Popover content
  const content = figma.createFrame();
  content.name = "PopoverContent";
  content.layoutMode = "VERTICAL";
  content.primaryAxisSizingMode = "AUTO";
  content.counterAxisSizingMode = "FIXED";
  content.resize(width, 100);
  content.paddingTop = 16;
  content.paddingBottom = 16;
  content.paddingLeft = 16;
  content.paddingRight = 16;
  content.itemSpacing = 8;
  content.cornerRadius = 8;
  content.fills = [{ type: "SOLID", color: colors.popover.rgb }];
  content.strokes = [{ type: "SOLID", color: colors.border.rgb }];
  content.strokeWeight = 1;
  content.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 4 },
      radius: 6,
      spread: -2,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  // Title
  const titleText = figma.createText();
  try {
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
    titleText.fontName = { family: "Inter", style: "Semi Bold" };
  } catch (e) {
    titleText.fontName = { family: "Inter", style: "Medium" };
  }
  titleText.characters = title;
  titleText.fontSize = 14;
  titleText.fills = [{ type: "SOLID", color: colors.popoverForeground.rgb }];
  content.appendChild(titleText);

  // Description
  const descText = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  descText.fontName = { family: "Inter", style: "Regular" };
  descText.characters = description;
  descText.fontSize = 14;
  descText.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];
  descText.textAutoResize = "HEIGHT";
  descText.resize(width - 32, descText.height);
  content.appendChild(descText);

  // Sample input fields
  const fieldsContainer = figma.createFrame();
  fieldsContainer.name = "Fields";
  fieldsContainer.layoutMode = "VERTICAL";
  fieldsContainer.primaryAxisSizingMode = "AUTO";
  fieldsContainer.layoutSizingHorizontal = "FILL";
  fieldsContainer.itemSpacing = 12;
  fieldsContainer.fills = [];

  const fields = [
    { label: "Width", value: "100%" },
    { label: "Height", value: "25px" },
  ];

  for (const field of fields) {
    const fieldRow = figma.createFrame();
    fieldRow.name = `Field-${field.label}`;
    fieldRow.layoutMode = "HORIZONTAL";
    fieldRow.layoutSizingHorizontal = "FILL";
    fieldRow.layoutSizingVertical = "HUG";
    fieldRow.primaryAxisAlignItems = "SPACE_BETWEEN";
    fieldRow.counterAxisAlignItems = "CENTER";
    fieldRow.fills = [];

    const label = figma.createText();
    label.fontName = { family: "Inter", style: "Regular" };
    label.characters = field.label;
    label.fontSize = 14;
    label.fills = [{ type: "SOLID", color: colors.popoverForeground.rgb }];
    fieldRow.appendChild(label);

    const input = figma.createFrame();
    input.name = "Input";
    input.layoutMode = "HORIZONTAL";
    input.primaryAxisSizingMode = "FIXED";
    input.counterAxisSizingMode = "FIXED";
    input.resize(100, 32);
    input.paddingLeft = 8;
    input.paddingRight = 8;
    input.counterAxisAlignItems = "CENTER";
    input.cornerRadius = 6;
    input.fills = [{ type: "SOLID", color: colors.background.rgb }];
    input.strokes = [{ type: "SOLID", color: colors.input.rgb }];
    input.strokeWeight = 1;

    const inputValue = figma.createText();
    inputValue.fontName = { family: "Inter", style: "Regular" };
    inputValue.characters = field.value;
    inputValue.fontSize = 14;
    inputValue.fills = [{ type: "SOLID", color: colors.foreground.rgb }];
    input.appendChild(inputValue);

    fieldRow.appendChild(input);
    content.appendChild(fieldRow);
    fieldRow.layoutSizingHorizontal = "FILL";
  }

  container.appendChild(content);

  return container;
}
