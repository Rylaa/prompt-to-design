// figma-plugin/src/handlers/screen-renderer.ts

import { DEVICE_PRESETS, IOS_LAYOUT, SPACER_SIZES, IOS_TYPOGRAPHY } from "./screen-constants";
import {
  createIOSButton,
  createIOSNavigationBar,
  createIOSTabBar,
  createIOSCell,
  createIOSList,
  createIOSTextField,
  createIOSSearchBar,
  createIOSSegmentedControl,
} from "../components/apple-ios";
import { getIOSColors, type Theme } from "../tokens";
import { handleCreateIcon } from "./components";
import { hexToRgb } from "./utils";
import { initializeDesignStyles, type DesignStyles } from "./style-initializer";

// ============================================================================
// Types (mirroring the MCP schema, simplified for plugin)
// ============================================================================

interface ScreenSpec {
  device: string;
  theme: "light" | "dark";
  statusBar?: { style?: string; hidden?: boolean };
  navigationBar?: { title: string; variant?: string; leftButton?: string; rightButton?: string; hasSearchBar?: boolean };
  content: ContentItem[];
  tabBar?: { items: Array<{ icon: string; label: string; badge?: number }>; activeIndex?: number };
  name?: string;
  backgroundColor?: string;
}

type ContentItem =
  | { type: "text"; value: string; style?: string; color?: string; customColor?: string; align?: string; weight?: string }
  | { type: "button"; text: string; style?: string; size?: string; icon?: string; disabled?: boolean; fullWidth?: boolean }
  | { type: "text-field"; placeholder?: string; value?: string; label?: string; secure?: boolean; style?: string }
  | { type: "cell"; title: string; subtitle?: string; value?: string; icon?: string; hasChevron?: boolean; hasToggle?: boolean; toggleValue?: boolean; style?: string }
  | { type: "list"; header?: string; footer?: string; style?: string; cells: any[] }
  | { type: "toggle"; label: string; value?: boolean }
  | { type: "search-bar"; placeholder?: string }
  | { type: "segmented-control"; segments: string[]; selectedIndex?: number }
  | { type: "image"; width?: number; height?: number; cornerRadius?: number; aspectRatio?: string }
  | { type: "spacer"; size?: string }
  | { type: "divider" }
  | { type: "icon"; name: string; size?: number; color?: string }
  | { type: "row"; children: ContentItem[]; spacing?: number; align?: string; distribute?: string }
  | { type: "section"; title?: string; children: ContentItem[]; spacing?: number; padding?: number }
  | { type: "card"; children: ContentItem[]; padding?: number; cornerRadius?: number; shadow?: boolean }
  | { type: "grid"; children: ContentItem[]; columns?: number; gap?: number; rowGap?: number }
  | { type: "container"; name?: string; children: ContentItem[]; layout?: string; spacing?: number; padding?: number; align?: string; background?: string };

// ============================================================================
// Main Entry Point
// ============================================================================

export async function handleCreateScreen(params: { screen: ScreenSpec }): Promise<{ nodeId: string; name: string }> {
  const spec = params.screen;
  const theme = (spec.theme || "light") as Theme;
  const device = DEVICE_PRESETS[spec.device] || DEVICE_PRESETS["iphone-15"];
  const screenName = spec.name || "Screen";

  // 1. Create screen frame
  const screen = figma.createFrame();
  screen.name = screenName;
  screen.resize(device.width, device.height);
  screen.layoutMode = "VERTICAL";
  screen.primaryAxisSizingMode = "FIXED";
  screen.counterAxisSizingMode = "FIXED";
  screen.paddingTop = 0;
  screen.paddingBottom = 0;
  screen.paddingLeft = 0;
  screen.paddingRight = 0;
  screen.itemSpacing = 0;
  screen.clipsContent = true;

  // Initialize Figma local styles
  const styles = await initializeDesignStyles(theme);

  // Set background
  if (spec.backgroundColor) {
    screen.fills = [{ type: "SOLID", color: hexToRgb(spec.backgroundColor) }];
  } else {
    const bgColor = theme === "dark"
      ? { r: 0, g: 0, b: 0 }
      : { r: 0.949, g: 0.949, b: 0.969 }; // iOS systemGroupedBackground
    screen.fills = [{ type: "SOLID", color: bgColor }];
  }

  // 2. Status bar
  if (!spec.statusBar?.hidden) {
    await renderStatusBar(screen, device.width, theme, spec.statusBar?.style);
  }

  // 3. Navigation bar
  if (spec.navigationBar) {
    await renderNavigationBar(screen, spec.navigationBar, device.width, theme);
  }

  // 4. Content area (FILL remaining space)
  const contentArea = figma.createFrame();
  contentArea.name = "Content";
  contentArea.layoutMode = "VERTICAL";
  contentArea.primaryAxisSizingMode = "FIXED";
  contentArea.counterAxisSizingMode = "FIXED";
  contentArea.paddingTop = IOS_LAYOUT.contentPadding;
  contentArea.paddingBottom = IOS_LAYOUT.contentPadding;
  contentArea.paddingLeft = IOS_LAYOUT.contentPadding;
  contentArea.paddingRight = IOS_LAYOUT.contentPadding;
  contentArea.itemSpacing = 12;
  contentArea.clipsContent = true;
  contentArea.fills = [];

  screen.appendChild(contentArea);
  contentArea.layoutSizingHorizontal = "FILL";
  contentArea.layoutSizingVertical = "FILL";

  // Render content items
  for (const item of spec.content) {
    await renderContentItem(contentArea, item, theme, device.width - (IOS_LAYOUT.contentPadding * 2), styles);
  }

  // 5. Tab bar
  if (spec.tabBar) {
    await renderTabBar(screen, spec.tabBar, device.width, theme);
  }

  // Select and scroll to the created screen
  figma.currentPage.selection = [screen];
  figma.viewport.scrollAndZoomIntoView([screen]);

  return { nodeId: screen.id, name: screen.name };
}

// ============================================================================
// Status Bar Renderer
// ============================================================================

async function renderStatusBar(
  parent: FrameNode,
  width: number,
  theme: Theme,
  style?: string
): Promise<void> {
  const statusBar = figma.createFrame();
  statusBar.name = "Status Bar";
  statusBar.resize(width, IOS_LAYOUT.statusBarHeight);
  statusBar.layoutMode = "HORIZONTAL";
  statusBar.primaryAxisAlignItems = "SPACE_BETWEEN";
  statusBar.counterAxisAlignItems = "MAX";
  statusBar.paddingLeft = 20;
  statusBar.paddingRight = 20;
  statusBar.paddingBottom = 10;
  statusBar.fills = [];

  const barStyle = style || (theme === "dark" ? "light" : "dark");
  const textColor = barStyle === "light"
    ? { r: 1, g: 1, b: 1 }
    : { r: 0, g: 0, b: 0 };

  // Time
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  const time = figma.createText();
  time.fontName = { family: "Inter", style: "Semi Bold" };
  time.characters = "9:41";
  time.fontSize = 15;
  time.fills = [{ type: "SOLID", color: textColor }];
  statusBar.appendChild(time);

  // Right icons placeholder (signal, wifi, battery)
  const rightIcons = figma.createFrame();
  rightIcons.name = "Right Icons";
  rightIcons.layoutMode = "HORIZONTAL";
  rightIcons.itemSpacing = 5;
  rightIcons.primaryAxisSizingMode = "AUTO";
  rightIcons.counterAxisSizingMode = "AUTO";
  rightIcons.fills = [];

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  const icons = figma.createText();
  icons.fontName = { family: "Inter", style: "Regular" };
  icons.characters = "signal  wifi  100%";
  icons.fontSize = 12;
  icons.fills = [{ type: "SOLID", color: textColor }];
  rightIcons.appendChild(icons);

  statusBar.appendChild(rightIcons);

  parent.appendChild(statusBar);
  statusBar.layoutSizingHorizontal = "FILL";
}

// ============================================================================
// Navigation Bar Renderer
// ============================================================================

async function renderNavigationBar(
  parent: FrameNode,
  spec: ScreenSpec["navigationBar"],
  width: number,
  theme: Theme
): Promise<void> {
  if (!spec) return;

  const navBar = await createIOSNavigationBar({
    title: spec.title,
    variant: (spec.variant as "large" | "inline") || "inline",
    leftButton: spec.leftButton,
    rightButton: spec.rightButton,
    hasSearchBar: spec.hasSearchBar,
    width,
    theme,
  });

  parent.appendChild(navBar);
  navBar.layoutSizingHorizontal = "FILL";
}

// ============================================================================
// Tab Bar Renderer
// ============================================================================

async function renderTabBar(
  parent: FrameNode,
  spec: ScreenSpec["tabBar"],
  width: number,
  theme: Theme
): Promise<void> {
  if (!spec) return;

  const tabBar = await createIOSTabBar({
    items: spec.items,
    activeIndex: spec.activeIndex ?? 0,
    width,
    theme,
  });

  parent.appendChild(tabBar);
  tabBar.layoutSizingHorizontal = "FILL";
}

// ============================================================================
// Content Item Renderer (Recursive)
// ============================================================================

async function renderContentItem(
  parent: FrameNode,
  item: ContentItem,
  theme: Theme,
  availableWidth: number,
  styles?: DesignStyles
): Promise<void> {
  switch (item.type) {
    case "text": {
      await renderText(parent, item, theme, styles);
      break;
    }
    case "button": {
      await renderButton(parent, item, theme, availableWidth);
      break;
    }
    case "text-field": {
      await renderTextField(parent, item, theme, availableWidth);
      break;
    }
    case "cell": {
      await renderCell(parent, item, theme, availableWidth);
      break;
    }
    case "list": {
      await renderList(parent, item, theme, availableWidth);
      break;
    }
    case "toggle": {
      await renderToggleRow(parent, item, theme, availableWidth);
      break;
    }
    case "search-bar": {
      const searchBar = await createIOSSearchBar({
        placeholder: item.placeholder || "Search",
        width: availableWidth,
        theme,
      });
      parent.appendChild(searchBar);
      searchBar.layoutSizingHorizontal = "FILL";
      break;
    }
    case "segmented-control": {
      const segmented = await createIOSSegmentedControl({
        segments: item.segments,
        selectedIndex: item.selectedIndex ?? 0,
        width: availableWidth,
        theme,
      });
      parent.appendChild(segmented);
      segmented.layoutSizingHorizontal = "FILL";
      break;
    }
    case "image": {
      await renderImagePlaceholder(parent, item, theme, availableWidth);
      break;
    }
    case "spacer": {
      renderSpacer(parent, item);
      break;
    }
    case "divider": {
      renderDivider(parent, theme, availableWidth);
      break;
    }
    case "icon": {
      await renderIcon(parent, item, theme);
      break;
    }
    case "row": {
      await renderRow(parent, item, theme, availableWidth, styles);
      break;
    }
    case "section": {
      await renderSection(parent, item, theme, availableWidth, styles);
      break;
    }
    case "card": {
      await renderCard(parent, item, theme, availableWidth, styles);
      break;
    }
    case "grid": {
      await renderGrid(parent, item, theme, availableWidth, styles);
      break;
    }
    case "container": {
      await renderContainer(parent, item, theme, availableWidth, styles);
      break;
    }
  }
}

// ============================================================================
// Individual Content Renderers
// ============================================================================

async function renderText(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "text" }>,
  theme: Theme,
  styles?: DesignStyles
): Promise<void> {
  const colors = getIOSColors(theme);
  const styleName = item.style || "body";
  const typo = IOS_TYPOGRAPHY[styleName] || IOS_TYPOGRAPHY.body;
  const weight = item.weight || typo.fontWeight;

  const fontStyle = weight === "bold" ? "Bold"
    : weight === "semibold" ? "Semi Bold"
    : weight === "medium" ? "Medium"
    : "Regular";

  await figma.loadFontAsync({ family: "Inter", style: fontStyle });

  const text = figma.createText();
  text.fontName = { family: "Inter", style: fontStyle };
  text.characters = item.value;
  text.fontSize = typo.fontSize;
  text.lineHeight = { value: typo.lineHeight, unit: "PIXELS" };

  // Apply text style if available (allows global style updates)
  const textStyleId = styles?.textStyles.get(styleName);
  if (textStyleId && !item.weight) {
    text.textStyleId = textStyleId;
  }

  // Color
  let textColor = colors.label;
  if (item.color === "secondary") textColor = colors.secondaryLabel;
  else if (item.color === "tertiary") textColor = colors.tertiaryLabel;
  else if (item.color === "accent") textColor = colors.systemBlue;
  else if (item.color === "destructive") textColor = colors.systemRed;
  else if (item.color === "custom" && item.customColor) textColor = hexToRgb(item.customColor);

  text.fills = [{ type: "SOLID", color: textColor }];

  // Apply paint style for semantic colors
  if (styles && item.color !== "custom") {
    const colorKey = item.color === "accent" ? "systemBlue"
      : item.color === "destructive" ? "systemRed"
      : item.color === "secondary" ? "secondaryLabel"
      : item.color === "tertiary" ? "tertiaryLabel"
      : "label";
    const paintStyleId = styles.paintStyles.get(colorKey);
    if (paintStyleId) {
      text.fillStyleId = paintStyleId;
    }
  }

  // Alignment
  if (item.align === "center") text.textAlignHorizontal = "CENTER";
  else if (item.align === "right") text.textAlignHorizontal = "RIGHT";

  parent.appendChild(text);
  text.layoutSizingHorizontal = "FILL";
}

async function renderButton(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "button" }>,
  theme: Theme,
  availableWidth: number
): Promise<void> {
  const btn = await createIOSButton({
    text: item.text,
    style: (item.style as any) || "filled",
    size: (item.size as any) || "medium",
    icon: item.icon,
    disabled: item.disabled,
    theme,
  });

  parent.appendChild(btn);
  btn.setPluginData("_componentize", JSON.stringify({
    name: `iOS Button/${item.style || "filled"}`,
    type: "button",
  }));

  if (item.fullWidth) {
    btn.layoutSizingHorizontal = "FILL";
  }
}

async function renderTextField(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "text-field" }>,
  theme: Theme,
  availableWidth: number
): Promise<void> {
  const field = await createIOSTextField({
    placeholder: item.placeholder || "",
    value: item.value || "",
    label: item.label,
    style: (item.style as any) || "rounded",
    width: availableWidth,
    theme,
  });

  parent.appendChild(field);
  field.layoutSizingHorizontal = "FILL";
}

async function renderCell(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "cell" }>,
  theme: Theme,
  availableWidth: number
): Promise<void> {
  const cell = await createIOSCell({
    title: item.title,
    subtitle: item.subtitle,
    value: item.value,
    icon: item.icon,
    hasChevron: item.hasChevron,
    hasToggle: item.hasToggle,
    toggleValue: item.toggleValue,
    style: (item.style as any) || "default",
    width: availableWidth,
    theme,
  });

  parent.appendChild(cell);
  cell.layoutSizingHorizontal = "FILL";
}

async function renderList(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "list" }>,
  theme: Theme,
  availableWidth: number
): Promise<void> {
  const list = await createIOSList({
    header: item.header,
    footer: item.footer,
    style: (item.style as any) || "inset",
    cells: item.cells.map(cell => ({
      ...cell,
      style: cell.style || "default",
    })),
    width: availableWidth,
    theme,
  });

  parent.appendChild(list);
  list.layoutSizingHorizontal = "FILL";
}

async function renderToggleRow(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "toggle" }>,
  theme: Theme,
  availableWidth: number
): Promise<void> {
  // Toggle with label as a cell-like row
  const cell = await createIOSCell({
    title: item.label,
    hasToggle: true,
    toggleValue: item.value ?? false,
    style: "default",
    width: availableWidth,
    theme,
  });

  parent.appendChild(cell);
  cell.layoutSizingHorizontal = "FILL";
}

async function renderImagePlaceholder(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "image" }>,
  theme: Theme,
  availableWidth: number
): Promise<void> {
  const colors = getIOSColors(theme);
  const width = item.width || availableWidth;
  let height = item.height || 200;

  // Aspect ratio
  if (item.aspectRatio) {
    const [w, h] = item.aspectRatio.split(":").map(Number);
    height = Math.round(width * (h / w));
  }

  const placeholder = figma.createFrame();
  placeholder.name = "Image Placeholder";
  placeholder.resize(width, height);
  placeholder.cornerRadius = item.cornerRadius || 0;
  placeholder.fills = [{ type: "SOLID", color: colors.systemGray5 || colors.systemGray4 }];

  // Center icon
  placeholder.layoutMode = "VERTICAL";
  placeholder.primaryAxisAlignItems = "CENTER";
  placeholder.counterAxisAlignItems = "CENTER";

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  const iconText = figma.createText();
  iconText.fontName = { family: "Inter", style: "Regular" };
  iconText.characters = "Image";
  iconText.fontSize = 14;
  iconText.fills = [{ type: "SOLID", color: colors.tertiaryLabel }];
  placeholder.appendChild(iconText);

  parent.appendChild(placeholder);
  placeholder.layoutSizingHorizontal = "FILL";
}

function renderSpacer(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "spacer" }>
): void {
  const size = item.size || "md";

  if (size === "fill") {
    // Flexible spacer - grows to fill available space
    const spacer = figma.createFrame();
    spacer.name = "Spacer (Fill)";
    spacer.fills = [];
    spacer.resize(1, 1);
    parent.appendChild(spacer);
    spacer.layoutSizingHorizontal = "FILL";
    spacer.layoutGrow = 1;
  } else {
    const height = SPACER_SIZES[size] || 16;
    const spacer = figma.createFrame();
    spacer.name = `Spacer (${size})`;
    spacer.fills = [];
    spacer.resize(1, height);
    parent.appendChild(spacer);
    spacer.layoutSizingHorizontal = "FILL";
  }
}

function renderDivider(
  parent: FrameNode,
  theme: Theme,
  availableWidth: number
): void {
  const colors = getIOSColors(theme);
  const divider = figma.createFrame();
  divider.name = "Divider";
  divider.resize(availableWidth, 0.5);
  divider.fills = [{ type: "SOLID", color: colors.separator }];

  parent.appendChild(divider);
  divider.layoutSizingHorizontal = "FILL";
}

async function renderIcon(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "icon" }>,
  theme: Theme
): Promise<void> {
  const colors = getIOSColors(theme);
  let color = colors.label;
  if (item.color === "secondary") color = colors.secondaryLabel;
  else if (item.color === "tertiary") color = colors.tertiaryLabel;
  else if (item.color === "accent") color = colors.systemBlue;

  try {
    const iconResult = await handleCreateIcon({
      name: item.name,
      size: item.size || 24,
      color: rgbToHex(color),
    });
    if (iconResult && typeof iconResult === "object" && "nodeId" in iconResult) {
      const iconNode = figma.getNodeById(iconResult.nodeId as string);
      if (iconNode) {
        parent.appendChild(iconNode as SceneNode);
      }
    }
  } catch {
    // Fallback: create a simple rectangle as placeholder
    const placeholder = figma.createFrame();
    placeholder.name = `Icon: ${item.name}`;
    placeholder.resize(item.size || 24, item.size || 24);
    placeholder.fills = [{ type: "SOLID", color: colors.tertiaryLabel }];
    placeholder.cornerRadius = 4;
    parent.appendChild(placeholder);
  }
}

// ============================================================================
// Layout Container Renderers
// ============================================================================

async function renderRow(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "row" }>,
  theme: Theme,
  availableWidth: number,
  styles?: DesignStyles
): Promise<void> {
  const row = figma.createFrame();
  row.name = "Row";
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = item.spacing ?? 12;
  row.fills = [];

  // Alignment
  if (item.align === "top") row.counterAxisAlignItems = "MIN";
  else if (item.align === "bottom") row.counterAxisAlignItems = "MAX";
  else if (item.align === "stretch") row.counterAxisAlignItems = "MIN"; // stretch handled via FILL
  else row.counterAxisAlignItems = "CENTER";

  // Distribution
  if (item.distribute === "center") row.primaryAxisAlignItems = "CENTER";
  else if (item.distribute === "end") row.primaryAxisAlignItems = "MAX";
  else if (item.distribute === "space-between") row.primaryAxisAlignItems = "SPACE_BETWEEN";
  else row.primaryAxisAlignItems = "MIN";

  parent.appendChild(row);
  row.layoutSizingHorizontal = "FILL";

  const childWidth = item.distribute === "equal"
    ? Math.floor((availableWidth - (item.spacing ?? 12) * (item.children.length - 1)) / item.children.length)
    : availableWidth;

  for (const child of item.children) {
    await renderContentItem(row, child, theme, childWidth, styles);
  }

  // Equal distribution: set all children to FILL
  if (item.distribute === "equal") {
    for (let i = 0; i < row.children.length; i++) {
      const child = row.children[i];
      if ("layoutSizingHorizontal" in child) {
        (child as FrameNode).layoutSizingHorizontal = "FILL";
      }
    }
  }
}

async function renderSection(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "section" }>,
  theme: Theme,
  availableWidth: number,
  styles?: DesignStyles
): Promise<void> {
  const colors = getIOSColors(theme);
  const section = figma.createFrame();
  section.name = item.title ? `Section: ${item.title}` : "Section";
  section.layoutMode = "VERTICAL";
  section.primaryAxisSizingMode = "AUTO";
  section.counterAxisSizingMode = "AUTO";
  section.itemSpacing = item.spacing ?? 8;
  section.fills = [];

  if (item.padding !== undefined) {
    section.paddingTop = item.padding;
    section.paddingBottom = item.padding;
    section.paddingLeft = item.padding;
    section.paddingRight = item.padding;
  }

  parent.appendChild(section);
  section.layoutSizingHorizontal = "FILL";

  // Section title
  if (item.title) {
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
    const title = figma.createText();
    title.fontName = { family: "Inter", style: "Semi Bold" };
    title.characters = item.title;
    title.fontSize = 13;
    title.textCase = "UPPER";
    title.fills = [{ type: "SOLID", color: colors.secondaryLabel }];
    title.letterSpacing = { value: 0.5, unit: "PIXELS" };
    section.appendChild(title);
    title.layoutSizingHorizontal = "FILL";
  }

  for (const child of item.children) {
    await renderContentItem(section, child, theme, availableWidth, styles);
  }
}

async function renderCard(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "card" }>,
  theme: Theme,
  availableWidth: number,
  styles?: DesignStyles
): Promise<void> {
  const padding = item.padding ?? 16;

  const card = figma.createFrame();
  card.name = "Card";
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "AUTO";
  card.itemSpacing = 8;
  card.paddingTop = padding;
  card.paddingBottom = padding;
  card.paddingLeft = padding;
  card.paddingRight = padding;
  card.cornerRadius = item.cornerRadius ?? 12;
  card.fills = [{ type: "SOLID", color: theme === "dark" ? { r: 0.11, g: 0.11, b: 0.118 } : { r: 1, g: 1, b: 1 } }];

  if (item.shadow !== false) {
    const shadowStyleId = styles?.effectStyles.get("cardShadow");
    if (shadowStyleId) {
      card.effectStyleId = shadowStyleId;
    } else {
      card.effects = [{
        type: "DROP_SHADOW",
        color: { r: 0, g: 0, b: 0, a: theme === "dark" ? 0.3 : 0.08 },
        offset: { x: 0, y: 2 },
        radius: 8,
        spread: 0,
        visible: true,
        blendMode: "NORMAL",
      }];
    }
  }

  parent.appendChild(card);
  card.layoutSizingHorizontal = "FILL";
  card.setPluginData("_componentize", JSON.stringify({
    name: "iOS Card",
    type: "card",
  }));

  const innerWidth = availableWidth - (padding * 2);
  for (const child of item.children) {
    await renderContentItem(card, child, theme, innerWidth, styles);
  }
}

async function renderGrid(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "grid" }>,
  theme: Theme,
  availableWidth: number,
  styles?: DesignStyles
): Promise<void> {
  const columns = item.columns ?? 2;
  const gap = item.gap ?? 16;
  const rowGap = item.rowGap ?? gap;

  const grid = figma.createFrame();
  grid.name = "Grid";
  grid.layoutMode = "HORIZONTAL";
  grid.layoutWrap = "WRAP";
  grid.primaryAxisSizingMode = "FIXED";
  grid.counterAxisSizingMode = "AUTO";
  grid.itemSpacing = gap;
  grid.counterAxisSpacing = rowGap;
  grid.fills = [];

  parent.appendChild(grid);
  grid.layoutSizingHorizontal = "FILL";

  const totalGap = (columns - 1) * gap;
  const itemWidth = Math.floor((availableWidth - totalGap) / columns);

  for (const child of item.children) {
    const gridItem = figma.createFrame();
    gridItem.name = "GridItem";
    gridItem.resize(itemWidth, 100);
    gridItem.layoutMode = "VERTICAL";
    gridItem.primaryAxisSizingMode = "AUTO";
    gridItem.counterAxisSizingMode = "FIXED";
    gridItem.fills = [];

    grid.appendChild(gridItem);

    await renderContentItem(gridItem, child, theme, itemWidth, styles);
  }
}

async function renderContainer(
  parent: FrameNode,
  item: Extract<ContentItem, { type: "container" }>,
  theme: Theme,
  availableWidth: number,
  styles?: DesignStyles
): Promise<void> {
  const container = figma.createFrame();
  container.name = item.name || "Container";
  container.layoutMode = item.layout === "horizontal" ? "HORIZONTAL" : "VERTICAL";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = "AUTO";
  container.itemSpacing = item.spacing ?? 16;
  container.fills = [];

  if (item.padding !== undefined) {
    container.paddingTop = item.padding;
    container.paddingBottom = item.padding;
    container.paddingLeft = item.padding;
    container.paddingRight = item.padding;
  }

  if (item.background) {
    container.fills = [{ type: "SOLID", color: hexToRgb(item.background) }];
  }

  if (item.align === "center") {
    container.counterAxisAlignItems = "CENTER";
    container.primaryAxisAlignItems = "CENTER";
  } else if (item.align === "end") {
    container.primaryAxisAlignItems = "MAX";
  }

  parent.appendChild(container);
  container.layoutSizingHorizontal = "FILL";

  const innerWidth = item.padding ? availableWidth - (item.padding * 2) : availableWidth;
  for (const child of item.children) {
    await renderContentItem(container, child, theme, innerWidth, styles);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function rgbToHex(color: { r: number; g: number; b: number }): string {
  const r = Math.round(color.r * 255).toString(16).padStart(2, "0");
  const g = Math.round(color.g * 255).toString(16).padStart(2, "0");
  const b = Math.round(color.b * 255).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}
