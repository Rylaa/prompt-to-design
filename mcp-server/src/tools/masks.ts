/**
 * Mask Tools - Create and manage masks
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import {
  CreateMaskInputSchema,
  SetMaskInputSchema,
  type CreateMaskInput,
  type SetMaskInput,
} from "../schemas/index.js";

export function registerMaskTools(server: McpServer): void {
  server.registerTool(
    "figma_create_mask",
    {
      title: "Create Mask",
      description: `Create a mask from a node.

Args:
  - nodeId: Node to use as mask shape
  - targetIds: Nodes to be masked

Returns: Success confirmation.`,
      inputSchema: CreateMaskInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateMaskInput>("CREATE_MASK")
  );

  server.registerTool(
    "figma_set_mask",
    {
      title: "Set Mask",
      description: `Toggle mask property on a node.

Args:
  - nodeId: Target node ID
  - isMask: true to make it a mask, false to remove mask

Returns: Success confirmation.`,
      inputSchema: SetMaskInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetMaskInput>("SET_MASK")
  );
}
