// figma-plugin/src/handlers/viewport.ts
/**
 * Viewport Handlers Module
 *
 * Handles viewport operations including:
 * - Getting viewport position and zoom
 * - Setting viewport center and zoom
 * - Scrolling to specific nodes
 * - Zoom to fit nodes or selection
 */

import {
  // Node helpers
  getNode,
} from "./utils";

// ============================================================================
// Types
// ============================================================================

interface ViewportInfo {
  center: { x: number; y: number };
  zoom: number;
  bounds: { x: number; y: number; width: number; height: number };
}

// ============================================================================
// GetViewport Handler
// ============================================================================

/**
 * Gets the current viewport position and zoom level.
 * @returns Viewport center, zoom, and bounds
 */
export async function handleGetViewport(): Promise<{ viewport: ViewportInfo }> {
  const viewport = figma.viewport;

  return {
    viewport: {
      center: viewport.center,
      zoom: viewport.zoom,
      bounds: viewport.bounds,
    },
  };
}

// ============================================================================
// SetViewport Handler
// ============================================================================

/**
 * Sets the viewport center position and zoom level.
 * @param params - Object containing x, y coordinates and zoom level
 * @returns Success confirmation
 */
export async function handleSetViewport(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const x = params.x as number;
  const y = params.y as number;
  const zoom = params.zoom as number;

  figma.viewport.center = { x, y };
  figma.viewport.zoom = zoom;

  return { success: true };
}

// ============================================================================
// ScrollToNode Handler
// ============================================================================

/**
 * Scrolls the viewport to center on a specific node.
 * @param params - Object containing nodeId
 * @returns Success confirmation
 */
export async function handleScrollToNode(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeId = params.nodeId as string;

  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`);
  }

  figma.viewport.scrollAndZoomIntoView([node]);

  return { success: true };
}

// ============================================================================
// ZoomToFit Handler
// ============================================================================

/**
 * Zooms the viewport to fit specific nodes or all page content.
 * @param params - Object containing optional nodeIds array
 * @returns Success confirmation
 */
export async function handleZoomToFit(
  params: Record<string, unknown>
): Promise<{ success: boolean }> {
  const nodeIds = params.nodeIds as string[] | undefined;

  if (nodeIds && nodeIds.length > 0) {
    const nodes: SceneNode[] = [];
    for (const id of nodeIds) {
      const node = await getNode(id);
      if (node) {
        nodes.push(node);
      }
    }
    if (nodes.length > 0) {
      figma.viewport.scrollAndZoomIntoView(nodes);
    }
  } else {
    // Zoom to fit all page content
    if (figma.currentPage.children.length > 0) {
      figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
    }
  }

  return { success: true };
}

// ============================================================================
// ZoomToSelection Handler
// ============================================================================

/**
 * Zooms the viewport to fit the current selection.
 * @returns Success confirmation
 */
export async function handleZoomToSelection(): Promise<{ success: boolean }> {
  const selection = figma.currentPage.selection;

  if (selection.length > 0) {
    figma.viewport.scrollAndZoomIntoView(selection);
  }

  return { success: true };
}
