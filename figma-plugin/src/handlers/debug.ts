// figma-plugin/src/handlers/debug.ts
/**
 * Debug Handlers Module
 *
 * Handles visual debug mode operations including:
 * - Toggle debug overlays (show padding, sizing, spacing)
 * - Get debug info for nodes (layout properties)
 */

import {
  // Node helpers
  getNode,
} from "./utils";

// ============================================================================
// Types
// ============================================================================

interface DebugModeOptions {
  showPadding?: boolean;
  showSizing?: boolean;
  showSpacing?: boolean;
}

interface DebugNodeInfo {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  layoutMode: string;
  primaryAxisSizing: string;
  counterAxisSizing: string;
  layoutSizingHorizontal: string;
  layoutSizingVertical: string;
  itemSpacing: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  width: number;
  height: number;
  children?: DebugNodeInfo[];
}

// ============================================================================
// Module State
// ============================================================================

let debugModeEnabled = false;
const debugOverlayIds = new Set<string>();

// Debug overlay colors for different layout aspects
const DEBUG_COLORS = {
  padding: { r: 0.2, g: 0.6, b: 1, a: 0.2 }, // Blue for padding
  spacing: { r: 1, g: 0.6, b: 0.2, a: 0.2 }, // Orange for spacing
  sizingFill: { r: 0.2, g: 0.8, b: 0.4, a: 0.3 }, // Green for FILL sizing
  sizingHug: { r: 0.8, g: 0.2, b: 0.8, a: 0.3 }, // Purple for HUG sizing
  sizingFixed: { r: 0.8, g: 0.8, b: 0.2, a: 0.3 }, // Yellow for FIXED sizing
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Remove all debug overlay nodes from the canvas
 */
async function clearDebugOverlays(): Promise<number> {
  let removedCount = 0;
  for (const overlayId of debugOverlayIds) {
    const node = figma.getNodeById(overlayId);
    if (node) {
      node.remove();
      removedCount++;
    }
  }
  debugOverlayIds.clear();
  return removedCount;
}

/**
 * Create a text label annotation for sizing mode
 */
async function createSizingLabel(
  _parent: FrameNode | GroupNode,
  text: string,
  x: number,
  y: number,
  color: RGBA
): Promise<TextNode> {
  const label = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  label.characters = text;
  label.fontSize = 10;
  label.fontName = { family: "Inter", style: "Bold" };
  label.fills = [{ type: "SOLID", color: { r: color.r, g: color.g, b: color.b } }];
  label.x = x;
  label.y = y;
  label.name = `[DEBUG] ${text}`;

  // Add to page at root level for visibility
  figma.currentPage.appendChild(label);
  debugOverlayIds.add(label.id);

  return label;
}

/**
 * Create visual debug overlays for a node showing layout info
 */
async function createDebugOverlaysForNode(
  node: SceneNode,
  options: DebugModeOptions
): Promise<number> {
  let createdCount = 0;

  if (!("layoutMode" in node)) {
    return createdCount;
  }

  const frameNode = node as FrameNode;
  const bounds = frameNode.absoluteBoundingBox;
  if (!bounds) return createdCount;

  // Create sizing mode label
  if (options.showSizing) {
    const hSizing = frameNode.layoutSizingHorizontal || "FIXED";
    const vSizing = frameNode.layoutSizingVertical || "FIXED";
    const layoutMode = frameNode.layoutMode || "NONE";

    const labelText = `${layoutMode} | H:${hSizing} V:${vSizing}`;
    const labelColor =
      hSizing === "FILL"
        ? DEBUG_COLORS.sizingFill
        : hSizing === "HUG"
          ? DEBUG_COLORS.sizingHug
          : DEBUG_COLORS.sizingFixed;

    await createSizingLabel(frameNode, labelText, bounds.x, bounds.y - 14, labelColor);
    createdCount++;
  }

  // Create padding indicator rectangles
  if (options.showPadding && frameNode.layoutMode !== "NONE") {
    const { paddingTop, paddingRight, paddingBottom, paddingLeft } = frameNode;

    if (paddingTop > 0 || paddingRight > 0 || paddingBottom > 0 || paddingLeft > 0) {
      await createSizingLabel(
        frameNode,
        `P: ${paddingTop}/${paddingRight}/${paddingBottom}/${paddingLeft}`,
        bounds.x,
        bounds.y + bounds.height + 2,
        DEBUG_COLORS.padding
      );
      createdCount++;
    }
  }

  // Create spacing indicator
  if (options.showSpacing && frameNode.layoutMode !== "NONE" && frameNode.itemSpacing > 0) {
    await createSizingLabel(
      frameNode,
      `Gap: ${frameNode.itemSpacing}px`,
      bounds.x + bounds.width + 4,
      bounds.y,
      DEBUG_COLORS.spacing
    );
    createdCount++;
  }

  return createdCount;
}

/**
 * Get layout debug info for a single node
 */
function getNodeDebugInfo(node: SceneNode): DebugNodeInfo {
  const info: DebugNodeInfo = {
    nodeId: node.id,
    nodeName: node.name,
    nodeType: node.type,
    layoutMode: "NONE",
    primaryAxisSizing: "FIXED",
    counterAxisSizing: "FIXED",
    layoutSizingHorizontal: "FIXED",
    layoutSizingVertical: "FIXED",
    itemSpacing: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    width: "width" in node ? (node as FrameNode).width : 0,
    height: "height" in node ? (node as FrameNode).height : 0,
  };

  if ("layoutMode" in node) {
    const frameNode = node as FrameNode;
    info.layoutMode = frameNode.layoutMode || "NONE";
    info.primaryAxisSizing = frameNode.primaryAxisSizingMode || "FIXED";
    info.counterAxisSizing = frameNode.counterAxisSizingMode || "FIXED";
    info.layoutSizingHorizontal = frameNode.layoutSizingHorizontal || "FIXED";
    info.layoutSizingVertical = frameNode.layoutSizingVertical || "FIXED";
    info.itemSpacing = frameNode.itemSpacing || 0;
    info.paddingTop = frameNode.paddingTop || 0;
    info.paddingRight = frameNode.paddingRight || 0;
    info.paddingBottom = frameNode.paddingBottom || 0;
    info.paddingLeft = frameNode.paddingLeft || 0;
  }

  return info;
}

/**
 * Generate ASCII tree representation of debug info
 */
function generateDebugTree(
  info: DebugNodeInfo,
  indent: string = "",
  isLast: boolean = true
): string {
  const prefix = indent + (isLast ? "└── " : "├── ");
  const childIndent = indent + (isLast ? "    " : "│   ");

  let line = `${prefix}${info.nodeName} (${info.nodeType})`;

  if (info.layoutMode !== "NONE") {
    line += `\n${childIndent}Layout: ${info.layoutMode}`;
    line += `\n${childIndent}Sizing: H=${info.layoutSizingHorizontal}, V=${info.layoutSizingVertical}`;
    line += `\n${childIndent}Axis: primary=${info.primaryAxisSizing}, counter=${info.counterAxisSizing}`;
    if (info.itemSpacing > 0) {
      line += `\n${childIndent}Spacing: ${info.itemSpacing}px`;
    }
    if (
      info.paddingTop > 0 ||
      info.paddingRight > 0 ||
      info.paddingBottom > 0 ||
      info.paddingLeft > 0
    ) {
      line += `\n${childIndent}Padding: ${info.paddingTop}/${info.paddingRight}/${info.paddingBottom}/${info.paddingLeft}`;
    }
  } else {
    line += ` [No Auto Layout]`;
  }

  line += `\n${childIndent}Size: ${Math.round(info.width)}x${Math.round(info.height)}`;

  if (info.children && info.children.length > 0) {
    for (let i = 0; i < info.children.length; i++) {
      const isChildLast = i === info.children.length - 1;
      line += "\n" + generateDebugTree(info.children[i], childIndent, isChildLast);
    }
  }

  return line;
}

// ============================================================================
// ToggleDebugMode Handler
// ============================================================================

/**
 * Toggle visual debug mode with overlay annotations.
 * @param params - Object containing enabled flag, optional nodeId, and options
 * @returns Debug mode status and affected nodes count
 */
export async function handleToggleDebugMode(
  params: Record<string, unknown>
): Promise<{ enabled: boolean; affectedNodes: number }> {
  const enabled = params.enabled as boolean;
  const nodeId = params.nodeId as string | undefined;
  const options = (params.options as DebugModeOptions) || {
    showPadding: true,
    showSizing: true,
    showSpacing: true,
  };

  // If disabling, clear all overlays
  if (!enabled) {
    const removedCount = await clearDebugOverlays();
    debugModeEnabled = false;
    return { enabled: false, affectedNodes: removedCount };
  }

  // Clear existing overlays before creating new ones
  await clearDebugOverlays();

  debugModeEnabled = true;
  let affectedNodes = 0;

  // Get target nodes
  let targetNodes: SceneNode[] = [];

  if (nodeId) {
    const node = await getNode(nodeId);
    if (node) {
      targetNodes = [node];
    }
  } else {
    // Use current selection or all frames on page
    targetNodes =
      figma.currentPage.selection.length > 0
        ? [...figma.currentPage.selection]
        : figma.currentPage.findAll(n => n.type === "FRAME");
  }

  // Create overlays for each target node
  for (const node of targetNodes) {
    const count = await createDebugOverlaysForNode(node, options);
    affectedNodes += count > 0 ? 1 : 0;

    // Also process children if it's a frame with children
    if ("children" in node) {
      for (const child of node.children) {
        const childCount = await createDebugOverlaysForNode(child, options);
        affectedNodes += childCount > 0 ? 1 : 0;
      }
    }
  }

  return { enabled: true, affectedNodes };
}

// ============================================================================
// GetDebugInfo Handler
// ============================================================================

/**
 * Get detailed debug info for a node's layout properties.
 * @param params - Object containing nodeId, optional includeChildren, and format
 * @returns Debug info as JSON or ASCII tree
 */
export async function handleGetDebugInfo(
  params: Record<string, unknown>
): Promise<{ data: DebugNodeInfo | string }> {
  const nodeId = params.nodeId as string;
  const includeChildren = (params.includeChildren as boolean) ?? false;
  const format = (params.format as string) ?? "json";

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  const info = getNodeDebugInfo(node);

  // Include children's info if requested
  if (includeChildren && "children" in node) {
    info.children = [];
    for (const child of (node as FrameNode).children) {
      const childInfo = getNodeDebugInfo(child);

      // Recursively get children's children
      if ("children" in child) {
        childInfo.children = [];
        for (const grandchild of (child as FrameNode).children) {
          childInfo.children.push(getNodeDebugInfo(grandchild));
        }
      }

      info.children.push(childInfo);
    }
  }

  // Return as tree string if requested
  if (format === "tree") {
    const treeStr = generateDebugTree(info);
    return { data: treeStr };
  }

  return { data: info };
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Check if debug mode is currently enabled
 */
export function isDebugModeEnabled(): boolean {
  return debugModeEnabled;
}

/**
 * Get count of active debug overlays
 */
export function getDebugOverlayCount(): number {
  return debugOverlayIds.size;
}
