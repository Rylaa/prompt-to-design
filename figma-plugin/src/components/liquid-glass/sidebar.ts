/**
 * Liquid Glass Sidebar Component
 */

import { getLiquidGlassColors, Theme } from "../../tokens";
import { applyGlassMaterial, GlassMaterial } from "./index";

export interface LiquidGlassSidebarItem {
  icon: string;
  label: string;
  isActive?: boolean;
  badge?: number;
}

export interface LiquidGlassSidebarOptions {
  items?: LiquidGlassSidebarItem[];
  width?: number;
  height?: number;
  title?: string;
  theme?: Theme;
  material?: GlassMaterial;
}

export async function createLiquidGlassSidebar(
  options: LiquidGlassSidebarOptions = {}
): Promise<FrameNode> {
  const {
    items = [
      { icon: "H", label: "Home", isActive: true },
      { icon: "S", label: "Search" },
      { icon: "L", label: "Library" },
      { icon: "P", label: "Profile" },
      { icon: "G", label: "Settings" },
    ],
    width = 280,
    height = 600,
    title = "Menu",
    theme = "light",
    material = "regular",
  } = options;

  const colors = getLiquidGlassColors(theme);

  const sidebar = figma.createFrame();
  sidebar.name = "LiquidGlass Sidebar";
  sidebar.layoutMode = "VERTICAL";
  sidebar.primaryAxisSizingMode = "FIXED";
  sidebar.counterAxisSizingMode = "FIXED";
  sidebar.resize(width, height);
  sidebar.paddingTop = 60;
  sidebar.paddingBottom = 20;
  sidebar.paddingLeft = 16;
  sidebar.paddingRight = 16;
  sidebar.itemSpacing = 4;

  // Apply glass material
  applyGlassMaterial(sidebar, { theme, material, style: theme === "light" ? "light" : "dark" });

  // Right border
  sidebar.strokes = [
    {
      type: "SOLID",
      color: colors.separatorOnGlass.rgb,
      opacity: 0.3,
    },
  ];
  sidebar.strokeWeight = 0.5;
  sidebar.strokeTopWeight = 0;
  sidebar.strokeBottomWeight = 0;
  sidebar.strokeLeftWeight = 0;
  sidebar.strokeRightWeight = 0.5;

  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  // Title
  const titleText = figma.createText();
  titleText.fontName = { family: "Inter", style: "Bold" };
  titleText.characters = title;
  titleText.fontSize = 24;
  titleText.fills = [{ type: "SOLID", color: colors.labelOnGlass.rgb }];
  sidebar.appendChild(titleText);

  // Spacer
  const spacer = figma.createFrame();
  spacer.name = "Spacer";
  spacer.resize(width - 32, 20);
  spacer.fills = [];
  sidebar.appendChild(spacer);

  // Menu items
  for (const item of items) {
    const menuItem = figma.createFrame();
    menuItem.name = `MenuItem-${item.label}`;
    menuItem.layoutMode = "HORIZONTAL";
    menuItem.primaryAxisSizingMode = "FIXED";
    menuItem.counterAxisSizingMode = "AUTO";
    menuItem.resize(width - 32, 44);
    menuItem.paddingLeft = 12;
    menuItem.paddingRight = 12;
    menuItem.itemSpacing = 12;
    menuItem.counterAxisAlignItems = "CENTER";
    menuItem.cornerRadius = 10;

    if (item.isActive) {
      menuItem.fills = [
        {
          type: "SOLID",
          color: colors.liquidBlue.rgb,
          opacity: 0.15,
        },
      ];
    } else {
      menuItem.fills = [];
    }

    // Icon
    const iconText = figma.createText();
    iconText.fontName = { family: "Inter", style: "Medium" };
    iconText.characters = item.icon;
    iconText.fontSize = 18;
    iconText.fills = [
      {
        type: "SOLID",
        color: item.isActive ? colors.liquidBlue.rgb : colors.labelOnGlass.rgb,
      },
    ];
    menuItem.appendChild(iconText);

    // Label
    const label = figma.createText();
    label.fontName = { family: "Inter", style: item.isActive ? "Medium" : "Regular" };
    label.characters = item.label;
    label.fontSize = 16;
    label.layoutGrow = 1;
    label.fills = [
      {
        type: "SOLID",
        color: item.isActive ? colors.liquidBlue.rgb : colors.labelOnGlass.rgb,
      },
    ];
    menuItem.appendChild(label);

    // Badge
    if (item.badge && item.badge > 0) {
      const badge = figma.createFrame();
      badge.name = "Badge";
      badge.layoutMode = "HORIZONTAL";
      badge.primaryAxisSizingMode = "AUTO";
      badge.counterAxisSizingMode = "AUTO";
      badge.paddingLeft = 8;
      badge.paddingRight = 8;
      badge.paddingTop = 2;
      badge.paddingBottom = 2;
      badge.cornerRadius = 10;
      badge.fills = [{ type: "SOLID", color: colors.liquidRed.rgb }];

      const badgeText = figma.createText();
      badgeText.fontName = { family: "Inter", style: "Medium" };
      badgeText.characters = item.badge.toString();
      badgeText.fontSize = 12;
      badgeText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      badge.appendChild(badgeText);

      menuItem.appendChild(badge);
    }

    sidebar.appendChild(menuItem);
  }

  return sidebar;
}
