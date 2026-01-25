# Session Selector Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Figma plugin'den hangi MCP session'a bağlanılacağını seçebilme - birden fazla Claude Code session'ı açıkken doğru session'a bağlanabilme.

**Architecture:** Her MCP session benzersiz bir Session ID ile kendini tanımlar. WebSocket server tüm aktif session'ları takip eder. Figma plugin bağlanmadan önce session listesini alır ve kullanıcıya seçtirir.

**Tech Stack:** TypeScript, WebSocket (ws), Zod, UUID

---

## Task 1: Session ID Tipi ve Interface Tanımları

**Files:**
- Create: `mcp-server/src/types/session.ts`

**Step 1: Session tiplerini tanımlayan dosyayı oluştur**

```typescript
/**
 * Session Types - MCP Session tanımları
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
  sessionId: string;
  sessionName: string;
}

export interface SessionDisconnectedMessage {
  type: "SESSION_DISCONNECTED";
  sessionId: string;
  reason: string;
}
```

**Step 2: Dosyanın oluşturulduğunu doğrula**

Run: `cat mcp-server/src/types/session.ts | head -20`
Expected: Interface tanımlarının görünmesi

**Step 3: Commit**

```bash
git add mcp-server/src/types/session.ts
git commit -m "feat(session): add session type definitions"
```

---

## Task 2: Session Registry Sınıfı Oluştur

**Files:**
- Create: `mcp-server/src/session-registry.ts`

**Step 1: Session Registry sınıfını oluştur**

```typescript
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
```

**Step 2: Dosyanın oluşturulduğunu doğrula**

Run: `cat mcp-server/src/session-registry.ts | head -30`
Expected: SessionRegistry sınıfının görünmesi

**Step 3: Commit**

```bash
git add mcp-server/src/session-registry.ts
git commit -m "feat(session): add SessionRegistry singleton class"
```

---

## Task 3: WebSocket Server'a Session Desteği Ekle

**Files:**
- Modify: `mcp-server/src/embedded-ws-server.ts`

**Step 1: Import ve interface güncellemelerini ekle**

Dosyanın başına ekle (import'ların altına):

```typescript
import type {
  SessionInfo,
  ListSessionsMessage,
  SessionsListMessage,
  ConnectSessionMessage,
  SessionConnectedMessage
} from "./types/session.js";
import { getSessionRegistry } from "./session-registry.js";
```

**Step 2: FigmaClient interface'ine sessionId ekle**

`interface FigmaClient` içine ekle:

```typescript
interface FigmaClient {
  ws: WebSocket;
  connectedAt: Date;
  lastPong: Date;
  isAlive: boolean;
  connectedSessionId: string | null;  // Yeni alan
}
```

**Step 3: EmbeddedWSServer sınıfına currentSessionId ekle**

Sınıfın private değişkenlerine ekle:

```typescript
private currentSessionId: string | null = null;
private currentSessionName: string = "Unknown Session";
```

**Step 4: setSessionInfo metodu ekle**

```typescript
/**
 * Bu server'ın session bilgisini ayarla
 */
public setSessionInfo(sessionId: string, sessionName: string): void {
  this.currentSessionId = sessionId;
  this.currentSessionName = sessionName;
  console.error(`🏷️ Session info set: ${sessionId} (${sessionName})`);
}
```

**Step 5: handleMessage metoduna yeni message type'ları ekle**

`switch (message.type)` içine case'leri ekle:

```typescript
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
```

**Step 6: REGISTER case'ini güncelle - eski davranışı koru ama session bilgisi ekle**

Mevcut `case "REGISTER":` bloğunu güncelle:

```typescript
case "REGISTER":
  if (message.source === "figma") {
    // Eğer session ID belirtilmemişse, eski davranış (otomatik bağlan)
    // Bu geriye uyumluluk için
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
```

**Step 7: getStatus metodunu güncelle**

```typescript
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
```

**Step 8: Build et ve hata kontrolü yap**

Run: `cd mcp-server && npm run build`
Expected: Build successful, no TypeScript errors

**Step 9: Commit**

```bash
git add mcp-server/src/embedded-ws-server.ts
git commit -m "feat(ws-server): add session management support"
```

---

## Task 4: MCP Server Index'e Session Kaydı Ekle

**Files:**
- Modify: `mcp-server/src/index.ts`

**Step 1: Import'ları ekle**

Dosyanın başına:

```typescript
import { getSessionRegistry } from "./session-registry.js";
```

**Step 2: Session ismini belirle ve kaydet**

`startServer()` çağrısından önce, server başlatma bloğuna:

```typescript
// Session adını belirle (CWD'nin son kısmı veya default)
const cwd = process.cwd();
const sessionName = cwd.split("/").pop() || "Claude Session";
const port = parseInt(process.env.WEBSOCKET_PORT || "9001");

// Session'ı registry'e kaydet
const registry = getSessionRegistry();
const session = registry.registerSession(sessionName, port);

console.error(`📌 Starting MCP Server for session: ${session.sessionId} (${sessionName})`);
```

**Step 3: WebSocket server'a session bilgisini aktar**

`startServer()` çağrısından sonra:

```typescript
// WebSocket server'a session bilgisini aktar
const wsServer = getServer();
wsServer.setSessionInfo(session.sessionId, sessionName);
```

**Step 4: Graceful shutdown'da session'ı temizle**

Process exit handler'a ekle (varsa güncelle, yoksa oluştur):

```typescript
// Graceful shutdown
process.on("SIGINT", async () => {
  console.error("\n🛑 Shutting down...");
  registry.unregisterSession(session.sessionId);
  await stopServer();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("\n🛑 Terminating...");
  registry.unregisterSession(session.sessionId);
  await stopServer();
  process.exit(0);
});
```

**Step 5: Build et**

Run: `cd mcp-server && npm run build`
Expected: Build successful

**Step 6: Commit**

```bash
git add mcp-server/src/index.ts
git commit -m "feat(mcp): register session on startup with auto-naming"
```

---

## Task 5: Types Export Düzenlemesi

**Files:**
- Create: `mcp-server/src/types/index.ts`

**Step 1: Types barrel export dosyası oluştur**

```typescript
export * from "./session.js";
```

**Step 2: Commit**

```bash
git add mcp-server/src/types/index.ts
git commit -m "chore(types): add barrel export for types"
```

---

## Task 6: Connection Status Tool'u Güncelle

**Files:**
- Modify: `mcp-server/src/tools/connection.ts`

**Step 1: Session bilgisini response'a ekle**

`figma_connection_status` tool'unun return değerini güncelle:

```typescript
return {
  content: [{
    type: "text",
    text: JSON.stringify({
      connected: pingResult.success,
      serverRunning: status.serverRunning,
      figmaConnected: status.figmaConnected,
      sessionId: status.sessionId,
      sessionName: status.sessionName,
      lastPong: status.figmaLastPong?.toISOString(),
      message: pingResult.success
        ? `Connected to Figma plugin (Session: ${status.sessionName})`
        : "Connected but plugin not responding to ping",
    }, null, 2),
  }],
};
```

**Step 2: Build et**

Run: `cd mcp-server && npm run build`
Expected: Build successful

**Step 3: Commit**

```bash
git add mcp-server/src/tools/connection.ts
git commit -m "feat(tools): add session info to connection status"
```

---

## Task 7: Figma Plugin UI - Session Selector HTML Yapısı

**Files:**
- Modify: `figma-plugin/src/ui.html`

**Step 1: Session selector container'ı ekle**

`<div class="status-section">` bloğundan önce yeni bir section ekle:

```html
<!-- Session Selector -->
<div id="session-section" class="session-section" style="display: none;">
  <div class="section-title">Select Session</div>
  <div id="session-list" class="session-list">
    <!-- Session'lar dinamik olarak eklenecek -->
  </div>
  <button id="refresh-sessions" class="secondary-btn" onclick="refreshSessions()">
    Refresh Sessions
  </button>
</div>
```

**Step 2: Session section için CSS ekle**

`<style>` bloğuna ekle:

```css
.session-section {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.session-item:hover {
  border-color: var(--primary-color);
  background: var(--bg-hover);
}

.session-item.selected {
  border-color: var(--primary-color);
  background: rgba(0, 122, 255, 0.1);
}

.session-item.connected {
  border-color: var(--success-color);
  background: rgba(52, 199, 89, 0.1);
}

.session-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.session-name {
  font-weight: 500;
  font-size: 13px;
}

.session-id {
  font-size: 11px;
  color: var(--text-secondary);
  font-family: monospace;
}

.session-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--bg-tertiary);
}

.session-status.connected {
  background: var(--success-color);
  color: white;
}

.secondary-btn {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.secondary-btn:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}
```

**Step 3: Commit (CSS ve HTML)**

```bash
git add figma-plugin/src/ui.html
git commit -m "feat(plugin-ui): add session selector HTML structure and styles"
```

---

## Task 8: Figma Plugin UI - Session JavaScript Logic

**Files:**
- Modify: `figma-plugin/src/ui.html`

**Step 1: Session state değişkenlerini ekle**

`<script>` bloğunun başına (mevcut değişkenlerin yanına):

```javascript
// Session management
let availableSessions = [];
let selectedSessionId = null;
let connectedSessionId = null;
let connectedSessionName = null;
```

**Step 2: Session listesi render fonksiyonu ekle**

```javascript
function renderSessionList() {
  const sessionList = document.getElementById('session-list');
  const sessionSection = document.getElementById('session-section');

  if (availableSessions.length === 0) {
    sessionList.innerHTML = '<div class="no-sessions">No active sessions found</div>';
    return;
  }

  sessionSection.style.display = 'block';

  sessionList.innerHTML = availableSessions.map(session => {
    const isConnected = session.sessionId === connectedSessionId;
    const isSelected = session.sessionId === selectedSessionId;

    return `
      <div class="session-item ${isConnected ? 'connected' : ''} ${isSelected ? 'selected' : ''}"
           onclick="selectSession('${session.sessionId}')">
        <div class="session-info">
          <div class="session-name">${escapeHtml(session.name)}</div>
          <div class="session-id">${session.sessionId}</div>
        </div>
        <div class="session-status ${isConnected ? 'connected' : ''}">
          ${isConnected ? 'Connected' : 'Available'}
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

**Step 3: Session seçme ve bağlanma fonksiyonlarını ekle**

```javascript
function selectSession(sessionId) {
  selectedSessionId = sessionId;
  renderSessionList();
  connectToSession(sessionId);
}

function connectToSession(sessionId) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    // Önce WebSocket bağlantısı kur, sonra session'a bağlan
    pendingSessionConnect = sessionId;
    connect();
    return;
  }

  updateStatus('connecting', `Connecting to session ${sessionId}...`);

  ws.send(JSON.stringify({
    type: 'CONNECT_SESSION',
    sessionId: sessionId,
    source: 'figma'
  }));
}

function refreshSessions() {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connect();
    return;
  }

  ws.send(JSON.stringify({ type: 'LIST_SESSIONS' }));
}

let pendingSessionConnect = null;
```

**Step 4: Message handler'a session message'larını ekle**

`ws.onmessage` içindeki switch'e case'leri ekle:

```javascript
case 'SESSIONS_LIST':
  availableSessions = message.sessions || [];
  renderSessionList();

  // Eğer pending bağlantı varsa, şimdi bağlan
  if (pendingSessionConnect) {
    const sessionId = pendingSessionConnect;
    pendingSessionConnect = null;
    connectToSession(sessionId);
  }
  break;

case 'SESSION_CONNECTED':
  if (message.success) {
    connectedSessionId = message.sessionId;
    connectedSessionName = message.sessionName;
    updateStatus('connected', `Connected to: ${message.sessionName}`);
    renderSessionList();
  } else {
    updateStatus('error', message.error || 'Failed to connect to session');
  }
  break;

case 'SESSION_DISCONNECTED':
  connectedSessionId = null;
  connectedSessionName = null;
  updateStatus('disconnected', message.reason || 'Disconnected from session');
  renderSessionList();
  break;

case 'REGISTERED':
  // Eski davranış uyumluluğu - session bilgisi varsa kaydet
  if (message.sessionId) {
    connectedSessionId = message.sessionId;
    connectedSessionName = message.sessionName || 'Unknown';
    updateStatus('connected', `Connected to: ${connectedSessionName}`);
  }
  // Session listesini iste
  ws.send(JSON.stringify({ type: 'LIST_SESSIONS' }));
  break;
```

**Step 5: connect() fonksiyonunu güncelle - otomatik session listesi iste**

`ws.onopen` callback'inde, REGISTER mesajından sonra:

```javascript
// Session listesini iste (selector için)
setTimeout(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'LIST_SESSIONS' }));
  }
}, 100);
```

**Step 6: Build et**

Run: `cd figma-plugin && npm run build`
Expected: Build successful

**Step 7: Commit**

```bash
git add figma-plugin/src/ui.html
git commit -m "feat(plugin-ui): add session selector JavaScript logic"
```

---

## Task 9: Test ve Doğrulama

**Files:**
- No new files

**Step 1: MCP Server'ı build et**

Run: `cd mcp-server && npm run build`
Expected: Build successful, no errors

**Step 2: Figma Plugin'i build et**

Run: `cd figma-plugin && npm run build`
Expected: Build successful, no errors

**Step 3: Manuel test adımları**

1. İlk Claude Code session'ı aç
2. Figma'da plugin'i aç
3. Session listesinde bir session görünmeli
4. Session'a tıkla ve bağlan
5. İkinci Claude Code session'ı aç (farklı terminalde)
6. Figma'da "Refresh Sessions" tıkla
7. İki session görünmeli
8. İkinci session'a geçiş yap

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete session selector implementation

- Add session type definitions
- Add SessionRegistry singleton for tracking sessions
- Update WebSocket server with session management
- Update MCP server to register sessions on startup
- Add session selector UI to Figma plugin
- Support multiple concurrent Claude Code sessions"
```

---

## Özet

Bu plan tamamlandığında:

1. **Her MCP session benzersiz bir ID alır** - Klasör adından otomatik isim
2. **Figma plugin session listesi gösterir** - Aktif tüm session'lar listelenir
3. **Kullanıcı session seçebilir** - Tıklayarak istediği session'a bağlanır
4. **Geriye uyumluluk korunur** - Eski davranış (otomatik bağlanma) çalışmaya devam eder
5. **Connection status session bilgisi içerir** - Hangi session'a bağlı olduğu görünür

**Execution options:**

1. **Subagent-Driven (this session)** - Bu session'da task task ilerle
2. **Parallel Session (separate)** - Yeni session'da executing-plans ile çalıştır
