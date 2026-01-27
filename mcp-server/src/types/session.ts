/**
 * Session Types - MCP Session definitions
 */

export interface MCPSession {
  sessionId: string;
  name: string;
  startedAt: Date;
  port: number;
}

export interface SessionInfo {
  sessionId: string;
  name: string;
  startedAt: string; // ISO string for serialization
  isConnected: boolean;
}

// WebSocket message types for session management
export interface ListSessionsMessage {
  type: "LIST_SESSIONS";
}

export interface SessionsListMessage {
  type: "SESSIONS_LIST";
  sessions: SessionInfo[];
}

export interface ConnectSessionMessage {
  type: "CONNECT_SESSION";
  sessionId: string;
  source: "figma";
}

export interface SessionConnectedMessage {
  type: "SESSION_CONNECTED";
  success: boolean;
  sessionId?: string;
  sessionName?: string;
  error?: string;
}

export interface SessionDisconnectedMessage {
  type: "SESSION_DISCONNECTED";
  sessionId: string;
  reason: string;
}
