/**
 * Node Manipulation Tools - Delete, clone, move, group, visibility, etc.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, DESTRUCTIVE_ANNOTATIONS } from "./handler-factory.js";
import {
  DeleteNodeInputSchema,
  CloneNodeInputSchema,
  MoveNodeInputSchema,
  ModifyNodeInputSchema,
  CreateGroupInputSchema,
  UngroupInputSchema,
  FlattenNodeInputSchema,
  SetVisibilityInputSchema,
  SetLockedInputSchema,
  AppendChildInputSchema,
  type DeleteNodeInput,
  type CloneNodeInput,
  type MoveNodeInput,
  type ModifyNodeInput,
  type CreateGroupInput,
  type UngroupInput,
  type FlattenNodeInput,
  type SetVisibilityInput,
  type SetLockedInput,
  type AppendChildInput,
} from "../schemas/index.js";

export function registerManipulationTools(server: McpServer): void {
  server.registerTool(
    "figma_delete_node",
    {
      title: "Delete Node",
      description: `Delete a node from the canvas.

Args:
  - nodeId: ID of the node to delete

Returns: Success confirmation.`,
      inputSchema: DeleteNodeInputSchema,
      annotations: DESTRUCTIVE_ANNOTATIONS,
    },
    createToolHandler<DeleteNodeInput>("DELETE_NODE")
  );

  server.registerTool(
    "figma_clone_node",
    {
      title: "Clone Node",
      description: `Create a copy of a node.

Args:
  - nodeId: ID of the node to clone
  - x: X position for the clone (optional)
  - y: Y position for the clone (optional)
  - name: Name for the clone (optional)

Returns: Node ID of the clone.`,
      inputSchema: CloneNodeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CloneNodeInput>("CLONE_NODE")
  );

  server.registerTool(
    "figma_move_node",
    {
      title: "Move Node",
      description: `Move a node to a different parent.

Args:
  - nodeId: ID of the node to move
  - newParentId: ID of the new parent frame
  - index: Position index within the new parent (optional)

Returns: Success confirmation.`,
      inputSchema: MoveNodeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<MoveNodeInput>("MOVE_TO_PARENT")
  );

  server.registerTool(
    "figma_modify_node",
    {
      title: "Modify Node",
      description: `Modify properties of an existing node.

Args:
  - nodeId: Target node ID
  - properties: Object with properties to update

Returns: Success confirmation.`,
      inputSchema: ModifyNodeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ModifyNodeInput>("MODIFY_NODE")
  );

  server.registerTool(
    "figma_create_group",
    {
      title: "Create Group",
      description: `Group multiple nodes together.

Args:
  - nodeIds: Array of node IDs to group
  - name: Group name (optional)

Returns: Node ID of the created group.`,
      inputSchema: CreateGroupInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateGroupInput>("CREATE_GROUP")
  );

  server.registerTool(
    "figma_ungroup",
    {
      title: "Ungroup",
      description: `Ungroup a group node, moving children to the parent.

Args:
  - nodeId: ID of the group to ungroup

Returns: Array of child node IDs.`,
      inputSchema: UngroupInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<UngroupInput>("UNGROUP")
  );

  server.registerTool(
    "figma_flatten_node",
    {
      title: "Flatten Node",
      description: `Flatten a node to a single vector path.

Args:
  - nodeId: ID of the node to flatten

Returns: Node ID of the flattened node.`,
      inputSchema: FlattenNodeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<FlattenNodeInput>("FLATTEN_NODE")
  );

  server.registerTool(
    "figma_set_visibility",
    {
      title: "Set Visibility",
      description: `Show or hide a node.

Args:
  - nodeId: Target node ID
  - visible: true to show, false to hide

Returns: Success confirmation.`,
      inputSchema: SetVisibilityInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetVisibilityInput>("SET_VISIBILITY")
  );

  server.registerTool(
    "figma_set_locked",
    {
      title: "Set Locked",
      description: `Lock or unlock a node.

Args:
  - nodeId: Target node ID
  - locked: true to lock, false to unlock

Returns: Success confirmation.`,
      inputSchema: SetLockedInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetLockedInput>("SET_LOCKED")
  );

  server.registerTool(
    "figma_append_child",
    {
      title: "Append Child",
      description: `Add a child element to an existing frame.

Args:
  - parentId: Parent frame ID
  - childType: frame | rectangle | ellipse | text
  - properties: Child properties

Returns: Child node ID.`,
      inputSchema: AppendChildInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<AppendChildInput>("APPEND_CHILD")
  );
}
