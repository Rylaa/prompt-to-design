/**
 * Storage Tools - Client storage and shared plugin data
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS, DESTRUCTIVE_ANNOTATIONS } from "./handler-factory.js";
import {
  ClientStorageSetInputSchema,
  ClientStorageGetInputSchema,
  ClientStorageDeleteInputSchema,
  ClientStorageKeysInputSchema,
  SetSharedPluginDataInputSchema,
  GetSharedPluginDataInputSchema,
  GetSharedPluginDataKeysInputSchema,
  type ClientStorageSetInput,
  type ClientStorageGetInput,
  type ClientStorageDeleteInput,
  type ClientStorageKeysInput,
  type SetSharedPluginDataInput,
  type GetSharedPluginDataInput,
  type GetSharedPluginDataKeysInput,
} from "../schemas/index.js";

export function registerStorageTools(server: McpServer): void {
  // Client Storage
  server.registerTool(
    "figma_client_storage_set",
    {
      title: "Client Storage Set",
      description: `Store data in client storage (persists across sessions).

Args:
  - key: Storage key
  - value: Value to store (any JSON-serializable value)

Returns: Success confirmation.`,
      inputSchema: ClientStorageSetInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ClientStorageSetInput>("CLIENT_STORAGE_SET")
  );

  server.registerTool(
    "figma_client_storage_get",
    {
      title: "Client Storage Get",
      description: `Retrieve data from client storage.

Args:
  - key: Storage key

Returns: Stored value or undefined.`,
      inputSchema: ClientStorageGetInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<ClientStorageGetInput>("CLIENT_STORAGE_GET")
  );

  server.registerTool(
    "figma_client_storage_delete",
    {
      title: "Client Storage Delete",
      description: `Delete data from client storage.

Args:
  - key: Storage key to delete

Returns: Success confirmation.`,
      inputSchema: ClientStorageDeleteInputSchema,
      annotations: DESTRUCTIVE_ANNOTATIONS,
    },
    createToolHandler<ClientStorageDeleteInput>("CLIENT_STORAGE_DELETE")
  );

  server.registerTool(
    "figma_client_storage_keys",
    {
      title: "Client Storage Keys",
      description: `List all keys in client storage.

Returns: Array of storage keys.`,
      inputSchema: ClientStorageKeysInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<ClientStorageKeysInput>("CLIENT_STORAGE_KEYS")
  );

  // Shared Plugin Data
  server.registerTool(
    "figma_set_shared_plugin_data",
    {
      title: "Set Shared Plugin Data",
      description: `Store shared data on a node (accessible by other plugins).

Args:
  - nodeId: Target node ID
  - namespace: Data namespace
  - key: Data key
  - value: Value to store (string)

Returns: Success confirmation.`,
      inputSchema: SetSharedPluginDataInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetSharedPluginDataInput>("SET_SHARED_PLUGIN_DATA")
  );

  server.registerTool(
    "figma_get_shared_plugin_data",
    {
      title: "Get Shared Plugin Data",
      description: `Retrieve shared data from a node.

Args:
  - nodeId: Target node ID
  - namespace: Data namespace
  - key: Data key

Returns: Stored value or empty string.`,
      inputSchema: GetSharedPluginDataInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetSharedPluginDataInput>("GET_SHARED_PLUGIN_DATA")
  );

  server.registerTool(
    "figma_get_shared_plugin_data_keys",
    {
      title: "Get Shared Plugin Data Keys",
      description: `List all keys in a namespace on a node.

Args:
  - nodeId: Target node ID
  - namespace: Data namespace

Returns: Array of keys.`,
      inputSchema: GetSharedPluginDataKeysInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetSharedPluginDataKeysInput>("GET_SHARED_PLUGIN_DATA_KEYS")
  );
}
