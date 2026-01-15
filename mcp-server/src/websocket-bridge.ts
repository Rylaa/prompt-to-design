/**
 * WebSocket Bridge Client
 * MCP Server'dan WebSocket Server'a bağlanır ve Figma'ya komut gönderir
 */

import WebSocket from "ws";

// Connection stability configuration
const CONNECT_TIMEOUT = 10000;       // 10 seconds - initial connection timeout
const HEALTH_CHECK_INTERVAL = 20000; // 20 seconds - periodic health check
const PING_TIMEOUT = 15000;          // 15 seconds - ping response timeout (full round-trip)
const MAX_RECONNECT_ATTEMPTS = 5;
const MAX_RECONNECT_DELAY = 30000;   // 30 seconds max delay

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

type ResponseCallback = (response: FigmaResponse) => void;

class WebSocketBridge {
  private ws: WebSocket | null = null;
  private url: string;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = MAX_RECONNECT_ATTEMPTS;
  private pendingCallbacks: Map<string, ResponseCallback> = new Map();
  private messageQueue: Array<{ id: string; message: string; callback: ResponseCallback }> = [];

  // Health monitoring
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastPongReceived: Date | null = null;
  private connectionHealthy: boolean = false;
  private connectTimeout: NodeJS.Timeout | null = null;

  constructor(url: string = "ws://localhost:9001") {
    this.url = url;
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Clear any existing connection timeout
        if (this.connectTimeout) {
          clearTimeout(this.connectTimeout);
        }

        // Set connection timeout
        this.connectTimeout = setTimeout(() => {
          if (!this.connected && this.ws) {
            console.error("❌ Connection timeout - closing socket");
            this.ws.close();
            this.ws = null;
            reject(new Error(`Connection timeout after ${CONNECT_TIMEOUT}ms`));
          }
        }, CONNECT_TIMEOUT);

        this.ws = new WebSocket(this.url);

        this.ws.on("open", () => {
          // Clear connection timeout
          if (this.connectTimeout) {
            clearTimeout(this.connectTimeout);
            this.connectTimeout = null;
          }

          console.error("✅ Connected to WebSocket Bridge");
          this.connected = true;
          this.connectionHealthy = true;
          this.reconnectAttempts = 0;
          this.lastPongReceived = new Date();

          // Register as MCP client
          this.ws?.send(JSON.stringify({
            type: "REGISTER",
            source: "mcp",
          }));

          // Start health monitoring
          this.startHealthMonitor();

          // Process queued messages
          this.processQueue();

          resolve();
        });

        // Handle native pong from server (for heartbeat)
        this.ws.on("pong", () => {
          this.lastPongReceived = new Date();
          this.connectionHealthy = true;
        });

        this.ws.on("message", (data: Buffer) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            console.error("❌ Failed to parse message:", error);
          }
        });

        this.ws.on("close", () => {
          console.error("📤 Disconnected from WebSocket Bridge");
          this.connected = false;
          this.connectionHealthy = false;
          this.stopHealthMonitor();
          this.attemptReconnect();
        });

        this.ws.on("error", (error) => {
          console.error("❌ WebSocket error:", error.message);
          if (!this.connected) {
            // Clear connection timeout on error
            if (this.connectTimeout) {
              clearTimeout(this.connectTimeout);
              this.connectTimeout = null;
            }
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: Record<string, unknown>): void {
    // Handle RESPONSE messages
    if (message.type === "RESPONSE" && typeof message.id === "string") {
      const callback = this.pendingCallbacks.get(message.id);
      if (callback) {
        callback({
          success: message.success as boolean,
          nodeId: message.nodeId as string | undefined,
          data: message.data,
          message: message.message as string | undefined,
          error: message.error as string | undefined,
        });
        this.pendingCallbacks.delete(message.id);
      }
    }

    // Handle PONG messages (health check response)
    if (message.type === "PONG" && typeof message.id === "string") {
      this.lastPongReceived = new Date();
      this.connectionHealthy = true;

      const callback = this.pendingCallbacks.get(message.id);
      if (callback) {
        callback({
          success: true,
          message: "Figma plugin is responding",
        });
        this.pendingCallbacks.delete(message.id);
      }
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;

    // Exponential backoff with jitter to prevent thundering herd
    const baseDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), MAX_RECONNECT_DELAY);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    const delay = baseDelay + jitter;

    console.error(`🔄 Reconnecting in ${(delay / 1000).toFixed(1)}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(() => {
        // Will retry via close handler
      });
    }, delay);
  }

  private processQueue(): void {
    while (this.messageQueue.length > 0 && this.connected) {
      const item = this.messageQueue.shift();
      if (item) {
        this.pendingCallbacks.set(item.id, item.callback);
        this.ws?.send(item.message);
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  public async sendCommand(command: FigmaCommand): Promise<FigmaResponse> {
    return new Promise((resolve, reject) => {
      const id = this.generateId();
      const message = JSON.stringify({
        type: "COMMAND",
        id,
        action: command.action,
        params: command.params,
      });

      const callback: ResponseCallback = (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || "Command failed"));
        }
      };

      // Set timeout for response
      setTimeout(() => {
        if (this.pendingCallbacks.has(id)) {
          this.pendingCallbacks.delete(id);
          reject(new Error("Command timeout - no response from Figma plugin"));
        }
      }, 30000);

      if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
        this.pendingCallbacks.set(id, callback);
        this.ws.send(message);
      } else {
        // Queue message for when connected
        this.messageQueue.push({ id, message, callback });
        
        // Try to connect if not connected
        if (!this.connected) {
          this.connect().catch(() => {
            reject(new Error("Failed to connect to WebSocket Bridge"));
          });
        }
      }
    });
  }

  public isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Send PING to test full pipeline: MCP → Bridge → Figma UI → Plugin → back
   * Returns true if Figma plugin responds, false otherwise
   */
  public async sendPing(timeoutMs: number = 5000): Promise<FigmaResponse> {
    return new Promise((resolve) => {
      const id = this.generateId();
      const message = JSON.stringify({
        type: "PING",
        id,
        timestamp: Date.now(),
      });

      const callback: ResponseCallback = (response) => {
        resolve(response);
      };

      // Set timeout for response
      const timeoutHandle = setTimeout(() => {
        if (this.pendingCallbacks.has(id)) {
          this.pendingCallbacks.delete(id);
          resolve({
            success: false,
            error: "PING timeout - Figma plugin not responding",
          });
        }
      }, timeoutMs);

      // Ensure timeout is cleared when callback fires
      const wrappedCallback: ResponseCallback = (response) => {
        clearTimeout(timeoutHandle);
        callback(response);
      };

      if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
        this.pendingCallbacks.set(id, wrappedCallback);
        this.ws.send(message);
      } else {
        clearTimeout(timeoutHandle);
        resolve({
          success: false,
          error: "Not connected to WebSocket Bridge",
        });
      }
    });
  }

  public disconnect(): void {
    this.stopHealthMonitor();

    // Clear connection timeout if pending
    if (this.connectTimeout) {
      clearTimeout(this.connectTimeout);
      this.connectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
      this.connectionHealthy = false;
    }
  }

  /**
   * Start periodic health monitoring
   * Sends pings to verify the full pipeline is working
   */
  private startHealthMonitor(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      if (!this.connected || !this.ws) {
        return;
      }

      // Send native WebSocket ping to server
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }

      // Also send application-level ping to test full pipeline
      try {
        const result = await this.sendPing(PING_TIMEOUT);
        if (result.success) {
          this.connectionHealthy = true;
        } else {
          this.connectionHealthy = false;
          console.error("⚠️ Health check warning - Figma plugin not responding");
        }
      } catch {
        this.connectionHealthy = false;
        console.error("⚠️ Health check error");
      }

      // Check if we received any pong recently
      if (this.lastPongReceived) {
        const timeSinceLastPong = Date.now() - this.lastPongReceived.getTime();
        if (timeSinceLastPong > HEALTH_CHECK_INTERVAL * 2) {
          console.error("❌ No pong received for too long, reconnecting...");
          this.forceReconnect();
        }
      }
    }, HEALTH_CHECK_INTERVAL);

    console.error(`🔍 Health monitor started (interval: ${HEALTH_CHECK_INTERVAL}ms)`);
  }

  /**
   * Stop health monitoring
   */
  private stopHealthMonitor(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Force reconnection by closing current connection
   */
  public forceReconnect(): void {
    console.error("🔄 Forcing reconnection...");
    this.stopHealthMonitor();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connected = false;
    this.connectionHealthy = false;
    this.reconnectAttempts = 0; // Reset to allow full retry cycle
    this.attemptReconnect();
  }

  /**
   * Get connection health status
   */
  public getHealthStatus(): {
    connected: boolean;
    healthy: boolean;
    lastPong: Date | null;
    reconnectAttempts: number;
  } {
    return {
      connected: this.connected,
      healthy: this.connectionHealthy,
      lastPong: this.lastPongReceived,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Singleton instance
let bridgeInstance: WebSocketBridge | null = null;

export function getBridge(): WebSocketBridge {
  if (!bridgeInstance) {
    const url = process.env.WEBSOCKET_URL || "ws://localhost:9001";
    bridgeInstance = new WebSocketBridge(url);
  }
  return bridgeInstance;
}

/**
 * Reset the bridge instance completely.
 * Use this when connection becomes stale (e.g., after session restart).
 * This forces a fresh connection on next getBridge() call.
 */
export function resetBridge(): void {
  if (bridgeInstance) {
    console.error("🔄 Resetting bridge instance...");
    bridgeInstance.disconnect();
    bridgeInstance = null;
  }
}

/**
 * Reset and immediately reconnect.
 * Use when connection status check fails.
 */
export async function resetAndReconnect(): Promise<void> {
  resetBridge();
  const bridge = getBridge();
  await bridge.connect();
  console.error("✅ Bridge reset and reconnected");
}

export async function sendToFigma(command: FigmaCommand): Promise<FigmaResponse> {
  const bridge = getBridge();
  if (!bridge.isConnected()) {
    await bridge.connect();
  }
  return bridge.sendCommand(command);
}
