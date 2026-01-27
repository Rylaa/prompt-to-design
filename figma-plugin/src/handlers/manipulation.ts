// figma-plugin/src/handlers/manipulation.ts
/**
 * Node Manipulation Handlers Module
 *
 * Handles node manipulation operations including delete, clone, modify,
 * move, append, group, ungroup, flatten, visibility, and lock operations.
 */

import {
  // Types
  type FillConfig,
  type EffectConfig,
  type StrokeConfig,
  type AutoLayoutConfig,
  type TextStyleConfig,
  // Node helpers
  nodeRegistry,
  registerNode,
  getNode,
  // Paint helpers
  createFill,
  createEffect,
  applyStroke,
  applyAutoLayout,
  // Font helpers
  loadFont,
  getFontStyle,
} from "./utils";

// ============================================================================
// Delete Operations
// ============================================================================

/**
 * Deletes a node from the canvas.
 * @param params - Object containing nodeId to delete
 * @returns Success confirmation
 */
export async function handleDeleteNode(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const node = await getNode(nodeId);

  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  node.remove();
  nodeRegistry.delete(nodeId);
  return { success: true };
}

// ============================================================================
// Clone Operations
// ============================================================================

/**
 * Creates a copy of a node.
 * @param params - Object containing nodeId to clone and optional position/name
 * @returns Node ID of the cloned node
 */
export async function handleCloneNode(
  params: Record<string, unknown>
): Promise<{ nodeId: string }> {
  const nodeId = params.nodeId as string;
  const node = await getNode(nodeId);

  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  const clone = node.clone();

  if (params.x !== undefined) clone.x = params.x as number;
  if (params.y !== undefined) clone.y = params.y as number;
  if (params.name) clone.name = params.name as string;

  registerNode(clone);
  return { nodeId: clone.id };
}

// ============================================================================
// Modify Operations
// ============================================================================

/**
 * Modifies properties of an existing node.
 * Supports fill, stroke, effects, autoLayout, and any other node properties.
 * @param params - Object containing nodeId and properties to modify
 * @returns Success confirmation
 */
export async function handleModifyNode(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const node = await getNode(nodeId);

  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  const properties = params.properties as Record<string, unknown>;

  for (const [key, value] of Object.entries(properties)) {
    if (key === "fill" && "fills" in node) {
      (node as GeometryMixin).fills = [createFill(value as FillConfig)];
    } else if (key === "stroke" && "strokes" in node) {
      applyStroke(node as GeometryMixin & MinimalStrokesMixin, value as StrokeConfig);
    } else if (key === "effects" && "effects" in node) {
      (node as BlendMixin).effects = (value as EffectConfig[]).map(createEffect);
    } else if (key === "autoLayout" && node.type === "FRAME") {
      applyAutoLayout(node as FrameNode, value as AutoLayoutConfig);
    } else if (key in node) {
      (node as unknown as Record<string, unknown>)[key] = value;
    }
  }

  return { success: true };
}

// ============================================================================
// Move/Reparent Operations
// ============================================================================

/**
 * Moves a node to a different parent frame.
 * @param params - Object containing nodeId, newParentId, and optional index
 * @returns Success confirmation
 */
export async function handleMoveToParent(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const newParentId = params.newParentId as string;
  const index = params.index as number | undefined;

  const node = await getNode(nodeId);
  const newParent = await getNode(newParentId);

  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  if (!newParent || !("appendChild" in newParent)) {
    throw new Error(`New parent ${newParentId} not found or cannot have children`);
  }

  const parentFrame = newParent as FrameNode;

  if (index !== undefined && index >= 0 && index < parentFrame.children.length) {
    parentFrame.insertChild(index, node);
  } else {
    parentFrame.appendChild(node);
  }

  return { success: true };
}

// ============================================================================
// Append Child Operations
// ============================================================================

/**
 * Appends a new child element to an existing frame.
 * Supports creating frame, rectangle, ellipse, and text children.
 * @param params - Object containing parentId, childType, and properties
 * @returns Node ID of the created child
 */
export async function handleAppendChild(
  params: Record<string, unknown>
): Promise<{ nodeId: string }> {
  const parentId = params.parentId as string;
  const parent = await getNode(parentId);

  if (!parent || !("appendChild" in parent)) {
    throw new Error(`Parent ${parentId} not found or cannot have children`);
  }

  const childType = params.childType as string;
  const properties = (params.properties as Record<string, unknown>) || {};

  let child: SceneNode;

  switch (childType) {
    case "frame": {
      const frame = figma.createFrame();
      if (properties.name) frame.name = properties.name as string;
      if (properties.width && properties.height) {
        frame.resize(properties.width as number, properties.height as number);
      }
      if (properties.fill) {
        frame.fills = [createFill(properties.fill as FillConfig)];
      }
      if (properties.cornerRadius !== undefined) {
        frame.cornerRadius = properties.cornerRadius as number;
      }
      if (properties.autoLayout) {
        applyAutoLayout(frame, properties.autoLayout as AutoLayoutConfig);
      }
      child = frame;
      break;
    }
    case "rectangle": {
      const rect = figma.createRectangle();
      if (properties.name) rect.name = properties.name as string;
      if (properties.width && properties.height) {
        rect.resize(properties.width as number, properties.height as number);
      }
      if (properties.fill) {
        rect.fills = [createFill(properties.fill as FillConfig)];
      }
      if (properties.cornerRadius !== undefined) {
        rect.cornerRadius = properties.cornerRadius as number;
      }
      child = rect;
      break;
    }
    case "ellipse": {
      const ellipse = figma.createEllipse();
      if (properties.name) ellipse.name = properties.name as string;
      if (properties.width && properties.height) {
        ellipse.resize(properties.width as number, properties.height as number);
      }
      if (properties.fill) {
        ellipse.fills = [createFill(properties.fill as FillConfig)];
      }
      child = ellipse;
      break;
    }
    case "text": {
      const text = figma.createText();
      const style = (properties.style as TextStyleConfig) || {};
      await loadFont(style.fontFamily || "Inter", style.fontWeight || 400);
      text.fontName = {
        family: style.fontFamily || "Inter",
        style: getFontStyle(style.fontWeight || 400),
      };
      text.characters = (properties.content as string) || "Text";
      text.fontSize = style.fontSize || 16;
      if (properties.fill) {
        text.fills = [createFill(properties.fill as FillConfig)];
      }
      if (properties.name) text.name = properties.name as string;
      child = text;
      break;
    }
    default:
      throw new Error(`Unknown child type: ${childType}`);
  }

  (parent as FrameNode).appendChild(child);
  registerNode(child);
  return { nodeId: child.id };
}

// ============================================================================
// Group Operations
// ============================================================================

/**
 * Groups multiple nodes together.
 * All nodes must have the same parent to be grouped.
 * @param params - Object containing nodeIds array and optional name
 * @returns Node ID of the created group
 */
export async function handleCreateGroup(
  params: Record<string, unknown>
): Promise<{ nodeId: string }> {
  const nodeIds = params.nodeIds as string[];
  const name = (params.name as string) ?? "Group";

  if (!nodeIds || nodeIds.length === 0) {
    throw new Error("No nodes provided for grouping");
  }

  const nodes: SceneNode[] = [];
  for (const id of nodeIds) {
    const node = await getNode(id);
    if (node) {
      nodes.push(node);
    }
  }

  if (nodes.length === 0) {
    throw new Error("No valid nodes found for grouping");
  }

  // All nodes must have the same parent
  const parent = nodes[0].parent;
  if (!parent || !("insertChild" in parent)) {
    throw new Error("Cannot group nodes without a common parent");
  }

  const group = figma.group(nodes, parent as FrameNode | PageNode);
  group.name = name;

  registerNode(group);
  return { nodeId: group.id };
}

/**
 * Ungroups a group node, moving children to the parent.
 * @param params - Object containing nodeId of the group to ungroup
 * @returns Array of child node IDs
 */
export async function handleUngroup(
  params: Record<string, unknown>
): Promise<{ nodeIds: string[] }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if (node.type !== "GROUP") {
    throw new Error("Node is not a group");
  }

  const group = node as GroupNode;
  const parent = group.parent;
  const children = [...group.children];
  const nodeIds: string[] = [];

  // Move children to parent
  for (const child of children) {
    if (parent && "appendChild" in parent) {
      (parent as FrameNode | PageNode).appendChild(child);
    } else {
      figma.currentPage.appendChild(child);
    }
    nodeIds.push(child.id);
  }

  // Remove empty group
  group.remove();

  return { nodeIds };
}

// ============================================================================
// Flatten Operations
// ============================================================================

/**
 * Flattens a node to a single vector path.
 * @param params - Object containing nodeId to flatten and optional name
 * @returns Node ID of the flattened node
 */
export async function handleFlattenNode(
  params: Record<string, unknown>
): Promise<{ nodeId: string }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  const flattenedNode = figma.flatten([node], figma.currentPage);
  flattenedNode.name = (params.name as string) || `${node.name} (flattened)`;

  registerNode(flattenedNode);
  return { nodeId: flattenedNode.id };
}

// ============================================================================
// Visibility Operations
// ============================================================================

/**
 * Sets the visibility of a node.
 * @param params - Object containing nodeId and visible boolean
 * @returns Success confirmation
 */
export async function handleSetVisibility(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const visible = params.visible as boolean;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  node.visible = visible;
  return { success: true };
}

// ============================================================================
// Lock Operations
// ============================================================================

/**
 * Sets the locked state of a node.
 * @param params - Object containing nodeId and locked boolean
 * @returns Success confirmation
 */
export async function handleSetLocked(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const locked = params.locked as boolean;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  if ("locked" in node) {
    (node as SceneNode).locked = locked;
  } else {
    throw new Error("Node does not support locking");
  }

  return { success: true };
}
