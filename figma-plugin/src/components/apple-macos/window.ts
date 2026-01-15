/**
 * Apple macOS Window Component
 * Variants: document, utility, panel
 */

import {
  getMacOSColors,
  macOSSpacing,
  macOSShadowsLight,
  macOSShadowsDark,
  shadowsToFigmaEffects,
  Theme,
} from "../../tokens";

export type WindowVariant = "document" | "utility" | "panel";

export interface WindowOptions {
  title?: string;
  variant?: WindowVariant;
  width?: number;
  height?: number;
  hasToolbar?: boolean;
  hasSidebar?: boolean;
  theme?: Theme;
}

export async function createMacOSWindow(
  options: WindowOptions = {}
): Promise<FrameNode> {
  const {
    title = "Untitled",
    variant = "document",
    width = 800,
    height = 600,
    hasToolbar = true,
    hasSidebar = false,
    theme = "light",
  } = options;

  const colors = getMacOSColors(theme);
  const shadows = theme === "light" ? macOSShadowsLight : macOSShadowsDark;

  // Create window frame
  const window = figma.createFrame();
  window.name = `macOS Window/${variant}`;
  window.layoutMode = "VERTICAL";
  window.primaryAxisSizingMode = "FIXED";
  window.counterAxisSizingMode = "FIXED";
  window.resize(width, height);
  window.cornerRadius = 10;
  window.fills = [{ type: "SOLID", color: colors.systemBackground.rgb }];
  window.effects = shadowsToFigmaEffects(shadows.window.shadows);
  window.clipsContent = true;

  // Create title bar
  const titleBar = await createMacOSTitleBar({
    title,
    width,
    hasToolbar,
    theme,
  });
  window.appendChild(titleBar);
  titleBar.layoutSizingHorizontal = "FILL";

  // Create content area
  const contentArea = figma.createFrame();
  contentArea.name = "ContentArea";
  contentArea.layoutMode = "HORIZONTAL";
  // layoutSizingHorizontal = "FILL" is set after appendChild
  contentArea.layoutSizingVertical = "HUG";
  contentArea.layoutAlign = "STRETCH";
  contentArea.layoutGrow = 1;
  contentArea.fills = [];

  // Add sidebar if enabled
  if (hasSidebar) {
    const sidebar = await createMacOSSidebar({
      width: macOSSpacing.sidebarWidth,
      theme,
    });
    contentArea.appendChild(sidebar);
  }

  // Main content
  const mainContent = figma.createFrame();
  mainContent.name = "MainContent";
  mainContent.layoutMode = "VERTICAL";
  mainContent.layoutSizingVertical = "HUG";
  // layoutSizingHorizontal = "FILL" is set after appendChild
  mainContent.layoutAlign = "STRETCH";
  mainContent.layoutGrow = 1;
  mainContent.paddingTop = macOSSpacing.contentPadding;
  mainContent.paddingBottom = macOSSpacing.contentPadding;
  mainContent.paddingLeft = macOSSpacing.contentPadding;
  mainContent.paddingRight = macOSSpacing.contentPadding;
  mainContent.fills = [];
  contentArea.appendChild(mainContent);
  mainContent.layoutSizingHorizontal = "FILL";

  window.appendChild(contentArea);
  contentArea.layoutSizingHorizontal = "FILL";

  return window;
}

export async function createMacOSTitleBar(
  options: { title?: string; width?: number; hasToolbar?: boolean; theme?: Theme } = {}
): Promise<FrameNode> {
  const {
    title = "Untitled",
    width = 800,
    hasToolbar = true,
    theme = "light",
  } = options;

  const colors = getMacOSColors(theme);
  const height = hasToolbar ? macOSSpacing.toolbarHeight : 28;

  // Create title bar frame
  const titleBar = figma.createFrame();
  titleBar.name = "TitleBar";
  titleBar.layoutMode = "HORIZONTAL";
  // layoutSizingHorizontal = "FILL" is set after appendChild in parent
  titleBar.layoutSizingVertical = "FIXED";
  titleBar.layoutAlign = "STRETCH";
  titleBar.resize(width, height);
  titleBar.paddingLeft = 12;
  titleBar.paddingRight = 12;
  titleBar.primaryAxisAlignItems = "SPACE_BETWEEN";
  titleBar.counterAxisAlignItems = "CENTER";
  titleBar.fills = [
    {
      type: "SOLID",
      color: colors.secondarySystemBackground.rgb,
    },
  ];

  // Add bottom border
  titleBar.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
  titleBar.strokeWeight = 0.5;
  titleBar.strokeAlign = "INSIDE";
  titleBar.strokeBottomWeight = 0.5;
  titleBar.strokeTopWeight = 0;
  titleBar.strokeLeftWeight = 0;
  titleBar.strokeRightWeight = 0;

  // Traffic lights container
  const trafficLights = figma.createFrame();
  trafficLights.name = "TrafficLights";
  trafficLights.layoutMode = "HORIZONTAL";
  trafficLights.primaryAxisSizingMode = "AUTO";
  trafficLights.counterAxisSizingMode = "AUTO";
  trafficLights.itemSpacing = 8;
  trafficLights.fills = [];

  // Close button (red)
  const closeBtn = figma.createEllipse();
  closeBtn.name = "CloseButton";
  closeBtn.resize(12, 12);
  closeBtn.fills = [{ type: "SOLID", color: { r: 1, g: 0.38, b: 0.35 } }];

  // Minimize button (yellow)
  const minBtn = figma.createEllipse();
  minBtn.name = "MinimizeButton";
  minBtn.resize(12, 12);
  minBtn.fills = [{ type: "SOLID", color: { r: 1, g: 0.74, b: 0.18 } }];

  // Maximize button (green)
  const maxBtn = figma.createEllipse();
  maxBtn.name = "MaximizeButton";
  maxBtn.resize(12, 12);
  maxBtn.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.8, b: 0.25 } }];

  trafficLights.appendChild(closeBtn);
  trafficLights.appendChild(minBtn);
  trafficLights.appendChild(maxBtn);
  titleBar.appendChild(trafficLights);

  // Title text
  const titleText = figma.createText();
  try {
    await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
    titleText.fontName = { family: "SF Pro Text", style: "Regular" };
  } catch (e) {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    titleText.fontName = { family: "Inter", style: "Regular" };
  }
  titleText.characters = title;
  titleText.fontSize = 13;
  titleText.fills = [{ type: "SOLID", color: colors.label.rgb }];
  titleBar.appendChild(titleText);

  // Spacer for balance
  const spacer = figma.createFrame();
  spacer.name = "Spacer";
  spacer.resize(52, 12);
  spacer.fills = [];
  titleBar.appendChild(spacer);

  return titleBar;
}

export async function createMacOSSidebar(
  options: { width?: number; items?: string[]; activeIndex?: number; theme?: Theme } = {}
): Promise<FrameNode> {
  const {
    width = macOSSpacing.sidebarWidth,
    items = ["Documents", "Downloads", "Desktop", "Applications"],
    activeIndex = 0,
    theme = "light",
  } = options;

  const colors = getMacOSColors(theme);

  // Create sidebar frame
  const sidebar = figma.createFrame();
  sidebar.name = "Sidebar";
  sidebar.layoutMode = "VERTICAL";
  sidebar.layoutSizingVertical = "FILL";
  sidebar.layoutSizingHorizontal = "FIXED";
  sidebar.resize(width, 400);
  sidebar.paddingTop = 8;
  sidebar.paddingBottom = 8;
  sidebar.paddingLeft = 8;
  sidebar.paddingRight = 8;
  sidebar.itemSpacing = 2;
  sidebar.fills = [
    {
      type: "SOLID",
      color: theme === "light"
        ? { r: 0.96, g: 0.96, b: 0.97 }
        : colors.secondarySystemBackground.rgb,
    },
  ];

  // Add border on right
  sidebar.strokes = [{ type: "SOLID", color: colors.separator.rgb }];
  sidebar.strokeWeight = 0.5;
  sidebar.strokeAlign = "INSIDE";
  sidebar.strokeRightWeight = 0.5;
  sidebar.strokeTopWeight = 0;
  sidebar.strokeBottomWeight = 0;
  sidebar.strokeLeftWeight = 0;

  // Create sidebar items
  for (let i = 0; i < items.length; i++) {
    const isActive = i === activeIndex;

    const item = figma.createFrame();
    item.name = `SidebarItem-${items[i]}`;
    item.layoutMode = "HORIZONTAL";
    // layoutSizingHorizontal = "FILL" is set after appendChild
    item.layoutSizingVertical = "FIXED";
    item.layoutAlign = "STRETCH";
    item.resize(width - 16, macOSSpacing.sidebarItemHeight);
    item.paddingLeft = macOSSpacing.sidebarItemPadding;
    item.paddingRight = macOSSpacing.sidebarItemPadding;
    item.primaryAxisAlignItems = "MIN";
    item.counterAxisAlignItems = "CENTER";
    item.itemSpacing = 8;
    item.cornerRadius = 6;

    if (isActive) {
      item.fills = [{ type: "SOLID", color: colors.systemBlue.rgb, opacity: 0.2 }];
    } else {
      item.fills = [];
    }

    // Icon
    const icon = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    icon.fontName = { family: "Inter", style: "Regular" };
    icon.characters = "📁";
    icon.fontSize = 14;
    item.appendChild(icon);

    // Label
    const label = figma.createText();
    try {
      await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
      label.fontName = { family: "SF Pro Text", style: "Regular" };
    } catch (e) {
      label.fontName = { family: "Inter", style: "Regular" };
    }
    label.characters = items[i];
    label.fontSize = 13;
    label.fills = [
      {
        type: "SOLID",
        color: isActive ? colors.systemBlue.rgb : colors.label.rgb,
      },
    ];
    item.appendChild(label);

    sidebar.appendChild(item);
    item.layoutSizingHorizontal = "FILL";
  }

  return sidebar;
}
