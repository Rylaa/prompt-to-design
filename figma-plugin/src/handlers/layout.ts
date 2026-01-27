// figma-plugin/src/handlers/layout.ts
/**
 * Layout management handlers
 * Handles: SetAutoLayout, SetConstraints, SetLayoutSizing, SetLayoutGrid, GetLayoutGrid, ReorderChildren, LintLayout
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

// Spacing tokens for lint validation
import { spacing } from "../tokens/spacing";

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
// LintLayout Handler
// ============================================================================

// Valid spacing tokens for lint validation
const VALID_SPACING_TOKENS = Object.values(spacing);

// Lint violation types
type LintRule =
  | "NO_ABSOLUTE_POSITION"
  | "AUTO_LAYOUT_REQUIRED"
  | "VALID_SIZING_MODE"
  | "SPACING_TOKEN_ONLY"
  | "FILL_REQUIRED_ON_ROOT";

interface LintViolation {
  nodeId: string;
  nodeName: string;
  rule: LintRule;
  message: string;
}

interface LintLayoutResult {
  passed: boolean;
  violations: LintViolation[];
}

/**
 * Validates Auto Layout rules on a node tree
 * @param params - Parameters including nodeId, rules array, and recursive flag
 * @returns LintResult with passed status and violations array
 */
async function handleLintLayout(
  params: Record<string, unknown>
): Promise<LintLayoutResult> {
  const nodeId = params.nodeId as string;
  const rules = (params.rules as LintRule[]) || [
    "NO_ABSOLUTE_POSITION",
    "AUTO_LAYOUT_REQUIRED",
    "VALID_SIZING_MODE",
  ];
  const recursive = (params.recursive as boolean) ?? true;

  const node = await getNodeOrThrow(nodeId);
  const violations: LintViolation[] = [];

  // Helper to check a single node
  function checkNode(n: SceneNode, isRoot: boolean): void {
    // FILL_REQUIRED_ON_ROOT - Root frame must have a fill
    if (isRoot && rules.includes("FILL_REQUIRED_ON_ROOT")) {
      if ("fills" in n) {
        const fills = (n as GeometryMixin).fills as readonly Paint[];
        if (!fills || fills.length === 0) {
          violations.push({
            nodeId: n.id,
            nodeName: n.name,
            rule: "FILL_REQUIRED_ON_ROOT",
            message: "Root frame must have a fill color",
          });
        }
      }
    }

    // Only check frames for layout rules
    if (n.type !== "FRAME") return;
    const frame = n as FrameNode;

    // AUTO_LAYOUT_REQUIRED - All frames must have Auto Layout enabled
    if (rules.includes("AUTO_LAYOUT_REQUIRED")) {
      if (frame.layoutMode === "NONE") {
        violations.push({
          nodeId: frame.id,
          nodeName: frame.name,
          rule: "AUTO_LAYOUT_REQUIRED",
          message: "Frame does not have Auto Layout enabled",
        });
      }
    }

    // NO_ABSOLUTE_POSITION - No x,y positioning should be used
    if (rules.includes("NO_ABSOLUTE_POSITION")) {
      if (frame.layoutMode === "NONE" && (frame.x !== 0 || frame.y !== 0)) {
        violations.push({
          nodeId: frame.id,
          nodeName: frame.name,
          rule: "NO_ABSOLUTE_POSITION",
          message: `Frame uses absolute position (x: ${frame.x}, y: ${frame.y})`,
        });
      }
    }

    // SPACING_TOKEN_ONLY - Spacing values must match token system
    if (rules.includes("SPACING_TOKEN_ONLY") && frame.layoutMode !== "NONE") {
      if (!VALID_SPACING_TOKENS.includes(frame.itemSpacing)) {
        violations.push({
          nodeId: frame.id,
          nodeName: frame.name,
          rule: "SPACING_TOKEN_ONLY",
          message: `Item spacing ${frame.itemSpacing} is not a valid spacing token`,
        });
      }
      const paddings = [
        frame.paddingTop,
        frame.paddingRight,
        frame.paddingBottom,
        frame.paddingLeft,
      ];
      for (const pad of paddings) {
        if (!VALID_SPACING_TOKENS.includes(pad)) {
          violations.push({
            nodeId: frame.id,
            nodeName: frame.name,
            rule: "SPACING_TOKEN_ONLY",
            message: `Padding value ${pad} is not a valid spacing token`,
          });
          break; // Only report once per frame
        }
      }
    }

    // VALID_SIZING_MODE - Children use FILL/HUG/FIXED correctly
    if (rules.includes("VALID_SIZING_MODE") && frame.layoutMode !== "NONE") {
      const hSizing = frame.layoutSizingHorizontal;
      const vSizing = frame.layoutSizingVertical;
      if (!["FIXED", "HUG", "FILL"].includes(hSizing)) {
        violations.push({
          nodeId: frame.id,
          nodeName: frame.name,
          rule: "VALID_SIZING_MODE",
          message: `Invalid horizontal sizing mode: ${hSizing}`,
        });
      }
      if (!["FIXED", "HUG", "FILL"].includes(vSizing)) {
        violations.push({
          nodeId: frame.id,
          nodeName: frame.name,
          rule: "VALID_SIZING_MODE",
          message: `Invalid vertical sizing mode: ${vSizing}`,
        });
      }
    }
  }

  // Check root node
  checkNode(node, true);

  // Recursively check children
  if (recursive && canHaveChildren(node)) {
    function checkChildren(parent: FrameNode | GroupNode | ComponentNode): void {
      for (const child of parent.children) {
        checkNode(child, false);
        if (canHaveChildren(child)) {
          checkChildren(child as FrameNode | GroupNode | ComponentNode);
        }
      }
    }
    checkChildren(node as FrameNode | GroupNode | ComponentNode);
  }

  return {
    passed: violations.length === 0,
    violations,
  };
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
  handleLintLayout,
};
