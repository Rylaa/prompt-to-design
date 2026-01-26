/**
 * Visual Debug Mode Tools
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS } from "./handler-factory.js";
import {
  ToggleDebugModeInputSchema,
  GetDebugInfoInputSchema,
  type ToggleDebugModeInput,
  type GetDebugInfoInput,
} from "../schemas/index.js";

export function registerDebugTools(server: McpServer): void {
  server.registerTool(
    "figma_toggle_debug_mode",
    {
      title: "Toggle Debug Mode",
      description: `Toggle visual debug overlay on frames to show padding, spacing, sizing modes. Helps identify layout issues.

Args:
  - enabled: Enable or disable debug mode
  - nodeId: Optional specific node to debug (defaults to all)
  - options: Debug visualization options
    - showPadding: Show padding overlay
    - showSpacing: Show item spacing
    - showSizing: Show FILL/HUG/FIXED labels
    - showHierarchy: Show parent-child lines

Returns: Confirmation with debug mode status.`,
      inputSchema: ToggleDebugModeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<ToggleDebugModeInput>("TOGGLE_DEBUG_MODE")
  );

  server.registerTool(
    "figma_get_debug_info",
    {
      title: "Get Debug Info",
      description: `Get detailed debug information about a node's layout properties including sizing mode, padding, spacing, and constraints.

Args:
  - nodeId: Node to get debug info for
  - includeChildren: Include children info (default: false)
  - format: Output format - "json" or "tree" (default: json)

Returns: Detailed layout properties for debugging.`,
      inputSchema: GetDebugInfoInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetDebugInfoInput>("GET_DEBUG_INFO")
  );
}
