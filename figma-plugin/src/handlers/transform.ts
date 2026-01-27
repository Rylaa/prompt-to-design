/**
 * Transform Handlers Module
 *
 * Handles node transformation operations including resize, rotation, scale, and transform matrix.
 * Note: SET_POSITION is deprecated in favor of Auto Layout positioning.
 */

import { getNodeOrThrow } from "./utils";

/**
 * Resizes a node to the specified dimensions.
 */
export async function handleResizeNode(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const width = params.width as number;
  const height = params.height as number;

  const node = await getNodeOrThrow(nodeId);

  if (!("resize" in node)) {
    throw new Error(`Node ${nodeId} does not support resize`);
  }

  (node as FrameNode | RectangleNode | EllipseNode).resize(width, height);
  return { success: true };
}

/**
 * @deprecated Use Auto Layout for positioning instead.
 * Child node positions are automatically determined by their parent's Auto Layout configuration.
 * @throws {Error} Always throws - this operation is no longer supported
 */
export async function handleSetPosition(params: Record<string, unknown>): Promise<{ success: boolean }> {
  throw new Error(
    "SET_POSITION is no longer supported. Use Auto Layout parent with proper spacing instead. " +
    "Child position is determined by parent's Auto Layout configuration."
  );
}

/**
 * Sets the rotation angle of a node in degrees.
 */
export async function handleSetRotation(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const rotation = params.rotation as number;

  const node = await getNodeOrThrow(nodeId);

  if (!("rotation" in node)) {
    throw new Error(`Node ${nodeId} does not support rotation`);
  }

  (node as SceneNode & LayoutMixin).rotation = rotation;
  return { success: true };
}

/**
 * Sets the relative transform matrix of a node.
 */
export async function handleSetTransform(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const transform = params.transform as [[number, number, number], [number, number, number]];

  const node = await getNodeOrThrow(nodeId);

  if (!("relativeTransform" in node)) {
    throw new Error(`Node ${nodeId} does not support transforms`);
  }

  (node as SceneNode & LayoutMixin).relativeTransform = transform;
  return { success: true };
}

/**
 * Scales a node by a given factor.
 * Uses rescale if available, otherwise falls back to resize.
 */
export async function handleScaleNode(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const scale = params.scale as number;

  const node = await getNodeOrThrow(nodeId);

  if ("rescale" in node) {
    (node as SceneNode & LayoutMixin).rescale(scale);
  } else if ("resize" in node) {
    const currentWidth = (node as SceneNode & LayoutMixin).width;
    const currentHeight = (node as SceneNode & LayoutMixin).height;
    (node as SceneNode & LayoutMixin).resize(currentWidth * scale, currentHeight * scale);
  } else {
    throw new Error(`Node ${nodeId} does not support scaling`);
  }

  return { success: true };
}
