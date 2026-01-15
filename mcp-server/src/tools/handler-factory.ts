/**
 * Tool Handler Factory
 * Creates standardized handlers for MCP tools that communicate with Figma
 */

import { sendToFigma } from "../embedded-ws-server.js";

interface ToolResult {
  [x: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

/**
 * Creates a standardized tool handler that sends commands to Figma
 * @param action - The action name to send to Figma plugin
 * @returns Handler function for the MCP tool
 */
export function createToolHandler<T>(action: string): (params: T) => Promise<ToolResult> {
  return async (params: T) => {
    try {
      const response = await sendToFigma({
        action,
        params: params as Record<string, unknown>,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
        isError: true,
      };
    }
  };
}

/**
 * Default tool annotations for non-destructive operations
 */
export const DEFAULT_ANNOTATIONS = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
} as const;

/**
 * Annotations for read-only operations
 */
export const READONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
} as const;

/**
 * Annotations for destructive operations
 */
export const DESTRUCTIVE_ANNOTATIONS = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
} as const;
