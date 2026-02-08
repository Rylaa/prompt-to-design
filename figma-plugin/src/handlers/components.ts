// figma-plugin/src/handlers/components.ts
/**
 * UI Component creation and manipulation handlers
 * Handles: CreateButton, CreateInput, CreateCard, CreateKPICard, CreateUIComponent, CreateIcon, ListIcons
 */

// Handler utilities
import {
  // Types
  type FillConfig,
  type RGBColor,
  // Node helpers
  registerNode,
  getNode,
  attachToParentOrPage,
  setPosition,
  // Paint helpers
  hexToRgb,
  parseColor,
  createSolidPaint,
  createFill,
  // Font helpers
  loadFont,
} from "./utils";

// Core layout system
import { createAutoLayout } from "../core";
import type { AutoLayoutConfig as CoreAutoLayoutConfig } from "../core/types";

// Theme
import { themeManager } from "../tokens";
import { resolveTheme, getQuickThemeColors, validateTextContrast } from "../tokens/theme-helpers";

// Icons
import { LUCIDE_ICONS, hasIcon, getAvailableIcons } from "../icons/lucide-svgs";

// ============================================================================
// Constants
// ============================================================================

// Button size configurations
const BUTTON_SIZES = {
  sm: { paddingX: 12, paddingY: 6, fontSize: 14 },
  md: { paddingX: 16, paddingY: 10, fontSize: 16 },
  lg: { paddingX: 24, paddingY: 14, fontSize: 18 },
} as const;

// Button variant styles (theme-aware)
function getButtonVariants(theme: "light" | "dark") {
  const isDark = theme === "dark";
  return {
    primary: { fill: "#8B5CF6", textColor: "#FFFFFF" },
    secondary: { fill: isDark ? "#27272A" : "#F4F4F5", textColor: isDark ? "#FFFFFF" : "#18181B" },
    outline: { fill: "transparent", textColor: "#8B5CF6", stroke: "#8B5CF6" },
    ghost: { fill: "transparent", textColor: isDark ? "#A1A1AA" : "#71717A" },
    destructive: { fill: "#EF4444", textColor: "#FFFFFF" },
  } as const;
}

// Input dimensions
const DEFAULT_INPUT_WIDTH = 280;
const DEFAULT_INPUT_HEIGHT = 44;
const INPUT_PADDING_X = 12;
const INPUT_CORNER_RADIUS = 8;
const INPUT_LABEL_SPACING = 6;

// Card defaults
const DEFAULT_CARD_PADDING = "6" as const; // 24px
const DEFAULT_CARD_CORNER_RADIUS = "lg";

// KPI Card defaults
const DEFAULT_KPI_WIDTH = 280;
const DEFAULT_KPI_TITLE = "Total Revenue";
const DEFAULT_KPI_VALUE = "$45,231.89";

// Icon defaults
const DEFAULT_ICON_SIZE = 24;
const DEFAULT_ICON_COLOR = "#000000";
const ICON_NAME_PREFIX = "icon-";

// Component defaults
const DEFAULT_BUTTON_TEXT = "Button";
const DEFAULT_INPUT_PLACEHOLDER = "Enter text...";
const DEFAULT_CORNER_RADIUS = 8;

// Avatar sizes
const AVATAR_SIZES = { sm: 32, md: 40, lg: 56, xl: 72 } as const;

// Badge variants (theme-aware)
function getBadgeVariants(theme: "light" | "dark") {
  const isDark = theme === "dark";
  return {
    default: { bg: isDark ? "#27272A" : "#18181B", text: isDark ? "#FFFFFF" : "#FAFAFA" },
    primary: { bg: "#8B5CF6", text: "#FFFFFF" },
    success: { bg: "#10B981", text: "#FFFFFF" },
    warning: { bg: "#F59E0B", text: "#18181B" },
    error: { bg: "#EF4444", text: "#FFFFFF" },
    info: { bg: "#3B82F6", text: "#FFFFFF" },
  } as const;
}

// IconButton sizes
const ICON_BUTTON_SIZES = { sm: 32, md: 40, lg: 48 } as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts Figma RGB (0-1 range) to hex color string
 * @param rgb - RGB object with values in 0-1 range
 * @returns Hex color string like "#FFFFFF"
 */
function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const r = Math.round(rgb.r * 255);
  const g = Math.round(rgb.g * 255);
  const b = Math.round(rgb.b * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
}

/**
 * Configuration for createTextNode helper
 */
interface TextNodeConfig {
  content: string;
  fontSize: number;
  fontWeight: number;
  fill: FillConfig;
}

/**
 * Creates a styled text node
 * @param config - Text node configuration
 * @returns Created TextNode
 */
async function createTextNode(config: TextNodeConfig): Promise<TextNode> {
  const text = figma.createText();

  // Load font with specified weight
  await loadFont("Inter", config.fontWeight);

  // Map weight to Figma font style
  const styleMap: Record<number, string> = {
    100: "Thin",
    200: "ExtraLight",
    300: "Light",
    400: "Regular",
    500: "Medium",
    600: "Semi Bold",
    700: "Bold",
    800: "ExtraBold",
    900: "Black",
  };

  const style = styleMap[config.fontWeight] || "Regular";
  text.fontName = { family: "Inter", style };
  text.characters = config.content;
  text.fontSize = config.fontSize;

  if (config.fill) {
    text.fills = [createFill(config.fill)];
  }

  return text;
}

// ============================================================================
// Component Library
// ============================================================================

/**
 * Map to cache created component nodes for reuse
 */
const componentLibrary: Map<string, ComponentNode> = new Map();

// ============================================================================
// CreateButton Handler
// ============================================================================

/**
 * Creates a styled button component with configurable variant and size
 * @param params - Button creation parameters
 * @returns Object containing the created button node's ID
 */
async function handleCreateButton(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const variant = (params.variant as string) || "primary";
  const size = (params.size as string) || "md";
  const theme = resolveTheme(params);

  const sizeConfig = BUTTON_SIZES[size as keyof typeof BUTTON_SIZES] || BUTTON_SIZES.md;
  const buttonVariants = getButtonVariants(theme);
  const variantConfig = buttonVariants[variant as keyof typeof buttonVariants] || buttonVariants.primary;

  const button = figma.createFrame();
  try {
    button.name = (params.name as string) || DEFAULT_BUTTON_TEXT;
    button.layoutMode = "HORIZONTAL";
    button.primaryAxisSizingMode = "AUTO";
    button.counterAxisSizingMode = "AUTO";
    button.primaryAxisAlignItems = "CENTER";
    button.counterAxisAlignItems = "CENTER";

    const px = (params.paddingX as number) !== undefined ? (params.paddingX as number) : sizeConfig.paddingX;
    const py = (params.paddingY as number) !== undefined ? (params.paddingY as number) : sizeConfig.paddingY;
    button.paddingLeft = px;
    button.paddingRight = px;
    button.paddingTop = py;
    button.paddingBottom = py;
    button.cornerRadius = (params.cornerRadius as number) !== undefined ? (params.cornerRadius as number) : DEFAULT_CORNER_RADIUS;

    if (params.fill) {
      button.fills = [createFill(params.fill as FillConfig)];
    } else if (variantConfig.fill === "transparent") {
      button.fills = [];
    } else {
      button.fills = [createSolidPaint(variantConfig.fill)];
    }

    if ("stroke" in variantConfig || variant === "outline") {
      const strokeColor = "stroke" in variantConfig ? variantConfig.stroke : "#8B5CF6";
      button.strokes = [createSolidPaint(strokeColor)];
      button.strokeWeight = 1;
    }

    const text = figma.createText();
    await loadFont("Inter", 500);
    text.fontName = { family: "Inter", style: "Medium" };
    text.characters = (params.text as string) || DEFAULT_BUTTON_TEXT;
    text.fontSize = sizeConfig.fontSize;

    const textColor = params.textColor
      ? parseColor(params.textColor as string | RGBColor)
      : parseColor(variantConfig.textColor);
    text.fills = [{ type: "SOLID", color: textColor }];

    button.appendChild(text);

    // Attach to parent or page
    await attachToParentOrPage(button, params.parentId as string | undefined);

    // fullWidth only works inside auto-layout parent
    if (params.fullWidth && params.parentId) {
      const parent = await getNode(params.parentId as string);
      if (parent && "layoutMode" in parent) {
        const parentFrame = parent as FrameNode;
        if (parentFrame.layoutMode !== "NONE") {
          button.layoutSizingHorizontal = "FILL";
        } else {
          // If parent has no auto-layout, set fixed width manually
          console.warn("fullWidth requires parent with auto-layout, using fixed width instead");
          button.resize(parentFrame.width - 32, button.height);
        }
      }
    }

    registerNode(button);
    return { nodeId: button.id };
  } catch (error) {
    // Clean up node on error
    button.remove();
    throw error;
  }
}

// ============================================================================
// CreateInput Handler
// ============================================================================

/**
 * Creates a styled input field with optional label
 * @param params - Input creation parameters
 * @returns Object containing the created input node's ID
 */
async function handleCreateInput(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const width = (params.width as number) || DEFAULT_INPUT_WIDTH;
  const variant = (params.variant as string) || "outline";
  const theme = resolveTheme(params);
  const tc = getQuickThemeColors(theme);

  const container = figma.createFrame();
  try {
    container.name = (params.name as string) || "Input";
    container.layoutMode = "VERTICAL";
    container.primaryAxisSizingMode = "AUTO";
    container.counterAxisSizingMode = "FIXED";
    container.resize(width, container.height);
    container.itemSpacing = INPUT_LABEL_SPACING;
    container.fills = [];

    // Add label if specified
    if (params.label) {
      const label = figma.createText();
      await loadFont("Inter", 500);
      label.fontName = { family: "Inter", style: "Medium" };
      label.characters = params.label as string;
      label.fontSize = 14;
      label.fills = [{ type: "SOLID", color: tc.mutedForeground }];
      container.appendChild(label);
    }

    const input = figma.createFrame();
    input.name = "Input Field";
    input.resize(width, DEFAULT_INPUT_HEIGHT);
    input.layoutMode = "HORIZONTAL";
    input.primaryAxisSizingMode = "FIXED";
    input.counterAxisSizingMode = "FIXED";
    input.primaryAxisAlignItems = "MIN";
    input.counterAxisAlignItems = "CENTER";
    input.paddingLeft = INPUT_PADDING_X;
    input.paddingRight = INPUT_PADDING_X;
    input.cornerRadius = INPUT_CORNER_RADIUS;

    if (variant === "outline") {
      input.fills = [{ type: "SOLID", color: tc.background }];
      input.strokes = [{ type: "SOLID", color: tc.input }];
      input.strokeWeight = 1;
    } else if (variant === "filled") {
      input.fills = [{ type: "SOLID", color: tc.muted }];
    }

    const placeholder = figma.createText();
    await loadFont("Inter", 400);
    placeholder.fontName = { family: "Inter", style: "Regular" };
    placeholder.characters = (params.placeholder as string) || DEFAULT_INPUT_PLACEHOLDER;
    placeholder.fontSize = 15;
    placeholder.fills = [{ type: "SOLID", color: tc.mutedForeground }];

    input.appendChild(placeholder);
    container.appendChild(input);

    // Attach to parent or page
    await attachToParentOrPage(container, params.parentId as string | undefined);

    registerNode(container);
    return { nodeId: container.id };
  } catch (error) {
    // Clean up node on error
    container.remove();
    throw error;
  }
}

// ============================================================================
// CreateCard Handler
// ============================================================================

/**
 * Creates a card container with auto-layout and optional shadow
 * @param params - Card creation parameters
 * @returns Object containing the created card node's ID
 */
async function handleCreateCard(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const theme = resolveTheme(params);
  const tc = getQuickThemeColors(theme);

  const config: CoreAutoLayoutConfig = {
    name: (params.name as string) || "Card",
    direction: "VERTICAL",
    spacing: {
      padding: DEFAULT_CARD_PADDING,
    },
    fill: {
      type: "SOLID",
      color: tc.card,
    },
    cornerRadius: DEFAULT_CARD_CORNER_RADIUS,
  };

  // Parent
  if (params.parentId) {
    const parentNode = await getNode(params.parentId as string);
    if (parentNode && "appendChild" in parentNode) {
      config.parent = parentNode as FrameNode | ComponentNode;
    }
  }

  // Custom fill
  if (params.fill) {
    const fillParam = params.fill as { type?: string; color?: string | { r: number; g: number; b: number } };
    if (fillParam.type === "SOLID" && fillParam.color) {
      if (typeof fillParam.color === "string") {
        config.fill = { type: "SOLID", color: hexToRgb(fillParam.color) };
      } else {
        config.fill = { type: "SOLID", color: fillParam.color };
      }
    }
  }

  // Dimensions
  if (params.width) {
    config.width = params.width as number;
    config.counterAxisSizing = "FIXED";
  }
  if (params.height) {
    config.height = params.height as number;
    config.primaryAxisSizing = "FIXED";
  }

  const card = createAutoLayout(config);

  // Theme-aware border
  card.strokes = [{ type: "SOLID", color: tc.border }];
  card.strokeWeight = 1;

  // Contrast validation
  validateTextContrast(tc.cardForeground, tc.card, "Card");

  // Shadow effect
  if (params.shadow !== false) {
    card.effects = [{
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 4 },
      radius: 8,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    }];
  }

  registerNode(card);
  return { nodeId: card.id };
}

// ============================================================================
// CreateKPICard Handler
// ============================================================================

/**
 * Creates a dashboard KPI card for displaying metrics
 * @param params - KPI card creation parameters
 * @returns Object containing the created card node's ID
 */
async function handleCreateKPICard(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const title = (params.title as string) || DEFAULT_KPI_TITLE;
  const value = (params.value as string) || DEFAULT_KPI_VALUE;
  const change = params.change as string | undefined;
  const changeType = (params.changeType as "positive" | "negative" | "neutral") || "neutral";
  const iconName = params.icon as string | undefined;
  const width = (params.width as number) || DEFAULT_KPI_WIDTH;
  const theme = (params.theme as "light" | "dark") || themeManager.getTheme();

  // Theme colors
  const isDark = theme === "dark";
  const bgColor = isDark ? { r: 0.035, g: 0.035, b: 0.043 } : { r: 1, g: 1, b: 1 };
  const textColor = isDark ? { r: 0.98, g: 0.98, b: 0.98 } : { r: 0.035, g: 0.035, b: 0.043 };
  const mutedColor = isDark ? { r: 0.64, g: 0.64, b: 0.7 } : { r: 0.45, g: 0.45, b: 0.5 };
  const borderColor = isDark ? { r: 0.16, g: 0.16, b: 0.18 } : { r: 0.89, g: 0.89, b: 0.91 };

  // Change type colors
  const changeColors = {
    positive: { r: 0.13, g: 0.77, b: 0.37 },
    negative: { r: 0.94, g: 0.27, b: 0.27 },
    neutral: mutedColor,
  };

  // Main card container
  const cardConfig: CoreAutoLayoutConfig = {
    name: "KPI Card",
    direction: "VERTICAL",
    spacing: { item: "2", padding: "6" },
    fill: { type: "SOLID", color: bgColor },
    stroke: { color: borderColor, weight: 1 },
    cornerRadius: "lg",
    width: width,
  };

  // Parent
  if (params.parentId) {
    const parentNode = await getNode(params.parentId as string);
    if (parentNode && "appendChild" in parentNode) {
      cardConfig.parent = parentNode as FrameNode | ComponentNode;
    }
  }

  const card = createAutoLayout(cardConfig);

  // Header row (icon + title)
  const headerConfig: CoreAutoLayoutConfig = {
    name: "Header",
    direction: "HORIZONTAL",
    spacing: { item: "2" },
    align: { counter: "CENTER" },
  };
  const header = createAutoLayout(headerConfig);
  card.appendChild(header);

  // Icon (if provided)
  if (iconName) {
    try {
      const iconResult = await handleCreateIcon({ name: iconName, size: 16, color: rgbToHex(mutedColor) });
      const iconNode = await getNode(iconResult.nodeId);
      if (iconNode) {
        header.appendChild(iconNode as SceneNode);
      }
    } catch (e) {
      // Icon not found, skip
    }
  }

  // Title text
  const titleText = await createTextNode({
    content: title,
    fontSize: 14,
    fontWeight: 500,
    fill: { type: "SOLID", color: mutedColor },
  });
  header.appendChild(titleText);

  // Value text (large)
  const valueText = await createTextNode({
    content: value,
    fontSize: 30,
    fontWeight: 700,
    fill: { type: "SOLID", color: textColor },
  });
  card.appendChild(valueText);

  // Change indicator (if provided)
  if (change) {
    const changeText = await createTextNode({
      content: change,
      fontSize: 12,
      fontWeight: 400,
      fill: { type: "SOLID", color: changeColors[changeType] },
    });
    card.appendChild(changeText);
  }

  registerNode(card);
  return { nodeId: card.id };
}

// ============================================================================
// Component Creator Functions (for CreateUIComponent)
// ============================================================================

/**
 * Creates a button component for the component library
 */
async function createButtonComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Button/${variant}`;

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.primaryAxisAlignItems = "CENTER";
  component.counterAxisAlignItems = "CENTER";
  component.paddingLeft = 16;
  component.paddingRight = 16;
  component.paddingTop = 10;
  component.paddingBottom = 10;
  component.cornerRadius = DEFAULT_CORNER_RADIUS;
  component.itemSpacing = 8;

  const variants: Record<string, { bg: string; text: string; border?: string }> = {
    primary: { bg: "#8B5CF6", text: "#FFFFFF" },
    secondary: { bg: "#27272A", text: "#FFFFFF" },
    outline: { bg: "#00000000", text: "#8B5CF6", border: "#8B5CF6" },
    ghost: { bg: "#00000000", text: "#A1A1AA" },
    destructive: { bg: "#EF4444", text: "#FFFFFF" },
    success: { bg: "#10B981", text: "#FFFFFF" },
  };

  const style = variants[variant] || variants.primary;

  if (style.bg === "#00000000") {
    component.fills = [];
  } else {
    component.fills = [createSolidPaint(style.bg)];
  }

  if (style.border) {
    component.strokes = [createSolidPaint(style.border)];
    component.strokeWeight = 1;
  }

  const text = figma.createText();
  await loadFont("Inter", 500);
  text.fontName = { family: "Inter", style: "Medium" };
  text.characters = (params.text as string) || DEFAULT_BUTTON_TEXT;
  text.fontSize = 14;
  text.fills = [createSolidPaint(style.text)];

  component.appendChild(text);

  return component;
}

/**
 * Creates an input component for the component library
 */
async function createInputComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Input/${variant}`;

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisAlignItems = "MIN";
  component.counterAxisAlignItems = "CENTER";
  component.resize(DEFAULT_INPUT_WIDTH, DEFAULT_INPUT_HEIGHT);
  component.paddingLeft = INPUT_PADDING_X;
  component.paddingRight = INPUT_PADDING_X;
  component.cornerRadius = INPUT_CORNER_RADIUS;

  if (variant === "filled") {
    component.fills = [createSolidPaint("#27272A")];
  } else {
    component.fills = [createSolidPaint("#18181B")];
    component.strokes = [createSolidPaint("#3F3F46")];
    component.strokeWeight = 1;
  }

  const placeholder = figma.createText();
  await loadFont("Inter", 400);
  placeholder.fontName = { family: "Inter", style: "Regular" };
  placeholder.characters = (params.placeholder as string) || DEFAULT_INPUT_PLACEHOLDER;
  placeholder.fontSize = 14;
  placeholder.fills = [createSolidPaint("#71717A")];

  component.appendChild(placeholder);

  return component;
}

/**
 * Creates a card component for the component library
 */
async function createCardComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Card/${variant}`;

  const width = (params.width as number) || 320;
  component.resize(width, 200);

  component.layoutMode = "VERTICAL";
  component.primaryAxisSizingMode = "AUTO";
  component.paddingTop = 24;
  component.paddingRight = 24;
  component.paddingBottom = 24;
  component.paddingLeft = 24;
  component.itemSpacing = 16;
  component.cornerRadius = 16;

  if (variant === "elevated") {
    component.fills = [createSolidPaint("#18181B")];
    component.effects = [{
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.4 },
      offset: { x: 0, y: 8 },
      radius: 24,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    }];
  } else if (variant === "outlined") {
    component.fills = [createSolidPaint("#0A0A0A")];
    component.strokes = [createSolidPaint("#27272A")];
    component.strokeWeight = 1;
  } else {
    component.fills = [createSolidPaint("#18181B")];
    component.strokes = [createSolidPaint("#27272A")];
    component.strokeWeight = 1;
  }

  return component;
}

/**
 * Creates an avatar component for the component library
 */
async function createAvatarComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Avatar/${variant}`;

  const size = AVATAR_SIZES[variant as keyof typeof AVATAR_SIZES] || AVATAR_SIZES.md;

  component.resize(size, size);
  component.cornerRadius = size / 2;
  component.fills = [createSolidPaint("#3F3F46")];
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisAlignItems = "CENTER";
  component.counterAxisAlignItems = "CENTER";

  const initials = figma.createText();
  await loadFont("Inter", 500);
  initials.fontName = { family: "Inter", style: "Medium" };
  initials.characters = (params.initials as string) || "AB";
  initials.fontSize = size * 0.4;
  initials.fills = [createSolidPaint("#FFFFFF")];

  component.appendChild(initials);

  return component;
}

/**
 * Creates a badge component for the component library
 */
async function createBadgeComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Badge/${variant}`;

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.paddingLeft = 8;
  component.paddingRight = 8;
  component.paddingTop = 4;
  component.paddingBottom = 4;
  component.cornerRadius = 9999;

  const theme = resolveTheme(params);
  const badgeVariants = getBadgeVariants(theme);
  const style = badgeVariants[variant as keyof typeof badgeVariants] || badgeVariants.default;
  component.fills = [createSolidPaint(style.bg)];

  const text = figma.createText();
  await loadFont("Inter", 500);
  text.fontName = { family: "Inter", style: "Medium" };
  text.characters = (params.text as string) || "Badge";
  text.fontSize = 12;
  text.fills = [createSolidPaint(style.text)];

  component.appendChild(text);

  return component;
}

/**
 * Creates an icon button component for the component library
 */
async function createIconButtonComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `IconButton/${variant}`;

  const size = ICON_BUTTON_SIZES[variant as keyof typeof ICON_BUTTON_SIZES] || ICON_BUTTON_SIZES.md;

  component.resize(size, size);
  component.cornerRadius = DEFAULT_CORNER_RADIUS;
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisAlignItems = "CENTER";
  component.counterAxisAlignItems = "CENTER";
  component.fills = [createSolidPaint("#27272A")];

  const icon = figma.createText();
  await loadFont("Inter", 400);
  icon.fontName = { family: "Inter", style: "Regular" };
  icon.characters = (params.icon as string) || "\u2605"; // Star character
  icon.fontSize = size * 0.5;
  icon.fills = [createSolidPaint("#FFFFFF")];

  component.appendChild(icon);

  return component;
}

/**
 * Creates a checkbox component for the component library
 */
async function createCheckboxComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Checkbox/${variant}`;

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.itemSpacing = 8;
  component.counterAxisAlignItems = "CENTER";
  component.fills = [];

  const box = figma.createFrame();
  box.name = "checkbox-box";
  box.resize(20, 20);
  box.cornerRadius = 4;

  if (variant === "checked") {
    box.fills = [createSolidPaint("#8B5CF6")];
    const check = figma.createText();
    await loadFont("Inter", 700);
    check.fontName = { family: "Inter", style: "Bold" };
    check.characters = "\u2713"; // Checkmark
    check.fontSize = 14;
    check.fills = [createSolidPaint("#FFFFFF")];
    box.layoutMode = "HORIZONTAL";
    box.primaryAxisAlignItems = "CENTER";
    box.counterAxisAlignItems = "CENTER";
    box.appendChild(check);
  } else {
    box.fills = [createSolidPaint("#18181B")];
    box.strokes = [createSolidPaint("#3F3F46")];
    box.strokeWeight = 2;
  }

  component.appendChild(box);

  if (params.label) {
    const label = figma.createText();
    await loadFont("Inter", 400);
    label.fontName = { family: "Inter", style: "Regular" };
    label.characters = params.label as string;
    label.fontSize = 14;
    label.fills = [createSolidPaint("#FFFFFF")];
    component.appendChild(label);
  }

  return component;
}

/**
 * Creates a toggle component for the component library
 */
async function createToggleComponent(variant: string, _params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Toggle/${variant}`;

  component.resize(44, 24);
  component.cornerRadius = 12;
  component.layoutMode = "HORIZONTAL";
  component.paddingLeft = 2;
  component.paddingRight = 2;
  component.counterAxisAlignItems = "CENTER";

  if (variant === "on") {
    component.fills = [createSolidPaint("#8B5CF6")];
    component.primaryAxisAlignItems = "MAX";
  } else {
    component.fills = [createSolidPaint("#3F3F46")];
    component.primaryAxisAlignItems = "MIN";
  }

  const knob = figma.createEllipse();
  knob.name = "knob";
  knob.resize(20, 20);
  knob.fills = [createSolidPaint("#FFFFFF")];

  component.appendChild(knob);

  return component;
}

/**
 * Creates a tab component for the component library
 */
async function createTabComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `Tab/${variant}`;

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";
  component.paddingLeft = 16;
  component.paddingRight = 16;
  component.paddingTop = 12;
  component.paddingBottom = 12;
  component.fills = [];

  const text = figma.createText();
  await loadFont("Inter", variant === "active" ? 500 : 400);
  text.fontName = { family: "Inter", style: variant === "active" ? "Medium" : "Regular" };
  text.characters = (params.text as string) || "Tab";
  text.fontSize = 14;
  text.fills = [createSolidPaint(variant === "active" ? "#FFFFFF" : "#71717A")];

  component.appendChild(text);

  if (variant === "active") {
    component.strokes = [createSolidPaint("#8B5CF6")];
    component.strokeWeight = 2;
    component.strokeAlign = "INSIDE";
    component.strokeTopWeight = 0;
    component.strokeLeftWeight = 0;
    component.strokeRightWeight = 0;
    component.strokeBottomWeight = 2;
  }

  return component;
}

/**
 * Creates a nav item component for the component library
 */
async function createNavItemComponent(variant: string, params: Record<string, unknown>): Promise<ComponentNode> {
  const component = figma.createComponent();
  component.name = `NavItem/${variant}`;

  component.layoutMode = "HORIZONTAL";
  component.primaryAxisSizingMode = "FIXED";
  component.counterAxisSizingMode = "AUTO";
  component.resize(220, 44);
  component.primaryAxisAlignItems = "MIN";
  component.counterAxisAlignItems = "CENTER";
  component.paddingLeft = 12;
  component.paddingRight = 12;
  component.itemSpacing = 12;
  component.cornerRadius = DEFAULT_CORNER_RADIUS;

  if (variant === "active") {
    component.fills = [createSolidPaint("#8B5CF6")];
  } else {
    component.fills = [];
  }

  const icon = figma.createText();
  await loadFont("Inter", 400);
  icon.fontName = { family: "Inter", style: "Regular" };
  icon.characters = (params.icon as string) || "\u25CB"; // Circle
  icon.fontSize = 16;
  icon.fills = [createSolidPaint(variant === "active" ? "#FFFFFF" : "#A1A1AA")];
  component.appendChild(icon);

  const text = figma.createText();
  await loadFont("Inter", variant === "active" ? 500 : 400);
  text.fontName = { family: "Inter", style: variant === "active" ? "Medium" : "Regular" };
  text.characters = (params.text as string) || "Nav Item";
  text.fontSize = 14;
  text.fills = [createSolidPaint(variant === "active" ? "#FFFFFF" : "#A1A1AA")];
  component.appendChild(text);

  return component;
}

// ============================================================================
// CreateUIComponent Handler
// ============================================================================

/**
 * Creates a pre-built UI component with variants
 * Components are cached in the component library for reuse
 * @param params - UI component creation parameters
 * @returns Object containing the component node's ID and library key
 */
async function handleCreateUIComponent(params: Record<string, unknown>): Promise<{ nodeId: string; componentKey: string }> {
  const componentType = params.type as string;
  const variant = (params.variant as string) || "default";

  let component: ComponentNode;
  let componentKey: string;

  switch (componentType) {
    case "button": {
      componentKey = `Button/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        await attachToParentOrPage(instance, params.parentId as string | undefined);
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createButtonComponent(variant, params);
      break;
    }
    case "input": {
      componentKey = `Input/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        await attachToParentOrPage(instance, params.parentId as string | undefined);
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createInputComponent(variant, params);
      break;
    }
    case "card": {
      componentKey = `Card/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        await attachToParentOrPage(instance, params.parentId as string | undefined);
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createCardComponent(variant, params);
      break;
    }
    case "avatar": {
      componentKey = `Avatar/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        await attachToParentOrPage(instance, params.parentId as string | undefined);
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createAvatarComponent(variant, params);
      break;
    }
    case "badge": {
      componentKey = `Badge/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        await attachToParentOrPage(instance, params.parentId as string | undefined);
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createBadgeComponent(variant, params);
      break;
    }
    case "icon-button": {
      componentKey = `IconButton/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        await attachToParentOrPage(instance, params.parentId as string | undefined);
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createIconButtonComponent(variant, params);
      break;
    }
    case "checkbox": {
      componentKey = `Checkbox/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        await attachToParentOrPage(instance, params.parentId as string | undefined);
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createCheckboxComponent(variant, params);
      break;
    }
    case "toggle": {
      componentKey = `Toggle/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        await attachToParentOrPage(instance, params.parentId as string | undefined);
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createToggleComponent(variant, params);
      break;
    }
    case "tab": {
      componentKey = `Tab/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        await attachToParentOrPage(instance, params.parentId as string | undefined);
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createTabComponent(variant, params);
      break;
    }
    case "nav-item": {
      componentKey = `NavItem/${variant}`;
      if (componentLibrary.has(componentKey)) {
        const instance = componentLibrary.get(componentKey)!.createInstance();
        await attachToParentOrPage(instance, params.parentId as string | undefined);
        registerNode(instance);
        return { nodeId: instance.id, componentKey };
      }
      component = await createNavItemComponent(variant, params);
      break;
    }
    default:
      throw new Error(`Unknown UI component type: ${componentType}`);
  }

  componentLibrary.set(componentKey, component);
  await attachToParentOrPage(component, params.parentId as string | undefined);
  registerNode(component);

  return { nodeId: component.id, componentKey };
}

// ============================================================================
// CreateIcon Handler
// ============================================================================

/**
 * Creates a Lucide vector icon in Figma
 * @param params - Icon creation parameters including name, size, color
 * @returns Object containing the icon node's ID and optionally available icons list
 */
async function handleCreateIcon(params: Record<string, unknown>): Promise<{ nodeId: string; availableIcons?: string[] }> {
  const iconName = params.name as string;

  // If no icon name provided, return available icons
  if (!iconName) {
    return {
      nodeId: "",
      availableIcons: getAvailableIcons(),
    };
  }

  // Check if icon exists
  if (!hasIcon(iconName)) {
    const available = getAvailableIcons();
    const errorMsg = `Icon "${iconName}" not found. Available icons: ${available.slice(0, 20).join(", ")}...`;
    throw new Error(errorMsg);
  }

  const svgString = LUCIDE_ICONS[iconName];

  // Create SVG node using Figma's createNodeFromSvg API
  let icon: FrameNode;
  try {
    icon = figma.createNodeFromSvg(svgString);
  } catch (svgError) {
    const errorMsg = `Failed to create SVG node for icon "${iconName}": ${svgError instanceof Error ? svgError.message : String(svgError)}`;
    throw new Error(errorMsg);
  }

  icon.name = `${ICON_NAME_PREFIX}${iconName}`;

  // Apply size
  const size = (params.size as number) || DEFAULT_ICON_SIZE;
  icon.resize(size, size);

  // Apply color to stroke paths (theme-aware default)
  const color = params.color as string | undefined;
  let rgb: { r: number; g: number; b: number };
  if (color) {
    rgb = hexToRgb(color);
  } else {
    const theme = resolveTheme(params);
    const tc = getQuickThemeColors(theme);
    rgb = tc.foreground;
  }

  // Recursive function to apply color to all nested children
  const applyColorRecursive = (node: SceneNode): void => {
    // Apply stroke color if node has strokes
    if ("strokes" in node) {
      const vectorNode = node as VectorNode;
      if (vectorNode.strokes && vectorNode.strokes.length > 0) {
        vectorNode.strokes = [{
          type: "SOLID",
          color: rgb,
        }];
      }
    }

    // Some SVG elements might use fills instead of strokes
    if ("fills" in node) {
      const fillNode = node as GeometryMixin & SceneNode;
      const fills = fillNode.fills as readonly Paint[];
      if (fills && fills.length > 0 && fills[0].type === "SOLID") {
        fillNode.fills = [{
          type: "SOLID",
          color: rgb,
        }];
      }
    }

    // Recursively process children if node has them
    if ("children" in node) {
      const containerNode = node as FrameNode | GroupNode;
      for (const child of containerNode.children) {
        applyColorRecursive(child);
      }
    }
  };

  // Update stroke/fill color for all vector children
  for (const child of icon.children) {
    applyColorRecursive(child);
  }

  // Attach to parent or page, then set position
  await attachToParentOrPage(icon, params.parentId as string | undefined);
  setPosition(icon, params.x as number | undefined, params.y as number | undefined);

  registerNode(icon);
  return { nodeId: icon.id };
}

// ============================================================================
// ListIcons Handler
// ============================================================================

/**
 * Lists all available Lucide icons
 * @returns Object containing array of icon names
 */
async function handleListIcons(): Promise<{ icons: string[] }> {
  return { icons: getAvailableIcons() };
}

// ============================================================================
// Exports
// ============================================================================

export {
  handleCreateButton,
  handleCreateInput,
  handleCreateCard,
  handleCreateKPICard,
  handleCreateUIComponent,
  handleCreateIcon,
  handleListIcons,
};
