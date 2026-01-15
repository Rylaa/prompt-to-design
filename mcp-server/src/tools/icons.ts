/**
 * Icon Tools - Create Lucide vector icons
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS } from "./handler-factory.js";
import {
  CreateIconInputSchema,
  ListIconsInputSchema,
  type CreateIconInput,
  type ListIconsInput,
} from "../schemas/index.js";

export function registerIconTools(server: McpServer): void {
  server.registerTool(
    "figma_create_icon",
    {
      title: "Create Icon",
      description: `Create a Lucide vector icon in Figma.

Creates real SVG vector icons from the Lucide icon library (not emoji/Unicode).
Icons are crisp at any size and colors can be customized.

Args:
  - name: Icon name from Lucide library (required)
  - size: Icon size in pixels (default: 24)
  - color: Stroke color as hex (default: "#000000")
  - parentId: Parent frame to add icon to
  - x, y: Position coordinates

Common icon names:
  Navigation: chevron-left, chevron-right, chevron-down, chevron-up, arrow-left, arrow-right, x, menu, home
  Actions: plus, minus, edit, trash-2, copy, download, upload, share, search, filter, settings, refresh-cw
  Status: check, check-circle, x-circle, alert-circle, info, alert-triangle, loader
  Communication: mail, message-square, phone, video, bell, send
  User: user, users, user-plus, log-in, log-out
  Media: image, camera, play, pause, volume-2, mic
  Content: file, folder, link, bookmark, heart, star, eye, eye-off
  Commerce: shopping-cart, credit-card, package

Returns: Node ID of created icon frame.

Example:
  { name: "chevron-left", size: 24, color: "#007AFF" }`,
      inputSchema: CreateIconInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateIconInput>("CREATE_ICON")
  );

  server.registerTool(
    "figma_list_icons",
    {
      title: "List Icons",
      description: `List all available Lucide icons that can be created.

Returns an array of icon names that can be used with figma_create_icon.`,
      inputSchema: ListIconsInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<ListIconsInput>("LIST_ICONS")
  );
}
