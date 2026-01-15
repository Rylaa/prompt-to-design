/**
 * Query Tools - Selection, find nodes, get info
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, READONLY_ANNOTATIONS, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import {
  GetSelectionInputSchema,
  SelectNodesInputSchema,
  FindNodesInputSchema,
  FindChildrenInputSchema,
  GetNodeInfoInputSchema,
  GetPageInfoInputSchema,
  type FindNodesInput,
  type FindChildrenInput,
  type GetNodeInfoInput,
  type SelectNodesInput,
} from "../schemas/index.js";

export function registerQueryTools(server: McpServer): void {
  server.registerTool(
    "figma_get_selection",
    {
      title: "Get Selection",
      description: `Get information about currently selected nodes in Figma.

Returns: Array of selected node IDs and their properties.`,
      inputSchema: GetSelectionInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<Record<string, never>>("GET_SELECTION")
  );

  server.registerTool(
    "figma_select_nodes",
    {
      title: "Select Nodes",
      description: `Select specific nodes in Figma.

Args:
  - nodeIds: Array of node IDs to select

Returns: Success confirmation.`,
      inputSchema: SelectNodesInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SelectNodesInput>("SELECT_NODES")
  );

  server.registerTool(
    "figma_find_nodes",
    {
      title: "Find Nodes",
      description: `Find nodes matching criteria.

Args:
  - name: Find by name (partial match)
  - type: Find by node type (FRAME, TEXT, RECTANGLE, etc.)
  - pluginData: Find by plugin data key

Returns: Array of matching node IDs and basic info.`,
      inputSchema: FindNodesInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<FindNodesInput>("FIND_NODES")
  );

  server.registerTool(
    "figma_find_children",
    {
      title: "Find Children",
      description: `Find children of a specific node.

Args:
  - parentId: Parent node ID
  - recursive: Search recursively (default: false)
  - type: Filter by node type

Returns: Array of child node IDs and basic info.`,
      inputSchema: FindChildrenInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<FindChildrenInput>("FIND_CHILDREN")
  );

  server.registerTool(
    "figma_get_node_info",
    {
      title: "Get Node Info",
      description: `Get detailed information about a specific node.

Args:
  - nodeId: Target node ID

Returns: Node properties including type, size, position, fills, etc.`,
      inputSchema: GetNodeInfoInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetNodeInfoInput>("GET_NODE_INFO")
  );

  server.registerTool(
    "figma_get_page_info",
    {
      title: "Get Page Info",
      description: `Get information about the current page.

Returns: Page name, ID, and child node count.`,
      inputSchema: GetPageInfoInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<Record<string, never>>("GET_PAGE_INFO")
  );
}
