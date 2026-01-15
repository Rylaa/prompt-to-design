/**
 * Boolean Operation Tools - Union, subtract, intersect, exclude
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import {
  BooleanOperationInputSchema,
  type BooleanOperationInput,
} from "../schemas/index.js";

export function registerBooleanTools(server: McpServer): void {
  server.registerTool(
    "figma_boolean_operation",
    {
      title: "Boolean Operation",
      description: `Perform a boolean operation on multiple shapes.

Args:
  - nodeIds: Array of node IDs to combine
  - operation: UNION | SUBTRACT | INTERSECT | EXCLUDE

Returns: Node ID of the resulting boolean group.`,
      inputSchema: BooleanOperationInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<BooleanOperationInput>("BOOLEAN_OPERATION")
  );
}
