// mcp-server/src/tools/screen.ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CreateScreenInputSchema } from "../schemas/index.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import type { CreateScreenInput } from "../schemas/index.js";

export function registerScreenTools(server: McpServer): void {
  server.tool(
    "figma_create_screen",
    `Create a complete mobile screen from a semantic JSON specification.

Instead of making 50+ individual tool calls, describe the ENTIRE screen as a structured JSON tree.
The renderer handles all positioning, sizing, spacing, and styling automatically.

IMPORTANT: This is the PRIMARY tool for creating screens. Use individual tools only for modifications.

The screen JSON uses semantic iOS components:
- text: iOS typography (largeTitle, title1, body, caption1, etc.)
- button: iOS button (filled, tinted, gray, plain)
- text-field: iOS text input (default, rounded)
- cell: iOS list cell (with chevron, toggle, value, subtitle)
- list: iOS grouped list (plain, inset, grouped) with cells
- search-bar: iOS search bar
- segmented-control: iOS segmented control
- image: Image placeholder
- spacer: Flexible spacing (xs=4, sm=8, md=16, lg=24, xl=32, fill=grow)
- divider: Separator line
- icon: Lucide icon
- row: Horizontal layout container
- section: Grouped vertical container with optional title
- card: Card container with padding and shadow

Screen-level components (automatic positioning):
- navigationBar: iOS nav bar (large or inline variant)
- tabBar: iOS tab bar with icons and labels
- statusBar: iOS status bar

Example:
{
  "screen": {
    "device": "iphone-15",
    "theme": "dark",
    "name": "Login",
    "navigationBar": { "title": "Sign In", "variant": "inline" },
    "content": [
      { "type": "spacer", "size": "xl" },
      { "type": "text", "value": "Welcome Back", "style": "title1", "weight": "bold" },
      { "type": "text", "value": "Sign in to continue", "style": "subheadline", "color": "secondary" },
      { "type": "spacer", "size": "lg" },
      { "type": "text-field", "label": "Email", "placeholder": "email@example.com" },
      { "type": "text-field", "label": "Password", "placeholder": "Password", "secure": true },
      { "type": "spacer", "size": "md" },
      { "type": "button", "text": "Sign In", "style": "filled", "fullWidth": true },
      { "type": "button", "text": "Forgot Password?", "style": "plain" },
      { "type": "spacer", "size": "fill" },
      { "type": "text", "value": "Don't have an account? Sign Up", "style": "footnote", "color": "secondary", "align": "center" }
    ]
  }
}`,
    CreateScreenInputSchema.shape,
    createToolHandler<CreateScreenInput>("CREATE_SCREEN")
  );
}
