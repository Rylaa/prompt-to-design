/**
 * Apple iOS Tab Bar Component
 */

import {
  getIOSColors,
  iosSpacing,
  iosTypography,
  iosShadowsLight,
  iosShadowsDark,
  shadowsToFigmaEffects,
  Theme,
} from "../../tokens";

export interface TabBarItem {
  icon: string;
  label: string;
  badge?: number;
}

export interface TabBarOptions {
  items?: TabBarItem[];
  activeIndex?: number;
  width?: number;
  theme?: Theme;
}

export async function createIOSTabBar(
  options: TabBarOptions = {}
): Promise<FrameNode> {
  const {
    items = [
      { icon: "🏠", label: "Home" },
      { icon: "🔍", label: "Search" },
      { icon: "➕", label: "Add" },
      { icon: "❤️", label: "Favorites" },
      { icon: "👤", label: "Profile" },
    ],
    activeIndex = 0,
    width = 390,
    theme = "light",
  } = options;

  const colors = getIOSColors(theme);

  // Create tab bar frame
  const tabBar = figma.createFrame();
  tabBar.name = "iOS TabBar";
  tabBar.layoutMode = "HORIZONTAL";
  tabBar.primaryAxisSizingMode = "FIXED";
  tabBar.counterAxisSizingMode = "FIXED";
  tabBar.resize(width, iosSpacing.tabBarHeight);
  tabBar.primaryAxisAlignItems = "SPACE_BETWEEN";
  tabBar.counterAxisAlignItems = "CENTER";
  tabBar.paddingLeft = 8;
  tabBar.paddingRight = 8;
  tabBar.fills = [
    {
      type: "SOLID",
      color: colors.systemBackground.rgb,
      opacity: 0.94,
    },
  ];

  // Add shadow
  const shadows = theme === "light" ? iosShadowsLight : iosShadowsDark;
  tabBar.effects = shadowsToFigmaEffects(shadows.tabBar.shadows);

  // Create tab items
  const itemWidth = (width - 16) / items.length;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isActive = i === activeIndex;

    const tabItem = figma.createFrame();
    tabItem.name = `TabItem-${item.label}`;
    tabItem.layoutMode = "VERTICAL";
    tabItem.primaryAxisAlignItems = "CENTER";
    tabItem.counterAxisAlignItems = "CENTER";
    tabItem.layoutSizingVertical = "FIXED";
    // layoutSizingHorizontal = "FILL" is set after appendChild
    tabItem.resize(itemWidth, iosSpacing.tabBarHeight);
    tabItem.itemSpacing = 2;
    tabItem.fills = [];

    // Icon container (for badge positioning)
    const iconContainer = figma.createFrame();
    iconContainer.name = "IconContainer";
    iconContainer.resize(30, 24);
    iconContainer.fills = [];

    // Icon
    const iconText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    iconText.fontName = { family: "Inter", style: "Regular" };
    iconText.characters = item.icon;
    iconText.fontSize = 22;
    iconText.fills = [
      {
        type: "SOLID",
        color: isActive ? colors.systemBlue.rgb : colors.systemGray.rgb,
      },
    ];
    iconText.x = 4;
    iconText.y = 0;
    iconContainer.appendChild(iconText);

    // Badge (if provided)
    if (item.badge !== undefined && item.badge > 0) {
      const badge = figma.createFrame();
      badge.name = "Badge";
      badge.layoutMode = "HORIZONTAL";
      badge.primaryAxisAlignItems = "CENTER";
      badge.counterAxisAlignItems = "CENTER";
      badge.primaryAxisSizingMode = "AUTO";
      badge.counterAxisSizingMode = "AUTO";
      badge.paddingLeft = 5;
      badge.paddingRight = 5;
      badge.paddingTop = 1;
      badge.paddingBottom = 1;
      badge.cornerRadius = 9;
      badge.fills = [{ type: "SOLID", color: colors.systemRed.rgb }];
      badge.x = 18;
      badge.y = -4;

      const badgeText = figma.createText();
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      badgeText.fontName = { family: "Inter", style: "Bold" };
      badgeText.characters = item.badge > 99 ? "99+" : String(item.badge);
      badgeText.fontSize = 11;
      badgeText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      badge.appendChild(badgeText);

      iconContainer.appendChild(badge);
    }

    tabItem.appendChild(iconContainer);

    // Label
    const labelText = figma.createText();
    const labelStyle = iosTypography.caption2;
    try {
      await figma.loadFontAsync({ family: "SF Pro Text", style: "Medium" });
      labelText.fontName = { family: "SF Pro Text", style: "Medium" };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Medium" });
      labelText.fontName = { family: "Inter", style: "Medium" };
    }
    labelText.characters = item.label;
    labelText.fontSize = 10;
    labelText.fills = [
      {
        type: "SOLID",
        color: isActive ? colors.systemBlue.rgb : colors.systemGray.rgb,
      },
    ];

    tabItem.appendChild(labelText);
    tabBar.appendChild(tabItem);
    tabItem.layoutSizingHorizontal = "FILL";
  }

  return tabBar;
}
