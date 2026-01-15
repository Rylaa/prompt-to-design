/**
 * Export Tools - Export nodes to various formats
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import {
  ExportNodeInputSchema,
  ExportMultipleInputSchema,
  type ExportNodeInput,
  type ExportMultipleInput,
} from "../schemas/index.js";

export function registerExportTools(server: McpServer): void {
  server.registerTool(
    "figma_export_node",
    {
      title: "Export Node",
      description: `Export a node to an image format.

Args:
  - nodeId: Node to export
  - format: PNG | JPG | SVG | PDF
  - scale: Export scale (1 = 1x, 2 = 2x, etc.)
  - contentsOnly: Export only contents without background

Returns: Base64 encoded image data.`,
      inputSchema: ExportNodeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ExportNodeInput>("EXPORT_NODE")
  );

  server.registerTool(
    "figma_export_multiple",
    {
      title: "Export Multiple",
      description: `Export multiple nodes at once.

Args:
  - nodeIds: Array of node IDs to export
  - format: PNG | JPG | SVG | PDF
  - scale: Export scale

Returns: Array of base64 encoded images.`,
      inputSchema: ExportMultipleInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ExportMultipleInput>("EXPORT_MULTIPLE")
  );
}
