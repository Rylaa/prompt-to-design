/**
 * Session Registry - Aktif MCP session'ları takip eder
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
   * Yeni session kaydet
   */
  public registerSession(name: string, port: number): MCPSession {
    const sessionId = uuidv4().substring(0, 8); // Kısa ID
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
   * Session sil
   */
  public unregisterSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      console.error(`🗑️ Session unregistered: ${sessionId}`);
    }
    return deleted;
  }

  /**
   * Tüm aktif session'ları getir
   */
  public getAllSessions(): SessionInfo[] {
    return Array.from(this.sessions.values()).map((session) => ({
      sessionId: session.sessionId,
      name: session.name,
      startedAt: session.startedAt.toISOString(),
      isConnected: false, // WebSocket server tarafından güncellenecek
    }));
  }

  /**
   * Session ID ile session bul
   */
  public getSession(sessionId: string): MCPSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Session var mı kontrol et
   */
  public hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Tüm session'ları temizle (test için)
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
