/**
 * Basic Component Tools - Button, Input, Card, UI Components
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import {
  CreateButtonInputSchema,
  CreateInputInputSchema,
  CreateCardInputSchema,
  CreateUIComponentInputSchema,
  type CreateButtonInput,
  type CreateInputInput,
  type CreateCardInput,
  type CreateUIComponentInput,
} from "../schemas/index.js";

export function registerComponentTools(server: McpServer): void {
  server.registerTool(
    "figma_create_button",
    {
      title: "Create Button",
      description: `Create a styled button component in Figma.

Pre-styled button with auto-layout, proper padding, and hover states.

Args:
  - text: Button label (default: "Button")
  - variant: primary | secondary | outline | ghost
  - size: sm | md | lg
  - fill: Custom background color
  - textColor: Custom text color
  - fullWidth: Stretch to container width

Returns: Node ID of created button.`,
      inputSchema: CreateButtonInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateButtonInput>("CREATE_BUTTON")
  );

  server.registerTool(
    "figma_create_input",
    {
      title: "Create Input",
      description: `Create a text input field in Figma.

Styled input with placeholder text and optional label.

Args:
  - placeholder: Placeholder text
  - label: Optional label above input
  - width: Input width
  - variant: default | filled | outline

Returns: Node ID of created input.`,
      inputSchema: CreateInputInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateInputInput>("CREATE_INPUT")
  );

  server.registerTool(
    "figma_create_card",
    {
      title: "Create Card",
      description: `Create a card container in Figma.

Pre-styled card with padding, border radius, and optional shadow.

Args:
  - width: Card width
  - height: Card height (auto if not specified)
  - padding: Inner padding
  - cornerRadius: Border radius
  - fill: Background color
  - shadow: Enable drop shadow

Returns: Node ID of created card.`,
      inputSchema: CreateCardInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateCardInput>("CREATE_CARD")
  );

  server.registerTool(
    "figma_create_ui_component",
    {
      title: "Create UI Component",
      description: `Create a pre-built UI component with variants.

Creates reusable components that are automatically added to the component library.
Use create_component_instance to reuse them.

Available types and variants:
  - button: primary, secondary, outline, ghost, destructive, success
  - input: default, filled
  - card: default, elevated, outlined
  - avatar: sm, md, lg, xl (size variants)
  - badge: default, primary, success, warning, error, info
  - icon-button: sm, md, lg (size variants)
  - checkbox: default, checked
  - toggle: on, off
  - tab: default, active
  - nav-item: default, active

Args:
  - type: Component type
  - variant: Style variant
  - parentId: Parent frame (optional)
  - text/placeholder/icon/label/initials: Content based on type

Returns: Component node ID and library key for reuse.`,
      inputSchema: CreateUIComponentInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateUIComponentInput>("CREATE_UI_COMPONENT")
  );
}
