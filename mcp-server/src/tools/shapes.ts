/**
 * Shape Tools - Frame, Rectangle, Ellipse, Line, Polygon, Star, Vector
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import {
  CreateFrameInputSchema,
  CreateRectangleInputSchema,
  CreateEllipseInputSchema,
  CreateLineInputSchema,
  CreatePolygonInputSchema,
  CreateStarInputSchema,
  CreateVectorInputSchema,
  SetVectorPathsInputSchema,
  type CreateFrameInput,
  type CreateRectangleInput,
  type CreateEllipseInput,
  type CreateLineInput,
  type CreatePolygonInput,
  type CreateStarInput,
  type CreateVectorInput,
  type SetVectorPathsInput,
} from "../schemas/index.js";

export function registerShapeTools(server: McpServer): void {
  server.registerTool(
    "figma_create_frame",
    {
      title: "Create Frame",
      description: `Create a new frame/container in Figma.

Frames are the primary container for layouts. Supports auto-layout, fills, strokes, effects.

Args:
  - name: Frame name (default: "Frame")
  - width/height: Dimensions in pixels
  - fill: Solid color or gradient
  - cornerRadius: Border radius
  - autoLayout: Enable auto-layout with direction, spacing, padding
  - effects: Shadows, blurs

Returns: Node ID of created frame.

Examples:
  - Simple frame: { width: 400, height: 300 }
  - With auto-layout: { autoLayout: { mode: "VERTICAL", spacing: 16, padding: 24 } }
  - With gradient: { fill: { type: "GRADIENT", gradient: { type: "LINEAR", stops: [...] } } }`,
      inputSchema: CreateFrameInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateFrameInput>("CREATE_FRAME")
  );

  server.registerTool(
    "figma_create_rectangle",
    {
      title: "Create Rectangle",
      description: `Create a rectangle shape in Figma.

Args:
  - name: Shape name
  - width/height: Dimensions
  - fill: Solid or gradient fill
  - cornerRadius: Border radius
  - effects: Shadows, blurs

Returns: Node ID of created rectangle.`,
      inputSchema: CreateRectangleInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateRectangleInput>("CREATE_RECTANGLE")
  );

  server.registerTool(
    "figma_create_ellipse",
    {
      title: "Create Ellipse",
      description: `Create an ellipse/circle shape in Figma.

Args:
  - width/height: Dimensions (equal for circle)
  - fill: Solid or gradient fill
  - effects: Shadows, blurs

Returns: Node ID of created ellipse.`,
      inputSchema: CreateEllipseInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateEllipseInput>("CREATE_ELLIPSE")
  );

  server.registerTool(
    "figma_create_line",
    {
      title: "Create Line",
      description: `Create a line between two points.

Args:
  - startX/startY: Start coordinates
  - endX/endY: End coordinates
  - stroke: Stroke color and weight

Returns: Node ID of created line.`,
      inputSchema: CreateLineInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateLineInput>("CREATE_LINE")
  );

  server.registerTool(
    "figma_create_polygon",
    {
      title: "Create Polygon",
      description: `Create a regular polygon shape.

Args:
  - pointCount: Number of sides (3 = triangle, 6 = hexagon, etc.)
  - width/height: Bounding box dimensions
  - fill: Fill color

Returns: Node ID of created polygon.`,
      inputSchema: CreatePolygonInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreatePolygonInput>("CREATE_POLYGON")
  );

  server.registerTool(
    "figma_create_star",
    {
      title: "Create Star",
      description: `Create a star shape.

Args:
  - pointCount: Number of points
  - innerRadius: Inner radius ratio (0-1)
  - width/height: Bounding box dimensions
  - fill: Fill color

Returns: Node ID of created star.`,
      inputSchema: CreateStarInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateStarInput>("CREATE_STAR")
  );

  server.registerTool(
    "figma_create_vector",
    {
      title: "Create Vector",
      description: `Create a vector/path node with custom SVG paths.

Args:
  - paths: Array of SVG path data strings
  - fill: Fill color
  - stroke: Stroke configuration

Returns: Node ID of created vector.`,
      inputSchema: CreateVectorInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateVectorInput>("CREATE_VECTOR")
  );

  server.registerTool(
    "figma_set_vector_paths",
    {
      title: "Set Vector Paths",
      description: `Update paths on an existing vector node.

Args:
  - nodeId: Target vector node ID
  - paths: Array of SVG path data strings

Returns: Success confirmation.`,
      inputSchema: SetVectorPathsInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetVectorPathsInput>("SET_VECTOR_PATHS")
  );
}
