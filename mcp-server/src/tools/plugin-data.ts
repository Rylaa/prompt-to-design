/**
 * Plugin Data Tools - Store and retrieve custom data on nodes
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS, DESTRUCTIVE_ANNOTATIONS } from "./handler-factory.js";
import {
  SetPluginDataInputSchema,
  GetPluginDataInputSchema,
  GetAllPluginDataInputSchema,
  DeletePluginDataInputSchema,
  type SetPluginDataInput,
  type GetPluginDataInput,
  type GetAllPluginDataInput,
  type DeletePluginDataInput,
} from "../schemas/index.js";

export function registerPluginDataTools(server: McpServer): void {
  server.registerTool(
    "figma_set_plugin_data",
    {
      title: "Set Plugin Data",
      description: `Store custom data on a node.

Args:
  - nodeId: Target node ID
  - key: Data key
  - value: Data value (string)

Returns: Success confirmation.`,
      inputSchema: SetPluginDataInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetPluginDataInput>("SET_PLUGIN_DATA")
  );

  server.registerTool(
    "figma_get_plugin_data",
    {
      title: "Get Plugin Data",
      description: `Retrieve custom data from a node.

Args:
  - nodeId: Target node ID
  - key: Data key

Returns: Stored value or empty string if not found.`,
      inputSchema: GetPluginDataInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetPluginDataInput>("GET_PLUGIN_DATA")
  );

  server.registerTool(
    "figma_get_all_plugin_data",
    {
      title: "Get All Plugin Data",
      description: `Get all plugin data keys and values from a node.

Args:
  - nodeId: Target node ID

Returns: Object with all key-value pairs.`,
      inputSchema: GetAllPluginDataInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetAllPluginDataInput>("GET_ALL_PLUGIN_DATA")
  );

  server.registerTool(
    "figma_delete_plugin_data",
    {
      title: "Delete Plugin Data",
      description: `Remove custom data from a node.

Args:
  - nodeId: Target node ID
  - key: Data key to delete

Returns: Success confirmation.`,
      inputSchema: DeletePluginDataInputSchema,
      annotations: DESTRUCTIVE_ANNOTATIONS,
    },
    createToolHandler<DeletePluginDataInput>("DELETE_PLUGIN_DATA")
  );
}
