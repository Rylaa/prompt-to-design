/**
 * shadcn Select/Dropdown Component
 * A dropdown menu for selecting from a list of options
 */

import {
  getShadcnColors,
  shadcnSpacing,
  Theme,
} from "../../tokens";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  shortcut?: string;
}

export interface SelectOptions {
  placeholder?: string;
  value?: string;
  options?: SelectOption[];
  width?: number;
  disabled?: boolean;
  open?: boolean;
  theme?: Theme;
}

export async function createShadcnSelect(
  options: SelectOptions = {}
): Promise<FrameNode> {
  const {
    placeholder = "Select an option",
    value,
    options: selectOptions = [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
      { label: "Option 3", value: "3" },
    ],
    width = 200,
    disabled = false,
    open = false,
    theme = "light",
  } = options;

  const colors = getShadcnColors(theme);

  // Create select trigger
  const select = figma.createFrame();
  select.name = open ? "Select/Open" : "Select";
  select.layoutMode = "VERTICAL";
  select.primaryAxisSizingMode = "AUTO";
  select.counterAxisSizingMode = "FIXED";
  select.resize(width, 40);
  select.itemSpacing = 4;
  select.fills = [];

  // Trigger button
  const trigger = figma.createFrame();
  trigger.name = "SelectTrigger";
  trigger.layoutMode = "HORIZONTAL";
  trigger.primaryAxisSizingMode = "FIXED";
  trigger.counterAxisSizingMode = "FIXED";
  trigger.resize(width, 40);
  trigger.paddingLeft = 12;
  trigger.paddingRight = 12;
  trigger.primaryAxisAlignItems = "SPACE_BETWEEN";
  trigger.counterAxisAlignItems = "CENTER";
  trigger.cornerRadius = 6;
  trigger.fills = [{ type: "SOLID", color: colors.background.rgb }];
  trigger.strokes = [{ type: "SOLID", color: colors.input.rgb }];
  trigger.strokeWeight = 1;

  if (disabled) {
    trigger.opacity = 0.5;
  }

  // Selected value or placeholder
  const valueText = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  valueText.fontName = { family: "Inter", style: "Regular" };

  const selectedOption = selectOptions.find(opt => opt.value === value);
  valueText.characters = selectedOption ? selectedOption.label : placeholder;
  valueText.fontSize = 14;
  valueText.fills = [
    {
      type: "SOLID",
      color: selectedOption ? colors.foreground.rgb : colors.mutedForeground.rgb,
    },
  ];
  trigger.appendChild(valueText);

  // Chevron icon
  const chevron = figma.createText();
  chevron.fontName = { family: "Inter", style: "Regular" };
  chevron.characters = open ? "▲" : "▼";
  chevron.fontSize = 10;
  chevron.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];
  trigger.appendChild(chevron);

  select.appendChild(trigger);

  // Dropdown content (if open)
  if (open) {
    const content = figma.createFrame();
    content.name = "SelectContent";
    content.layoutMode = "VERTICAL";
    content.primaryAxisSizingMode = "AUTO";
    content.counterAxisSizingMode = "FIXED";
    content.resize(width, 100);
    content.paddingTop = 4;
    content.paddingBottom = 4;
    content.cornerRadius = 6;
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

    for (const opt of selectOptions) {
      const item = figma.createFrame();
      item.name = `SelectItem-${opt.value}`;
      item.layoutMode = "HORIZONTAL";
      item.layoutSizingHorizontal = "FILL";
      item.layoutSizingVertical = "HUG";
      item.paddingLeft = 8;
      item.paddingRight = 8;
      item.paddingTop = 8;
      item.paddingBottom = 8;
      item.counterAxisAlignItems = "CENTER";
      item.fills = opt.value === value
        ? [{ type: "SOLID", color: colors.accent.rgb }]
        : [];

      const itemText = figma.createText();
      itemText.fontName = { family: "Inter", style: "Regular" };
      itemText.characters = opt.label;
      itemText.fontSize = 14;
      itemText.fills = [{ type: "SOLID", color: colors.popoverForeground.rgb }];
      item.appendChild(itemText);

      content.appendChild(item);
      item.layoutSizingHorizontal = "FILL";
    }

    select.appendChild(content);
  }

  return select;
}

interface DropdownMenuItem {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
}

export async function createShadcnDropdownMenu(
  options: {
    triggerText?: string;
    items?: DropdownMenuItem[];
    width?: number;
    theme?: Theme;
  } = {}
): Promise<FrameNode> {
  const defaultItems: DropdownMenuItem[] = [
    { label: "Profile", shortcut: "⇧⌘P" },
    { label: "Settings", shortcut: "⌘," },
    { label: "", separator: true },
    { label: "Log out", shortcut: "⇧⌘Q" },
  ];
  const {
    triggerText = "Open Menu",
    items = defaultItems,
    width = 200,
    theme = "light",
  } = options;

  const colors = getShadcnColors(theme);

  const dropdown = figma.createFrame();
  dropdown.name = "DropdownMenu";
  dropdown.layoutMode = "VERTICAL";
  dropdown.primaryAxisSizingMode = "AUTO";
  dropdown.counterAxisSizingMode = "AUTO";
  dropdown.itemSpacing = 4;
  dropdown.fills = [];

  // Trigger button
  const trigger = figma.createFrame();
  trigger.name = "DropdownTrigger";
  trigger.layoutMode = "HORIZONTAL";
  trigger.primaryAxisSizingMode = "AUTO";
  trigger.counterAxisSizingMode = "AUTO";
  trigger.paddingLeft = 16;
  trigger.paddingRight = 16;
  trigger.paddingTop = 8;
  trigger.paddingBottom = 8;
  trigger.counterAxisAlignItems = "CENTER";
  trigger.itemSpacing = 8;
  trigger.cornerRadius = 6;
  trigger.fills = [{ type: "SOLID", color: colors.secondary.rgb }];

  const triggerLabel = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  triggerLabel.fontName = { family: "Inter", style: "Medium" };
  triggerLabel.characters = triggerText;
  triggerLabel.fontSize = 14;
  triggerLabel.fills = [{ type: "SOLID", color: colors.secondaryForeground.rgb }];
  trigger.appendChild(triggerLabel);

  const chevron = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  chevron.fontName = { family: "Inter", style: "Regular" };
  chevron.characters = "▼";
  chevron.fontSize = 10;
  chevron.fills = [{ type: "SOLID", color: colors.secondaryForeground.rgb }];
  trigger.appendChild(chevron);

  dropdown.appendChild(trigger);

  // Menu content
  const content = figma.createFrame();
  content.name = "DropdownContent";
  content.layoutMode = "VERTICAL";
  content.primaryAxisSizingMode = "AUTO";
  content.counterAxisSizingMode = "FIXED";
  content.resize(width, 100);
  content.paddingTop = 4;
  content.paddingBottom = 4;
  content.cornerRadius = 6;
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

  for (const item of items) {
    if (item.separator) {
      const sep = figma.createFrame();
      sep.name = "Separator";
      sep.resize(width - 8, 1);
      sep.fills = [{ type: "SOLID", color: colors.border.rgb }];
      sep.layoutAlign = "STRETCH";
      content.appendChild(sep);
      continue;
    }

    const menuItem = figma.createFrame();
    menuItem.name = `MenuItem-${item.label}`;
    menuItem.layoutMode = "HORIZONTAL";
    menuItem.layoutSizingHorizontal = "FILL";
    menuItem.layoutSizingVertical = "HUG";
    menuItem.paddingLeft = 8;
    menuItem.paddingRight = 8;
    menuItem.paddingTop = 8;
    menuItem.paddingBottom = 8;
    menuItem.primaryAxisAlignItems = "SPACE_BETWEEN";
    menuItem.counterAxisAlignItems = "CENTER";
    menuItem.fills = [];

    if (item.disabled) {
      menuItem.opacity = 0.5;
    }

    const labelText = figma.createText();
    labelText.fontName = { family: "Inter", style: "Regular" };
    labelText.characters = item.label;
    labelText.fontSize = 14;
    labelText.fills = [{ type: "SOLID", color: colors.popoverForeground.rgb }];
    menuItem.appendChild(labelText);

    if (item.shortcut) {
      const shortcutText = figma.createText();
      shortcutText.fontName = { family: "Inter", style: "Regular" };
      shortcutText.characters = item.shortcut;
      shortcutText.fontSize = 12;
      shortcutText.fills = [{ type: "SOLID", color: colors.mutedForeground.rgb }];
      menuItem.appendChild(shortcutText);
    }

    content.appendChild(menuItem);
    menuItem.layoutSizingHorizontal = "FILL";
  }

  dropdown.appendChild(content);

  return dropdown;
}
