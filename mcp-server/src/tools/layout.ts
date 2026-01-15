/**
 * Layout Tools - Auto-layout, constraints, positioning, sizing
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import {
  SetAutoLayoutInputSchema,
  SetConstraintsInputSchema,
  SetPositionInputSchema,
  ResizeNodeInputSchema,
  SetLayoutSizingInputSchema,
  ReorderChildrenInputSchema,
  SetLayoutGridInputSchema,
  GetLayoutGridInputSchema,
  type SetAutoLayoutInput,
  type SetConstraintsInput,
  type SetPositionInput,
  type ResizeNodeInput,
  type SetLayoutSizingInput,
  type ReorderChildrenInput,
  type SetLayoutGridInput,
  type GetLayoutGridInput,
} from "../schemas/index.js";

export function registerLayoutTools(server: McpServer): void {
  server.registerTool(
    "figma_set_autolayout",
    {
      title: "Set Auto-Layout",
      description: `Apply auto-layout to an existing frame.

Args:
  - nodeId: Target frame ID
  - layout: Auto-layout configuration
    - mode: HORIZONTAL | VERTICAL
    - spacing: Gap between items
    - padding: Inner padding
    - primaryAxisAlign: MIN | CENTER | MAX | SPACE_BETWEEN
    - counterAxisAlign: MIN | CENTER | MAX

Returns: Success confirmation.`,
      inputSchema: SetAutoLayoutInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetAutoLayoutInput>("SET_AUTOLAYOUT")
  );

  server.registerTool(
    "figma_set_constraints",
    {
      title: "Set Constraints",
      description: `Set layout constraints on a node (for non-auto-layout parents).

Args:
  - nodeId: Target node ID
  - horizontal: MIN | CENTER | MAX | STRETCH | SCALE
  - vertical: MIN | CENTER | MAX | STRETCH | SCALE

Returns: Success confirmation.`,
      inputSchema: SetConstraintsInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetConstraintsInput>("SET_CONSTRAINTS")
  );

  server.registerTool(
    "figma_set_position",
    {
      title: "Set Position",
      description: `Set the position of a node.

Args:
  - nodeId: Target node ID
  - x: X coordinate
  - y: Y coordinate

Returns: Success confirmation.`,
      inputSchema: SetPositionInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetPositionInput>("SET_POSITION")
  );

  server.registerTool(
    "figma_resize_node",
    {
      title: "Resize Node",
      description: `Resize a node to specific dimensions.

Args:
  - nodeId: Target node ID
  - width: New width in pixels
  - height: New height in pixels

Returns: Success confirmation.`,
      inputSchema: ResizeNodeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ResizeNodeInput>("RESIZE_NODE")
  );

  server.registerTool(
    "figma_set_layout_sizing",
    {
      title: "Set Layout Sizing",
      description: `Set sizing mode for a child of an auto-layout frame.

Args:
  - nodeId: Target node ID (must be child of auto-layout frame)
  - horizontal: FIXED | HUG | FILL
  - vertical: FIXED | HUG | FILL

Returns: Success confirmation.`,
      inputSchema: SetLayoutSizingInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetLayoutSizingInput>("SET_LAYOUT_SIZING")
  );

  server.registerTool(
    "figma_reorder_children",
    {
      title: "Reorder Children",
      description: `Change the order of a child within its parent frame.

Args:
  - parentId: Parent frame ID
  - childId: Child node ID to reorder
  - newIndex: New index position (0 = first/bottom)

Returns: Success confirmation.`,
      inputSchema: ReorderChildrenInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ReorderChildrenInput>("REORDER_CHILDREN")
  );

  server.registerTool(
    "figma_set_layout_grid",
    {
      title: "Set Layout Grid",
      description: `Set layout grids on a frame.

Args:
  - nodeId: Target frame ID
  - grids: Array of grid configurations (rows, columns, or grid)

Returns: Success confirmation.`,
      inputSchema: SetLayoutGridInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetLayoutGridInput>("SET_LAYOUT_GRID")
  );

  server.registerTool(
    "figma_get_layout_grid",
    {
      title: "Get Layout Grid",
      description: `Get layout grids from a frame.

Args:
  - nodeId: Target frame ID

Returns: Array of grid configurations.`,
      inputSchema: GetLayoutGridInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<GetLayoutGridInput>("GET_LAYOUT_GRID")
  );
}
