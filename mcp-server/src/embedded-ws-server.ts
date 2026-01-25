/**
 * Embedded WebSocket Server
 * MCP Server içinde çalışır, Figma Plugin ile doğrudan iletişim kurar
 */

import { WebSocketServer, WebSocket } from "ws";
import type {
  SessionInfo,
  ListSessionsMessage,
  SessionsListMessage,
  ConnectSessionMessage,
  SessionConnectedMessage
} from "./types/session.js";
import { getSessionRegistry } from "./session-registry.js";

// Configuration
const DEFAULT_PORT = 9001;
const HEARTBEAT_INTERVAL = 15000;  // 15 seconds
const CLIENT_TIMEOUT = 45000;      // 45 seconds
const COMMAND_TIMEOUT = 30000;     // 30 seconds for command responses

export interface FigmaCommand {
  action: string;
  params: Record<string, unknown>;
}

export interface FigmaResponse {
  success: boolean;
  nodeId?: string;
  data?: unknown;
  message?: string;
  error?: string;
}

interface Message {
  type: "COMMAND" | "RESPONSE" | "PING" | "PONG" | "REGISTER" | "LIST_SESSIONS" | "CONNECT_SESSION";
  id?: string;
  source?: "figma";
  action?: string;
  params?: Record<string, unknown>;
  success?: boolean;
  nodeId?: string;
  data?: unknown;
  message?: string;
  error?: string;
  timestamp?: number;
  sessionId?: string;
}

interface FigmaClient {
  ws: WebSocket;
  connectedAt: Date;
  lastPong: Date;
  isAlive: boolean;
  connectedSessionId: string | null;  // NEW FIELD
}

type ResponseCallback = (response: FigmaResponse) => void;

class EmbeddedWSServer {
  private wss: WebSocketServer | null = null;
  private figmaClient: FigmaClient | null = null;
  private pendingCallbacks: Map<string, { callback: ResponseCallback; timeout: NodeJS.Timeout }> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private port: number;
  private isRunning: boolean = false;
  private currentSessionId: string | null = null;
  private currentSessionName: string = "Unknown Session";

  constructor(port: number = DEFAULT_PORT) {
    this.port = port;
  }

  /**
   * Bu server'ın session bilgisini ayarla
   */
  public setSessionInfo(sessionId: string, sessionName: string): void {
    this.currentSessionId = sessionId;
    this.currentSessionName = sessionName;
    console.error(`🏷️ Session info set: ${sessionId} (${sessionName})`);
  }

  /**
   * Start the WebSocket server
   */
  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        resolve();
        return;
      }

      try {
        this.wss = new WebSocketServer({
          port: this.port,
          host: "0.0.0.0"  // Bind to all IPv4 interfaces for better compatibility
        });

        this.wss.on("listening", () => {
          this.isRunning = true;
          console.error(`🚀 Embedded WebSocket Server running on ws://localhost:${this.port}`);
          this.startHeartbeat();
          resolve();
        });

        this.wss.on("connection", (ws: WebSocket) => {
          console.error("📥 New client connected");

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
            if (this.figmaClient?.ws === ws) {
              console.error("📤 Figma client disconnected");
              this.figmaClient = null;
            }
          });

          ws.on("error", (error) => {
            console.error("❌ WebSocket error:", error);
          });

          ws.on("pong", () => {
            if (this.figmaClient?.ws === ws) {
              this.figmaClient.isAlive = true;
              this.figmaClient.lastPong = new Date();
            }
          });

          // Send welcome message
          ws.send(JSON.stringify({
            type: "WELCOME",
            message: "Connected to Prompt-to-Design MCP Server",
            timestamp: new Date().toISOString(),
          }));
        });

        this.wss.on("error", (error: NodeJS.ErrnoException) => {
          if (error.code === "EADDRINUSE") {
            console.error(`❌ Port ${this.port} is already in use. Another MCP session may be running.`);
            // Try to kill the existing server and retry
            reject(new Error(`Port ${this.port} already in use`));
          } else {
            console.error("❌ Server error:", error);
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages from Figma plugin
   */
  private handleMessage(ws: WebSocket, message: Message): void {
    switch (message.type) {
      case "REGISTER":
        if (message.source === "figma") {
          // Eğer session ID belirtilmemişse, eski davranış (otomatik bağlan)
          if (this.figmaClient && this.figmaClient.ws !== ws) {
            console.error("⚠️ Replacing existing Figma client");
            this.figmaClient.ws.close();
          }

          this.figmaClient = {
            ws,
            connectedAt: new Date(),
            lastPong: new Date(),
            isAlive: true,
            connectedSessionId: this.currentSessionId,
          };
          console.error(`✅ Figma client registered (session: ${this.currentSessionId || "none"})`);
          ws.send(JSON.stringify({
            type: "REGISTERED",
            as: "figma",
            sessionId: this.currentSessionId,
            sessionName: this.currentSessionName,
            timestamp: new Date().toISOString(),
          }));
        }
        break;

      case "RESPONSE":
        // Figma Plugin sends response to a command
        if (message.id && this.pendingCallbacks.has(message.id)) {
          const pending = this.pendingCallbacks.get(message.id)!;
          clearTimeout(pending.timeout);
          pending.callback({
            success: message.success ?? false,
            nodeId: message.nodeId,
            data: message.data,
            message: message.message,
            error: message.error,
          });
          this.pendingCallbacks.delete(message.id);
          console.error(`📩 Response received for ${message.id}: ${message.success ? "✅" : "❌"}`);
        }
        break;

      case "PONG":
        // Figma plugin responded to health check
        if (message.id && this.pendingCallbacks.has(message.id)) {
          const pending = this.pendingCallbacks.get(message.id)!;
          clearTimeout(pending.timeout);
          pending.callback({
            success: true,
            message: "Figma plugin is responding",
          });
          this.pendingCallbacks.delete(message.id);
          console.error(`✅ PONG received (id: ${message.id})`);
        }
        if (this.figmaClient?.ws === ws) {
          this.figmaClient.isAlive = true;
          this.figmaClient.lastPong = new Date();
        }
        break;

      case "PING":
        // Plugin sends keepalive PING, respond with PONG
        if (this.figmaClient?.ws === ws) {
          this.figmaClient.isAlive = true;
          this.figmaClient.lastPong = new Date();
        }
        ws.send(JSON.stringify({
          type: "PONG",
          id: message.id,
          timestamp: Date.now(),
        }));
        break;

      case "LIST_SESSIONS": {
        // Figma tüm aktif session'ları istiyor
        const registry = getSessionRegistry();
        const sessions = registry.getAllSessions().map((s) => ({
          ...s,
          isConnected: this.figmaClient?.connectedSessionId === s.sessionId,
        }));

        ws.send(JSON.stringify({
          type: "SESSIONS_LIST",
          sessions,
        } as SessionsListMessage));
        console.error(`📋 Sessions list sent (${sessions.length} sessions)`);
        break;
      }

      case "CONNECT_SESSION": {
        const connectMsg = message as unknown as ConnectSessionMessage;
        const targetSessionId = connectMsg.sessionId;

        // Bu session'a mı bağlanmak istiyor?
        if (targetSessionId !== this.currentSessionId) {
          ws.send(JSON.stringify({
            type: "SESSION_CONNECTED",
            success: false,
            error: `This is session ${this.currentSessionId}, not ${targetSessionId}`,
          }));
          break;
        }

        // Bağlantıyı kabul et
        if (this.figmaClient && this.figmaClient.ws !== ws) {
          console.error("⚠️ Replacing existing Figma client");
          this.figmaClient.ws.close();
        }

        this.figmaClient = {
          ws,
          connectedAt: new Date(),
          lastPong: new Date(),
          isAlive: true,
          connectedSessionId: this.currentSessionId,
        };

        console.error(`✅ Figma client connected to session: ${this.currentSessionId}`);

        ws.send(JSON.stringify({
          type: "SESSION_CONNECTED",
          success: true,
          sessionId: this.currentSessionId,
          sessionName: this.currentSessionName,
        } as SessionConnectedMessage));
        break;
      }

      default:
        console.error(`❓ Unknown message type: ${message.type}`);
    }
  }

  /**
   * Send a command to Figma plugin
   */
  public async sendCommand(command: FigmaCommand): Promise<FigmaResponse> {
    return new Promise((resolve, reject) => {
      if (!this.figmaClient || this.figmaClient.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("No Figma plugin connected. Please open the Figma plugin first."));
        return;
      }

      const id = this.generateId();
      const message = JSON.stringify({
        type: "COMMAND",
        id,
        action: command.action,
        params: command.params,
      });

      // Set timeout for response
      const timeout = setTimeout(() => {
        if (this.pendingCallbacks.has(id)) {
          this.pendingCallbacks.delete(id);
          reject(new Error("Command timeout - no response from Figma plugin"));
        }
      }, COMMAND_TIMEOUT);

      this.pendingCallbacks.set(id, {
        callback: (response) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error || "Command failed"));
          }
        },
        timeout,
      });

      this.figmaClient.ws.send(message);
      console.error(`📨 Command sent: ${command.action} (id: ${id})`);
    });
  }

  /**
   * Send PING to test if Figma plugin is responding
   */
  public async sendPing(timeoutMs: number = 5000): Promise<FigmaResponse> {
    return new Promise((resolve) => {
      if (!this.figmaClient || this.figmaClient.ws.readyState !== WebSocket.OPEN) {
        resolve({
          success: false,
          error: "No Figma plugin connected",
        });
        return;
      }

      const id = this.generateId();
      const message = JSON.stringify({
        type: "PING",
        id,
        timestamp: Date.now(),
      });

      const timeout = setTimeout(() => {
        if (this.pendingCallbacks.has(id)) {
          this.pendingCallbacks.delete(id);
          resolve({
            success: false,
            error: "PING timeout - Figma plugin not responding",
          });
        }
      }, timeoutMs);

      this.pendingCallbacks.set(id, {
        callback: resolve,
        timeout,
      });

      this.figmaClient.ws.send(message);
    });
  }

  /**
   * Check if Figma plugin is connected
   */
  public isFigmaConnected(): boolean {
    return this.figmaClient !== null && this.figmaClient.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Check if server is running
   */
  public isServerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get connection status
   */
  public getStatus(): {
    serverRunning: boolean;
    figmaConnected: boolean;
    figmaLastPong: Date | null;
    sessionId: string | null;
    sessionName: string;
  } {
    return {
      serverRunning: this.isRunning,
      figmaConnected: this.isFigmaConnected(),
      figmaLastPong: this.figmaClient?.lastPong || null,
      sessionId: this.currentSessionId,
      sessionName: this.currentSessionName,
    };
  }

  /**
   * Stop the server
   */
  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.stopHeartbeat();

      // Clear pending callbacks
      for (const [id, pending] of this.pendingCallbacks) {
        clearTimeout(pending.timeout);
        pending.callback({
          success: false,
          error: "Server shutting down",
        });
      }
      this.pendingCallbacks.clear();

      // Close Figma client
      if (this.figmaClient) {
        this.figmaClient.ws.close();
        this.figmaClient = null;
      }

      // Close server
      if (this.wss) {
        this.wss.close(() => {
          this.isRunning = false;
          this.wss = null;
          console.error("🛑 Embedded WebSocket Server stopped");
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Start heartbeat to detect dead connections
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.figmaClient) {
        if (!this.figmaClient.isAlive) {
          // Client didn't respond to last ping
          console.error("💀 Figma client did not respond to ping, terminating...");
          this.figmaClient.ws.terminate();
          this.figmaClient = null;
          return;
        }

        // Mark as not alive until pong received
        this.figmaClient.isAlive = false;

        // Send native WebSocket ping
        if (this.figmaClient.ws.readyState === WebSocket.OPEN) {
          this.figmaClient.ws.ping();
        }
      }
    }, HEARTBEAT_INTERVAL);

    console.error(`💓 Heartbeat started (interval: ${HEARTBEAT_INTERVAL}ms)`);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Generate unique message ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Force disconnect Figma client (for testing/debugging)
   */
  public disconnectFigma(): void {
    if (this.figmaClient) {
      this.figmaClient.ws.close();
      this.figmaClient = null;
      console.error("🔌 Figma client forcefully disconnected");
    }
  }
}

// Singleton instance
let serverInstance: EmbeddedWSServer | null = null;

/**
 * Get or create the server instance
 */
export function getServer(): EmbeddedWSServer {
  if (!serverInstance) {
    const port = parseInt(process.env.WEBSOCKET_PORT || String(DEFAULT_PORT));
    serverInstance = new EmbeddedWSServer(port);
  }
  return serverInstance;
}

/**
 * Start the server if not already running
 */
export async function startServer(): Promise<void> {
  const server = getServer();
  if (!server.isServerRunning()) {
    await server.start();
  }
}

/**
 * Send command to Figma
 */
export async function sendToFigma(command: FigmaCommand): Promise<FigmaResponse> {
  const server = getServer();
  if (!server.isServerRunning()) {
    await server.start();
  }
  return server.sendCommand(command);
}

/**
 * Stop the server (for graceful shutdown)
 */
export async function stopServer(): Promise<void> {
  if (serverInstance) {
    await serverInstance.stop();
    serverInstance = null;
  }
}
