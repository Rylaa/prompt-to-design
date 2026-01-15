/**
 * Apple iOS List & Cell Components
 * List styles: plain, inset, grouped
 * Cell styles: default, subtitle, value
 */

import {
  getIOSColors,
  iosSpacing,
  iosTypography,
  getFigmaFontStyle,
  Theme,
} from "../../tokens";

export type ListStyle = "plain" | "inset" | "grouped";
export type CellStyle = "default" | "subtitle" | "value";

export interface CellOptions {
  title: string;
  subtitle?: string;
  value?: string;
  style?: CellStyle;
  hasChevron?: boolean;
  hasToggle?: boolean;
  toggleValue?: boolean;
  icon?: string;
  width?: number;
  theme?: Theme;
}

export interface ListOptions {
  header?: string;
  footer?: string;
  style?: ListStyle;
  cells?: CellOptions[];
  width?: number;
  theme?: Theme;
}

export async function createIOSCell(
  options: CellOptions
): Promise<FrameNode> {
  const {
    title,
    subtitle,
    value,
    style = "default",
    hasChevron = false,
    hasToggle = false,
    toggleValue = false,
    icon,
    width = 390,
    theme = "light",
  } = options;

  const colors = getIOSColors(theme);

  // Create cell frame
  const cell = figma.createFrame();
  cell.name = `iOS Cell/${style}`;
  cell.layoutMode = "HORIZONTAL";
  cell.primaryAxisSizingMode = "FIXED";
  cell.counterAxisSizingMode = "AUTO";
  cell.resize(width, 44);
  cell.paddingLeft = iosSpacing.cellPaddingHorizontal;
  cell.paddingRight = iosSpacing.cellPaddingHorizontal;
  cell.paddingTop = iosSpacing.cellPaddingVertical;
  cell.paddingBottom = iosSpacing.cellPaddingVertical;
  cell.primaryAxisAlignItems = "SPACE_BETWEEN";
  cell.counterAxisAlignItems = "CENTER";
  cell.itemSpacing = 12;
  cell.fills = [{ type: "SOLID", color: colors.secondarySystemGroupedBackground.rgb }];

  // Left content container
  const leftContent = figma.createFrame();
  leftContent.name = "LeftContent";
  leftContent.layoutMode = "HORIZONTAL";
  leftContent.primaryAxisSizingMode = "AUTO";
  leftContent.counterAxisSizingMode = "AUTO";
  leftContent.primaryAxisAlignItems = "MIN";
  leftContent.counterAxisAlignItems = "CENTER";
  leftContent.itemSpacing = 12;
  leftContent.fills = [];

  // Icon (if provided)
  if (icon) {
    const iconText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    iconText.fontName = { family: "Inter", style: "Regular" };
    iconText.characters = icon;
    iconText.fontSize = 22;
    iconText.fills = [{ type: "SOLID", color: colors.systemBlue.rgb }];
    leftContent.appendChild(iconText);
  }

  // Text content
  const textContent = figma.createFrame();
  textContent.name = "TextContent";
  textContent.layoutMode = "VERTICAL";
  textContent.primaryAxisSizingMode = "AUTO";
  textContent.counterAxisSizingMode = "AUTO";
  textContent.itemSpacing = 2;
  textContent.fills = [];

  // Title
  const titleText = figma.createText();
  const bodyStyle = iosTypography.body;
  try {
    await figma.loadFontAsync({
      family: "SF Pro Text",
      style: getFigmaFontStyle(bodyStyle.weight),
    });
    titleText.fontName = {
      family: "SF Pro Text",
      style: getFigmaFontStyle(bodyStyle.weight),
    };
  } catch (e) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    titleText.fontName = { family: "Inter", style: "Regular" };
  }
  titleText.characters = title;
  titleText.fontSize = bodyStyle.size;
  titleText.fills = [{ type: "SOLID", color: colors.label.rgb }];
  textContent.appendChild(titleText);

  // Subtitle (for subtitle style)
  if (subtitle && (style === "subtitle" || style === "value")) {
    const subtitleText = figma.createText();
    const subStyle = iosTypography.footnote;
    try {
      await figma.loadFontAsync({
        family: "SF Pro Text",
        style: getFigmaFontStyle(subStyle.weight),
      });
      subtitleText.fontName = {
        family: "SF Pro Text",
        style: getFigmaFontStyle(subStyle.weight),
      };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      subtitleText.fontName = { family: "Inter", style: "Regular" };
    }
    subtitleText.characters = subtitle;
    subtitleText.fontSize = subStyle.size;
    subtitleText.fills = [{ type: "SOLID", color: colors.secondaryLabel.rgb }];
    textContent.appendChild(subtitleText);
  }

  leftContent.appendChild(textContent);
  cell.appendChild(leftContent);

  // Right content container
  const rightContent = figma.createFrame();
  rightContent.name = "RightContent";
  rightContent.layoutMode = "HORIZONTAL";
  rightContent.primaryAxisSizingMode = "AUTO";
  rightContent.counterAxisSizingMode = "AUTO";
  rightContent.primaryAxisAlignItems = "MAX";
  rightContent.counterAxisAlignItems = "CENTER";
  rightContent.itemSpacing = 8;
  rightContent.fills = [];

  // Value (for value style)
  if (value && !hasToggle) {
    const valueText = figma.createText();
    try {
      await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
      valueText.fontName = { family: "SF Pro Text", style: "Regular" };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      valueText.fontName = { family: "Inter", style: "Regular" };
    }
    valueText.characters = value;
    valueText.fontSize = 17;
    valueText.fills = [{ type: "SOLID", color: colors.secondaryLabel.rgb }];
    rightContent.appendChild(valueText);
  }

  // Toggle (if enabled)
  if (hasToggle) {
    const toggle = await createIOSToggle({ value: toggleValue, theme });
    rightContent.appendChild(toggle);
  }

  // Chevron (if enabled)
  if (hasChevron && !hasToggle) {
    const chevron = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    chevron.fontName = { family: "Inter", style: "Regular" };
    chevron.characters = "›";
    chevron.fontSize = 22;
    chevron.fills = [{ type: "SOLID", color: colors.tertiaryLabel.rgb }];
    rightContent.appendChild(chevron);
  }

  cell.appendChild(rightContent);

  return cell;
}

export async function createIOSToggle(
  options: { value?: boolean; theme?: Theme } = {}
): Promise<FrameNode> {
  const { value = false, theme = "light" } = options;
  const colors = getIOSColors(theme);

  const toggle = figma.createFrame();
  toggle.name = value ? "iOS Toggle/On" : "iOS Toggle/Off";
  toggle.resize(51, 31);
  toggle.cornerRadius = 15.5;
  toggle.fills = [
    {
      type: "SOLID",
      color: value ? colors.systemGreen.rgb : colors.systemGray4.rgb,
    },
  ];

  // Thumb
  const thumb = figma.createEllipse();
  thumb.name = "Thumb";
  thumb.resize(27, 27);
  thumb.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  thumb.x = value ? 22 : 2;
  thumb.y = 2;
  thumb.effects = [
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.15 },
      offset: { x: 0, y: 3 },
      radius: 8,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    },
  ];

  toggle.appendChild(thumb);

  return toggle;
}

export async function createIOSList(
  options: ListOptions = {}
): Promise<FrameNode> {
  const {
    header,
    footer,
    style = "grouped",
    cells = [],
    width = 390,
    theme = "light",
  } = options;

  const colors = getIOSColors(theme);
  const isInset = style === "inset" || style === "grouped";
  const cellWidth = isInset ? width - 32 : width;

  // Create list frame
  const list = figma.createFrame();
  list.name = `iOS List/${style}`;
  list.layoutMode = "VERTICAL";
  list.primaryAxisSizingMode = "AUTO";
  list.counterAxisSizingMode = "FIXED";
  list.resize(width, 200);
  list.paddingTop = isInset ? 8 : 0;
  list.paddingBottom = isInset ? 8 : 0;
  list.paddingLeft = isInset ? 16 : 0;
  list.paddingRight = isInset ? 16 : 0;
  list.itemSpacing = 0;
  list.fills = [{ type: "SOLID", color: colors.systemGroupedBackground.rgb }];

  // Header
  if (header) {
    const headerContainer = figma.createFrame();
    headerContainer.name = "ListHeader";
    headerContainer.layoutMode = "HORIZONTAL";
    // layoutSizingHorizontal = "FILL" is set after appendChild
    headerContainer.layoutSizingVertical = "HUG";
    headerContainer.layoutAlign = "STRETCH";
    headerContainer.paddingLeft = 16;
    headerContainer.paddingBottom = 6;
    headerContainer.fills = [];

    const headerText = figma.createText();
    try {
      await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
      headerText.fontName = { family: "SF Pro Text", style: "Regular" };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      headerText.fontName = { family: "Inter", style: "Regular" };
    }
    headerText.characters = header.toUpperCase();
    headerText.fontSize = 13;
    headerText.fills = [{ type: "SOLID", color: colors.secondaryLabel.rgb }];
    headerContainer.appendChild(headerText);

    list.appendChild(headerContainer);
    headerContainer.layoutSizingHorizontal = "FILL";
  }

  // Cells container
  const cellsContainer = figma.createFrame();
  cellsContainer.name = "CellsContainer";
  cellsContainer.layoutMode = "VERTICAL";
  cellsContainer.layoutSizingVertical = "HUG";
  // layoutSizingHorizontal = "FILL" is set after appendChild
  cellsContainer.layoutAlign = "STRETCH";
  cellsContainer.itemSpacing = 0;
  cellsContainer.cornerRadius = isInset ? 10 : 0;
  cellsContainer.fills = [{ type: "SOLID", color: colors.secondarySystemGroupedBackground.rgb }];
  cellsContainer.clipsContent = true;

  // Add cells
  for (let i = 0; i < cells.length; i++) {
    const cellOptions = cells[i];
    const cell = await createIOSCell({
      ...cellOptions,
      width: cellWidth,
      theme,
    });

    // Add separator (except for last cell)
    if (i < cells.length - 1) {
      const separator = figma.createFrame();
      separator.name = "Separator";
      separator.resize(cellWidth - 16, 0.5);
      separator.x = 16;
      separator.fills = [{ type: "SOLID", color: colors.separator.rgb }];

      const cellWithSeparator = figma.createFrame();
      cellWithSeparator.name = "CellWithSeparator";
      cellWithSeparator.layoutMode = "VERTICAL";
      cellWithSeparator.layoutSizingVertical = "HUG";
      // layoutSizingHorizontal = "FILL" is set after appendChild
      cellWithSeparator.layoutAlign = "STRETCH";
      cellWithSeparator.itemSpacing = 0;
      cellWithSeparator.fills = [];

      cellWithSeparator.appendChild(cell);
      cellWithSeparator.appendChild(separator);
      cellsContainer.appendChild(cellWithSeparator);
      cellWithSeparator.layoutSizingHorizontal = "FILL";
    } else {
      cellsContainer.appendChild(cell);
    }
  }

  list.appendChild(cellsContainer);
  cellsContainer.layoutSizingHorizontal = "FILL";

  // Footer
  if (footer) {
    const footerContainer = figma.createFrame();
    footerContainer.name = "ListFooter";
    footerContainer.layoutMode = "HORIZONTAL";
    // layoutSizingHorizontal = "FILL" is set after appendChild
    footerContainer.layoutSizingVertical = "HUG";
    footerContainer.layoutAlign = "STRETCH";
    footerContainer.paddingLeft = 16;
    footerContainer.paddingTop = 6;
    footerContainer.fills = [];

    const footerText = figma.createText();
    try {
      await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
      footerText.fontName = { family: "SF Pro Text", style: "Regular" };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      footerText.fontName = { family: "Inter", style: "Regular" };
    }
    footerText.characters = footer;
    footerText.fontSize = 13;
    footerText.fills = [{ type: "SOLID", color: colors.secondaryLabel.rgb }];
    footerText.textAutoResize = "HEIGHT";
    footerContainer.appendChild(footerText);

    list.appendChild(footerContainer);
    footerContainer.layoutSizingHorizontal = "FILL";
  }

  return list;
}
