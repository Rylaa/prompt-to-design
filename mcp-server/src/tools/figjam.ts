/**
 * FigJam Tools - Sticky notes, sections, connectors, code blocks, tables
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import {
  CreateStickyInputSchema,
  CreateSectionInputSchema,
  SetSectionContentsHiddenInputSchema,
  CreateConnectorInputSchema,
  UpdateConnectorInputSchema,
  CreateSliceInputSchema,
  CreateCodeBlockInputSchema,
  UpdateCodeBlockInputSchema,
  CreateTableInputSchema,
  UpdateTableInputSchema,
  SetTableCellInputSchema,
  type CreateStickyInput,
  type CreateSectionInput,
  type SetSectionContentsHiddenInput,
  type CreateConnectorInput,
  type UpdateConnectorInput,
  type CreateSliceInput,
  type CreateCodeBlockInput,
  type UpdateCodeBlockInput,
  type CreateTableInput,
  type UpdateTableInput,
  type SetTableCellInput,
} from "../schemas/index.js";

export function registerFigjamTools(server: McpServer): void {
  server.registerTool(
    "figma_create_sticky",
    {
      title: "Create Sticky",
      description: `Create a sticky note (FigJam only).

Args:
  - text: Text content
  - x, y: Position
  - fill: Background color
  - authorVisible: Show author name

Returns: Node ID of created sticky.`,
      inputSchema: CreateStickyInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateStickyInput>("CREATE_STICKY")
  );

  server.registerTool(
    "figma_create_section",
    {
      title: "Create Section",
      description: `Create a section container (FigJam only).

Args:
  - name: Section name
  - x, y: Position
  - width, height: Dimensions
  - fill: Background color

Returns: Node ID of created section.`,
      inputSchema: CreateSectionInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateSectionInput>("CREATE_SECTION")
  );

  server.registerTool(
    "figma_set_section_contents_hidden",
    {
      title: "Set Section Contents Hidden",
      description: `Show or hide section contents.

Args:
  - nodeId: Section node ID
  - hidden: true to hide, false to show

Returns: Success confirmation.`,
      inputSchema: SetSectionContentsHiddenInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetSectionContentsHiddenInput>("SET_SECTION_CONTENTS_HIDDEN")
  );

  server.registerTool(
    "figma_create_connector",
    {
      title: "Create Connector",
      description: `Create a connector line between nodes (FigJam only).

Args:
  - start: Start endpoint (node ID or position)
  - end: End endpoint (node ID or position)
  - connectorLineType: STRAIGHT | ELBOWED | CURVED
  - strokeColor: Line color
  - text: Label text

Returns: Node ID of created connector.`,
      inputSchema: CreateConnectorInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateConnectorInput>("CREATE_CONNECTOR")
  );

  server.registerTool(
    "figma_update_connector",
    {
      title: "Update Connector",
      description: `Update an existing connector.

Args:
  - nodeId: Connector node ID
  - start: New start endpoint
  - end: New end endpoint
  - connectorLineType: Line type
  - strokeColor: Line color

Returns: Success confirmation.`,
      inputSchema: UpdateConnectorInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<UpdateConnectorInput>("UPDATE_CONNECTOR")
  );

  server.registerTool(
    "figma_create_slice",
    {
      title: "Create Slice",
      description: `Create a slice for export.

Args:
  - name: Slice name
  - x, y: Position
  - width, height: Dimensions

Returns: Node ID of created slice.`,
      inputSchema: CreateSliceInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateSliceInput>("CREATE_SLICE")
  );

  server.registerTool(
    "figma_create_code_block",
    {
      title: "Create Code Block",
      description: `Create a code block (FigJam only).

Args:
  - code: Code content
  - language: Programming language for syntax highlighting
  - x, y: Position

Returns: Node ID of created code block.`,
      inputSchema: CreateCodeBlockInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateCodeBlockInput>("CREATE_CODE_BLOCK")
  );

  server.registerTool(
    "figma_update_code_block",
    {
      title: "Update Code Block",
      description: `Update an existing code block.

Args:
  - nodeId: Code block node ID
  - code: New code content
  - language: New language

Returns: Success confirmation.`,
      inputSchema: UpdateCodeBlockInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<UpdateCodeBlockInput>("UPDATE_CODE_BLOCK")
  );

  server.registerTool(
    "figma_create_table",
    {
      title: "Create Table",
      description: `Create a table (FigJam only).

Args:
  - rows: Number of rows
  - columns: Number of columns
  - x, y: Position

Returns: Node ID of created table.`,
      inputSchema: CreateTableInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateTableInput>("CREATE_TABLE")
  );

  server.registerTool(
    "figma_update_table",
    {
      title: "Update Table",
      description: `Update table dimensions.

Args:
  - nodeId: Table node ID
  - rows: New row count
  - columns: New column count

Returns: Success confirmation.`,
      inputSchema: UpdateTableInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<UpdateTableInput>("UPDATE_TABLE")
  );

  server.registerTool(
    "figma_set_table_cell",
    {
      title: "Set Table Cell",
      description: `Set content and style of a table cell.

Args:
  - nodeId: Table node ID
  - row: Row index (0-based)
  - column: Column index (0-based)
  - text: Cell text
  - fill: Cell background color

Returns: Success confirmation.`,
      inputSchema: SetTableCellInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetTableCellInput>("SET_TABLE_CELL")
  );
}
