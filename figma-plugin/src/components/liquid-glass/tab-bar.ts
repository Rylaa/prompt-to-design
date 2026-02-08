/**
 * Liquid Glass Tab Bar Component
 */

import { getLiquidGlassColors, Theme } from "../../tokens";
import { applyGlassMaterial } from "./index";

export interface LiquidGlassTabBarItem {
  icon: string;
  label: string;
  isActive?: boolean;
}

export interface LiquidGlassTabBarOptions {
  items?: LiquidGlassTabBarItem[];
  width?: number;
  theme?: Theme;
}

export async function createLiquidGlassTabBar(
  options: LiquidGlassTabBarOptions = {}
): Promise<FrameNode> {
  const {
    items = [
      { icon: "house.fill", label: "Home", isActive: true },
      { icon: "magnifyingglass", label: "Search" },
      { icon: "heart.fill", label: "Favorites" },
      { icon: "person.fill", label: "Profile" },
    ],
    width = 390,
    theme = "light",
  } = options;

  const colors = getLiquidGlassColors(theme);

  const tabBar = figma.createFrame();
  tabBar.name = "LiquidGlass TabBar";
  tabBar.layoutMode = "HORIZONTAL";
  tabBar.primaryAxisSizingMode = "FIXED";
  tabBar.counterAxisSizingMode = "FIXED";
  tabBar.resize(width, 83);
  tabBar.paddingTop = 8;
  tabBar.paddingBottom = 34; // Safe area
  tabBar.paddingLeft = 8;
  tabBar.paddingRight = 8;
  tabBar.itemSpacing = 0;
  tabBar.primaryAxisAlignItems = "SPACE_BETWEEN";

  // Apply glass material
  applyGlassMaterial(tabBar, { theme, material: "regular", style: theme === "light" ? "light" : "dark" });

  // Top border for subtle definition
  tabBar.strokes = [
    {
      type: "SOLID",
      color: theme === "light"
        ? { r: 0, g: 0, b: 0 }
        : { r: 1, g: 1, b: 1 },
      opacity: theme === "light" ? 0.1 : 0.1,
    },
  ];
  tabBar.strokeWeight = 0.5;
  tabBar.strokeTopWeight = 0.5;
  tabBar.strokeBottomWeight = 0;
  tabBar.strokeLeftWeight = 0;
  tabBar.strokeRightWeight = 0;

  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  const itemWidth = (width - 16) / items.length;

  for (const item of items) {
    const tabItem = figma.createFrame();
    tabItem.name = `Tab-${item.label}`;
    tabItem.layoutMode = "VERTICAL";
    tabItem.primaryAxisSizingMode = "FIXED";
    tabItem.counterAxisSizingMode = "FIXED";
    tabItem.resize(itemWidth, 41);
    tabItem.itemSpacing = 2;
    tabItem.primaryAxisAlignItems = "CENTER";
    tabItem.counterAxisAlignItems = "CENTER";
    tabItem.fills = [];

    // Icon placeholder (circle for now)
    const iconContainer = figma.createFrame();
    iconContainer.name = "Icon";
    iconContainer.resize(24, 24);
    iconContainer.cornerRadius = 4;
    iconContainer.fills = [];

    // Icon symbol (using SF Symbol-like text)
    const iconText = figma.createText();
    iconText.fontName = { family: "Inter", style: "Medium" };
    iconText.characters = item.icon.charAt(0).toUpperCase();
    iconText.fontSize = 16;
    iconText.fills = [
      {
        type: "SOLID",
        color: item.isActive ? colors.liquidBlue.rgb : colors.secondaryLabelOnGlass.rgb,
      },
    ];
    iconText.textAlignHorizontal = "CENTER";
    iconContainer.appendChild(iconText);
    iconText.x = (24 - iconText.width) / 2;
    iconText.y = (24 - iconText.height) / 2;

    tabItem.appendChild(iconContainer);

    // Label
    const label = figma.createText();
    label.fontName = { family: "Inter", style: item.isActive ? "Medium" : "Regular" };
    label.characters = item.label;
    label.fontSize = 10;
    label.fills = [
      {
        type: "SOLID",
        color: item.isActive ? colors.liquidBlue.rgb : colors.secondaryLabelOnGlass.rgb,
      },
    ];
    tabItem.appendChild(label);

    tabBar.appendChild(tabItem);
  }

  return tabBar;
}
