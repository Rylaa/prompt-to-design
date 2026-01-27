/**
 * Smart Layout Tool
 * AI-powered layout optimization for Figma designs
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import { SmartLayoutInputSchema, type SmartLayoutInput } from "../schemas/index.js";

export function registerSmartLayoutTools(server: McpServer): void {
  server.registerTool(
    "figma_smart_layout",
    {
      title: "Smart Layout",
      description: `Analyze and optimize layout of a node tree using AI-powered rules.

Strategies:
- AUTO_DETECT: Analyzes content and applies best layout strategy
- CARD_GRID: Optimizes for card-based grid layouts
- FORM_LAYOUT: Optimizes form inputs with labels
- NAVIGATION: Optimizes navigation items
- CONTENT_STACK: Optimizes content sections
- HERO_SECTION: Optimizes hero/landing sections

Features:
- Enforces 8-point grid spacing
- Auto-groups related elements by proximity
- Optimizes visual hierarchy (headings, body, captions)
- Suggests improvements for detected issues

Args:
  - nodeId: Target node ID to optimize
  - strategy: Layout optimization strategy
  - options: Optimization options (enforceGrid, autoGroup, etc.)

Returns: SmartLayoutResult with changes made and suggestions`,
      inputSchema: SmartLayoutInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SmartLayoutInput>("SMART_LAYOUT")
  );
}
