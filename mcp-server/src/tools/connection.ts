/**
 * Connection Tools - Check WebSocket connection status
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getServer } from "../embedded-ws-server.js";
import { ConnectionStatusInputSchema } from "../schemas/index.js";
import { READONLY_ANNOTATIONS } from "./handler-factory.js";

export function registerConnectionTools(server: McpServer): void {
  server.registerTool(
    "figma_connection_status",
    {
      title: "Connection Status",
      description: `Check WebSocket connection status to Figma plugin.

Returns: Connection status and instructions if not connected.`,
      inputSchema: ConnectionStatusInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    async () => {
      const wsServer = getServer();
      const status = wsServer.getStatus();

      if (!status.serverRunning) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              connected: false,
              message: "WebSocket server is not running. It should start automatically.",
            }, null, 2),
          }],
        };
      }

      if (!status.figmaConnected) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              connected: false,
              message: "Not connected to Figma plugin. Please open the Figma plugin and ensure it's connected.",
              instructions: [
                "1. Open Figma Desktop App",
                "2. Open your design file",
                "3. Go to Plugins > Development > Prompt-to-Design",
                "4. The plugin should connect automatically",
              ],
            }, null, 2),
          }],
        };
      }

      // Test ping
      const pingResult = await wsServer.sendPing(3000);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            connected: pingResult.success,
            serverRunning: status.serverRunning,
            figmaConnected: status.figmaConnected,
            lastPong: status.figmaLastPong?.toISOString(),
            message: pingResult.success
              ? "Connected to Figma plugin and responding"
              : "Connected but plugin not responding to ping",
          }, null, 2),
        }],
      };
    }
  );
}
