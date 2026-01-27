// figma-plugin/src/handlers/layout.ts
/**
 * Layout management handlers
 * Handles: SetAutoLayout, SetConstraints, SetLayoutSizing, SetLayoutGrid, GetLayoutGrid, ReorderChildren
 */

// Handler utilities
import {
  // Types
  type AutoLayoutConfig,
  type RGBColor,
  // Node helpers
  getNodeOrThrow,
  canHaveChildren,
  // Paint helpers
  parseColor,
  applyAutoLayout,
} from "./utils";

// ============================================================================
// SetAutoLayout Handler
// ============================================================================

/**
 * Applies auto-layout configuration to a frame
 * @param params - Parameters including nodeId and layout configuration
 * @returns Success confirmation
 */
async function handleSetAutoLayout(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const node = await getNodeOrThrow(nodeId);

  if (node.type !== "FRAME") {
    throw new Error(`Node ${nodeId} is not a frame`);
  }
  const frame = node as FrameNode;

  applyAutoLayout(frame, params.layout as AutoLayoutConfig);
  return { success: true };
}

// ============================================================================
// SetConstraints Handler
// ============================================================================

/**
 * Sets layout constraints on a node (for non-auto-layout parents)
 * @param params - Parameters including nodeId and constraint values
 * @returns Success confirmation
 */
async function handleSetConstraints(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const horizontal = params.horizontal as "MIN" | "CENTER" | "MAX" | "STRETCH" | "SCALE" | undefined;
  const vertical = params.vertical as "MIN" | "CENTER" | "MAX" | "STRETCH" | "SCALE" | undefined;

  const node = await getNodeOrThrow(nodeId);

  if (!("constraints" in node)) {
    throw new Error(`Node ${nodeId} does not support constraints`);
  }

  const constrainableNode = node as FrameNode;
  const newConstraints = { ...constrainableNode.constraints };

  if (horizontal) {
    newConstraints.horizontal = horizontal;
  }
  if (vertical) {
    newConstraints.vertical = vertical;
  }

  constrainableNode.constraints = newConstraints;
  return { success: true };
}

// ============================================================================
// SetLayoutSizing Handler
// ============================================================================

/**
 * Sets sizing mode for a child of an auto-layout frame
 * @param params - Parameters including nodeId and sizing modes
 * @returns Success confirmation
 */
async function handleSetLayoutSizing(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const horizontal = params.horizontal as "FIXED" | "HUG" | "FILL" | undefined;
  const vertical = params.vertical as "FIXED" | "HUG" | "FILL" | undefined;

  const node = await getNodeOrThrow(nodeId);

  if (!("layoutSizingHorizontal" in node)) {
    throw new Error(`Node ${nodeId} does not support layout sizing`);
  }

  const layoutNode = node as FrameNode;

  if (horizontal) {
    layoutNode.layoutSizingHorizontal = horizontal;
  }
  if (vertical) {
    layoutNode.layoutSizingVertical = vertical;
  }

  return { success: true };
}

// ============================================================================
// SetLayoutGrid Handler
// ============================================================================

/**
 * Sets layout grids on a frame
 * @param params - Parameters including nodeId and grid configurations
 * @returns Success confirmation
 */
async function handleSetLayoutGrid(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;
  const grids = params.grids as Array<{
    pattern: "COLUMNS" | "ROWS" | "GRID";
    sectionSize?: number;
    count?: number;
    offset?: number;
    gutterSize?: number;
    alignment?: "MIN" | "CENTER" | "MAX" | "STRETCH";
    color?: string | RGBColor;
  }>;

  const node = await getNodeOrThrow(nodeId);
  if (node.type !== "FRAME") {
    throw new Error(`Node ${nodeId} is not a frame`);
  }
  const frame = node as FrameNode;

  const layoutGrids: LayoutGrid[] = grids.map(g => {
    const baseGrid = {
      visible: true,
      color: g.color ? { ...parseColor(g.color), a: 0.1 } : { r: 1, g: 0, b: 0, a: 0.1 },
    };

    if (g.pattern === "GRID") {
      return {
        ...baseGrid,
        pattern: "GRID" as const,
        sectionSize: g.sectionSize || 10,
      };
    } else {
      return {
        ...baseGrid,
        pattern: g.pattern,
        count: g.count || 12,
        sectionSize: g.sectionSize || 60,
        offset: g.offset || 0,
        gutterSize: g.gutterSize || 20,
        alignment: g.alignment || "STRETCH",
      };
    }
  });

  frame.layoutGrids = layoutGrids;

  return { success: true };
}

// ============================================================================
// GetLayoutGrid Handler
// ============================================================================

/**
 * Gets layout grids from a frame
 * @param params - Parameters including nodeId
 * @returns Array of grid configurations
 */
async function handleGetLayoutGrid(params: Record<string, unknown>): Promise<{ grids: LayoutGrid[] }> {
  const nodeId = params.nodeId as string;

  const node = await getNodeOrThrow(nodeId);
  if (node.type !== "FRAME") {
    throw new Error(`Node ${nodeId} is not a frame`);
  }
  const frame = node as FrameNode;

  return { grids: [...frame.layoutGrids] };
}

// ============================================================================
// ReorderChildren Handler
// ============================================================================

/**
 * Changes the order of a child within its parent frame
 * @param params - Parameters including parentId, childId, and newIndex
 * @returns Success confirmation
 */
async function handleReorderChildren(params: Record<string, unknown>): Promise<{ success: boolean }> {
  const parentId = params.parentId as string;
  const childId = params.childId as string;
  const newIndex = params.newIndex as number;

  const parent = await getNodeOrThrow(parentId);
  if (!canHaveChildren(parent)) {
    throw new Error(`Parent ${parentId} cannot have children`);
  }

  const child = await getNodeOrThrow(childId);

  const clampedIndex = Math.max(0, Math.min(newIndex, parent.children.length - 1));
  parent.insertChild(clampedIndex, child);

  return { success: true };
}

// ============================================================================
// Exports
// ============================================================================

export {
  handleSetAutoLayout,
  handleSetConstraints,
  handleSetLayoutSizing,
  handleSetLayoutGrid,
  handleGetLayoutGrid,
  handleReorderChildren,
};
