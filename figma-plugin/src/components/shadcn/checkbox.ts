/**
 * shadcn Checkbox Component
 */

import {
  getShadcnColors,
  shadcnSpacing,
  Theme,
} from "../../tokens";
import { resolveThemeFromOptions } from "../../tokens/theme-helpers";

export interface CheckboxOptions {
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  theme?: Theme;
}

export async function createShadcnCheckbox(
  options: CheckboxOptions = {}
): Promise<FrameNode> {
  const {
    checked = false,
    label,
    disabled = false,
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const colors = getShadcnColors(theme);
  const size = shadcnSpacing.checkboxSize;

  // Create container
  const container = figma.createFrame();
  container.name = "Checkbox";
  container.layoutMode = "HORIZONTAL";
  container.primaryAxisAlignItems = "MIN";
  container.counterAxisAlignItems = "CENTER";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "AUTO";
  container.itemSpacing = 8;
  container.fills = [];

  // Create checkbox box
  const checkbox = figma.createFrame();
  checkbox.name = checked ? "CheckboxChecked" : "CheckboxUnchecked";
  checkbox.resize(size, size);
  checkbox.cornerRadius = 4;

  if (checked) {
    checkbox.fills = [
      {
        type: "SOLID",
        color: colors.primary.rgb,
        opacity: disabled ? 0.5 : 1,
      },
    ];

    // Add checkmark
    const checkmark = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    checkmark.fontName = { family: "Inter", style: "Bold" };
    checkmark.characters = "✓";
    checkmark.fontSize = 12;
    checkmark.fills = [{ type: "SOLID", color: colors.primaryForeground.rgb }];
    checkmark.x = 2;
    checkmark.y = 0;
    checkbox.appendChild(checkmark);
  } else {
    checkbox.fills = [
      {
        type: "SOLID",
        color: colors.background.rgb,
        opacity: disabled ? 0.5 : 1,
      },
    ];
    checkbox.strokes = [{ type: "SOLID", color: colors.input.rgb }];
    checkbox.strokeWeight = 1;
  }

  container.appendChild(checkbox);

  // Add label if provided
  if (label) {
    const labelText = figma.createText();
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      labelText.fontName = { family: "Inter", style: "Regular" };
    } catch (e) {
      // Font already loaded above
    }
    labelText.characters = label;
    labelText.fontSize = 14;
    labelText.fills = [
      {
        type: "SOLID",
        color: colors.foreground.rgb,
        opacity: disabled ? 0.5 : 1,
      },
    ];
    container.appendChild(labelText);
  }

  return container;
}

export async function createShadcnRadio(
  options: CheckboxOptions = {}
): Promise<FrameNode> {
  const {
    checked = false,
    label,
    disabled = false,
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const colors = getShadcnColors(theme);
  const size = shadcnSpacing.radioSize;

  // Create container
  const container = figma.createFrame();
  container.name = "Radio";
  container.layoutMode = "HORIZONTAL";
  container.primaryAxisAlignItems = "MIN";
  container.counterAxisAlignItems = "CENTER";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "AUTO";
  container.itemSpacing = 8;
  container.fills = [];

  // Create radio circle
  const radio = figma.createFrame();
  radio.name = checked ? "RadioChecked" : "RadioUnchecked";
  radio.resize(size, size);
  radio.cornerRadius = size / 2;
  radio.fills = [
    {
      type: "SOLID",
      color: colors.background.rgb,
      opacity: disabled ? 0.5 : 1,
    },
  ];
  radio.strokes = [{ type: "SOLID", color: colors.input.rgb }];
  radio.strokeWeight = 1;
  radio.layoutMode = "HORIZONTAL";
  radio.primaryAxisAlignItems = "CENTER";
  radio.counterAxisAlignItems = "CENTER";

  if (checked) {
    // Add inner circle
    const inner = figma.createEllipse();
    inner.name = "RadioInner";
    inner.resize(8, 8);
    inner.fills = [
      {
        type: "SOLID",
        color: colors.primary.rgb,
        opacity: disabled ? 0.5 : 1,
      },
    ];
    radio.appendChild(inner);
  }

  container.appendChild(radio);

  // Add label if provided
  if (label) {
    const labelText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    labelText.fontName = { family: "Inter", style: "Regular" };
    labelText.characters = label;
    labelText.fontSize = 14;
    labelText.fills = [
      {
        type: "SOLID",
        color: colors.foreground.rgb,
        opacity: disabled ? 0.5 : 1,
      },
    ];
    container.appendChild(labelText);
  }

  return container;
}
