/**
 * Apple iOS Navigation Bar Component
 * Variants: large, inline
 */

import {
  getIOSColors,
  iosSpacing,
  iosTypography,
  iosShadowsLight,
  iosShadowsDark,
  shadowsToFigmaEffects,
  getFigmaFontStyle,
  Theme,
} from "../../tokens";
import { hexToRgb } from "../../tokens/colors";

export type NavBarVariant = "large" | "inline";

export interface NavBarOptions {
  title?: string;
  variant?: NavBarVariant;
  leftButton?: string;
  rightButton?: string;
  hasSearchBar?: boolean;
  width?: number;
  theme?: Theme;
}

export async function createIOSNavigationBar(
  options: NavBarOptions = {}
): Promise<FrameNode> {
  const {
    title = "Title",
    variant = "large",
    leftButton,
    rightButton,
    hasSearchBar = false,
    width = 390,
    theme = "light",
  } = options;

  const colors = getIOSColors(theme);
  const isLarge = variant === "large";
  const height = isLarge ? iosSpacing.navBarHeightLarge : iosSpacing.navBarHeight;

  // Create navigation bar frame
  const navBar = figma.createFrame();
  navBar.name = `iOS NavigationBar/${variant}`;
  navBar.layoutMode = "VERTICAL";
  navBar.primaryAxisSizingMode = "AUTO";
  navBar.counterAxisSizingMode = "FIXED";
  navBar.resize(width, height);
  navBar.fills = [
    {
      type: "SOLID",
      color: colors.systemBackground.rgb,
      opacity: 0.94,
    },
  ];

  // Add shadow
  const shadows = theme === "light" ? iosShadowsLight : iosShadowsDark;
  navBar.effects = shadowsToFigmaEffects(shadows.navBar.shadows);

  // Create top bar (buttons + inline title)
  const topBar = figma.createFrame();
  topBar.name = "TopBar";
  topBar.layoutMode = "HORIZONTAL";
  // layoutSizingHorizontal = "FILL" is set after appendChild
  topBar.layoutSizingVertical = "FIXED";
  topBar.layoutAlign = "STRETCH";
  topBar.resize(width, iosSpacing.navBarHeight);
  topBar.paddingLeft = iosSpacing.layoutMargin;
  topBar.paddingRight = iosSpacing.layoutMargin;
  topBar.primaryAxisAlignItems = "SPACE_BETWEEN";
  topBar.counterAxisAlignItems = "CENTER";
  topBar.fills = [];

  // Left button
  const leftContainer = figma.createFrame();
  leftContainer.name = "LeftContainer";
  leftContainer.layoutMode = "HORIZONTAL";
  leftContainer.primaryAxisSizingMode = "AUTO";
  leftContainer.counterAxisSizingMode = "AUTO";
  leftContainer.fills = [];

  if (leftButton) {
    const leftText = figma.createText();
    try {
      await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
      leftText.fontName = { family: "SF Pro Text", style: "Regular" };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      leftText.fontName = { family: "Inter", style: "Regular" };
    }
    leftText.characters = leftButton;
    leftText.fontSize = 17;
    leftText.fills = [{ type: "SOLID", color: colors.systemBlue.rgb }];
    leftContainer.appendChild(leftText);
  }
  topBar.appendChild(leftContainer);

  // Center title (for inline variant)
  if (!isLarge) {
    const titleText = figma.createText();
    const titleStyle = iosTypography.headline;
    try {
      await figma.loadFontAsync({
        family: "SF Pro Text",
        style: getFigmaFontStyle(titleStyle.weight),
      });
      titleText.fontName = {
        family: "SF Pro Text",
        style: getFigmaFontStyle(titleStyle.weight),
      };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
      titleText.fontName = { family: "Inter", style: "Semi Bold" };
    }
    titleText.characters = title;
    titleText.fontSize = titleStyle.size;
    titleText.fills = [{ type: "SOLID", color: colors.label.rgb }];
    topBar.appendChild(titleText);
  } else {
    // Spacer for large variant
    const spacer = figma.createFrame();
    spacer.name = "Spacer";
    spacer.layoutGrow = 1;
    spacer.fills = [];
    topBar.appendChild(spacer);
  }

  // Right button
  const rightContainer = figma.createFrame();
  rightContainer.name = "RightContainer";
  rightContainer.layoutMode = "HORIZONTAL";
  rightContainer.primaryAxisSizingMode = "AUTO";
  rightContainer.counterAxisSizingMode = "AUTO";
  rightContainer.fills = [];

  if (rightButton) {
    const rightText = figma.createText();
    try {
      await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
      rightText.fontName = { family: "SF Pro Text", style: "Regular" };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      rightText.fontName = { family: "Inter", style: "Regular" };
    }
    rightText.characters = rightButton;
    rightText.fontSize = 17;
    rightText.fills = [{ type: "SOLID", color: colors.systemBlue.rgb }];
    rightContainer.appendChild(rightText);
  }
  topBar.appendChild(rightContainer);

  navBar.appendChild(topBar);
  topBar.layoutSizingHorizontal = "FILL";

  // Large title (for large variant)
  if (isLarge) {
    const largeTitleContainer = figma.createFrame();
    largeTitleContainer.name = "LargeTitleContainer";
    largeTitleContainer.layoutMode = "HORIZONTAL";
    // layoutSizingHorizontal = "FILL" is set after appendChild
    largeTitleContainer.layoutSizingVertical = "HUG";
    largeTitleContainer.layoutAlign = "STRETCH";
    largeTitleContainer.paddingLeft = iosSpacing.layoutMargin;
    largeTitleContainer.paddingRight = iosSpacing.layoutMargin;
    largeTitleContainer.paddingBottom = 8;
    largeTitleContainer.fills = [];

    const largeTitleText = figma.createText();
    const largeTitleStyle = iosTypography.largeTitle;
    try {
      await figma.loadFontAsync({
        family: "SF Pro Display",
        style: getFigmaFontStyle(700),
      });
      largeTitleText.fontName = { family: "SF Pro Display", style: "Bold" };
    } catch (e) {
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      largeTitleText.fontName = { family: "Inter", style: "Bold" };
    }
    largeTitleText.characters = title;
    largeTitleText.fontSize = largeTitleStyle.size;
    largeTitleText.fills = [{ type: "SOLID", color: colors.label.rgb }];
    largeTitleContainer.appendChild(largeTitleText);

    navBar.appendChild(largeTitleContainer);
    largeTitleContainer.layoutSizingHorizontal = "FILL";
  }

  // Search bar (optional)
  if (hasSearchBar) {
    const searchBar = await createIOSSearchBar({ width: width - 32, theme });
    searchBar.layoutAlign = "CENTER";
    navBar.appendChild(searchBar);
  }

  return navBar;
}

export async function createIOSSearchBar(
  options: { placeholder?: string; width?: number; theme?: Theme } = {}
): Promise<FrameNode> {
  const {
    placeholder = "Search",
    width = 358,
    theme = "light",
  } = options;

  const colors = getIOSColors(theme);

  const searchBar = figma.createFrame();
  searchBar.name = "iOS SearchBar";
  searchBar.layoutMode = "HORIZONTAL";
  searchBar.primaryAxisAlignItems = "MIN";
  searchBar.counterAxisAlignItems = "CENTER";
  searchBar.primaryAxisSizingMode = "FIXED";
  searchBar.counterAxisSizingMode = "FIXED";
  searchBar.resize(width, iosSpacing.searchBarHeight);
  searchBar.paddingLeft = 8;
  searchBar.paddingRight = 8;
  searchBar.itemSpacing = 6;
  searchBar.cornerRadius = 10;
  searchBar.fills = [{ type: "SOLID", color: colors.systemGray6.rgb }];

  // Search icon
  const icon = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  icon.fontName = { family: "Inter", style: "Regular" };
  icon.characters = "🔍";
  icon.fontSize = 14;
  icon.fills = [{ type: "SOLID", color: colors.secondaryLabel.rgb }];
  searchBar.appendChild(icon);

  // Placeholder text
  const text = figma.createText();
  try {
    await figma.loadFontAsync({ family: "SF Pro Text", style: "Regular" });
    text.fontName = { family: "SF Pro Text", style: "Regular" };
  } catch (e) {
    text.fontName = { family: "Inter", style: "Regular" };
  }
  text.characters = placeholder;
  text.fontSize = 17;
  text.fills = [{ type: "SOLID", color: colors.tertiaryLabel.rgb }];
  text.layoutGrow = 1;
  searchBar.appendChild(text);

  return searchBar;
}
