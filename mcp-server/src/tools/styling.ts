/**
 * Styling Tools - Fill, stroke, effects, opacity, corner radius, blend mode
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import {
  SetFillInputSchema,
  SetEffectsInputSchema,
  SetStrokeInputSchema,
  SetOpacityInputSchema,
  SetCornerRadiusInputSchema,
  SetBlendModeInputSchema,
  type SetFillInput,
  type SetEffectsInput,
  type SetStrokeInput,
  type SetOpacityInput,
  type SetCornerRadiusInput,
  type SetBlendModeInput,
} from "../schemas/index.js";

export function registerStylingTools(server: McpServer): void {
  server.registerTool(
    "figma_set_fill",
    {
      title: "Set Fill",
      description: `Set fill color or gradient on a node.

Args:
  - nodeId: Target node ID
  - fill: Solid color or gradient configuration

Returns: Success confirmation.`,
      inputSchema: SetFillInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetFillInput>("SET_FILL")
  );

  server.registerTool(
    "figma_set_effects",
    {
      title: "Set Effects",
      description: `Apply effects (shadows, blur) to a node.

Args:
  - nodeId: Target node ID
  - effects: Array of shadow or blur effects

Returns: Success confirmation.`,
      inputSchema: SetEffectsInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetEffectsInput>("SET_EFFECTS")
  );

  server.registerTool(
    "figma_set_stroke",
    {
      title: "Set Stroke",
      description: `Set stroke/border on a node.

Args:
  - nodeId: Target node ID
  - color: Stroke color
  - weight: Stroke weight in pixels
  - align: INSIDE | OUTSIDE | CENTER

Returns: Success confirmation.`,
      inputSchema: SetStrokeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetStrokeInput>("SET_STROKE")
  );

  server.registerTool(
    "figma_set_opacity",
    {
      title: "Set Opacity",
      description: `Set opacity of a node.

Args:
  - nodeId: Target node ID
  - opacity: Opacity value (0-1)

Returns: Success confirmation.`,
      inputSchema: SetOpacityInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetOpacityInput>("SET_OPACITY")
  );

  server.registerTool(
    "figma_set_corner_radius",
    {
      title: "Set Corner Radius",
      description: `Set corner radius on a node.

Args:
  - nodeId: Target node ID
  - radius: Uniform corner radius
  - topLeft/topRight/bottomRight/bottomLeft: Individual corner radii

Returns: Success confirmation.`,
      inputSchema: SetCornerRadiusInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetCornerRadiusInput>("SET_CORNER_RADIUS")
  );

  server.registerTool(
    "figma_set_blend_mode",
    {
      title: "Set Blend Mode",
      description: `Set blend mode on a node.

Args:
  - nodeId: Target node ID
  - blendMode: PASS_THROUGH | NORMAL | DARKEN | MULTIPLY | LINEAR_BURN | COLOR_BURN |
               LIGHTEN | SCREEN | LINEAR_DODGE | COLOR_DODGE | OVERLAY | SOFT_LIGHT |
               HARD_LIGHT | DIFFERENCE | EXCLUSION | HUE | SATURATION | COLOR | LUMINOSITY

Returns: Success confirmation.`,
      inputSchema: SetBlendModeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<SetBlendModeInput>("SET_BLEND_MODE")
  );
}
