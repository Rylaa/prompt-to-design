/**
 * iOS 26 Liquid Glass Component Library
 * Implements Apple's new Liquid Glass design language
 */

import {
  getLiquidGlassColors,
  getLiquidGlassEffects,
  Theme,
} from "../../tokens";

// ============================================================================
// Types
// ============================================================================

export type GlassMaterial = "thin" | "regular" | "thick" | "ultraThin";
export type GlassStyle = "light" | "dark" | "tinted";

export interface GlassOptions {
  theme?: Theme;
  material?: GlassMaterial;
  style?: GlassStyle;
  tintColor?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function getBlurRadius(material: GlassMaterial, theme: Theme): number {
  const effects = getLiquidGlassEffects(theme);
  switch (material) {
    case "ultraThin":
      return 10;
    case "thin":
      return effects.thinMaterialBlur;
    case "regular":
      return effects.regularMaterialBlur;
    case "thick":
      return effects.thickMaterialBlur;
    default:
      return effects.regularMaterialBlur;
  }
}

function getGlassOpacity(style: GlassStyle, theme: Theme): number {
  const effects = getLiquidGlassEffects(theme);
  if (style === "tinted") {
    return effects.accentTintOpacity;
  }
  return theme === "light" ? effects.lightGlassOpacity : effects.darkGlassOpacity;
}

// Apply glass material effects to a frame
export function applyGlassMaterial(
  frame: FrameNode,
  options: GlassOptions = {}
): void {
  const {
    theme = "light",
    material = "regular",
    style = "light",
    tintColor,
  } = options;

  const colors = getLiquidGlassColors(theme);
  const effects = getLiquidGlassEffects(theme);
  const blurRadius = getBlurRadius(material, theme);
  const opacity = getGlassOpacity(style, theme);

  // Determine fill color based on style
  let fillColor = style === "dark" ? colors.glassDark.rgb : colors.glassLight.rgb;
  if (style === "tinted" && tintColor) {
    // Parse hex color
    const hex = tintColor.replace("#", "");
    fillColor = {
      r: parseInt(hex.substring(0, 2), 16) / 255,
      g: parseInt(hex.substring(2, 4), 16) / 255,
      b: parseInt(hex.substring(4, 6), 16) / 255,
    };
  } else if (style === "tinted") {
    fillColor = colors.glassAccent.rgb;
  }

  // Apply semi-transparent fill
  frame.fills = [
    {
      type: "SOLID",
      color: fillColor,
      opacity: opacity,
    },
  ];

  // Apply effects: blur + shadow + specular highlight
  frame.effects = [
    // Background blur
    {
      type: "BACKGROUND_BLUR",
      blurType: "NORMAL",
      radius: blurRadius,
      visible: true,
    } as const,
    // Drop shadow for depth
    {
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: effects.glassShadowOpacity },
      offset: { x: 0, y: effects.glassShadowOffsetY },
      radius: effects.glassShadowBlur,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    },
    // Inner glow / specular highlight
    {
      type: "INNER_SHADOW",
      color: { r: 1, g: 1, b: 1, a: effects.specularOpacity },
      offset: { x: 0, y: 1 },
      radius: 0,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    },
  ];
}

// ============================================================================
// Glass Button Component
// ============================================================================

export interface LiquidGlassButtonOptions {
  text?: string;
  variant?: "primary" | "secondary" | "tinted";
  size?: "small" | "medium" | "large";
  theme?: Theme;
  iconName?: string;
}

export async function createLiquidGlassButton(
  options: LiquidGlassButtonOptions = {}
): Promise<FrameNode> {
  const {
    text = "Button",
    variant = "primary",
    size = "medium",
    theme = "light",
  } = options;

  const colors = getLiquidGlassColors(theme);

  // Size configurations
  const sizes = {
    small: { height: 32, paddingX: 12, fontSize: 14, radius: 16 },
    medium: { height: 44, paddingX: 20, fontSize: 17, radius: 22 },
    large: { height: 54, paddingX: 28, fontSize: 17, radius: 27 },
  };
  const sizeConfig = sizes[size];

  const button = figma.createFrame();
  button.name = `LiquidGlass Button - ${variant}`;
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";
  button.paddingLeft = sizeConfig.paddingX;
  button.paddingRight = sizeConfig.paddingX;
  button.primaryAxisSizingMode = "AUTO";
  button.counterAxisSizingMode = "FIXED";
  button.resize(100, sizeConfig.height);
  button.cornerRadius = sizeConfig.radius;

  // Apply glass material based on variant
  const glassStyle: GlassStyle = variant === "tinted" ? "tinted" : (theme === "light" ? "light" : "dark");
  applyGlassMaterial(button, {
    theme,
    material: "regular",
    style: glassStyle,
    tintColor: variant === "tinted" ? colors.liquidBlue.hex : undefined,
  });

  // Add subtle stroke
  button.strokes = [
    {
      type: "SOLID",
      color: theme === "light"
        ? { r: 1, g: 1, b: 1 }
        : { r: 1, g: 1, b: 1 },
      opacity: theme === "light" ? 0.3 : 0.15,
    },
  ];
  button.strokeWeight = 0.5;

  // Text
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  const label = figma.createText();
  label.fontName = { family: "Inter", style: "Medium" };
  label.characters = text;
  label.fontSize = sizeConfig.fontSize;

  // Text color
  if (variant === "primary") {
    label.fills = [{ type: "SOLID", color: colors.liquidBlue.rgb }];
  } else if (variant === "tinted") {
    label.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  } else {
    label.fills = [{ type: "SOLID", color: colors.labelOnGlass.rgb }];
  }

  button.appendChild(label);
  return button;
}

// ============================================================================
// Glass Tab Bar Component
// ============================================================================

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

// ============================================================================
// Glass Navigation Bar Component
// ============================================================================

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

// ============================================================================
// Glass Card Component
// ============================================================================

export interface LiquidGlassCardOptions {
  width?: number;
  height?: number;
  padding?: number;
  cornerRadius?: number;
  theme?: Theme;
  material?: GlassMaterial;
}

export async function createLiquidGlassCard(
  options: LiquidGlassCardOptions = {}
): Promise<FrameNode> {
  const {
    width = 340,
    height,
    padding = 20,
    cornerRadius = 20,
    theme = "light",
    material = "regular",
  } = options;

  const card = figma.createFrame();
  card.name = "LiquidGlass Card";
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = height ? "FIXED" : "AUTO";
  card.counterAxisSizingMode = "FIXED";
  card.resize(width, height || 200);
  card.paddingTop = padding;
  card.paddingBottom = padding;
  card.paddingLeft = padding;
  card.paddingRight = padding;
  card.itemSpacing = 12;
  card.cornerRadius = cornerRadius;

  // Apply glass material
  applyGlassMaterial(card, { theme, material, style: theme === "light" ? "light" : "dark" });

  // Subtle stroke
  card.strokes = [
    {
      type: "SOLID",
      color: theme === "light"
        ? { r: 1, g: 1, b: 1 }
        : { r: 1, g: 1, b: 1 },
      opacity: theme === "light" ? 0.5 : 0.2,
    },
  ];
  card.strokeWeight = 1;

  return card;
}

// ============================================================================
// Glass Control Center Toggle
// ============================================================================

export interface LiquidGlassToggleOptions {
  icon?: string;
  label?: string;
  isActive?: boolean;
  size?: number;
  theme?: Theme;
}

export async function createLiquidGlassToggle(
  options: LiquidGlassToggleOptions = {}
): Promise<FrameNode> {
  const {
    icon = "W",
    label = "Wi-Fi",
    isActive = true,
    size = 62,
    theme = "light",
  } = options;

  const colors = getLiquidGlassColors(theme);

  const toggle = figma.createFrame();
  toggle.name = `LiquidGlass Toggle - ${label}`;
  toggle.layoutMode = "VERTICAL";
  toggle.primaryAxisSizingMode = "FIXED";
  toggle.counterAxisSizingMode = "FIXED";
  toggle.resize(size, size);
  toggle.cornerRadius = size / 4;
  toggle.primaryAxisAlignItems = "CENTER";
  toggle.counterAxisAlignItems = "CENTER";

  // Active state uses tinted glass, inactive uses regular
  if (isActive) {
    applyGlassMaterial(toggle, {
      theme,
      material: "regular",
      style: "tinted",
      tintColor: colors.liquidBlue.hex,
    });
  } else {
    applyGlassMaterial(toggle, { theme, material: "regular", style: theme === "light" ? "light" : "dark" });
  }

  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  // Icon
  const iconText = figma.createText();
  iconText.fontName = { family: "Inter", style: "Medium" };
  iconText.characters = icon;
  iconText.fontSize = 24;
  iconText.fills = [
    {
      type: "SOLID",
      color: isActive ? { r: 1, g: 1, b: 1 } : colors.labelOnGlass.rgb,
    },
  ];
  toggle.appendChild(iconText);

  return toggle;
}

// ============================================================================
// Glass Sidebar Component
// ============================================================================

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

// ============================================================================
// Glass Floating Panel Component
// ============================================================================

export interface LiquidGlassFloatingPanelOptions {
  title?: string;
  width?: number;
  height?: number;
  theme?: Theme;
  material?: GlassMaterial;
  showHandle?: boolean;
}

export async function createLiquidGlassFloatingPanel(
  options: LiquidGlassFloatingPanelOptions = {}
): Promise<FrameNode> {
  const {
    title = "Panel",
    width = 320,
    height = 400,
    theme = "light",
    material = "regular",
    showHandle = true,
  } = options;

  const colors = getLiquidGlassColors(theme);

  const panel = figma.createFrame();
  panel.name = "LiquidGlass FloatingPanel";
  panel.layoutMode = "VERTICAL";
  panel.primaryAxisSizingMode = "FIXED";
  panel.counterAxisSizingMode = "FIXED";
  panel.resize(width, height);
  panel.cornerRadius = 20;
  panel.clipsContent = true;

  // Apply glass material
  applyGlassMaterial(panel, { theme, material, style: theme === "light" ? "light" : "dark" });

  // Border
  panel.strokes = [
    {
      type: "SOLID",
      color: theme === "light" ? { r: 1, g: 1, b: 1 } : { r: 1, g: 1, b: 1 },
      opacity: theme === "light" ? 0.5 : 0.2,
    },
  ];
  panel.strokeWeight = 1;

  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  // Header
  const header = figma.createFrame();
  header.name = "Header";
  header.layoutMode = "VERTICAL";
  header.primaryAxisSizingMode = "AUTO";
  header.counterAxisSizingMode = "FIXED";
  header.resize(width, 56);
  header.paddingTop = 12;
  header.paddingBottom = 12;
  header.paddingLeft = 16;
  header.paddingRight = 16;
  header.itemSpacing = 8;
  header.counterAxisAlignItems = "CENTER";
  header.fills = [];

  // Drag handle
  if (showHandle) {
    const handle = figma.createFrame();
    handle.name = "DragHandle";
    handle.resize(36, 5);
    handle.cornerRadius = 2.5;
    handle.fills = [
      {
        type: "SOLID",
        color: colors.separatorOnGlass.rgb,
        opacity: 0.5,
      },
    ];
    header.appendChild(handle);
  }

  // Title
  const titleText = figma.createText();
  titleText.fontName = { family: "Inter", style: "Bold" };
  titleText.characters = title;
  titleText.fontSize = 17;
  titleText.fills = [{ type: "SOLID", color: colors.labelOnGlass.rgb }];
  header.appendChild(titleText);

  panel.appendChild(header);

  // Separator
  const separator = figma.createFrame();
  separator.name = "Separator";
  separator.resize(width, 0.5);
  separator.fills = [
    {
      type: "SOLID",
      color: colors.separatorOnGlass.rgb,
      opacity: 0.3,
    },
  ];
  panel.appendChild(separator);

  // Content area
  const content = figma.createFrame();
  content.name = "Content";
  content.layoutMode = "VERTICAL";
  content.layoutGrow = 1;
  content.counterAxisSizingMode = "FIXED";
  content.resize(width, height - 56);
  content.paddingTop = 16;
  content.paddingBottom = 16;
  content.paddingLeft = 16;
  content.paddingRight = 16;
  content.itemSpacing = 12;
  content.fills = [];
  panel.appendChild(content);

  return panel;
}

// ============================================================================
// Glass Modal Component
// ============================================================================

export interface LiquidGlassModalAction {
  label: string;
  variant?: "default" | "primary" | "destructive";
}

export interface LiquidGlassModalOptions {
  title?: string;
  message?: string;
  actions?: LiquidGlassModalAction[];
  width?: number;
  theme?: Theme;
  material?: GlassMaterial;
}

export async function createLiquidGlassModal(
  options: LiquidGlassModalOptions = {}
): Promise<FrameNode> {
  const {
    title = "Alert",
    message = "This is a modal message.",
    actions = [
      { label: "Cancel", variant: "default" },
      { label: "Confirm", variant: "primary" },
    ],
    width = 300,
    theme = "light",
    material = "thick",
  } = options;

  const colors = getLiquidGlassColors(theme);

  const modal = figma.createFrame();
  modal.name = "LiquidGlass Modal";
  modal.layoutMode = "VERTICAL";
  modal.primaryAxisSizingMode = "AUTO";
  modal.counterAxisSizingMode = "FIXED";
  modal.resize(width, 180);
  modal.cornerRadius = 24;
  modal.paddingTop = 24;
  modal.paddingBottom = 16;
  modal.paddingLeft = 20;
  modal.paddingRight = 20;
  modal.itemSpacing = 16;
  modal.counterAxisAlignItems = "CENTER";

  // Apply glass material with thick blur
  applyGlassMaterial(modal, { theme, material, style: theme === "light" ? "light" : "dark" });

  // Border
  modal.strokes = [
    {
      type: "SOLID",
      color: theme === "light" ? { r: 1, g: 1, b: 1 } : { r: 1, g: 1, b: 1 },
      opacity: theme === "light" ? 0.6 : 0.2,
    },
  ];
  modal.strokeWeight = 1;

  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  // Title
  const titleText = figma.createText();
  titleText.fontName = { family: "Inter", style: "Bold" };
  titleText.characters = title;
  titleText.fontSize = 17;
  titleText.textAlignHorizontal = "CENTER";
  titleText.fills = [{ type: "SOLID", color: colors.labelOnGlass.rgb }];
  modal.appendChild(titleText);

  // Message
  const messageText = figma.createText();
  messageText.fontName = { family: "Inter", style: "Regular" };
  messageText.characters = message;
  messageText.fontSize = 14;
  messageText.textAlignHorizontal = "CENTER";
  messageText.resize(width - 40, messageText.height);
  messageText.textAutoResize = "HEIGHT";
  messageText.fills = [{ type: "SOLID", color: colors.secondaryLabelOnGlass.rgb }];
  modal.appendChild(messageText);

  // Separator
  const separator = figma.createFrame();
  separator.name = "Separator";
  separator.resize(width - 40, 0.5);
  separator.fills = [
    {
      type: "SOLID",
      color: colors.separatorOnGlass.rgb,
      opacity: 0.3,
    },
  ];
  modal.appendChild(separator);

  // Actions row
  const actionsRow = figma.createFrame();
  actionsRow.name = "Actions";
  actionsRow.layoutMode = "HORIZONTAL";
  actionsRow.primaryAxisSizingMode = "FIXED";
  actionsRow.counterAxisSizingMode = "AUTO";
  actionsRow.resize(width - 40, 44);
  actionsRow.itemSpacing = 12;
  actionsRow.fills = [];
  actionsRow.primaryAxisAlignItems = "CENTER";

  for (const action of actions) {
    const button = figma.createFrame();
    button.name = `Action-${action.label}`;
    button.layoutMode = "HORIZONTAL";
    button.layoutGrow = 1;
    button.counterAxisSizingMode = "AUTO";
    button.primaryAxisAlignItems = "CENTER";
    button.counterAxisAlignItems = "CENTER";
    button.paddingTop = 10;
    button.paddingBottom = 10;
    button.cornerRadius = 12;

    // Style based on variant
    if (action.variant === "primary") {
      button.fills = [
        {
          type: "SOLID",
          color: colors.liquidBlue.rgb,
          opacity: 0.15,
        },
      ];
    } else if (action.variant === "destructive") {
      button.fills = [
        {
          type: "SOLID",
          color: colors.liquidRed.rgb,
          opacity: 0.15,
        },
      ];
    } else {
      button.fills = [];
    }

    const buttonLabel = figma.createText();
    buttonLabel.fontName = { family: "Inter", style: "Medium" };
    buttonLabel.characters = action.label;
    buttonLabel.fontSize = 16;

    if (action.variant === "primary") {
      buttonLabel.fills = [{ type: "SOLID", color: colors.liquidBlue.rgb }];
    } else if (action.variant === "destructive") {
      buttonLabel.fills = [{ type: "SOLID", color: colors.liquidRed.rgb }];
    } else {
      buttonLabel.fills = [{ type: "SOLID", color: colors.labelOnGlass.rgb }];
    }

    button.appendChild(buttonLabel);
    actionsRow.appendChild(button);
  }

  modal.appendChild(actionsRow);

  return modal;
}

// ============================================================================
// Glass Search Bar Component
// ============================================================================

export interface LiquidGlassSearchBarOptions {
  placeholder?: string;
  value?: string;
  width?: number;
  theme?: Theme;
  material?: GlassMaterial;
  showCancelButton?: boolean;
}

export async function createLiquidGlassSearchBar(
  options: LiquidGlassSearchBarOptions = {}
): Promise<FrameNode> {
  const {
    placeholder = "Search",
    value = "",
    width = 358,
    theme = "light",
    material = "thin",
    showCancelButton = false,
  } = options;

  const colors = getLiquidGlassColors(theme);

  const container = figma.createFrame();
  container.name = "LiquidGlass SearchBar";
  container.layoutMode = "HORIZONTAL";
  container.primaryAxisSizingMode = "FIXED";
  container.counterAxisSizingMode = "AUTO";
  container.resize(width, 36);
  container.itemSpacing = 8;
  container.counterAxisAlignItems = "CENTER";
  container.fills = [];

  // Search field
  const searchField = figma.createFrame();
  searchField.name = "SearchField";
  searchField.layoutMode = "HORIZONTAL";
  searchField.layoutGrow = 1;
  searchField.counterAxisSizingMode = "FIXED";
  searchField.resize(width - (showCancelButton ? 70 : 0), 36);
  searchField.paddingLeft = 10;
  searchField.paddingRight = 10;
  searchField.itemSpacing = 6;
  searchField.counterAxisAlignItems = "CENTER";
  searchField.cornerRadius = 10;

  // Apply glass material
  applyGlassMaterial(searchField, { theme, material, style: theme === "light" ? "light" : "dark" });

  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  // Search icon
  const searchIcon = figma.createText();
  searchIcon.fontName = { family: "Inter", style: "Regular" };
  searchIcon.characters = "🔍";
  searchIcon.fontSize = 14;
  searchIcon.fills = [{ type: "SOLID", color: colors.secondaryLabelOnGlass.rgb }];
  searchField.appendChild(searchIcon);

  // Text (placeholder or value)
  const text = figma.createText();
  text.fontName = { family: "Inter", style: "Regular" };
  text.characters = value || placeholder;
  text.fontSize = 17;
  text.layoutGrow = 1;
  text.fills = [
    {
      type: "SOLID",
      color: value ? colors.labelOnGlass.rgb : colors.secondaryLabelOnGlass.rgb,
    },
  ];
  searchField.appendChild(text);

  // Clear button (if has value)
  if (value) {
    const clearButton = figma.createFrame();
    clearButton.name = "ClearButton";
    clearButton.resize(18, 18);
    clearButton.cornerRadius = 9;
    clearButton.fills = [
      {
        type: "SOLID",
        color: colors.separatorOnGlass.rgb,
        opacity: 0.5,
      },
    ];

    const clearIcon = figma.createText();
    clearIcon.fontName = { family: "Inter", style: "Medium" };
    clearIcon.characters = "×";
    clearIcon.fontSize = 14;
    clearIcon.fills = [
      {
        type: "SOLID",
        color: theme === "light" ? { r: 1, g: 1, b: 1 } : { r: 0, g: 0, b: 0 },
      },
    ];
    clearButton.appendChild(clearIcon);
    clearIcon.x = (18 - clearIcon.width) / 2;
    clearIcon.y = (18 - clearIcon.height) / 2;

    searchField.appendChild(clearButton);
  }

  container.appendChild(searchField);

  // Cancel button
  if (showCancelButton) {
    const cancelButton = figma.createText();
    cancelButton.fontName = { family: "Inter", style: "Regular" };
    cancelButton.characters = "Cancel";
    cancelButton.fontSize = 17;
    cancelButton.fills = [{ type: "SOLID", color: colors.liquidBlue.rgb }];
    container.appendChild(cancelButton);
  }

  return container;
}

// ============================================================================
// Glass Toolbar Component
// ============================================================================

export interface LiquidGlassToolbarItem {
  icon: string;
  label?: string;
  isActive?: boolean;
  isDisabled?: boolean;
}

export interface LiquidGlassToolbarOptions {
  items?: LiquidGlassToolbarItem[];
  width?: number;
  theme?: Theme;
  material?: GlassMaterial;
  showLabels?: boolean;
}

export async function createLiquidGlassToolbar(
  options: LiquidGlassToolbarOptions = {}
): Promise<FrameNode> {
  const {
    items = [
      { icon: "B", label: "Bold" },
      { icon: "I", label: "Italic" },
      { icon: "U", label: "Underline" },
      { icon: "S", label: "Strike" },
      { icon: "L", label: "Link", isActive: true },
    ],
    width = 390,
    theme = "light",
    material = "thin",
    showLabels = false,
  } = options;

  const colors = getLiquidGlassColors(theme);

  const toolbar = figma.createFrame();
  toolbar.name = "LiquidGlass Toolbar";
  toolbar.layoutMode = "HORIZONTAL";
  toolbar.primaryAxisSizingMode = "FIXED";
  toolbar.counterAxisSizingMode = "AUTO";
  toolbar.resize(width, 44);
  toolbar.paddingLeft = 16;
  toolbar.paddingRight = 16;
  toolbar.paddingTop = 8;
  toolbar.paddingBottom = 8;
  toolbar.itemSpacing = 8;
  toolbar.counterAxisAlignItems = "CENTER";

  // Apply glass material
  applyGlassMaterial(toolbar, { theme, material, style: theme === "light" ? "light" : "dark" });

  // Top border
  toolbar.strokes = [
    {
      type: "SOLID",
      color: colors.separatorOnGlass.rgb,
      opacity: 0.3,
    },
  ];
  toolbar.strokeWeight = 0.5;
  toolbar.strokeTopWeight = 0.5;
  toolbar.strokeBottomWeight = 0;
  toolbar.strokeLeftWeight = 0;
  toolbar.strokeRightWeight = 0;

  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  for (const item of items) {
    const toolItem = figma.createFrame();
    toolItem.name = `Tool-${item.label || item.icon}`;
    toolItem.layoutMode = showLabels ? "VERTICAL" : "HORIZONTAL";
    toolItem.primaryAxisSizingMode = "AUTO";
    toolItem.counterAxisSizingMode = "AUTO";
    toolItem.paddingLeft = 10;
    toolItem.paddingRight = 10;
    toolItem.paddingTop = 4;
    toolItem.paddingBottom = 4;
    toolItem.itemSpacing = 2;
    toolItem.primaryAxisAlignItems = "CENTER";
    toolItem.counterAxisAlignItems = "CENTER";
    toolItem.cornerRadius = 8;

    // Background for active state
    if (item.isActive) {
      toolItem.fills = [
        {
          type: "SOLID",
          color: colors.liquidBlue.rgb,
          opacity: 0.15,
        },
      ];
    } else {
      toolItem.fills = [];
    }

    // Icon
    const iconText = figma.createText();
    iconText.fontName = { family: "Inter", style: "Medium" };
    iconText.characters = item.icon;
    iconText.fontSize = 18;

    const iconColor = item.isDisabled
      ? colors.secondaryLabelOnGlass.rgb
      : item.isActive
        ? colors.liquidBlue.rgb
        : colors.labelOnGlass.rgb;
    iconText.fills = [{ type: "SOLID", color: iconColor, opacity: item.isDisabled ? 0.5 : 1 }];
    toolItem.appendChild(iconText);

    // Label
    if (showLabels && item.label) {
      const label = figma.createText();
      label.fontName = { family: "Inter", style: "Regular" };
      label.characters = item.label;
      label.fontSize = 10;
      label.fills = [
        {
          type: "SOLID",
          color: item.isActive ? colors.liquidBlue.rgb : colors.secondaryLabelOnGlass.rgb,
          opacity: item.isDisabled ? 0.5 : 1,
        },
      ];
      toolItem.appendChild(label);
    }

    toolbar.appendChild(toolItem);
  }

  return toolbar;
}

// ============================================================================
// Component Registry
// ============================================================================

export const liquidGlassComponents: Record<string, Function> = {
  button: createLiquidGlassButton,
  "tab-bar": createLiquidGlassTabBar,
  "navigation-bar": createLiquidGlassNavBar,
  card: createLiquidGlassCard,
  toggle: createLiquidGlassToggle,
  sidebar: createLiquidGlassSidebar,
  "floating-panel": createLiquidGlassFloatingPanel,
  modal: createLiquidGlassModal,
  "search-bar": createLiquidGlassSearchBar,
  toolbar: createLiquidGlassToolbar,
};

// Helper to create component by name
export async function createLiquidGlassComponent(
  componentName: string,
  options: Record<string, unknown> = {}
): Promise<SceneNode | null> {
  const createFn = liquidGlassComponents[componentName];
  if (!createFn) {
    console.error(`Unknown Liquid Glass component: ${componentName}`);
    return null;
  }
  return createFn(options);
}

// List all available components
export function listLiquidGlassComponents(): string[] {
  return Object.keys(liquidGlassComponents);
}
