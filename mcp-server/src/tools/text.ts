/**
 * Text Tools - Create and modify text elements
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS } from "./handler-factory.js";
import {
  CreateTextInputSchema,
  SetTextContentInputSchema,
  ListAvailableFontsInputSchema,
  type CreateTextInput,
  type SetTextContentInput,
  type ListAvailableFontsInput,
} from "../schemas/index.js";

export function registerTextTools(server: McpServer): void {
  server.registerTool(
    "figma_create_text",
    {
      title: "Create Text",
      description: `Create a text element in Figma.

Args:
  - content: Text content (required)
  - style: Font family, size, weight, alignment, etc.
  - fill: Text color

Returns: Node ID of created text.

Example:
  { content: "Hello World", style: { fontSize: 24, fontWeight: 700 } }`,
      inputSchema: CreateTextInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateTextInput>("CREATE_TEXT")
  );

  server.registerTool(
    "figma_set_text_content",
    {
      title: "Set Text Content",
      description: `Update the text content of an existing text node.

Args:
  - nodeId: Target text node ID
  - content: New text content

Returns: Success confirmation.`,
      inputSchema: SetTextContentInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetTextContentInput>("SET_TEXT_CONTENT")
  );

  server.registerTool(
    "figma_list_available_fonts",
    {
      title: "List Available Fonts",
      description: `Get list of fonts available in the current Figma file.

Returns: Array of available font families.`,
      inputSchema: ListAvailableFontsInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<ListAvailableFontsInput>("LIST_AVAILABLE_FONTS")
  );
}
