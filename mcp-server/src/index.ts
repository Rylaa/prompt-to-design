#!/usr/bin/env node
/**
 * Prompt-to-Design MCP Server
 * Claude Code CLI ile Figma'da tasarım oluşturma
 */

import path from "path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { startServer, stopServer, getServer } from "./embedded-ws-server.js";
import { registerAllTools } from "./tools/index.js";
import { getSessionRegistry } from "./session-registry.js";

// Initialize MCP Server
const server = new McpServer({
  name: "prompt-to-design",
  version: "1.0.0",
});

// Register all Figma tools
registerAllTools(server);

// Session adını belirle (CWD'nin son kısmı veya default)
const cwd = process.cwd();
const sessionName = path.basename(cwd) || "Claude Session";
const port = parseInt(process.env.WEBSOCKET_PORT || "9001");

// Session'ı registry'e kaydet
const registry = getSessionRegistry();
const session = registry.registerSession(sessionName, port);

console.error(`📌 Starting MCP Server for session: ${session.sessionId} (${sessionName})`);

// Main entry point
async function main(): Promise<void> {
  // Start embedded WebSocket server for Figma plugin communication
  try {
    await startServer();
    console.error(`Embedded WebSocket server started on port ${port}`);

    // WebSocket server'a session bilgisini aktar
    const wsServer = getServer();
    wsServer.setSessionInfo(session.sessionId, sessionName);
  } catch (error) {
    console.error("Could not start embedded WebSocket server:", error);
    console.error(`Port ${port} might be in use. Try: lsof -ti:${port} | xargs kill -9`);
    registry.unregisterSession(session.sessionId);
  }

  // Connect MCP server via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Prompt-to-Design MCP Server running");
}

// Graceful shutdown handlers
process.on("SIGINT", async () => {
  console.error("\n🛑 Shutting down...");
  try {
    registry.unregisterSession(session.sessionId);
    await stopServer();
  } catch (error) {
    console.error("Error during shutdown:", error);
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("\n🛑 Terminating...");
  try {
    registry.unregisterSession(session.sessionId);
    await stopServer();
  } catch (error) {
    console.error("Error during shutdown:", error);
  }
  process.exit(0);
});

process.on("uncaughtException", async (error) => {
  console.error("Uncaught exception:", error);
  try {
    registry.unregisterSession(session.sessionId);
    await stopServer();
  } catch (cleanupError) {
    console.error("Error during cleanup:", cleanupError);
  }
  process.exit(1);
});

// Start the server
main();
