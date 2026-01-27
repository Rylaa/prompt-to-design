// figma-plugin/src/handlers/styles.ts
/**
 * Styles Handlers Module
 *
 * Handles Figma style system operations including:
 * - Getting local styles (paint, text, effect, grid)
 * - Creating paint styles
 * - Creating text styles
 * - Creating effect styles
 * - Applying styles to nodes
 */

import {
  // Types
  type FillConfig,
  type EffectConfig,
  // Node helpers
  getNode,
  // Paint helpers
  createFill,
  createEffect,
} from "./utils";

// ============================================================================
// Types
// ============================================================================

type StyleType = "PAINT" | "TEXT" | "EFFECT" | "GRID";

interface StyleDefinition {
  id: string;
  name: string;
  type: string;
}

// ============================================================================
// GetLocalStyles Handler
// ============================================================================

/**
 * Gets all local styles from the document, optionally filtered by type.
 * @param params - Object containing optional type filter
 * @returns Array of style definitions with id, name, and type
 */
export async function handleGetLocalStyles(
  params: Record<string, unknown>
): Promise<{ styles: StyleDefinition[] }> {
  const styleType = params.type as StyleType | undefined;

  const styles: StyleDefinition[] = [];

  if (!styleType || styleType === "PAINT") {
    const paintStyles = await figma.getLocalPaintStylesAsync();
    for (const style of paintStyles) {
      styles.push({ id: style.id, name: style.name, type: "PAINT" });
    }
  }

  if (!styleType || styleType === "TEXT") {
    const textStyles = await figma.getLocalTextStylesAsync();
    for (const style of textStyles) {
      styles.push({ id: style.id, name: style.name, type: "TEXT" });
    }
  }

  if (!styleType || styleType === "EFFECT") {
    const effectStyles = await figma.getLocalEffectStylesAsync();
    for (const style of effectStyles) {
      styles.push({ id: style.id, name: style.name, type: "EFFECT" });
    }
  }

  if (!styleType || styleType === "GRID") {
    const gridStyles = await figma.getLocalGridStylesAsync();
    for (const style of gridStyles) {
      styles.push({ id: style.id, name: style.name, type: "GRID" });
    }
  }

  return { styles };
}

// ============================================================================
// CreatePaintStyle Handler
// ============================================================================

/**
 * Creates a reusable paint/color style.
 * @param params - Object containing name and paints array
 * @returns Style ID of the created paint style
 */
export async function handleCreatePaintStyle(
  params: Record<string, unknown>
): Promise<{ styleId: string }> {
  const name = params.name as string;
  const paints = params.paints as FillConfig[];

  const style = figma.createPaintStyle();
  style.name = name;

  if (paints && paints.length > 0) {
    style.paints = paints.map(p => createFill(p));
  }

  return { styleId: style.id };
}

// ============================================================================
// CreateTextStyle Handler
// ============================================================================

/**
 * Creates a reusable text style.
 * @param params - Object containing name and text properties
 * @returns Style ID of the created text style
 */
export async function handleCreateTextStyle(
  params: Record<string, unknown>
): Promise<{ styleId: string }> {
  const name = params.name as string;

  const style = figma.createTextStyle();
  style.name = name;

  // Apply text properties
  if (params.fontFamily) {
    const fontWeight = (params.fontWeight as number) || 400;
    const fontStyle = fontWeight >= 500 ? "Medium" : "Regular";
    await figma.loadFontAsync({ family: params.fontFamily as string, style: fontStyle });
    style.fontName = { family: params.fontFamily as string, style: fontStyle };
  }

  if (params.fontSize) {
    style.fontSize = params.fontSize as number;
  }

  if (params.letterSpacing) {
    style.letterSpacing = { value: params.letterSpacing as number, unit: "PIXELS" };
  }

  if (params.lineHeight) {
    const lh = params.lineHeight;
    if (typeof lh === "number") {
      style.lineHeight = { value: lh, unit: "PIXELS" };
    } else if (lh === "AUTO") {
      style.lineHeight = { unit: "AUTO" };
    }
  }

  return { styleId: style.id };
}

// ============================================================================
// CreateEffectStyle Handler
// ============================================================================

/**
 * Creates a reusable effect style.
 * @param params - Object containing name and effects array
 * @returns Style ID of the created effect style
 */
export async function handleCreateEffectStyle(
  params: Record<string, unknown>
): Promise<{ styleId: string }> {
  const name = params.name as string;
  const effects = params.effects as EffectConfig[];

  const style = figma.createEffectStyle();
  style.name = name;

  if (effects && effects.length > 0) {
    style.effects = effects.map(e => createEffect(e));
  }

  return { styleId: style.id };
}

// ============================================================================
// ApplyStyle Handler
// ============================================================================

/**
 * Applies a style to a node.
 * @param params - Object containing nodeId, styleId, and styleType
 * @returns Success confirmation
 */
export async function handleApplyStyle(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const styleId = params.styleId as string;
  const styleType = params.styleType as "fill" | "stroke" | "text" | "effect";

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const style = await figma.getStyleByIdAsync(styleId);
  if (!style) {
    throw new Error(`Style not found: ${styleId}`);
  }

  switch (styleType) {
    case "fill":
      if ("fillStyleId" in node) {
        (node as GeometryMixin).fillStyleId = styleId;
      }
      break;
    case "stroke":
      if ("strokeStyleId" in node) {
        (node as GeometryMixin).strokeStyleId = styleId;
      }
      break;
    case "text":
      if (node.type === "TEXT") {
        (node as TextNode).textStyleId = styleId;
      }
      break;
    case "effect":
      if ("effectStyleId" in node) {
        (node as BlendMixin).effectStyleId = styleId;
      }
      break;
  }

  return { success: true };
}
