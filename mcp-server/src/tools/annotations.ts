/**
 * Annotations Tools - Dev Mode annotations and status
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS, DESTRUCTIVE_ANNOTATIONS } from "./handler-factory.js";
import {
  CreateAnnotationInputSchema,
  GetAnnotationsInputSchema,
  UpdateAnnotationInputSchema,
  RemoveAnnotationInputSchema,
  SetDevStatusInputSchema,
  type CreateAnnotationInput,
  type GetAnnotationsInput,
  type UpdateAnnotationInput,
  type RemoveAnnotationInput,
  type SetDevStatusInput,
} from "../schemas/index.js";

export function registerAnnotationTools(server: McpServer): void {
  server.registerTool(
    "figma_create_annotation",
    {
      title: "Create Annotation",
      description: `Create a Dev Mode annotation on a node.

Args:
  - nodeId: Target node ID
  - label: Annotation label
  - content: Annotation content/description

Returns: Annotation ID.`,
      inputSchema: CreateAnnotationInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateAnnotationInput>("CREATE_ANNOTATION")
  );

  server.registerTool(
    "figma_get_annotations",
    {
      title: "Get Annotations",
      description: `Get all annotations from a node.

Args:
  - nodeId: Target node ID

Returns: Array of annotation objects.`,
      inputSchema: GetAnnotationsInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<GetAnnotationsInput>("GET_ANNOTATIONS")
  );

  server.registerTool(
    "figma_update_annotation",
    {
      title: "Update Annotation",
      description: `Update an existing annotation.

Args:
  - nodeId: Target node ID
  - annotationId: Annotation ID to update
  - label: New label
  - content: New content

Returns: Success confirmation.`,
      inputSchema: UpdateAnnotationInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<UpdateAnnotationInput>("UPDATE_ANNOTATION")
  );

  server.registerTool(
    "figma_remove_annotation",
    {
      title: "Remove Annotation",
      description: `Remove an annotation from a node.

Args:
  - nodeId: Target node ID
  - annotationId: Annotation ID to remove

Returns: Success confirmation.`,
      inputSchema: RemoveAnnotationInputSchema,
      annotations: DESTRUCTIVE_ANNOTATIONS,
    },
    createToolHandler<RemoveAnnotationInput>("REMOVE_ANNOTATION")
  );

  server.registerTool(
    "figma_set_dev_status",
    {
      title: "Set Dev Status",
      description: `Set development status on a node for Dev Mode.

Args:
  - nodeId: Target node ID
  - status: READY_FOR_DEV | IN_PROGRESS | COMPLETED | null (to clear)

Returns: Success confirmation.`,
      inputSchema: SetDevStatusInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetDevStatusInput>("SET_DEV_STATUS")
  );
}
