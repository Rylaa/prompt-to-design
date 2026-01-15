/**
 * shadcn Switch Component
 */

import {
  getShadcnColors,
  shadcnSpacing,
  Theme,
} from "../../tokens";

export interface SwitchOptions {
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  theme?: Theme;
}

export async function createShadcnSwitch(
  options: SwitchOptions = {}
): Promise<FrameNode> {
  const {
    checked = false,
    label,
    disabled = false,
    theme = "light",
  } = options;

  const colors = getShadcnColors(theme);
  const width = shadcnSpacing.switchWidth;
  const height = shadcnSpacing.switchHeight;
  const thumbSize = shadcnSpacing.switchThumbSize;

  // Create container
  const container = figma.createFrame();
  container.name = "Switch";
  container.layoutMode = "HORIZONTAL";
  container.primaryAxisAlignItems = "MIN";
  container.counterAxisAlignItems = "CENTER";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "AUTO";
  container.itemSpacing = 8;
  container.fills = [];

  // Create switch track
  const track = figma.createFrame();
  track.name = checked ? "SwitchTrackOn" : "SwitchTrackOff";
  track.resize(width, height);
  track.cornerRadius = height / 2;
  track.fills = [
    {
      type: "SOLID",
      color: checked ? colors.primary.rgb : colors.input.rgb,
      opacity: disabled ? 0.5 : 1,
    },
  ];

  // Create thumb
  const thumb = figma.createEllipse();
  thumb.name = "SwitchThumb";
  thumb.resize(thumbSize, thumbSize);
  thumb.fills = [{ type: "SOLID", color: colors.background.rgb }];

  // Position thumb
  const thumbOffset = (height - thumbSize) / 2;
  thumb.x = checked ? width - thumbSize - thumbOffset : thumbOffset;
  thumb.y = thumbOffset;

  // Add drop shadow to thumb
  thumb.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 1 },
      radius: 2,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  track.appendChild(thumb);
  container.appendChild(track);

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
