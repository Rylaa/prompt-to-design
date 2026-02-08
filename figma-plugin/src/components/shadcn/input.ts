/**
 * shadcn Input Component
 * Variants: default, disabled, with-icon, file
 */

import {
  getShadcnColors,
  shadcnSpacing,
  shadcnTypography,
  getFigmaFontStyle,
  Theme,
} from "../../tokens";
import { resolveThemeFromOptions } from "../../tokens/theme-helpers";

export type InputVariant = "default" | "disabled" | "withIcon" | "file";

export interface InputOptions {
  placeholder?: string;
  value?: string;
  label?: string;
  variant?: InputVariant;
  width?: number;
  disabled?: boolean;
  theme?: Theme;
}

export async function createShadcnInput(
  options: InputOptions = {}
): Promise<FrameNode> {
  const {
    placeholder = "Enter text...",
    value,
    label,
    variant = "default",
    width = 280,
    disabled = false,
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const colors = getShadcnColors(theme);

  // Create container for label + input
  const container = figma.createFrame();
  container.name = "Input";
  container.layoutMode = "VERTICAL";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "FIXED";
  container.resize(width, 40);
  container.itemSpacing = 8;
  container.fills = [];

  // Add label if provided
  if (label) {
    const labelText = figma.createText();
    const labelStyle = shadcnTypography.label;

    try {
      await figma.loadFontAsync({
        family: labelStyle.family,
        style: getFigmaFontStyle(labelStyle.weight),
      });
      labelText.fontName = {
        family: labelStyle.family,
        style: getFigmaFontStyle(labelStyle.weight),
      };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      labelText.fontName = { family: "Inter", style: "Medium" };
    }

    labelText.characters = label;
    labelText.fontSize = labelStyle.size;
    labelText.fills = [
      {
        type: "SOLID",
        color: colors.foreground.rgb,
      },
    ];
    container.appendChild(labelText);
  }

  // Create input frame
  const input = figma.createFrame();
  input.name = "InputField";
  input.layoutMode = "HORIZONTAL";
  input.primaryAxisAlignItems = "MIN";
  input.counterAxisAlignItems = "CENTER";
  input.primaryAxisSizingMode = "FIXED";
  input.counterAxisSizingMode = "FIXED";
  input.resize(width, shadcnSpacing.inputHeight);
  input.paddingLeft = shadcnSpacing.inputPadding;
  input.paddingRight = shadcnSpacing.inputPadding;
  input.cornerRadius = 6;

  // Set background and border
  input.fills = [
    {
      type: "SOLID",
      color: colors.background.rgb,
      opacity: disabled ? 0.5 : 1,
    },
  ];
  input.strokes = [
    {
      type: "SOLID",
      color: colors.input.rgb,
    },
  ];
  input.strokeWeight = 1;

  // Create text node
  const textNode = figma.createText();
  const inputStyle = shadcnTypography.input;

  try {
    await figma.loadFontAsync({
      family: inputStyle.family,
      style: getFigmaFontStyle(inputStyle.weight),
    });
    textNode.fontName = {
      family: inputStyle.family,
      style: getFigmaFontStyle(inputStyle.weight),
    };
  } catch (e) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    textNode.fontName = { family: "Inter", style: "Regular" };
  }

  textNode.characters = value || placeholder;
  textNode.fontSize = inputStyle.size;
  textNode.fills = [
    {
      type: "SOLID",
      color: value ? colors.foreground.rgb : colors.mutedForeground.rgb,
      opacity: disabled ? 0.5 : 1,
    },
  ];
  textNode.layoutAlign = "STRETCH";
  textNode.layoutGrow = 1;

  input.appendChild(textNode);
  container.appendChild(input);

  return container;
}

export async function createShadcnTextarea(
  options: InputOptions & { rows?: number } = {}
): Promise<FrameNode> {
  const {
    placeholder = "Enter text...",
    value,
    label,
    width = 280,
    rows = 3,
    disabled = false,
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const colors = getShadcnColors(theme);
  const rowHeight = 24;
  const height = rows * rowHeight + shadcnSpacing.inputPadding * 2;

  // Create container
  const container = figma.createFrame();
  container.name = "Textarea";
  container.layoutMode = "VERTICAL";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "FIXED";
  container.resize(width, height);
  container.itemSpacing = 8;
  container.fills = [];

  // Add label if provided
  if (label) {
    const labelText = figma.createText();
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      labelText.fontName = { family: "Inter", style: "Medium" };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      labelText.fontName = { family: "Inter", style: "Regular" };
    }
    labelText.characters = label;
    labelText.fontSize = 14;
    labelText.fills = [{ type: "SOLID", color: colors.foreground.rgb }];
    container.appendChild(labelText);
  }

  // Create textarea frame
  const textarea = figma.createFrame();
  textarea.name = "TextareaField";
  textarea.layoutMode = "VERTICAL";
  textarea.primaryAxisAlignItems = "MIN";
  textarea.counterAxisAlignItems = "MIN";
  textarea.primaryAxisSizingMode = "FIXED";
  textarea.counterAxisSizingMode = "FIXED";
  textarea.resize(width, height);
  textarea.paddingTop = shadcnSpacing.inputPadding;
  textarea.paddingBottom = shadcnSpacing.inputPadding;
  textarea.paddingLeft = shadcnSpacing.inputPadding;
  textarea.paddingRight = shadcnSpacing.inputPadding;
  textarea.cornerRadius = 6;

  textarea.fills = [
    {
      type: "SOLID",
      color: colors.background.rgb,
      opacity: disabled ? 0.5 : 1,
    },
  ];
  textarea.strokes = [{ type: "SOLID", color: colors.input.rgb }];
  textarea.strokeWeight = 1;

  // Create text
  const textNode = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  textNode.fontName = { family: "Inter", style: "Regular" };
  textNode.characters = value || placeholder;
  textNode.fontSize = 14;
  textNode.fills = [
    {
      type: "SOLID",
      color: value ? colors.foreground.rgb : colors.mutedForeground.rgb,
    },
  ];
  textNode.layoutAlign = "STRETCH";
  textNode.textAutoResize = "HEIGHT";

  textarea.appendChild(textNode);
  container.appendChild(textarea);

  return container;
}
