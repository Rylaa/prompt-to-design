/**
 * Session Registry - Tracks active MCP sessions
 */

import { v4 as uuidv4 } from "uuid";
import type { MCPSession, SessionInfo } from "./types/session.js";

class SessionRegistry {
  private sessions: Map<string, MCPSession> = new Map();
  private static instance: SessionRegistry | null = null;

  private constructor() {}

  public static getInstance(): SessionRegistry {
    if (!SessionRegistry.instance) {
      SessionRegistry.instance = new SessionRegistry();
    }
    return SessionRegistry.instance;
  }

  /**
   * Register new session
   */
  public registerSession(name: string, port: number): MCPSession {
    const sessionId = uuidv4().substring(0, 8); // Short ID
    const session: MCPSession = {
      sessionId,
      name,
      startedAt: new Date(),
      port,
    };
    this.sessions.set(sessionId, session);
    console.error(`📝 Session registered: ${sessionId} (${name})`);
    return session;
  }

  /**
   * Delete session
   */
  public unregisterSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      console.error(`🗑️ Session unregistered: ${sessionId}`);
    }
    return deleted;
  }

  /**
   * Get all active sessions
   */
  public getAllSessions(): SessionInfo[] {
    return Array.from(this.sessions.values()).map((session) => ({
      sessionId: session.sessionId,
      name: session.name,
      startedAt: session.startedAt.toISOString(),
      isConnected: false, // Will be updated by WebSocket server
    }));
  }

  /**
   * Find session by ID
   */
  public getSession(sessionId: string): MCPSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Check if session exists
   */
  public hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Clear all sessions (for testing)
   */
  public clear(): void {
    this.sessions.clear();
  }
}

// Singleton export
export const sessionRegistry = SessionRegistry.getInstance();

export function getSessionRegistry(): SessionRegistry {
  return SessionRegistry.getInstance();
}
