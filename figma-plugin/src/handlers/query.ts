// figma-plugin/src/handlers/query.ts
/**
 * Query Handlers Module
 *
 * Handles node querying and selection operations including:
 * - Getting/setting selection
 * - Finding nodes by criteria
 * - Getting node and page info
 */

import {
  // Node helpers
  getNode,
} from "./utils";

// ============================================================================
// Types
// ============================================================================

interface NodeBasicInfo {
  id: string;
  name: string;
  type: string;
}

interface NodeExtendedInfo {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface FindCriteria {
  types?: string[];
  name?: string;
  namePattern?: string;
  recursive?: boolean;
}

// ============================================================================
// GetSelection Handler
// ============================================================================

/**
 * Gets the current selection on the page.
 * @returns Array of selected nodes with id, name, and type
 */
export async function handleGetSelection(): Promise<{ selection: NodeBasicInfo[] }> {
  const selection = figma.currentPage.selection.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
  }));

  return { selection };
}

// ============================================================================
// SelectNodes Handler
// ============================================================================

/**
 * Selects specific nodes by their IDs.
 * @param params - Object containing nodeIds array
 * @returns Success confirmation
 */
export async function handleSelectNodes(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeIds = params.nodeIds as string[];

  if (!nodeIds || nodeIds.length === 0) {
    figma.currentPage.selection = [];
    return { success: true };
  }

  const nodes: SceneNode[] = [];
  for (const id of nodeIds) {
    const node = await getNode(id);
    if (node) {
      nodes.push(node);
    }
  }

  figma.currentPage.selection = nodes;

  // Scroll to first selected node
  if (nodes.length > 0) {
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  return { success: true };
}

// ============================================================================
// GetNodeInfo Handler
// ============================================================================

/**
 * Gets detailed information about a specific node.
 * @param params - Object containing nodeId
 * @returns Comprehensive node data including layout, fills, strokes, etc.
 */
export async function handleGetNodeInfo(
  params: Record<string, unknown>
): Promise<{ data: Record<string, unknown> }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found`);
  }

  const info: Record<string, unknown> = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible,
    x: node.x,
    y: node.y,
  };

  if ("width" in node) {
    info.width = (node as FrameNode).width;
    info.height = (node as FrameNode).height;
  }

  if ("children" in node) {
    const children = (node as FrameNode).children;
    info.childCount = children.length;
    info.children = children.map((child) => ({
      id: child.id,
      name: child.name,
      type: child.type,
    }));
  }

  if ("layoutMode" in node) {
    const layoutNode = node as FrameNode;
    info.layoutMode = layoutNode.layoutMode;
    info.primaryAxisSizingMode = layoutNode.primaryAxisSizingMode;
    info.counterAxisSizingMode = layoutNode.counterAxisSizingMode;
    info.layoutSizingHorizontal = layoutNode.layoutSizingHorizontal;
    info.layoutSizingVertical = layoutNode.layoutSizingVertical;
    info.itemSpacing = layoutNode.itemSpacing;
    info.paddingTop = layoutNode.paddingTop;
    info.paddingRight = layoutNode.paddingRight;
    info.paddingBottom = layoutNode.paddingBottom;
    info.paddingLeft = layoutNode.paddingLeft;
  }

  if ("fills" in node) {
    info.fills = (node as FrameNode).fills;
  }

  if ("strokes" in node) {
    info.strokes = (node as FrameNode).strokes;
    info.strokeWeight = (node as FrameNode).strokeWeight;
  }

  if ("cornerRadius" in node) {
    info.cornerRadius = (node as RectangleNode).cornerRadius;
  }

  if ("opacity" in node) {
    info.opacity = (node as FrameNode).opacity;
  }

  if ("constraints" in node) {
    info.constraints = (node as FrameNode).constraints;
  }

  return { data: info };
}

// ============================================================================
// GetPageInfo Handler
// ============================================================================

/**
 * Gets information about the current page including top-level nodes.
 * @returns Page data with id, name, node count, and node list
 */
export async function handleGetPageInfo(): Promise<{ data: Record<string, unknown> }> {
  const currentPage = figma.currentPage;

  const topLevelNodes = currentPage.children.map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
    x: node.x,
    y: node.y,
    width: "width" in node ? (node as FrameNode).width : undefined,
    height: "height" in node ? (node as FrameNode).height : undefined,
  }));

  return {
    data: {
      pageId: currentPage.id,
      pageName: currentPage.name,
      nodeCount: topLevelNodes.length,
      nodes: topLevelNodes,
    },
  };
}

// ============================================================================
// FindNodes Handler
// ============================================================================

/**
 * Finds nodes on the current page matching criteria.
 * @param params - Object containing criteria (types, name, namePattern)
 * @returns Array of matching nodes
 */
export async function handleFindNodes(
  params: Record<string, unknown>
): Promise<{ nodes: NodeBasicInfo[] }> {
  const criteria = params.criteria as FindCriteria;

  const allNodes = figma.currentPage.findAll();

  const limit = params.limit as number | undefined;

  let filteredNodes = allNodes.filter(node => {
    // Filter by type
    if (criteria.types && criteria.types.length > 0) {
      if (!criteria.types.includes(node.type)) {
        return false;
      }
    }

    // Filter by exact name
    if (criteria.name && node.name !== criteria.name) {
      return false;
    }

    // Filter by name pattern (regex)
    if (criteria.namePattern) {
      const regex = new RegExp(criteria.namePattern);
      if (!regex.test(node.name)) {
        return false;
      }
    }

    return true;
  });

  if (limit !== undefined && limit > 0) {
    filteredNodes = filteredNodes.slice(0, limit);
  }

  const nodes = filteredNodes.map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
  }));

  return { nodes };
}

// ============================================================================
// FindChildren Handler
// ============================================================================

/**
 * Finds children of a specific node matching criteria.
 * @param params - Object containing parentId and criteria (types, name, namePattern, recursive)
 * @returns Array of matching child nodes
 */
export async function handleFindChildren(
  params: Record<string, unknown>
): Promise<{ nodes: NodeBasicInfo[] }> {
  const parentId = params.parentId as string;
  const criteria = params.criteria as FindCriteria;

  const parent = await getNode(parentId);
  if (!parent) {
    throw new Error(`Parent node not found: ${parentId}`);
  }

  if (!("children" in parent)) {
    throw new Error("Node does not have children");
  }

  const parentNode = parent as FrameNode | GroupNode | ComponentNode;

  let childNodes: SceneNode[];
  if (criteria.recursive) {
    childNodes = parentNode.findAll();
  } else {
    childNodes = [...parentNode.children];
  }

  const filteredNodes = childNodes.filter(node => {
    if (criteria.types && criteria.types.length > 0) {
      if (!criteria.types.includes(node.type)) {
        return false;
      }
    }

    if (criteria.name && node.name !== criteria.name) {
      return false;
    }

    if (criteria.namePattern) {
      const regex = new RegExp(criteria.namePattern);
      if (!regex.test(node.name)) {
        return false;
      }
    }

    return true;
  });

  const nodes = filteredNodes.map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
  }));

  return { nodes };
}
