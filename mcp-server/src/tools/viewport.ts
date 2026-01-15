/**
 * Viewport Tools - Control the Figma canvas view
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS } from "./handler-factory.js";
import {
  GetViewportInputSchema,
  SetViewportInputSchema,
  ScrollToNodeInputSchema,
  ZoomToFitInputSchema,
  ZoomToSelectionInputSchema,
  type GetViewportInput,
  type SetViewportInput,
  type ScrollToNodeInput,
  type ZoomToFitInput,
  type ZoomToSelectionInput,
} from "../schemas/index.js";

export function registerViewportTools(server: McpServer): void {
  server.registerTool(
    "figma_get_viewport",
    {
      title: "Get Viewport",
      description: `Get current viewport position and zoom level.

Returns: Viewport center coordinates and zoom level.`,
      inputSchema: GetViewportInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetViewportInput>("GET_VIEWPORT")
  );

  server.registerTool(
    "figma_set_viewport",
    {
      title: "Set Viewport",
      description: `Set viewport position and zoom level.

Args:
  - x: Center X coordinate
  - y: Center Y coordinate
  - zoom: Zoom level (1 = 100%)

Returns: Success confirmation.`,
      inputSchema: SetViewportInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetViewportInput>("SET_VIEWPORT")
  );

  server.registerTool(
    "figma_scroll_to_node",
    {
      title: "Scroll To Node",
      description: `Scroll the viewport to center on a node.

Args:
  - nodeId: Target node ID

Returns: Success confirmation.`,
      inputSchema: ScrollToNodeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ScrollToNodeInput>("SCROLL_TO_NODE")
  );

  server.registerTool(
    "figma_zoom_to_fit",
    {
      title: "Zoom To Fit",
      description: `Zoom to fit specific nodes in the viewport.

Args:
  - nodeIds: Array of node IDs to fit in view

Returns: Success confirmation.`,
      inputSchema: ZoomToFitInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ZoomToFitInput>("ZOOM_TO_FIT")
  );

  server.registerTool(
    "figma_zoom_to_selection",
    {
      title: "Zoom To Selection",
      description: `Zoom to fit the current selection in the viewport.

Returns: Success confirmation.`,
      inputSchema: ZoomToSelectionInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ZoomToSelectionInput>("ZOOM_TO_SELECTION")
  );
}
