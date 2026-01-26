/**
 * Linter Tools - Post-generation layout validation
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, READONLY_ANNOTATIONS } from "./handler-factory.js";
import { LintLayoutInputSchema, type LintLayoutInput } from "../schemas/index.js";

export function registerLinterTools(server: McpServer): void {
  server.registerTool(
    "figma_lint_layout",
    {
      title: "Lint Layout",
      description: `Validate Auto Layout rules on a node tree.

Checks for common layout issues:
- NO_ABSOLUTE_POSITION: Ensures no x,y positioning is used
- AUTO_LAYOUT_REQUIRED: All frames must have Auto Layout enabled
- VALID_SIZING_MODE: Children use FILL/HUG/FIXED correctly
- SPACING_TOKEN_ONLY: Spacing values match token system (0,4,8,12,16,24,32)
- FILL_REQUIRED_ON_ROOT: Root frame must have a fill color

Args:
  - nodeId: Root node ID to lint
  - rules: Array of rules to check (default: all)
  - recursive: Check children recursively (default: true)

Returns: LintResult with passed status and violations array.`,
      inputSchema: LintLayoutInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<LintLayoutInput>("LINT_LAYOUT")
  );
}
