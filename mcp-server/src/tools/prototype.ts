/**
 * Prototype Tools - Reactions, interactions, and flow starting points
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS, DESTRUCTIVE_ANNOTATIONS } from "./handler-factory.js";
import {
  SetReactionsInputSchema,
  GetReactionsInputSchema,
  AddReactionInputSchema,
  RemoveReactionsInputSchema,
  SetFlowStartingPointInputSchema,
  GetFlowStartingPointsInputSchema,
  RemoveFlowStartingPointInputSchema,
  type SetReactionsInput,
  type GetReactionsInput,
  type AddReactionInput,
  type RemoveReactionsInput,
  type SetFlowStartingPointInput,
  type GetFlowStartingPointsInput,
  type RemoveFlowStartingPointInput,
} from "../schemas/index.js";

export function registerPrototypeTools(server: McpServer): void {
  server.registerTool(
    "figma_set_reactions",
    {
      title: "Set Reactions",
      description: `Set prototype reactions (interactions) on a node.

Args:
  - nodeId: Target node ID
  - reactions: Array of reaction objects with trigger and action

Returns: Success confirmation.`,
      inputSchema: SetReactionsInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetReactionsInput>("SET_REACTIONS")
  );

  server.registerTool(
    "figma_get_reactions",
    {
      title: "Get Reactions",
      description: `Get prototype reactions from a node.

Args:
  - nodeId: Target node ID

Returns: Array of reaction objects.`,
      inputSchema: GetReactionsInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetReactionsInput>("GET_REACTIONS")
  );

  server.registerTool(
    "figma_add_reaction",
    {
      title: "Add Reaction",
      description: `Add a single reaction to a node's existing reactions.

Args:
  - nodeId: Target node ID
  - reaction: Reaction object with trigger and action

Returns: Success confirmation.`,
      inputSchema: AddReactionInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<AddReactionInput>("ADD_REACTION")
  );

  server.registerTool(
    "figma_remove_reactions",
    {
      title: "Remove Reactions",
      description: `Remove all reactions from a node.

Args:
  - nodeId: Target node ID

Returns: Success confirmation.`,
      inputSchema: RemoveReactionsInputSchema,
      annotations: DESTRUCTIVE_ANNOTATIONS,
    },
    createToolHandler<RemoveReactionsInput>("REMOVE_REACTIONS")
  );

  server.registerTool(
    "figma_set_flow_starting_point",
    {
      title: "Set Flow Starting Point",
      description: `Set a frame as a prototype flow starting point.

Args:
  - nodeId: Frame node ID
  - name: Flow name

Returns: Success confirmation.`,
      inputSchema: SetFlowStartingPointInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetFlowStartingPointInput>("SET_FLOW_STARTING_POINT")
  );

  server.registerTool(
    "figma_get_flow_starting_points",
    {
      title: "Get Flow Starting Points",
      description: `Get all prototype flow starting points.

Returns: Array of flow starting point objects.`,
      inputSchema: GetFlowStartingPointsInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetFlowStartingPointsInput>("GET_FLOW_STARTING_POINTS")
  );

  server.registerTool(
    "figma_remove_flow_starting_point",
    {
      title: "Remove Flow Starting Point",
      description: `Remove a flow starting point from a frame.

Args:
  - nodeId: Frame node ID

Returns: Success confirmation.`,
      inputSchema: RemoveFlowStartingPointInputSchema,
      annotations: DESTRUCTIVE_ANNOTATIONS,
    },
    createToolHandler<RemoveFlowStartingPointInput>("REMOVE_FLOW_STARTING_POINT")
  );
}
