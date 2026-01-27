/**
 * WebSocket Bridge Server
 * Acts as a bridge between MCP Server and Figma Plugin
 */

import { WebSocketServer, WebSocket } from "ws";

const PORT = parseInt(process.env.WS_PORT || "9001");

// Connection stability configuration
const HEARTBEAT_INTERVAL = 15000;  // 15 seconds - send ping to all clients
const CLIENT_TIMEOUT = 45000;      // 45 seconds - consider client dead if no pong

interface Message {
  type: "COMMAND" | "RESPONSE" | "PING" | "PONG" | "REGISTER";
  id?: string;
  source?: "mcp" | "figma";
  action?: string;
  params?: Record<string, unknown>;
  success?: boolean;
  nodeId?: string;
  data?: unknown;
  message?: string;
  error?: string;
}

interface Client {
  ws: WebSocket;
  type: "mcp" | "figma" | "unknown";
  connectedAt: Date;
  lastPong: Date;      // Track last pong received
  isAlive: boolean;    // Track if client responded to last ping
}

class WebSocketBridge {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, Client> = new Map();
  private pendingRequests: Map<string, { resolve: (value: Message) => void; timeout: NodeJS.Timeout }> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.setupServer();
    this.startHeartbeat();
    console.log(`🚀 WebSocket Bridge Server running on ws://localhost:${port}`);
    console.log(`💓 Heartbeat enabled (interval: ${HEARTBEAT_INTERVAL}ms, timeout: ${CLIENT_TIMEOUT}ms)`);
  }

  private setupServer(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("📥 New client connected");

      // Register client as unknown initially
      this.clients.set(ws, {
        ws,
        type: "unknown",
        connectedAt: new Date(),
        lastPong: new Date(),
        isAlive: true,
      });

      ws.on("message", (data: Buffer) => {
        try {
          const message: Message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("❌ Failed to parse message:", error);
          ws.send(JSON.stringify({ type: "ERROR", error: "Invalid JSON" }));
        }
      });

      ws.on("close", () => {
        const client = this.clients.get(ws);
        console.log(`📤 Client disconnected: ${client?.type || "unknown"}`);
        this.clients.delete(ws);
      });

      ws.on("error", (error) => {
        console.error("❌ WebSocket error:", error);
      });

      // Handle native WebSocket pong response (for heartbeat)
      ws.on("pong", () => {
        const client = this.clients.get(ws);
        if (client) {
          client.isAlive = true;
          client.lastPong = new Date();
        }
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: "WELCOME",
        message: "Connected to Prompt-to-Design Bridge",
        timestamp: new Date().toISOString(),
      }));
    });

    this.wss.on("error", (error) => {
      console.error("❌ Server error:", error);
    });
  }

  private handleMessage(ws: WebSocket, message: Message): void {
    const client = this.clients.get(ws);
    if (!client) return;

    switch (message.type) {
      case "REGISTER":
        // Client identifies itself as MCP or Figma
        if (message.source === "mcp" || message.source === "figma") {
          client.type = message.source;
          console.log(`✅ Client registered as: ${message.source}`);
          ws.send(JSON.stringify({
            type: "REGISTERED",
            as: message.source,
            timestamp: new Date().toISOString(),
          }));
        }
        break;

      case "COMMAND":
        // MCP Server sends command to Figma Plugin
        console.log(`📨 Command from MCP: ${message.action}`);
        this.forwardToFigma(message);
        break;

      case "RESPONSE":
        // Figma Plugin sends response back to MCP Server
        console.log(`📩 Response from Figma: ${message.success ? "✅" : "❌"}`);
        this.forwardToMCP(message);
        
        // Resolve pending request if exists
        if (message.id && this.pendingRequests.has(message.id)) {
          const pending = this.pendingRequests.get(message.id)!;
          clearTimeout(pending.timeout);
          pending.resolve(message);
          this.pendingRequests.delete(message.id);
        }
        break;

      case "PING":
        // If PING has an id, it's a health check from MCP - forward to Figma
        if (message.id && client.type === "mcp") {
          console.log(`🔔 PING from MCP (id: ${message.id}) → forwarding to Figma`);
          this.forwardToFigma(message);
        } else {
          // Simple ping, respond directly with numeric timestamp
          ws.send(JSON.stringify({ type: "PONG", timestamp: Date.now() }));
        }
        break;

      case "PONG":
        // Figma plugin responded to health check, forward to MCP
        if (message.id) {
          console.log(`✅ PONG from ${client.type} (id: ${message.id}) → forwarding to MCP`);
          this.forwardToMCP(message);
        }
        break;

      default:
        console.log(`❓ Unknown message type: ${message.type}`);
    }
  }

  private forwardToFigma(message: Message): void {
    let sent = false;
    for (const [, client] of this.clients) {
      if (client.type === "figma" && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
        sent = true;
        break;
      }
    }
    if (!sent) {
      console.warn("⚠️ No Figma client connected to receive command");
      // Send error back to MCP
      this.forwardToMCP({
        type: "RESPONSE",
        id: message.id,
        success: false,
        error: "No Figma plugin connected. Please open the Figma plugin first.",
      });
    }
  }

  private forwardToMCP(message: Message): void {
    let sent = false;
    for (const [, client] of this.clients) {
      if (client.type === "mcp" && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
        sent = true;
        console.log(`📤 Forwarded ${message.type} to MCP (id: ${message.id || 'none'})`);
        break;
      }
    }
    if (!sent) {
      console.warn(`⚠️ No MCP client connected to receive ${message.type} (id: ${message.id || 'none'})`);
    }
  }

  public getStatus(): { mcp: boolean; figma: boolean; clients: number } {
    let mcpConnected = false;
    let figmaConnected = false;
    
    for (const [, client] of this.clients) {
      if (client.type === "mcp" && client.ws.readyState === WebSocket.OPEN) {
        mcpConnected = true;
      }
      if (client.type === "figma" && client.ws.readyState === WebSocket.OPEN) {
        figmaConnected = true;
      }
    }

    return {
      mcp: mcpConnected,
      figma: figmaConnected,
      clients: this.clients.size,
    };
  }

  /**
   * Get detailed connection health information
   */
  public getHealthStatus(): {
    mcp: { connected: boolean; lastPong: Date | null; isAlive: boolean };
    figma: { connected: boolean; lastPong: Date | null; isAlive: boolean };
    totalClients: number;
  } {
    let mcpClient: Client | null = null;
    let figmaClient: Client | null = null;

    for (const [, client] of this.clients) {
      if (client.type === "mcp" && client.ws.readyState === WebSocket.OPEN) {
        mcpClient = client;
      }
      if (client.type === "figma" && client.ws.readyState === WebSocket.OPEN) {
        figmaClient = client;
      }
    }

    return {
      mcp: {
        connected: mcpClient !== null,
        lastPong: mcpClient?.lastPong || null,
        isAlive: mcpClient?.isAlive || false,
      },
      figma: {
        connected: figmaClient !== null,
        lastPong: figmaClient?.lastPong || null,
        isAlive: figmaClient?.isAlive || false,
      },
      totalClients: this.clients.size,
    };
  }

  /**
   * Start the heartbeat mechanism using native WebSocket ping/pong
   * This detects dead connections that TCP keepalive might miss
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, ws) => {
        if (!client.isAlive) {
          // Client didn't respond to last ping - terminate connection
          console.log(`💀 Client ${client.type} did not respond to ping, terminating...`);
          ws.terminate();
          this.clients.delete(ws);
          return;
        }

        // Mark as not alive until pong received
        client.isAlive = false;

        // Send native WebSocket ping (not application-level)
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      });
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * Stop the heartbeat mechanism
   */
  public stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log(`💓 Heartbeat stopped`);
    }
  }
}

// Start server
const bridge = new WebSocketBridge(PORT);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down WebSocket Bridge...");
  bridge.stopHeartbeat();
  process.exit(0);
});

// Status check every 30 seconds
setInterval(() => {
  const status = bridge.getStatus();
  console.log(`📊 Status: MCP=${status.mcp ? "✅" : "❌"} Figma=${status.figma ? "✅" : "❌"} Clients=${status.clients}`);
}, 30000);
