/**
 * Media Tools - Images, videos, and link previews
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import {
  CreateImageInputSchema,
  SetImageFillInputSchema,
  CreateVideoInputSchema,
  SetVideoFillInputSchema,
  CreateLinkPreviewInputSchema,
  type CreateImageInput,
  type SetImageFillInput,
  type CreateVideoInput,
  type SetVideoFillInput,
  type CreateLinkPreviewInput,
} from "../schemas/index.js";

export function registerMediaTools(server: McpServer): void {
  server.registerTool(
    "figma_create_image",
    {
      title: "Create Image",
      description: `Create an image node from a URL or base64 data.

Args:
  - url: Image URL or base64 data
  - name: Image name
  - x, y: Position
  - width, height: Dimensions

Returns: Node ID of created image.`,
      inputSchema: CreateImageInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateImageInput>("CREATE_IMAGE")
  );

  server.registerTool(
    "figma_set_image_fill",
    {
      title: "Set Image Fill",
      description: `Set an image as fill on an existing node.

Args:
  - nodeId: Target node ID
  - url: Image URL or base64 data
  - scaleMode: FILL | FIT | TILE | CROP

Returns: Success confirmation.`,
      inputSchema: SetImageFillInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetImageFillInput>("SET_IMAGE_FILL")
  );

  server.registerTool(
    "figma_create_video",
    {
      title: "Create Video",
      description: `Create a video placeholder node.

Args:
  - url: Video URL
  - name: Video name
  - x, y: Position
  - width, height: Dimensions

Returns: Node ID of created video container.`,
      inputSchema: CreateVideoInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateVideoInput>("CREATE_VIDEO")
  );

  server.registerTool(
    "figma_set_video_fill",
    {
      title: "Set Video Fill",
      description: `Set a video as fill on a node.

Args:
  - nodeId: Target node ID
  - url: Video URL

Returns: Success confirmation.`,
      inputSchema: SetVideoFillInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetVideoFillInput>("SET_VIDEO_FILL")
  );

  server.registerTool(
    "figma_create_link_preview",
    {
      title: "Create Link Preview",
      description: `Create a link preview card (FigJam only).

Args:
  - url: URL to preview
  - x, y: Position

Returns: Node ID of created link preview.`,
      inputSchema: CreateLinkPreviewInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateLinkPreviewInput>("CREATE_LINK_PREVIEW")
  );
}
