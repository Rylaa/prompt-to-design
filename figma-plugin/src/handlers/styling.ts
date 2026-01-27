// figma-plugin/src/handlers/styling.ts
/**
 * Styling management handlers
 * Handles: SetFill, SetEffects, SetOpacity, SetStroke, SetCornerRadius, SetBlendMode
 */

// Handler utilities
import {
  // Types
  type RGBColor,
  type FillConfig,
  type EffectConfig,
  // Node helpers
  getNodeOrThrow,
  // Paint helpers
  createFill,
  createEffect,
  createSolidPaint,
} from "./utils";

// ============================================================================
// SetFill Handler
// ============================================================================

/**
 * Sets fill color or gradient on a node
 * @param params - Parameters including nodeId and fill configuration
 * @returns Success confirmation
 */
async function handleSetFill(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const node = await getNodeOrThrow(nodeId);

  if (!("fills" in node)) {
    throw new Error(`Node ${nodeId} cannot have fills`);
  }

  (node as GeometryMixin).fills = [createFill(params.fill as FillConfig)];
  return { success: true };
}

// ============================================================================
// SetEffects Handler
// ============================================================================

/**
 * Applies effects (shadows, blur) to a node
 * @param params - Parameters including nodeId and effects array
 * @returns Success confirmation
 */
async function handleSetEffects(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const node = await getNodeOrThrow(nodeId);

  if (!("effects" in node)) {
    throw new Error(`Node ${nodeId} cannot have effects`);
  }

  (node as BlendMixin).effects = (params.effects as EffectConfig[]).map(createEffect);
  return { success: true };
}

// ============================================================================
// SetOpacity Handler
// ============================================================================

/**
 * Sets opacity of a node
 * @param params - Parameters including nodeId and opacity value
 * @returns Success confirmation
 */
async function handleSetOpacity(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const opacity = params.opacity as number;

  const node = await getNodeOrThrow(nodeId);

  if (!("opacity" in node)) {
    throw new Error(`Node ${nodeId} does not support opacity`);
  }

  (node as FrameNode).opacity = opacity;
  return { success: true };
}

// ============================================================================
// SetStroke Handler
// ============================================================================

/**
 * Sets stroke/border on a node
 * @param params - Parameters including nodeId, color, weight, and alignment
 * @returns Success confirmation
 */
async function handleSetStroke(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const color = params.color as string | RGBColor;
  const weight = (params.weight as number) ?? 1;
  const align = (params.align as "INSIDE" | "OUTSIDE" | "CENTER") ?? "INSIDE";

  const node = await getNodeOrThrow(nodeId);

  if (!("strokes" in node)) {
    throw new Error(`Node ${nodeId} does not support strokes`);
  }

  const strokeNode = node as FrameNode | RectangleNode | EllipseNode;
  strokeNode.strokes = [createSolidPaint(color)];
  strokeNode.strokeWeight = weight;
  strokeNode.strokeAlign = align;

  return { success: true };
}

// ============================================================================
// SetCornerRadius Handler
// ============================================================================

/**
 * Sets corner radius on a node
 * @param params - Parameters including nodeId and radius values
 * @returns Success confirmation
 */
async function handleSetCornerRadius(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const radius = params.radius as number;
  const topLeft = params.topLeft as number | undefined;
  const topRight = params.topRight as number | undefined;
  const bottomRight = params.bottomRight as number | undefined;
  const bottomLeft = params.bottomLeft as number | undefined;

  const node = await getNodeOrThrow(nodeId);

  if (!("cornerRadius" in node)) {
    throw new Error(`Node ${nodeId} does not support corner radius`);
  }

  const roundedNode = node as FrameNode | RectangleNode;

  // If individual corners are specified, use them
  if (topLeft !== undefined || topRight !== undefined || bottomRight !== undefined || bottomLeft !== undefined) {
    roundedNode.topLeftRadius = topLeft ?? radius;
    roundedNode.topRightRadius = topRight ?? radius;
    roundedNode.bottomRightRadius = bottomRight ?? radius;
    roundedNode.bottomLeftRadius = bottomLeft ?? radius;
  } else {
    roundedNode.cornerRadius = radius;
  }

  return { success: true };
}

// ============================================================================
// SetBlendMode Handler
// ============================================================================

/**
 * Sets blend mode on a node
 * @param params - Parameters including nodeId and blendMode value
 * @returns Success confirmation
 */
async function handleSetBlendMode(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const blendMode = params.blendMode as BlendMode;

  const node = await getNodeOrThrow(nodeId);

  if (!("blendMode" in node)) {
    throw new Error(`Node ${nodeId} does not support blend modes`);
  }

  (node as SceneNode & BlendMixin).blendMode = blendMode;
  return { success: true };
}

// ============================================================================
// Exports
// ============================================================================

export {
  handleSetFill,
  handleSetEffects,
  handleSetOpacity,
  handleSetStroke,
  handleSetCornerRadius,
  handleSetBlendMode,
};
