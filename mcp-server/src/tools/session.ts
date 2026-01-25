/**
 * Session Management Tools
 * Design session state için MCP araçları
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sessionManager, DEVICE_PRESETS, MOBILE_LAYOUTS } from "../session/index.js";
import type { CreateSessionInput, UpdateSessionInput } from "../session/index.js";

// Schemas
const CreateSessionSchema = z.object({
  projectName: z.string().min(1).describe("Project name for the design session"),
  device: z.string().optional().describe("Device preset name (e.g., 'iphone-15', 'pixel-8')"),
  customDevice: z.object({
    width: z.number().min(1),
    height: z.number().min(1),
    platform: z.enum(["ios", "android", "web"]),
  }).optional().describe("Custom device dimensions if not using preset"),
  theme: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    background: z.string().optional(),
    surface: z.string().optional(),
    text: z.string().optional(),
    textSecondary: z.string().optional(),
    border: z.string().optional(),
  }).optional().describe("Custom theme colors"),
});

const UpdateSessionSchema = z.object({
  projectName: z.string().optional(),
  device: z.string().optional(),
  theme: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    background: z.string().optional(),
  }).optional(),
  activeScreen: z.string().optional(),
});

const AddScreenSchema = z.object({
  name: z.string().min(1).describe("Screen name (e.g., 'Home', 'Login', 'Profile')"),
  nodeId: z.string().min(1).describe("Figma node ID of the screen frame"),
  layout: z.string().optional().default("standard").describe("Layout template: standard, header-only, footer-only, fullscreen, tab-bar, navigation-bar"),
  setActive: z.boolean().optional().default(true).describe("Set as active screen"),
});

const RegisterComponentSchema = z.object({
  nodeId: z.string().min(1).describe("Figma node ID"),
  name: z.string().min(1).describe("Component name for reuse"),
  type: z.string().min(1).describe("Component type (button, input, card, etc.)"),
  library: z.enum(["shadcn", "ios", "macos", "liquid-glass", "custom"]).optional(),
  variant: z.string().optional(),
  reusable: z.boolean().default(true),
});

const AddFlowSchema = z.object({
  from: z.string().min(1).describe("Source screen name"),
  to: z.string().min(1).describe("Target screen name"),
  trigger: z.enum(["onTap", "onDrag", "afterDelay", "onHover"]).default("onTap"),
  sourceNodeId: z.string().optional(),
  targetNodeId: z.string().optional(),
});

export function registerSessionTools(server: McpServer): void {
  // Create Session
  server.tool(
    "design_session_create",
    "Create a new design session with device and theme configuration",
    CreateSessionSchema.shape,
    async (params) => {
      try {
        const session = sessionManager.createSession(params as CreateSessionInput);
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              session: {
                sessionId: session.sessionId,
                projectName: session.projectName,
                device: session.device,
                theme: {
                  primary: session.theme.primary,
                  background: session.theme.background,
                },
              },
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  // Get Active Session
  server.tool(
    "design_session_get",
    "Get the current active design session",
    {},
    async () => {
      const session = sessionManager.getActiveSession();
      if (!session) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ success: false, error: "No active session" }) }],
        };
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ success: true, session }, null, 2) }],
      };
    }
  );

  // Update Session
  server.tool(
    "design_session_update",
    "Update the active design session",
    UpdateSessionSchema.shape,
    async (params) => {
      const session = sessionManager.updateSession(params as UpdateSessionInput);
      if (!session) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ success: false, error: "No active session" }) }],
        };
      }
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ success: true, session }, null, 2) }],
      };
    }
  );

  // Add Screen
  server.tool(
    "design_session_add_screen",
    "Add a new screen to the active session",
    AddScreenSchema.shape,
    async (params) => {
      try {
        const layout = MOBILE_LAYOUTS[params.layout || "standard"] || MOBILE_LAYOUTS["standard"];
        const screen = sessionManager.addScreen({
          name: params.name,
          nodeId: params.nodeId,
          regions: layout.regions.map(r => ({
            name: r.name,
            type: r.type,
            height: r.height,
            position: r.position,
          })),
        }, params.setActive);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ success: true, screen }, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  // Register Component
  server.tool(
    "design_session_register_component",
    "Register a component for reuse across screens",
    RegisterComponentSchema.shape,
    async (params) => {
      try {
        sessionManager.registerComponent(params);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ success: true, component: params }) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  // Add Flow
  server.tool(
    "design_session_add_flow",
    "Add a prototype flow between screens",
    AddFlowSchema.shape,
    async (params) => {
      try {
        sessionManager.addFlow(params);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ success: true, flow: params }) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  // List Device Presets
  server.tool(
    "design_session_list_devices",
    "List available device presets",
    {},
    async () => {
      const devices = Object.entries(DEVICE_PRESETS).map(([key, value]) => ({
        id: key,
        ...value,
      }));
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ devices }, null, 2) }],
      };
    }
  );

  // List Layout Templates
  server.tool(
    "design_session_list_layouts",
    "List available mobile layout templates",
    {},
    async () => {
      const layouts = Object.entries(MOBILE_LAYOUTS).map(([key, value]) => ({
        id: key,
        ...value,
      }));
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ layouts }, null, 2) }],
      };
    }
  );
}
