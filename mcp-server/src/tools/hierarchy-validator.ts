/**
 * Hierarchy Validator Tool - Validate node hierarchy for design quality
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, READONLY_ANNOTATIONS } from "./handler-factory.js";
import {
  ValidateHierarchyInputSchema,
  type ValidateHierarchyInput,
} from "../schemas/index.js";

export function registerHierarchyValidatorTools(server: McpServer): void {
  server.registerTool(
    "figma_validate_hierarchy",
    {
      title: "Validate Hierarchy",
      description: `Validate node hierarchy for design quality issues.

Checks a node tree against configurable rules:
  - MAX_NESTING_DEPTH: Flags deeply nested structures (default max 10)
  - NO_EMPTY_CONTAINERS: Finds empty frames/groups with no children
  - NO_SINGLE_CHILD_WRAPPER: Finds frames with only one child (except auto-layout padding frames)
  - NO_NESTED_INTERACTIVE: Detects interactive elements (button/input) nested inside other interactive elements

Args:
  - nodeId: Root node ID to validate
  - rules: Array of rule names to check (defaults to all)
  - maxDepth: Maximum allowed nesting depth (default 10)

Returns: Validation result with pass/fail status, score, and violation details.`,
      inputSchema: ValidateHierarchyInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<ValidateHierarchyInput>("VALIDATE_HIERARCHY")
  );
}
