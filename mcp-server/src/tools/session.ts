/**
 * Session Management Tools
 * MCP tools for design session state
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS } from "./handler-factory.js";
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
    surface: z.string().optional(),
    text: z.string().optional(),
    textSecondary: z.string().optional(),
    border: z.string().optional(),
    error: z.string().optional(),
    success: z.string().optional(),
    warning: z.string().optional(),
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

const EmptySchema = z.object({});

export function registerSessionTools(server: McpServer): void {
  // Create Session
  server.registerTool(
    "design_session_create",
    {
      title: "Create Design Session",
      description: "Create a new design session with device and theme configuration",
      inputSchema: CreateSessionSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    async (params) => {
      try {
        const session = sessionManager.createSession(params as unknown as CreateSessionInput);
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
  server.registerTool(
    "design_session_get",
    {
      title: "Get Design Session",
      description: "Get the current active design session",
      inputSchema: EmptySchema,
      annotations: READONLY_ANNOTATIONS,
    },
    async () => {
      try {
        const session = sessionManager.getActiveSession();
        if (!session) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ success: false, error: "No active session" }) }],
          };
        }
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ success: true, session }, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  // Update Session
  server.registerTool(
    "design_session_update",
    {
      title: "Update Design Session",
      description: "Update the active design session",
      inputSchema: UpdateSessionSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    async (params) => {
      try {
        const session = sessionManager.updateSession(params as unknown as UpdateSessionInput);
        if (!session) {
          return {
            content: [{ type: "text" as const, text: JSON.stringify({ success: false, error: "No active session" }) }],
          };
        }
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ success: true, session }, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  // Add Screen
  server.registerTool(
    "design_session_add_screen",
    {
      title: "Add Screen",
      description: "Add a new screen to the active session",
      inputSchema: AddScreenSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
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
  server.registerTool(
    "design_session_register_component",
    {
      title: "Register Component",
      description: "Register a component for reuse across screens",
      inputSchema: RegisterComponentSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    async (params) => {
      try {
        const registeredComponent = sessionManager.registerComponent(params);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ success: true, component: registeredComponent }) }],
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
  server.registerTool(
    "design_session_add_flow",
    {
      title: "Add Flow",
      description: "Add a prototype flow between screens",
      inputSchema: AddFlowSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
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
  server.registerTool(
    "design_session_list_devices",
    {
      title: "List Devices",
      description: "List available device presets",
      inputSchema: EmptySchema,
      annotations: READONLY_ANNOTATIONS,
    },
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
  server.registerTool(
    "design_session_list_layouts",
    {
      title: "List Layouts",
      description: "List available mobile layout templates",
      inputSchema: EmptySchema,
      annotations: READONLY_ANNOTATIONS,
    },
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
