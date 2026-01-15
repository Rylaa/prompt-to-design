/**
 * Page Tools - Page management and editor info
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS } from "./handler-factory.js";
import {
  GetCurrentPageInputSchema,
  SetCurrentPageInputSchema,
  CreatePageInputSchema,
  GetAllPagesInputSchema,
  GetEditorTypeInputSchema,
  GetModeInputSchema,
  type GetCurrentPageInput,
  type SetCurrentPageInput,
  type CreatePageInput,
  type GetAllPagesInput,
  type GetEditorTypeInput,
  type GetModeInput,
} from "../schemas/index.js";

export function registerPageTools(server: McpServer): void {
  server.registerTool(
    "figma_get_current_page",
    {
      title: "Get Current Page",
      description: `Get information about the current page.

Returns: Page ID, name, and child count.`,
      inputSchema: GetCurrentPageInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetCurrentPageInput>("GET_CURRENT_PAGE")
  );

  server.registerTool(
    "figma_set_current_page",
    {
      title: "Set Current Page",
      description: `Switch to a different page.

Args:
  - pageId: Target page ID

Returns: Success confirmation.`,
      inputSchema: SetCurrentPageInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetCurrentPageInput>("SET_CURRENT_PAGE")
  );

  server.registerTool(
    "figma_create_page",
    {
      title: "Create Page",
      description: `Create a new page in the document.

Args:
  - name: Page name

Returns: Page ID of created page.`,
      inputSchema: CreatePageInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreatePageInput>("CREATE_PAGE")
  );

  server.registerTool(
    "figma_get_all_pages",
    {
      title: "Get All Pages",
      description: `Get information about all pages in the document.

Returns: Array of page objects with ID and name.`,
      inputSchema: GetAllPagesInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetAllPagesInput>("GET_ALL_PAGES")
  );

  server.registerTool(
    "figma_get_editor_type",
    {
      title: "Get Editor Type",
      description: `Get the current editor type.

Returns: "figma" for Figma files, "figjam" for FigJam files.`,
      inputSchema: GetEditorTypeInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetEditorTypeInput>("GET_EDITOR_TYPE")
  );

  server.registerTool(
    "figma_get_mode",
    {
      title: "Get Mode",
      description: `Get the current Figma mode.

Returns: "design" or "dev" (Dev Mode).`,
      inputSchema: GetModeInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetModeInput>("GET_MODE")
  );
}
