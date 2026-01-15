/**
 * Apple macOS Button Component
 * Styles: push, gradient, help, toolbar
 */

import {
  getMacOSColors,
  macOSSpacing,
  macOSTypography,
  getFigmaFontStyle,
  Theme,
} from "../../tokens";

export type MacOSButtonStyle = "push" | "gradient" | "help" | "toolbar";

export interface MacOSButtonOptions {
  text?: string;
  style?: MacOSButtonStyle;
  isDefault?: boolean;
  disabled?: boolean;
  icon?: string;
  theme?: Theme;
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

export async function createMacOSButton(
  options: MacOSButtonOptions = {}
): Promise<FrameNode> {
  const {
    text = "Button",
    style = "push",
    isDefault = false,
    disabled = false,
    icon,
    theme = "light",
  } = options;

  const colors = getMacOSColors(theme);

  // Create button frame
  const button = figma.createFrame();
  button.name = `macOS Button/${style}`;
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";
  button.primaryAxisSizingMode = "AUTO";
  button.counterAxisSizingMode = "FIXED";
  button.resize(80, macOSSpacing.buttonHeight);
  button.paddingLeft = macOSSpacing.buttonPaddingHorizontal;
  button.paddingRight = macOSSpacing.buttonPaddingHorizontal;
  button.itemSpacing = 4;
  button.cornerRadius = 5;

  // Set background based on style
  if (style === "push") {
    if (isDefault) {
      button.fills = [{ type: "SOLID", color: colors.systemBlue.rgb }];
    } else {
      button.fills = [
        {
          type: "SOLID",
          color: theme === "light"
            ? { r: 1, g: 1, b: 1 }
            : colors.systemGray5.rgb,
        },
      ];
      button.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
      button.strokeWeight = 0.5;
    }
  } else if (style === "gradient") {
    button.fills = [
      {
        type: "GRADIENT_LINEAR",
        gradientStops: [
          { position: 0, color: { r: 1, g: 1, b: 1, a: 1 } },
          { position: 1, color: { r: 0.95, g: 0.95, b: 0.95, a: 1 } },
        ],
        gradientTransform: [
          [0, 1, 0],
          [-1, 0, 1],
        ],
      },
    ];
    button.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
    button.strokeWeight = 0.5;
  } else if (style === "help") {
    button.resize(22, 22);
    button.paddingLeft = 0;
    button.paddingRight = 0;
    button.cornerRadius = 11;
    button.fills = [
      {
        type: "SOLID",
        color: theme === "light"
          ? { r: 1, g: 1, b: 1 }
          : colors.systemGray5.rgb,
      },
    ];
    button.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
    button.strokeWeight = 0.5;
  } else if (style === "toolbar") {
    button.resize(28, 22);
    button.paddingLeft = 6;
    button.paddingRight = 6;
    button.fills = [];
  }

  // Add icon for icon-only buttons
  if ((style === "help" || style === "toolbar") && !text) {
    const iconText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    iconText.fontName = { family: "Inter", style: "Regular" };
    iconText.characters = style === "help" ? "?" : (icon || "⚙");
    iconText.fontSize = style === "help" ? 14 : 12;
    iconText.fills = [
      {
        type: "SOLID",
        color: colors.secondaryLabel.rgb,
        opacity: disabled ? 0.5 : 1,
      },
    ];
    button.appendChild(iconText);
  } else {
    // Add icon if provided
    if (icon) {
      const iconText = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      iconText.fontName = { family: "Inter", style: "Regular" };
      iconText.characters = icon;
      iconText.fontSize = 12;
      iconText.fills = [
        {
          type: "SOLID",
          color: isDefault
            ? { r: 1, g: 1, b: 1 }
            : colors.label.rgb,
          opacity: disabled ? 0.5 : 1,
        },
      ];
      button.appendChild(iconText);
    }

    // Add text
    const textNode = figma.createText();
    const typography = macOSTypography.button;

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
    textNode.fontSize = typography.size;
    textNode.fills = [
      {
        type: "SOLID",
        color: isDefault
          ? { r: 1, g: 1, b: 1 }
          : colors.label.rgb,
        opacity: disabled ? 0.5 : 1,
      },
    ];

    button.appendChild(textNode);
  }

  return button;
}

export async function createMacOSCheckbox(
  options: { checked?: boolean; label?: string; disabled?: boolean; theme?: Theme } = {}
): Promise<FrameNode> {
  const {
    checked = false,
    label,
    disabled = false,
    theme = "light",
  } = options;

  const colors = getMacOSColors(theme);
  const size = macOSSpacing.checkboxSize;

  // Create container
  const container = figma.createFrame();
  container.name = "macOS Checkbox";
  container.layoutMode = "HORIZONTAL";
  container.primaryAxisAlignItems = "MIN";
  container.counterAxisAlignItems = "CENTER";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "AUTO";
  container.itemSpacing = 6;
  container.fills = [];

  // Create checkbox
  const checkbox = figma.createFrame();
  checkbox.name = checked ? "CheckboxChecked" : "CheckboxUnchecked";
  checkbox.resize(size, size);
  checkbox.cornerRadius = 3;

  if (checked) {
    checkbox.fills = [
      {
        type: "SOLID",
        color: colors.systemBlue.rgb,
        opacity: disabled ? 0.5 : 1,
      },
    ];

    // Add checkmark
    const checkmark = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    checkmark.fontName = { family: "Inter", style: "Bold" };
    checkmark.characters = "✓";
    checkmark.fontSize = 10;
    checkmark.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    checkmark.x = 2;
    checkmark.y = 0;
    checkbox.appendChild(checkmark);
  } else {
    checkbox.fills = [
      {
        type: "SOLID",
        color: theme === "light" ? { r: 1, g: 1, b: 1 } : colors.systemGray5.rgb,
        opacity: disabled ? 0.5 : 1,
      },
    ];
    checkbox.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
    checkbox.strokeWeight = 0.5;
  }

  container.appendChild(checkbox);

  // Add label if provided
  if (label) {
    const labelText = figma.createText();
    try {
      await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
      labelText.fontName = { family: "SF Pro Text", style: "Regular" };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      labelText.fontName = { family: "Inter", style: "Regular" };
    }
    labelText.characters = label;
    labelText.fontSize = 13;
    labelText.fills = [
      {
        type: "SOLID",
        color: colors.label.rgb,
        opacity: disabled ? 0.5 : 1,
      },
    ];
    container.appendChild(labelText);
  }

  return container;
}

export async function createMacOSTextField(
  options: { placeholder?: string; value?: string; width?: number; theme?: Theme } = {}
): Promise<FrameNode> {
  const {
    placeholder = "Text Field",
    value,
    width = 200,
    theme = "light",
  } = options;

  const colors = getMacOSColors(theme);

  const textField = figma.createFrame();
  textField.name = "macOS TextField";
  textField.layoutMode = "HORIZONTAL";
  textField.primaryAxisAlignItems = "MIN";
  textField.counterAxisAlignItems = "CENTER";
  textField.primaryAxisSizingMode = "FIXED";
  textField.counterAxisSizingMode = "FIXED";
  textField.resize(width, macOSSpacing.textFieldHeight);
  textField.paddingLeft = macOSSpacing.textFieldPadding;
  textField.paddingRight = macOSSpacing.textFieldPadding;
  textField.cornerRadius = 4;
  textField.fills = [
    {
      type: "SOLID",
      color: theme === "light" ? { r: 1, g: 1, b: 1 } : colors.systemGray6.rgb,
    },
  ];
  textField.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
  textField.strokeWeight = 0.5;

  // Text
  const text = figma.createText();
  try {
    await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
    text.fontName = { family: "SF Pro Text", style: "Regular" };
  } catch (e) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    text.fontName = { family: "Inter", style: "Regular" };
  }
  text.characters = value || placeholder;
  text.fontSize = 13;
  text.fills = [
    {
      type: "SOLID",
      color: value ? colors.label.rgb : colors.tertiaryLabel.rgb,
    },
  ];
  text.layoutAlign = "STRETCH";
  text.layoutGrow = 1;

  textField.appendChild(text);

  return textField;
}
