// mcp-server/src/tools/componentize.ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ComponentizeScreenInputSchema } from "../schemas/componentize.js";
import { createToolHandler } from "./handler-factory.js";
import type { ComponentizeScreenInput } from "../schemas/componentize.js";

export function registerComponentizeTools(server: McpServer): void {
  server.tool(
    "figma_componentize_screen",
    `Post-process a rendered screen: convert marked frames to Figma Components with optional variants.

Run AFTER figma_create_screen. Finds frames marked with _componentize pluginData
and converts them to reusable Figma Components. Optionally generates state variants
(hover, disabled, focused) for interactive elements.

Use autoDetect to automatically find buttons, cards, and cells by name pattern.
Use createVariants to generate state/size/theme variants for each component.`,
    ComponentizeScreenInputSchema.shape,
    createToolHandler<ComponentizeScreenInput>("COMPONENTIZE_SCREEN")
  );
}
