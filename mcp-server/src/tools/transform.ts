/**
 * Transform Tools - Rotation, scale, transform matrix
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import {
  SetRotationInputSchema,
  ScaleNodeInputSchema,
  SetTransformInputSchema,
  type SetRotationInput,
  type ScaleNodeInput,
  type SetTransformInput,
} from "../schemas/index.js";

export function registerTransformTools(server: McpServer): void {
  server.registerTool(
    "figma_set_rotation",
    {
      title: "Set Rotation",
      description: `Rotate a node by a specified angle.

Args:
  - nodeId: Target node ID
  - rotation: Rotation angle in degrees

Returns: Success confirmation.`,
      inputSchema: SetRotationInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetRotationInput>("SET_ROTATION")
  );

  server.registerTool(
    "figma_scale_node",
    {
      title: "Scale Node",
      description: `Scale a node by a factor.

Args:
  - nodeId: Target node ID
  - scale: Scale factor (1 = 100%, 0.5 = 50%, 2 = 200%)

Returns: Success confirmation.`,
      inputSchema: ScaleNodeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ScaleNodeInput>("SCALE_NODE")
  );

  server.registerTool(
    "figma_set_transform",
    {
      title: "Set Transform",
      description: `Set the full transform matrix of a node.

Args:
  - nodeId: Target node ID
  - transform: 2D transform matrix [[a, c, tx], [b, d, ty]]

Returns: Success confirmation.`,
      inputSchema: SetTransformInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetTransformInput>("SET_TRANSFORM")
  );
}
