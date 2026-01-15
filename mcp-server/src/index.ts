#!/usr/bin/env node
/**
 * Prompt-to-Design MCP Server
 * Claude Code CLI ile Figma'da tasarım oluşturma
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { startServer, stopServer } from "./embedded-ws-server.js";
import { registerAllTools } from "./tools/index.js";

// Initialize MCP Server
const server = new McpServer({
  name: "prompt-to-design",
  version: "1.0.0",
});

// Register all Figma tools
registerAllTools(server);

// Main entry point
async function main(): Promise<void> {
  // Start embedded WebSocket server for Figma plugin communication
  try {
    await startServer();
    console.error("Embedded WebSocket server started on port 9001");
  } catch (error) {
    console.error("Could not start embedded WebSocket server:", error);
    console.error("Port 9001 might be in use. Try: lsof -ti:9001 | xargs kill -9");
  }

  // Connect MCP server via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Prompt-to-Design MCP Server running");
}

// Graceful shutdown handlers
process.on("SIGINT", async () => {
  console.error("\nShutting down...");
  await stopServer();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("\nShutting down...");
  await stopServer();
  process.exit(0);
});

// Start the server
main();
