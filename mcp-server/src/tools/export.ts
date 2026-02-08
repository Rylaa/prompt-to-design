/**
 * Export Tools - Export nodes as PNG, JPG, SVG, PDF
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
      description: `Export a single node as an image (PNG, JPG, SVG, or PDF).

Args:
  - nodeId: ID of the node to export
  - format: Export format (PNG, JPG, SVG, PDF)
  - scale: Export scale (0.01-4, default 1)
  - quality: JPG quality (0-100)
  - contentsOnly: Export contents without frame background (default true)

Returns: Base64 encoded image data with metadata.`,
      inputSchema: ExportNodeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ExportNodeInput>("EXPORT_NODE")
  );

  server.registerTool(
    "figma_export_multiple",
    {
      title: "Export Multiple Nodes",
      description: `Export multiple nodes as images in a single operation.

Args:
  - nodeIds: Array of node IDs to export
  - format: Export format (PNG, JPG, SVG, PDF)
  - scale: Export scale (0.01-4, default 1)

Returns: Array of base64 encoded image data with metadata for each node.`,
      inputSchema: ExportMultipleInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ExportMultipleInput>("EXPORT_MULTIPLE")
  );
}
