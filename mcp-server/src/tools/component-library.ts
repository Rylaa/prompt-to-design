/**
 * Component Library Tools - Create and manage reusable components
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS } from "./handler-factory.js";
import {
  CreateComponentInputSchema,
  CreateComponentInstanceInputSchema,
  GetLocalComponentsInputSchema,
  RegisterComponentInputSchema,
  type CreateComponentInput,
  type CreateComponentInstanceInput,
  type RegisterComponentInput,
} from "../schemas/index.js";

export function registerComponentLibraryTools(server: McpServer): void {
  server.registerTool(
    "figma_create_component",
    {
      title: "Create Component",
      description: `Convert a node to a reusable component.

Args:
  - nodeId: Node to convert (uses selection if not provided)
  - name: Component name

Returns: Component node ID.`,
      inputSchema: CreateComponentInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateComponentInput>("CREATE_COMPONENT")
  );

  server.registerTool(
    "figma_create_component_instance",
    {
      title: "Create Component Instance",
      description: `Create an instance of an existing component.

Use this to reuse components you've created. Components are automatically cached for reuse.

Args:
  - componentKey: Library key (e.g., 'Button/primary', 'NavItem/active')
  - componentId: Or use direct component node ID
  - parentId: Parent frame to add instance to
  - x, y: Position

Returns: Instance node ID.`,
      inputSchema: CreateComponentInstanceInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateComponentInstanceInput>("CREATE_COMPONENT_INSTANCE")
  );

  server.registerTool(
    "figma_get_local_components",
    {
      title: "Get Local Components",
      description: `List all available components in the current document.

Returns component IDs and names that can be used with create_component_instance.`,
      inputSchema: GetLocalComponentsInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<Record<string, never>>("GET_LOCAL_COMPONENTS")
  );

  server.registerTool(
    "figma_register_component",
    {
      title: "Register Component",
      description: `Register an existing component to the library for easy reuse.

Args:
  - nodeId: Component node ID to register
  - libraryKey: Key name (e.g., 'MyButton', 'Header/Large')

Returns: Success confirmation.`,
      inputSchema: RegisterComponentInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<RegisterComponentInput>("REGISTER_COMPONENT")
  );
}
