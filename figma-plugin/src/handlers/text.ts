// figma-plugin/src/handlers/text.ts
/**
 * Text creation and manipulation handlers
 * Handles: CreateText, SetTextContent, ListAvailableFonts
 */

// Handler utilities
import {
  // Types
  type FillConfig,
  type TextStyleConfig,
  // Node helpers
  registerNode,
  getNodeOrThrow,
  attachToParentOrPage,
  setPosition,
  getNode,
  // Paint helpers
  createFill,
  // Font helpers
  loadFont,
} from "./utils";

// Theme helpers
import { resolveTheme, getQuickThemeColors, validateTextContrast } from "../tokens/theme-helpers";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_FONT_FAMILY = "Inter";
const DEFAULT_FONT_WEIGHT = 400;
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_TEXT_CONTENT = "Text";
const DEFAULT_TEXT_NAME_MAX_LENGTH = 20;
const DEFAULT_FONT_LIST_LIMIT = 100;

// ============================================================================
// CreateText Handler
// ============================================================================

/**
 * Creates a new text node with the specified content and styling
 * @param params - Text creation parameters including content, style, fill, width, position
 * @returns Object containing the created text node's ID
 */
async function handleCreateText(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  const text = figma.createText();
  const style = (params.style as TextStyleConfig) || {};

  // Load font with specified family and weight
  const fontFamily = style.fontFamily || DEFAULT_FONT_FAMILY;
  const fontWeight = style.fontWeight || DEFAULT_FONT_WEIGHT;
  const font = await loadFont(fontFamily, fontWeight);

  // Apply font and content
  text.fontName = font;
  text.characters = (params.content as string) || DEFAULT_TEXT_CONTENT;
  text.fontSize = style.fontSize || DEFAULT_FONT_SIZE;

  // Apply text alignment
  if (style.textAlign) {
    text.textAlignHorizontal = style.textAlign;
  }

  // Apply letter spacing
  if (style.letterSpacing !== undefined) {
    text.letterSpacing = { value: style.letterSpacing, unit: "PIXELS" };
  }

  // Apply line height
  if (style.lineHeight !== undefined) {
    if (typeof style.lineHeight === "number") {
      text.lineHeight = { value: style.lineHeight, unit: "PIXELS" };
    } else if (style.lineHeight === "AUTO") {
      text.lineHeight = { unit: "AUTO" };
    }
  }

  // Apply text case
  if (style.textCase) {
    text.textCase = style.textCase;
  }

  // Apply text decoration
  if (style.textDecoration) {
    text.textDecoration = style.textDecoration;
  }

  // Apply fill color
  if (params.fill) {
    text.fills = [createFill(params.fill as FillConfig)];
  } else {
    // Default to theme-aware foreground color
    const theme = resolveTheme(params);
    const tc = getQuickThemeColors(theme);
    text.fills = [{ type: "SOLID", color: tc.foreground }];
  }

  // Apply fixed width with auto-height
  if (params.width) {
    text.resize(params.width as number, text.height);
    text.textAutoResize = "HEIGHT";
  }

  // Set name from params or derive from content
  text.name = (params.name as string) || text.characters.substring(0, DEFAULT_TEXT_NAME_MAX_LENGTH);

  // Attach to parent and set position
  await attachToParentOrPage(text, params.parentId as string | undefined);
  setPosition(text, params.x as number | undefined, params.y as number | undefined);

  // Contrast validation: check text color against parent background
  if (params.parentId) {
    const parentNode = await getNode(params.parentId as string);
    if (parentNode && "fills" in parentNode) {
      const parentFills = (parentNode as FrameNode).fills as readonly Paint[];
      if (parentFills.length > 0 && parentFills[0].type === "SOLID") {
        const parentBg = (parentFills[0] as SolidPaint).color;
        const textFills = text.fills as readonly Paint[];
        if (textFills.length > 0 && textFills[0].type === "SOLID") {
          const textFg = (textFills[0] as SolidPaint).color;
          validateTextContrast(textFg, parentBg, text.name, text.fontSize as number);
        }
      }
    }
  }

  registerNode(text);
  return { nodeId: text.id };
}

// ============================================================================
// SetTextContent Handler
// ============================================================================

/**
 * Updates the text content of an existing text node
 * Automatically loads the node's current font before modifying content
 * @param params - Object containing nodeId and new content
 * @returns Success status
 */
async function handleSetTextContent(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const content = params.content as string;

  const node = await getNodeOrThrow(nodeId);

  if (node.type !== "TEXT") {
    throw new Error(`Node ${nodeId} is not a text node`);
  }

  const textNode = node as TextNode;

  // Load font before changing characters
  const fontName = textNode.fontName as FontName;
  await figma.loadFontAsync(fontName);

  textNode.characters = content;
  return { success: true };
}

// ============================================================================
// ListAvailableFonts Handler
// ============================================================================

/**
 * Font entry returned by the list fonts handler
 */
interface FontEntry {
  family: string;
  styles: string[];
}

/**
 * Lists all available fonts in Figma, grouped by family
 * Supports optional filtering by font name and result limiting
 * @param params - Optional filter string and limit
 * @returns Array of font families with their available styles
 */
async function handleListAvailableFonts(params: Record<string, unknown>): Promise<{ fonts: FontEntry[] }> {
  const availableFonts = await figma.listAvailableFontsAsync();

  // Group fonts by family
  const fontMap = new Map<string, Set<string>>();

  for (const font of availableFonts) {
    if (!fontMap.has(font.fontName.family)) {
      fontMap.set(font.fontName.family, new Set());
    }
    fontMap.get(font.fontName.family)!.add(font.fontName.style);
  }

  // Apply filter if specified
  const filter = params.filter as string | undefined;

  const fonts: FontEntry[] = [];
  for (const [family, styles] of fontMap) {
    if (!filter || family.toLowerCase().includes(filter.toLowerCase())) {
      fonts.push({ family, styles: Array.from(styles) });
    }
  }

  // Limit results
  const limit = (params.limit as number) || DEFAULT_FONT_LIST_LIMIT;
  return { fonts: fonts.slice(0, limit) };
}

// ============================================================================
// Exports
// ============================================================================

export {
  handleCreateText,
  handleSetTextContent,
  handleListAvailableFonts,
};
