/**
 * Styles & Variables Tools - Design tokens, styles, and variables API
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS } from "./handler-factory.js";
import {
  GetLocalStylesInputSchema,
  CreatePaintStyleInputSchema,
  CreateTextStyleInputSchema,
  CreateEffectStyleInputSchema,
  ApplyStyleInputSchema,
  GetLocalVariablesInputSchema,
  GetVariableCollectionsInputSchema,
  CreateVariableInputSchema,
  CreateVariableCollectionInputSchema,
  BindVariableInputSchema,
  type GetLocalStylesInput,
  type CreatePaintStyleInput,
  type CreateTextStyleInput,
  type CreateEffectStyleInput,
  type ApplyStyleInput,
  type GetLocalVariablesInput,
  type GetVariableCollectionsInput,
  type CreateVariableInput,
  type CreateVariableCollectionInput,
  type BindVariableInput,
} from "../schemas/index.js";

export function registerStylesVariablesTools(server: McpServer): void {
  server.registerTool(
    "figma_get_local_styles",
    {
      title: "Get Local Styles",
      description: `Get all local styles (paint, text, effect) from the document.

Args:
  - type: Filter by style type (PAINT, TEXT, EFFECT) - optional

Returns: Array of style objects with id, name, and type.`,
      inputSchema: GetLocalStylesInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetLocalStylesInput>("GET_LOCAL_STYLES")
  );

  server.registerTool(
    "figma_create_paint_style",
    {
      title: "Create Paint Style",
      description: `Create a reusable paint/color style.

Args:
  - name: Style name (e.g., "Primary/500")
  - paint: Paint definition (solid color or gradient)

Returns: Style ID.`,
      inputSchema: CreatePaintStyleInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreatePaintStyleInput>("CREATE_PAINT_STYLE")
  );

  server.registerTool(
    "figma_create_text_style",
    {
      title: "Create Text Style",
      description: `Create a reusable text style.

Args:
  - name: Style name (e.g., "Heading/H1")
  - fontFamily: Font family
  - fontSize: Font size
  - fontWeight: Font weight
  - lineHeight: Line height
  - letterSpacing: Letter spacing

Returns: Style ID.`,
      inputSchema: CreateTextStyleInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateTextStyleInput>("CREATE_TEXT_STYLE")
  );

  server.registerTool(
    "figma_create_effect_style",
    {
      title: "Create Effect Style",
      description: `Create a reusable effect style (shadow, blur).

Args:
  - name: Style name (e.g., "Shadow/Large")
  - effects: Array of effect definitions

Returns: Style ID.`,
      inputSchema: CreateEffectStyleInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateEffectStyleInput>("CREATE_EFFECT_STYLE")
  );

  server.registerTool(
    "figma_apply_style",
    {
      title: "Apply Style",
      description: `Apply a style to a node.

Args:
  - nodeId: Target node ID
  - styleId: Style ID to apply
  - styleType: PAINT | TEXT | EFFECT

Returns: Success confirmation.`,
      inputSchema: ApplyStyleInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ApplyStyleInput>("APPLY_STYLE")
  );

  server.registerTool(
    "figma_get_local_variables",
    {
      title: "Get Local Variables",
      description: `Get all local variables from the document.

Args:
  - collectionId: Filter by collection ID (optional)

Returns: Array of variable objects.`,
      inputSchema: GetLocalVariablesInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetLocalVariablesInput>("GET_LOCAL_VARIABLES")
  );

  server.registerTool(
    "figma_get_variable_collections",
    {
      title: "Get Variable Collections",
      description: `Get all variable collections from the document.

Returns: Array of collection objects with id, name, and modes.`,
      inputSchema: GetVariableCollectionsInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetVariableCollectionsInput>("GET_VARIABLE_COLLECTIONS")
  );

  server.registerTool(
    "figma_create_variable",
    {
      title: "Create Variable",
      description: `Create a new variable.

Args:
  - name: Variable name
  - collectionId: Collection to add variable to
  - resolvedType: COLOR | FLOAT | STRING | BOOLEAN
  - value: Initial value

Returns: Variable ID.`,
      inputSchema: CreateVariableInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateVariableInput>("CREATE_VARIABLE")
  );

  server.registerTool(
    "figma_create_variable_collection",
    {
      title: "Create Variable Collection",
      description: `Create a new variable collection.

Args:
  - name: Collection name

Returns: Collection ID.`,
      inputSchema: CreateVariableCollectionInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateVariableCollectionInput>("CREATE_VARIABLE_COLLECTION")
  );

  server.registerTool(
    "figma_bind_variable",
    {
      title: "Bind Variable",
      description: `Bind a variable to a node property.

Args:
  - nodeId: Target node ID
  - variableId: Variable ID to bind
  - property: Property to bind (fills, strokes, opacity, etc.)

Returns: Success confirmation.`,
      inputSchema: BindVariableInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<BindVariableInput>("BIND_VARIABLE")
  );
}
