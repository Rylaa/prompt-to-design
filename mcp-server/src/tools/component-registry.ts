/**
 * Component Registry Tools - Slot Pattern for component reuse
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS } from "./handler-factory.js";
import {
  RegisterComponentSlotInputSchema,
  CreateFromSlotInputSchema,
  ListComponentSlotsInputSchema,
  type RegisterComponentSlotInput,
  type CreateFromSlotInput,
  type ListComponentSlotsInput,
} from "../schemas/index.js";

export function registerComponentRegistryTools(server: McpServer): void {
  server.registerTool(
    "figma_register_component_slot",
    {
      title: "Register Component Slot",
      description: `Register a component for reuse via the slot pattern.

Once registered, use figma_create_from_slot to create instances without
redrawing the component each time.

Args:
  - nodeId: Component or ComponentSet node ID
  - slotKey: Unique key (e.g., 'Button/primary', 'Card/elevated')
  - variants: Optional variant name to node ID mapping

Returns: Confirmation with registered slot key.`,
      inputSchema: RegisterComponentSlotInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<RegisterComponentSlotInput>("REGISTER_COMPONENT_SLOT")
  );

  server.registerTool(
    "figma_create_from_slot",
    {
      title: "Create From Slot",
      description: `Create a component instance from a registered slot.

Much faster than redrawing components - uses Figma's native instance system.

Args:
  - slotKey: Registered component slot key
  - variant: Optional variant to use
  - parentId: Parent frame to add instance to
  - overrides: Property overrides (text, fills, etc.)

Returns: Instance node ID.`,
      inputSchema: CreateFromSlotInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateFromSlotInput>("CREATE_FROM_SLOT")
  );

  server.registerTool(
    "figma_list_component_slots",
    {
      title: "List Component Slots",
      description: `List all registered component slots.

Args:
  - filter: Optional filter by slot key prefix

Returns: Array of registered slots with their variants.`,
      inputSchema: ListComponentSlotsInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<ListComponentSlotsInput>("LIST_COMPONENT_SLOTS")
  );
}
