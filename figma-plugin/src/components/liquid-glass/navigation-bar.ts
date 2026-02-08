/**
 * Liquid Glass Navigation Bar Component
 */

import { getLiquidGlassColors, Theme } from "../../tokens";
import { applyGlassMaterial } from "./index";

export interface LiquidGlassNavBarOptions {
  title?: string;
  largeTitle?: boolean;
  showBackButton?: boolean;
  rightAction?: string;
  width?: number;
  theme?: Theme;
}

export async function createLiquidGlassNavBar(
  options: LiquidGlassNavBarOptions = {}
): Promise<FrameNode> {
  const {
    title = "Title",
    largeTitle = false,
    showBackButton = true,
    rightAction,
    width = 390,
    theme = "light",
  } = options;

  const colors = getLiquidGlassColors(theme);
  const height = largeTitle ? 96 : 44;

  const navBar = figma.createFrame();
  navBar.name = "LiquidGlass NavigationBar";
  navBar.layoutMode = "HORIZONTAL";
  navBar.primaryAxisSizingMode = "FIXED";
  navBar.counterAxisSizingMode = "FIXED";
  navBar.resize(width, height + 47); // Include status bar area
  navBar.paddingTop = 47; // Status bar
  navBar.paddingLeft = 16;
  navBar.paddingRight = 16;
  navBar.counterAxisAlignItems = "CENTER";

  // Apply glass material
  applyGlassMaterial(navBar, { theme, material: "thin", style: theme === "light" ? "light" : "dark" });

  // Bottom border
  navBar.strokes = [
    {
      type: "SOLID",
      color: colors.separatorOnGlass.rgb,
      opacity: 0.3,
    },
  ];
  navBar.strokeWeight = 0.5;
  navBar.strokeTopWeight = 0;
  navBar.strokeBottomWeight = 0.5;
  navBar.strokeLeftWeight = 0;
  navBar.strokeRightWeight = 0;

  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  // Back button
  if (showBackButton) {
    const backButton = figma.createFrame();
    backButton.name = "BackButton";
    backButton.layoutMode = "HORIZONTAL";
    backButton.primaryAxisSizingMode = "AUTO";
    backButton.counterAxisSizingMode = "AUTO";
    backButton.itemSpacing = 4;
    backButton.fills = [];

    const chevron = figma.createText();
    chevron.fontName = { family: "Inter", style: "Medium" };
    chevron.characters = "<";
    chevron.fontSize = 17;
    chevron.fills = [{ type: "SOLID", color: colors.liquidBlue.rgb }];
    backButton.appendChild(chevron);

    const backLabel = figma.createText();
    backLabel.fontName = { family: "Inter", style: "Medium" };
    backLabel.characters = "Back";
    backLabel.fontSize = 17;
    backLabel.fills = [{ type: "SOLID", color: colors.liquidBlue.rgb }];
    backButton.appendChild(backLabel);

    navBar.appendChild(backButton);
  }

  // Spacer
  const spacer1 = figma.createFrame();
  spacer1.name = "Spacer";
  spacer1.layoutGrow = 1;
  spacer1.resize(10, 44);
  spacer1.fills = [];
  navBar.appendChild(spacer1);

  // Title
  const titleText = figma.createText();
  titleText.fontName = { family: "Inter", style: largeTitle ? "Bold" : "Medium" };
  titleText.characters = title;
  titleText.fontSize = largeTitle ? 34 : 17;
  titleText.fills = [{ type: "SOLID", color: colors.labelOnGlass.rgb }];
  navBar.appendChild(titleText);

  // Spacer
  const spacer2 = figma.createFrame();
  spacer2.name = "Spacer";
  spacer2.layoutGrow = 1;
  spacer2.resize(10, 44);
  spacer2.fills = [];
  navBar.appendChild(spacer2);

  // Right action
  if (rightAction) {
    const rightButton = figma.createText();
    rightButton.fontName = { family: "Inter", style: "Medium" };
    rightButton.characters = rightAction;
    rightButton.fontSize = 17;
    rightButton.fills = [{ type: "SOLID", color: colors.liquidBlue.rgb }];
    navBar.appendChild(rightButton);
  } else if (showBackButton) {
    // Placeholder to balance layout
    const placeholder = figma.createFrame();
    placeholder.name = "Placeholder";
    placeholder.resize(60, 44);
    placeholder.fills = [];
    navBar.appendChild(placeholder);
  }

  return navBar;
}
