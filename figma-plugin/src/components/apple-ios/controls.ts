/**
 * Apple iOS Control Components
 * Segmented Control, Stepper, Slider, Picker
 */

import {
  getIOSColors,
  iosSpacing,
  iosTypography,
  Theme,
} from "../../tokens";

export interface SegmentedControlOptions {
  segments?: string[];
  selectedIndex?: number;
  width?: number;
  theme?: Theme;
}

export async function createIOSSegmentedControl(
  options: SegmentedControlOptions = {}
): Promise<FrameNode> {
  const {
    segments = ["First", "Second", "Third"],
    selectedIndex = 0,
    width = 300,
    theme = "light",
  } = options;

  const colors = getIOSColors(theme);
  const segmentWidth = width / segments.length;

  const control = figma.createFrame();
  control.name = "iOS SegmentedControl";
  control.layoutMode = "HORIZONTAL";
  control.primaryAxisSizingMode = "FIXED";
  control.counterAxisSizingMode = "FIXED";
  control.resize(width, 32);
  control.cornerRadius = 8;
  control.fills = [{ type: "SOLID", color: colors.systemGray5.rgb }];
  control.paddingLeft = 2;
  control.paddingRight = 2;
  control.paddingTop = 2;
  control.paddingBottom = 2;

  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  for (let i = 0; i < segments.length; i++) {
    const isSelected = i === selectedIndex;

    const segment = figma.createFrame();
    segment.name = `Segment-${segments[i]}`;
    segment.layoutMode = "HORIZONTAL";
    segment.primaryAxisSizingMode = "FIXED";
    segment.counterAxisSizingMode = "AUTO";
    segment.resize(segmentWidth - 4, 28);
    segment.primaryAxisAlignItems = "CENTER";
    segment.counterAxisAlignItems = "CENTER";
    segment.cornerRadius = 6;

    if (isSelected) {
      segment.fills = [{ type: "SOLID", color: colors.systemBackground.rgb }];
      segment.effects = [
        {
          type: "DROP_SHADOW",
          color: { r: 0, g: 0, b: 0, a: 0.08 },
          offset: { x: 0, y: 1 },
          radius: 2,
          spread: 0,
          visible: true,
          blendMode: "NORMAL",
        },
      ];
    } else {
      segment.fills = [];
    }

    const label = figma.createText();
    label.fontName = { family: "Inter", style: "Medium" };
    label.characters = segments[i];
    label.fontSize = 13;
    label.fills = [
      {
        type: "SOLID",
        color: isSelected ? colors.label.rgb : colors.secondaryLabel.rgb,
      },
    ];
    segment.appendChild(label);

    control.appendChild(segment);
  }

  return control;
}

export interface StepperOptions {
  value?: number;
  min?: number;
  max?: number;
  theme?: Theme;
}

export async function createIOSStepper(
  options: StepperOptions = {}
): Promise<FrameNode> {
  const {
    value = 0,
    min = 0,
    max = 10,
    theme = "light",
  } = options;

  const colors = getIOSColors(theme);

  const stepper = figma.createFrame();
  stepper.name = "iOS Stepper";
  stepper.layoutMode = "HORIZONTAL";
  stepper.primaryAxisSizingMode = "AUTO";
  stepper.counterAxisSizingMode = "AUTO";
  stepper.cornerRadius = 8;
  stepper.fills = [{ type: "SOLID", color: colors.systemGray5.rgb }];
  stepper.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
  stepper.strokeWeight = 0.5;

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  // Minus button
  const minusBtn = figma.createFrame();
  minusBtn.name = "MinusButton";
  minusBtn.layoutMode = "HORIZONTAL";
  minusBtn.primaryAxisSizingMode = "FIXED";
  minusBtn.counterAxisSizingMode = "FIXED";
  minusBtn.resize(44, 32);
  minusBtn.primaryAxisAlignItems = "CENTER";
  minusBtn.counterAxisAlignItems = "CENTER";
  minusBtn.fills = [];

  const minusIcon = figma.createText();
  minusIcon.fontName = { family: "Inter", style: "Regular" };
  minusIcon.characters = "−";
  minusIcon.fontSize = 22;
  minusIcon.fills = [
    {
      type: "SOLID",
      color: value <= min ? colors.systemGray3.rgb : colors.systemBlue.rgb,
    },
  ];
  minusBtn.appendChild(minusIcon);

  stepper.appendChild(minusBtn);

  // Divider
  const divider = figma.createFrame();
  divider.name = "Divider";
  divider.resize(0.5, 20);
  divider.fills = [{ type: "SOLID", color: colors.separator.rgb }];
  stepper.appendChild(divider);

  // Plus button
  const plusBtn = figma.createFrame();
  plusBtn.name = "PlusButton";
  plusBtn.layoutMode = "HORIZONTAL";
  plusBtn.primaryAxisSizingMode = "FIXED";
  plusBtn.counterAxisSizingMode = "FIXED";
  plusBtn.resize(44, 32);
  plusBtn.primaryAxisAlignItems = "CENTER";
  plusBtn.counterAxisAlignItems = "CENTER";
  plusBtn.fills = [];

  const plusIcon = figma.createText();
  plusIcon.fontName = { family: "Inter", style: "Regular" };
  plusIcon.characters = "+";
  plusIcon.fontSize = 22;
  plusIcon.fills = [
    {
      type: "SOLID",
      color: value >= max ? colors.systemGray3.rgb : colors.systemBlue.rgb,
    },
  ];
  plusBtn.appendChild(plusIcon);

  stepper.appendChild(plusBtn);

  return stepper;
}

export interface IOSSliderOptions {
  value?: number;
  min?: number;
  max?: number;
  width?: number;
  showValue?: boolean;
  theme?: Theme;
}

export async function createIOSSlider(
  options: IOSSliderOptions = {}
): Promise<FrameNode> {
  const {
    value = 50,
    min = 0,
    max = 100,
    width = 250,
    showValue = false,
    theme = "light",
  } = options;

  const colors = getIOSColors(theme);
  const percentage = ((value - min) / (max - min)) * 100;
  const trackHeight = 4;
  const thumbSize = 28;

  const slider = figma.createFrame();
  slider.name = "iOS Slider";
  slider.layoutMode = "HORIZONTAL";
  slider.primaryAxisSizingMode = "AUTO";
  slider.counterAxisSizingMode = "AUTO";
  slider.itemSpacing = 12;
  slider.counterAxisAlignItems = "CENTER";
  slider.fills = [];

  // Track container
  const trackContainer = figma.createFrame();
  trackContainer.name = "TrackContainer";
  trackContainer.resize(width, thumbSize);
  trackContainer.fills = [];

  // Background track
  const bgTrack = figma.createFrame();
  bgTrack.name = "BackgroundTrack";
  bgTrack.resize(width, trackHeight);
  bgTrack.y = (thumbSize - trackHeight) / 2;
  bgTrack.cornerRadius = trackHeight / 2;
  bgTrack.fills = [{ type: "SOLID", color: colors.systemGray4.rgb }];
  trackContainer.appendChild(bgTrack);

  // Filled track
  const filledWidth = (percentage / 100) * width;
  const filledTrack = figma.createFrame();
  filledTrack.name = "FilledTrack";
  filledTrack.resize(Math.max(1, filledWidth), trackHeight);
  filledTrack.y = (thumbSize - trackHeight) / 2;
  filledTrack.cornerRadius = trackHeight / 2;
  filledTrack.fills = [{ type: "SOLID", color: colors.systemBlue.rgb }];
  trackContainer.appendChild(filledTrack);

  // Thumb
  const thumb = figma.createEllipse();
  thumb.name = "Thumb";
  thumb.resize(thumbSize, thumbSize);
  thumb.x = Math.max(0, Math.min(filledWidth - thumbSize / 2, width - thumbSize));
  thumb.y = 0;
  thumb.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  thumb.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.15 },
      offset: { x: 0, y: 2 },
      radius: 4,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    },
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.06 },
      offset: { x: 0, y: 0 },
      radius: 1,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    },
  ];
  trackContainer.appendChild(thumb);

  slider.appendChild(trackContainer);

  // Value label (optional)
  if (showValue) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    const valueLabel = figma.createText();
    valueLabel.fontName = { family: "Inter", style: "Regular" };
    valueLabel.characters = String(value);
    valueLabel.fontSize = 17;
    valueLabel.fills = [{ type: "SOLID", color: colors.label.rgb }];
    slider.appendChild(valueLabel);
  }

  return slider;
}

export interface PickerOptions {
  options?: string[];
  selectedIndex?: number;
  width?: number;
  theme?: Theme;
}

export async function createIOSPicker(
  options: PickerOptions = {}
): Promise<FrameNode> {
  const {
    options: pickerOptions = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
    selectedIndex = 2,
    width = 200,
    theme = "light",
  } = options;

  const colors = getIOSColors(theme);
  const itemHeight = 40;
  const visibleItems = 5;

  const picker = figma.createFrame();
  picker.name = "iOS Picker";
  picker.layoutMode = "VERTICAL";
  picker.primaryAxisSizingMode = "FIXED";
  picker.counterAxisSizingMode = "FIXED";
  picker.resize(width, itemHeight * visibleItems);
  picker.fills = [{ type: "SOLID", color: colors.systemBackground.rgb }];
  picker.clipsContent = true;

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  // Selection indicator
  const indicator = figma.createFrame();
  indicator.name = "SelectionIndicator";
  indicator.resize(width, itemHeight);
  indicator.y = itemHeight * 2;
  indicator.fills = [{ type: "SOLID", color: colors.systemGray5.rgb, opacity: 0.5 }];
  indicator.cornerRadius = 8;
  picker.appendChild(indicator);

  // Items
  const startIndex = Math.max(0, selectedIndex - 2);
  for (let i = 0; i < visibleItems; i++) {
    const optIndex = startIndex + i;
    if (optIndex >= pickerOptions.length) break;

    const isSelected = optIndex === selectedIndex;
    const distance = Math.abs(i - 2);

    const item = figma.createFrame();
    item.name = `PickerItem-${optIndex}`;
    item.layoutMode = "HORIZONTAL";
    item.primaryAxisSizingMode = "FIXED";
    item.counterAxisSizingMode = "FIXED";
    item.resize(width, itemHeight);
    item.primaryAxisAlignItems = "CENTER";
    item.counterAxisAlignItems = "CENTER";
    item.fills = [];

    const label = figma.createText();
    label.fontName = { family: "Inter", style: "Regular" };
    label.characters = pickerOptions[optIndex];
    label.fontSize = isSelected ? 22 : 20 - distance * 2;
    label.fills = [
      {
        type: "SOLID",
        color: colors.label.rgb,
      },
    ];
    label.opacity = isSelected ? 1 : 0.5 - distance * 0.15;
    item.appendChild(label);

    picker.appendChild(item);
  }

  return picker;
}

export interface TextFieldOptions {
  placeholder?: string;
  value?: string;
  label?: string;
  clearButton?: boolean;
  style?: "default" | "rounded";
  width?: number;
  theme?: Theme;
}

export async function createIOSTextField(
  options: TextFieldOptions = {}
): Promise<FrameNode> {
  const {
    placeholder = "Placeholder",
    value = "",
    label,
    clearButton = true,
    style = "default",
    width = 300,
    theme = "light",
  } = options;

  const colors = getIOSColors(theme);

  const container = figma.createFrame();
  container.name = "iOS TextField";
  container.layoutMode = "VERTICAL";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "FIXED";
  container.resize(width, 44);
  container.itemSpacing = 4;
  container.fills = [];

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  // Label (optional)
  if (label) {
    const labelText = figma.createText();
    labelText.fontName = { family: "Inter", style: "Regular" };
    labelText.characters = label;
    labelText.fontSize = 13;
    labelText.fills = [{ type: "SOLID", color: colors.secondaryLabel.rgb }];
    container.appendChild(labelText);
  }

  // Text field
  const field = figma.createFrame();
  field.name = "TextField";
  field.layoutMode = "HORIZONTAL";
  field.primaryAxisSizingMode = "FIXED";
  field.counterAxisSizingMode = "FIXED";
  field.resize(width, 44);
  field.paddingLeft = 12;
  field.paddingRight = 12;
  field.primaryAxisAlignItems = "SPACE_BETWEEN";
  field.counterAxisAlignItems = "CENTER";

  if (style === "rounded") {
    field.cornerRadius = 10;
    field.fills = [{ type: "SOLID", color: colors.systemGray6.rgb }];
  } else {
    field.fills = [{ type: "SOLID", color: colors.systemBackground.rgb }];
    field.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
    field.strokeWeight = 0.5;
    field.strokeBottomWeight = 0.5;
    field.strokeTopWeight = 0;
    field.strokeLeftWeight = 0;
    field.strokeRightWeight = 0;
  }

  // Text
  const text = figma.createText();
  text.fontName = { family: "Inter", style: "Regular" };
  text.characters = value || placeholder;
  text.fontSize = 17;
  text.fills = [
    {
      type: "SOLID",
      color: value ? colors.label.rgb : colors.tertiaryLabel.rgb,
    },
  ];
  text.layoutGrow = 1;
  field.appendChild(text);

  // Clear button (if has value)
  if (clearButton && value) {
    const clearBtn = figma.createFrame();
    clearBtn.name = "ClearButton";
    clearBtn.resize(18, 18);
    clearBtn.cornerRadius = 9;
    clearBtn.fills = [{ type: "SOLID", color: colors.systemGray3.rgb }];

    const clearIcon = figma.createText();
    clearIcon.fontName = { family: "Inter", style: "Regular" };
    clearIcon.characters = "×";
    clearIcon.fontSize = 14;
    clearIcon.fills = [{ type: "SOLID", color: colors.systemBackground.rgb }];
    clearIcon.x = 4;
    clearIcon.y = 0;
    clearBtn.appendChild(clearIcon);

    field.appendChild(clearBtn);
  }

  container.appendChild(field);

  return container;
}

export interface ActivityIndicatorOptions {
  size?: "small" | "medium" | "large";
  theme?: Theme;
}

export async function createIOSActivityIndicator(
  options: ActivityIndicatorOptions = {}
): Promise<FrameNode> {
  const {
    size = "medium",
    theme = "light",
  } = options;

  const colors = getIOSColors(theme);
  const sizeMap = {
    small: 20,
    medium: 37,
    large: 50,
  };
  const actualSize = sizeMap[size];

  const indicator = figma.createFrame();
  indicator.name = `iOS ActivityIndicator/${size}`;
  indicator.resize(actualSize, actualSize);
  indicator.fills = [];

  // Create spinning segments
  const segments = 8;
  const segmentWidth = actualSize * 0.08;
  const segmentLength = actualSize * 0.25;

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * 360;
    const opacity = 0.2 + (i / segments) * 0.8;

    const segment = figma.createRectangle();
    segment.name = `Segment-${i}`;
    segment.resize(segmentWidth, segmentLength);
    segment.cornerRadius = segmentWidth / 2;
    segment.fills = [
      {
        type: "SOLID",
        color: colors.systemGray.rgb,
      },
    ];
    segment.opacity = opacity;

    // Position segment
    const centerX = actualSize / 2;
    const centerY = actualSize / 2;
    const radius = actualSize * 0.35;

    segment.x = centerX - segmentWidth / 2;
    segment.y = centerY - radius - segmentLength / 2;
    segment.rotation = angle;

    // Apply rotation around center
    const radians = (angle * Math.PI) / 180;
    const offsetX = radius * Math.sin(radians);
    const offsetY = -radius * Math.cos(radians) + radius;
    segment.x += offsetX;
    segment.y += offsetY;

    indicator.appendChild(segment);
  }

  return indicator;
}
