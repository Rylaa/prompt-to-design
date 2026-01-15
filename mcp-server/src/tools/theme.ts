/**
 * Theme Tools - Set global theme and custom tokens
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import {
  SetThemeInputSchema,
  SetThemeTokensInputSchema,
  type SetThemeInput,
  type SetThemeTokensInput,
} from "../schemas/index.js";

export function registerThemeTools(server: McpServer): void {
  server.registerTool(
    "figma_set_theme",
    {
      title: "Set Theme",
      description: `Set the global theme for component creation.

Applies light or dark theme to all subsequent component creations.

Args:
  - theme: "light" | "dark"
  - platform: Optional platform for theme colors ("shadcn" | "ios" | "macos")

Returns: Success confirmation with current theme settings.`,
      inputSchema: SetThemeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetThemeInput>("SET_THEME")
  );

  server.registerTool(
    "figma_set_theme_tokens",
    {
      title: "Set Theme Tokens",
      description: `Set custom color tokens for the current theme.
Use this to implement custom design systems (e.g., specific brand colors, custom dark modes)
by overriding standard semantic tokens.

Common tokens to override:
- background: Main page background
- foreground: Main text color
- card: Card background
- primary: Primary button background
- primaryForeground: Primary button text
- secondary: Secondary button background
- border: Border color
- input: Input field border/background

Args:
  - colors: Object mapping token names to hex strings (e.g., { background: "#0A0F1C" })

Returns: Success confirmation.`,
      inputSchema: SetThemeTokensInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetThemeTokensInput>("SET_THEME_TOKENS")
  );
}
