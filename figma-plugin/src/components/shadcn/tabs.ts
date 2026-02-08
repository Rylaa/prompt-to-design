/**
 * shadcn Tabs Component
 */

import {
  getShadcnColors,
  shadcnSpacing,
  Theme,
} from "../../tokens";
import { resolveThemeFromOptions } from "../../tokens/theme-helpers";

export interface TabsOptions {
  tabs?: string[];
  activeIndex?: number;
  width?: number;
  theme?: Theme;
}

export async function createShadcnTabs(
  options: TabsOptions = {}
): Promise<FrameNode> {
  const {
    tabs = ["Account", "Password", "Settings"],
    activeIndex = 0,
    width,
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const colors = getShadcnColors(theme);

  // Create tabs container
  const container = figma.createFrame();
  container.name = "Tabs";
  container.layoutMode = "VERTICAL";
  container.primaryAxisSizingMode = "AUTO";
  container.counterAxisSizingMode = width ? "FIXED" : "AUTO";
  if (width) container.resize(width, 48);
  container.itemSpacing = 0;
  container.fills = [];

  // Create tab list
  const tabList = figma.createFrame();
  tabList.name = "TabList";
  tabList.layoutMode = "HORIZONTAL";
  tabList.primaryAxisSizingMode = "AUTO";
  tabList.counterAxisSizingMode = "AUTO";
  tabList.paddingLeft = 4;
  tabList.paddingRight = 4;
  tabList.paddingTop = 4;
  tabList.paddingBottom = 4;
  tabList.itemSpacing = 0;
  tabList.cornerRadius = 8;
  tabList.fills = [{ type: "SOLID", color: colors.muted.rgb }];

  // Create tabs
  for (let i = 0; i < tabs.length; i++) {
    const isActive = i === activeIndex;

    const tab = figma.createFrame();
    tab.name = `Tab-${tabs[i]}`;
    tab.layoutMode = "HORIZONTAL";
    tab.primaryAxisAlignItems = "CENTER";
    tab.counterAxisAlignItems = "CENTER";
    tab.primaryAxisSizingMode = "AUTO";
    tab.counterAxisSizingMode = "FIXED";
    tab.resize(100, shadcnSpacing.tabHeight - 8);
    tab.paddingLeft = shadcnSpacing.tabPadding;
    tab.paddingRight = shadcnSpacing.tabPadding;
    tab.cornerRadius = 6;

    if (isActive) {
      tab.fills = [{ type: "SOLID", color: colors.background.rgb }];
      tab.effects = [
        {
          type: "DROP_SHADOW",
          color: { r: 0, g: 0, b: 0, a: 0.05 },
          offset: { x: 0, y: 1 },
          radius: 2,
          spread: 0,
          visible: true,
          blendMode: "NORMAL",
        },
      ];
    } else {
      tab.fills = [];
    }

    // Add tab text
    const tabText = figma.createText();
    try {
      await figma.loadFontAsync({
        family: "Inter",
        style: isActive ? "Medium" : "Regular",
      });
      tabText.fontName = {
        family: "Inter",
        style: isActive ? "Medium" : "Regular",
      };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      tabText.fontName = { family: "Inter", style: "Regular" };
    }
    tabText.characters = tabs[i];
    tabText.fontSize = 14;
    tabText.fills = [
      {
        type: "SOLID",
        color: isActive ? colors.foreground.rgb : colors.mutedForeground.rgb,
      },
    ];

    tab.appendChild(tabText);
    tabList.appendChild(tab);
  }

  container.appendChild(tabList);

  return container;
}

export async function createShadcnSeparator(
  options: { orientation?: "horizontal" | "vertical"; length?: number; theme?: Theme } = {}
): Promise<FrameNode> {
  const {
    orientation = "horizontal",
    length = 200,
    theme: rawTheme,
  } = options;
  const theme = resolveThemeFromOptions(rawTheme);

  const colors = getShadcnColors(theme);

  const separator = figma.createFrame();
  separator.name = "Separator";

  if (orientation === "horizontal") {
    separator.resize(length, 1);
  } else {
    separator.resize(1, length);
  }

  separator.fills = [{ type: "SOLID", color: colors.border.rgb }];

  return separator;
}
