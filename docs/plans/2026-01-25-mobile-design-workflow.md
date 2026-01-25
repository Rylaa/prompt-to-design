# Mobile Design Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prompt ile mobil Figma tasarımları oluşturan, ekranlar arası bağlamı koruyan ve akıllı pozisyonlama yapan bir workflow sistemi kurmak.

**Architecture:** 2 Agent + State yapısı:
- **Design Agent**: Kullanıcı promptunu analiz eder, design kararları verir, component seçimi yapar
- **Execution Agent**: Figma'da tasarımı oluşturur, pozisyonları hesaplar, validate eder
- **Design Session State**: MCP Server'da tutulan, ekranlar arası bağlamı koruyan state

**Tech Stack:** TypeScript, MCP Protocol, WebSocket, Claude Code Plugin System, Figma Plugin API

---

## Phase 1: Design Session State (MCP Server)

### Task 1: Session Manager Oluştur

**Files:**
- Create: `mcp-server/src/session/state.ts`
- Modify: `mcp-server/src/session/index.ts` (export ekle)

**Step 1: Session Manager class'ını yaz**

```typescript
// mcp-server/src/session/state.ts
/**
 * Design Session State Manager
 * Ekranlar arası bağlamı korur
 */

import { v4 as uuidv4 } from "uuid";
import type {
  DesignSession,
  CreateSessionInput,
  UpdateSessionInput,
  Screen,
  RegisteredComponent,
  PrototypeFlow,
} from "./types.js";
import { DEVICE_PRESETS, DEFAULT_DEVICE, DEFAULT_THEME } from "./presets.js";

class SessionManager {
  private sessions: Map<string, DesignSession> = new Map();
  private activeSessionId: string | null = null;

  /**
   * Yeni design session oluşturur
   */
  createSession(input: CreateSessionInput): DesignSession {
    const sessionId = uuidv4();

    // Device belirleme
    let device = DEFAULT_DEVICE;
    if (input.device && DEVICE_PRESETS[input.device]) {
      device = DEVICE_PRESETS[input.device];
    } else if (input.customDevice) {
      device = {
        name: "Custom",
        type: "mobile",
        ...input.customDevice,
      };
    }

    // Theme merge
    const theme = {
      ...DEFAULT_THEME,
      ...input.theme,
    };

    const session: DesignSession = {
      sessionId,
      projectName: input.projectName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      device,
      theme,
      components: {},
      screens: [],
      flows: [],
    };

    this.sessions.set(sessionId, session);
    this.activeSessionId = sessionId;

    return session;
  }

  /**
   * Aktif session'ı döndürür
   */
  getActiveSession(): DesignSession | null {
    if (!this.activeSessionId) return null;
    return this.sessions.get(this.activeSessionId) || null;
  }

  /**
   * Session'ı ID ile getirir
   */
  getSession(sessionId: string): DesignSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Aktif session'ı günceller
   */
  updateSession(input: UpdateSessionInput): DesignSession | null {
    const session = this.getActiveSession();
    if (!session) return null;

    if (input.projectName) {
      session.projectName = input.projectName;
    }

    if (input.device && DEVICE_PRESETS[input.device]) {
      session.device = DEVICE_PRESETS[input.device];
    }

    if (input.theme) {
      session.theme = { ...session.theme, ...input.theme };
    }

    if (input.activeScreen) {
      session.activeScreen = input.activeScreen;
    }

    session.updatedAt = new Date().toISOString();
    return session;
  }

  /**
   * Yeni ekran kaydeder
   */
  addScreen(screen: Omit<Screen, "components">): Screen {
    const session = this.getActiveSession();
    if (!session) throw new Error("No active session");

    const newScreen: Screen = {
      ...screen,
      components: [],
    };

    session.screens.push(newScreen);
    session.activeScreen = screen.name;
    session.updatedAt = new Date().toISOString();

    return newScreen;
  }

  /**
   * Component kaydeder (reuse için)
   */
  registerComponent(component: RegisteredComponent): void {
    const session = this.getActiveSession();
    if (!session) throw new Error("No active session");

    session.components[component.name] = component;

    // Aktif ekrana component'ı ekle
    if (session.activeScreen) {
      const screen = session.screens.find(s => s.name === session.activeScreen);
      if (screen && !screen.components.includes(component.name)) {
        screen.components.push(component.name);
      }
    }

    session.updatedAt = new Date().toISOString();
  }

  /**
   * Prototype flow ekler
   */
  addFlow(flow: PrototypeFlow): void {
    const session = this.getActiveSession();
    if (!session) throw new Error("No active session");

    session.flows.push(flow);
    session.updatedAt = new Date().toISOString();
  }

  /**
   * Session'ı siler
   */
  deleteSession(sessionId: string): boolean {
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
    }
    return this.sessions.delete(sessionId);
  }

  /**
   * Tüm session'ları listeler
   */
  listSessions(): DesignSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Aktif session'ı değiştirir
   */
  setActiveSession(sessionId: string): boolean {
    if (this.sessions.has(sessionId)) {
      this.activeSessionId = sessionId;
      return true;
    }
    return false;
  }
}

// Singleton instance
export const sessionManager = new SessionManager();
```

**Step 2: Index dosyasını oluştur**

```typescript
// mcp-server/src/session/index.ts
/**
 * Session Module Exports
 */

export * from "./types.js";
export * from "./presets.js";
export { sessionManager } from "./state.js";
```

**Step 3: uuid dependency ekle**

Run: `cd /Users/yusufdemirkoparan/Projects/prompt-to-design/mcp-server && npm install uuid && npm install -D @types/uuid`

**Step 4: Build et ve hata kontrolü yap**

Run: `cd /Users/yusufdemirkoparan/Projects/prompt-to-design/mcp-server && npm run build`
Expected: Build successful

**Step 5: Commit**

```bash
git add mcp-server/src/session/
git commit -m "feat(session): add session state manager for cross-screen context"
```

---

### Task 2: Session MCP Tools Oluştur

**Files:**
- Create: `mcp-server/src/tools/session.ts`
- Modify: `mcp-server/src/tools/index.ts`

**Step 1: Session tools schema ve handler yaz**

```typescript
// mcp-server/src/tools/session.ts
/**
 * Session Management Tools
 * Design session state için MCP araçları
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sessionManager, DEVICE_PRESETS, MOBILE_LAYOUTS } from "../session/index.js";
import type { CreateSessionInput, UpdateSessionInput } from "../session/index.js";

// Schemas
const CreateSessionSchema = z.object({
  projectName: z.string().describe("Project name for the design session"),
  device: z.string().optional().describe("Device preset name (e.g., 'iphone-15', 'pixel-8')"),
  customDevice: z.object({
    width: z.number().min(1),
    height: z.number().min(1),
    platform: z.enum(["ios", "android", "web"]),
  }).optional().describe("Custom device dimensions if not using preset"),
  theme: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    background: z.string().optional(),
    surface: z.string().optional(),
    text: z.string().optional(),
    textSecondary: z.string().optional(),
    border: z.string().optional(),
  }).optional().describe("Custom theme colors"),
});

const UpdateSessionSchema = z.object({
  projectName: z.string().optional(),
  device: z.string().optional(),
  theme: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    background: z.string().optional(),
  }).optional(),
  activeScreen: z.string().optional(),
});

const AddScreenSchema = z.object({
  name: z.string().describe("Screen name (e.g., 'Home', 'Login', 'Profile')"),
  nodeId: z.string().describe("Figma node ID of the screen frame"),
  layout: z.string().optional().default("standard").describe("Layout template: standard, header-only, footer-only, fullscreen, tab-bar, navigation-bar"),
});

const RegisterComponentSchema = z.object({
  nodeId: z.string().describe("Figma node ID"),
  name: z.string().describe("Component name for reuse"),
  type: z.string().describe("Component type (button, input, card, etc.)"),
  library: z.enum(["shadcn", "ios", "macos", "liquid-glass", "custom"]).optional(),
  variant: z.string().optional(),
  reusable: z.boolean().default(true),
});

const AddFlowSchema = z.object({
  from: z.string().describe("Source screen name"),
  to: z.string().describe("Target screen name"),
  trigger: z.enum(["onTap", "onDrag", "afterDelay", "onHover"]).default("onTap"),
  sourceNodeId: z.string().optional(),
  targetNodeId: z.string().optional(),
});

export function registerSessionTools(server: McpServer): void {
  // Create Session
  server.tool(
    "design_session_create",
    "Create a new design session with device and theme configuration",
    CreateSessionSchema.shape,
    async (params) => {
      try {
        const session = sessionManager.createSession(params as CreateSessionInput);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              session: {
                sessionId: session.sessionId,
                projectName: session.projectName,
                device: session.device,
                theme: {
                  primary: session.theme.primary,
                  background: session.theme.background,
                },
              },
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  // Get Active Session
  server.tool(
    "design_session_get",
    "Get the current active design session",
    {},
    async () => {
      const session = sessionManager.getActiveSession();
      if (!session) {
        return {
          content: [{ type: "text", text: JSON.stringify({ success: false, error: "No active session" }) }],
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, session }, null, 2) }],
      };
    }
  );

  // Update Session
  server.tool(
    "design_session_update",
    "Update the active design session",
    UpdateSessionSchema.shape,
    async (params) => {
      const session = sessionManager.updateSession(params as UpdateSessionInput);
      if (!session) {
        return {
          content: [{ type: "text", text: JSON.stringify({ success: false, error: "No active session" }) }],
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true, session }, null, 2) }],
      };
    }
  );

  // Add Screen
  server.tool(
    "design_session_add_screen",
    "Add a new screen to the active session",
    AddScreenSchema.shape,
    async (params) => {
      try {
        const layout = MOBILE_LAYOUTS[params.layout || "standard"] || MOBILE_LAYOUTS["standard"];
        const screen = sessionManager.addScreen({
          name: params.name,
          nodeId: params.nodeId,
          regions: layout.regions.map(r => ({
            name: r.name,
            type: r.type,
            height: r.height,
            position: r.position,
          })),
        });
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true, screen }, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  // Register Component
  server.tool(
    "design_session_register_component",
    "Register a component for reuse across screens",
    RegisterComponentSchema.shape,
    async (params) => {
      try {
        sessionManager.registerComponent(params);
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true, component: params }) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  // Add Flow
  server.tool(
    "design_session_add_flow",
    "Add a prototype flow between screens",
    AddFlowSchema.shape,
    async (params) => {
      try {
        sessionManager.addFlow(params);
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true, flow: params }) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  // List Device Presets
  server.tool(
    "design_session_list_devices",
    "List available device presets",
    {},
    async () => {
      const devices = Object.entries(DEVICE_PRESETS).map(([key, value]) => ({
        id: key,
        ...value,
      }));
      return {
        content: [{ type: "text", text: JSON.stringify({ devices }, null, 2) }],
      };
    }
  );

  // List Layout Templates
  server.tool(
    "design_session_list_layouts",
    "List available mobile layout templates",
    {},
    async () => {
      const layouts = Object.entries(MOBILE_LAYOUTS).map(([key, value]) => ({
        id: key,
        ...value,
      }));
      return {
        content: [{ type: "text", text: JSON.stringify({ layouts }, null, 2) }],
      };
    }
  );
}
```

**Step 2: tools/index.ts'e session tools ekle**

Modify `mcp-server/src/tools/index.ts`:
```typescript
// En üste import ekle
import { registerSessionTools } from "./session.js";

// registerAllTools fonksiyonunun içine ekle
export function registerAllTools(server: McpServer): void {
  // ... mevcut registrations
  registerSessionTools(server);
}
```

**Step 3: Build et**

Run: `cd /Users/yusufdemirkoparan/Projects/prompt-to-design/mcp-server && npm run build`

**Step 4: Commit**

```bash
git add mcp-server/src/tools/session.ts mcp-server/src/tools/index.ts
git commit -m "feat(session): add MCP tools for session management"
```

---

## Phase 2: Smart Positioning System (Figma Plugin)

### Task 3: Position Calculator Modülü Oluştur

**Files:**
- Create: `figma-plugin/src/positioning/calculator.ts`
- Create: `figma-plugin/src/positioning/types.ts`
- Create: `figma-plugin/src/positioning/index.ts`

**Step 1: Types dosyasını oluştur**

```typescript
// figma-plugin/src/positioning/types.ts
/**
 * Smart Positioning Types
 */

export interface LayoutContext {
  parentWidth: number;
  parentHeight: number;
  parentPadding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  siblings: SiblingInfo[];
  parentLayoutMode: "NONE" | "HORIZONTAL" | "VERTICAL";
  parentItemSpacing: number;
}

export interface SiblingInfo {
  nodeId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
}

export interface PositionRequest {
  width: number;
  height: number;
  region?: "header" | "content" | "footer";
  alignment?: "start" | "center" | "end" | "stretch";
  offset?: { x?: number; y?: number };
}

export interface PositionResult {
  x: number;
  y: number;
  width: number;
  height: number;
  layoutSizing?: {
    horizontal: "FIXED" | "HUG" | "FILL";
    vertical: "FIXED" | "HUG" | "FILL";
  };
}

export interface RegionBounds {
  header: { y: number; height: number };
  content: { y: number; height: number };
  footer: { y: number; height: number };
}
```

**Step 2: Calculator modülünü oluştur**

```typescript
// figma-plugin/src/positioning/calculator.ts
/**
 * Smart Position Calculator
 * Mobil frame içinde akıllı pozisyon hesaplama
 */

import type {
  LayoutContext,
  PositionRequest,
  PositionResult,
  RegionBounds,
  SiblingInfo,
} from "./types.js";

// Standart mobil region yükseklikleri
const REGION_HEIGHTS = {
  header: 60,
  footer: 80,
  tabBar: 83,
  navigationBar: 96,
  statusBar: 47,
  homeIndicator: 34,
};

/**
 * Frame içindeki region sınırlarını hesaplar
 */
export function calculateRegionBounds(
  frameHeight: number,
  hasHeader: boolean = true,
  hasFooter: boolean = true,
  headerHeight: number = REGION_HEIGHTS.header,
  footerHeight: number = REGION_HEIGHTS.footer
): RegionBounds {
  const header = {
    y: 0,
    height: hasHeader ? headerHeight : 0,
  };

  const footer = {
    y: hasFooter ? frameHeight - footerHeight : frameHeight,
    height: hasFooter ? footerHeight : 0,
  };

  const content = {
    y: header.height,
    height: frameHeight - header.height - footer.height,
  };

  return { header, content, footer };
}

/**
 * Siblings arasındaki boş alanı bulur
 */
export function findNextAvailableY(
  siblings: SiblingInfo[],
  startY: number,
  endY: number,
  spacing: number = 16
): number {
  if (siblings.length === 0) return startY;

  // Siblings'ı y pozisyonuna göre sırala
  const sorted = [...siblings].sort((a, b) => a.y - b.y);

  // Son sibling'in altından başla
  const lastSibling = sorted[sorted.length - 1];
  const nextY = lastSibling.y + lastSibling.height + spacing;

  return Math.min(nextY, endY);
}

/**
 * Yatay hizalama pozisyonunu hesaplar
 */
export function calculateHorizontalPosition(
  parentWidth: number,
  elementWidth: number,
  alignment: "start" | "center" | "end" | "stretch",
  padding: { left: number; right: number }
): { x: number; width: number } {
  const availableWidth = parentWidth - padding.left - padding.right;

  switch (alignment) {
    case "start":
      return { x: padding.left, width: elementWidth };
    case "center":
      return {
        x: padding.left + (availableWidth - elementWidth) / 2,
        width: elementWidth,
      };
    case "end":
      return {
        x: parentWidth - padding.right - elementWidth,
        width: elementWidth,
      };
    case "stretch":
      return { x: padding.left, width: availableWidth };
    default:
      return { x: padding.left, width: elementWidth };
  }
}

/**
 * Ana pozisyon hesaplama fonksiyonu
 */
export function calculatePosition(
  context: LayoutContext,
  request: PositionRequest
): PositionResult {
  const { parentWidth, parentHeight, parentPadding, siblings, parentLayoutMode } = context;
  const { width, height, region = "content", alignment = "stretch", offset } = request;

  // Auto-layout parent ise farklı davran
  if (parentLayoutMode !== "NONE") {
    return {
      x: 0,
      y: 0,
      width: alignment === "stretch" ? parentWidth - parentPadding.left - parentPadding.right : width,
      height,
      layoutSizing: {
        horizontal: alignment === "stretch" ? "FILL" : "FIXED",
        vertical: "FIXED",
      },
    };
  }

  // Region sınırlarını hesapla
  const bounds = calculateRegionBounds(
    parentHeight,
    region !== "header", // header region'ında header yok
    region !== "footer"  // footer region'ında footer yok
  );

  // Region'a göre Y pozisyonu
  let regionBound = bounds[region];

  // Region içindeki siblings'ı filtrele
  const regionSiblings = siblings.filter(s =>
    s.y >= regionBound.y && s.y < regionBound.y + regionBound.height
  );

  // Sonraki boş Y pozisyonunu bul
  const y = findNextAvailableY(
    regionSiblings,
    regionBound.y + parentPadding.top,
    regionBound.y + regionBound.height - parentPadding.bottom
  );

  // X pozisyonu ve genişlik
  const horizontal = calculateHorizontalPosition(
    parentWidth,
    width,
    alignment,
    { left: parentPadding.left, right: parentPadding.right }
  );

  return {
    x: horizontal.x + (offset?.x || 0),
    y: y + (offset?.y || 0),
    width: horizontal.width,
    height,
  };
}

/**
 * Parent frame'den layout context oluşturur
 */
export function getLayoutContext(parent: FrameNode | ComponentNode): LayoutContext {
  const siblings: SiblingInfo[] = [];

  parent.children.forEach((child, index) => {
    if ("x" in child && "y" in child && "width" in child && "height" in child) {
      siblings.push({
        nodeId: child.id,
        name: child.name,
        x: child.x,
        y: child.y,
        width: child.width,
        height: child.height,
        order: index,
      });
    }
  });

  return {
    parentWidth: parent.width,
    parentHeight: parent.height,
    parentPadding: {
      top: parent.paddingTop || 0,
      right: parent.paddingRight || 0,
      bottom: parent.paddingBottom || 0,
      left: parent.paddingLeft || 0,
    },
    siblings,
    parentLayoutMode: parent.layoutMode,
    parentItemSpacing: parent.itemSpacing || 0,
  };
}
```

**Step 3: Index dosyasını oluştur**

```typescript
// figma-plugin/src/positioning/index.ts
/**
 * Smart Positioning Module
 */

export * from "./types.js";
export * from "./calculator.js";
```

**Step 4: esbuild config kontrolü**

Build zaten mevcut, değişiklik gerekmez.

**Step 5: Commit**

```bash
git add figma-plugin/src/positioning/
git commit -m "feat(plugin): add smart positioning calculator module"
```

---

### Task 4: Figma Plugin'e Smart Positioning Entegrasyonu

**Files:**
- Modify: `figma-plugin/src/code.ts`

**Step 1: Import ekle ve CREATE_FRAME handler'ı güncelle**

`figma-plugin/src/code.ts` dosyasının başına:
```typescript
import { calculatePosition, getLayoutContext } from "./positioning/index.js";
import type { PositionRequest } from "./positioning/types.js";
```

**Step 2: Helper fonksiyon ekle**

```typescript
// handleCreateFrame fonksiyonundan önce ekle
function applySmartPosition(
  node: SceneNode,
  parent: FrameNode | ComponentNode | null,
  params: {
    x?: number;
    y?: number;
    width: number;
    height: number;
    region?: "header" | "content" | "footer";
    alignment?: "start" | "center" | "end" | "stretch";
  }
): void {
  // Manuel pozisyon verilmişse onu kullan
  if (params.x !== undefined && params.y !== undefined) {
    if ("x" in node) node.x = params.x;
    if ("y" in node) node.y = params.y;
    return;
  }

  // Parent yoksa veya auto-layout ise skip
  if (!parent) return;

  if (parent.layoutMode !== "NONE") {
    // Auto-layout için sizing ayarla
    if ("layoutSizingHorizontal" in node) {
      node.layoutSizingHorizontal = params.alignment === "stretch" ? "FILL" : "FIXED";
    }
    return;
  }

  // Smart positioning uygula
  const context = getLayoutContext(parent);
  const request: PositionRequest = {
    width: params.width,
    height: params.height,
    region: params.region,
    alignment: params.alignment,
  };

  const result = calculatePosition(context, request);

  if ("x" in node) node.x = result.x;
  if ("y" in node) node.y = result.y;
  if ("resize" in node) node.resize(result.width, result.height);
}
```

**Step 3: CREATE_FRAME case'ini güncelle**

Mevcut CREATE_FRAME handler'ında parentId kontrolünden sonra:
```typescript
// Parent'a ekledikten sonra smart positioning uygula
if (parentNode && params.region) {
  applySmartPosition(frame, parentNode, {
    width: params.width,
    height: params.height,
    region: params.region,
    alignment: params.alignment || "stretch",
  });
}
```

**Step 4: Build et**

Run: `cd /Users/yusufdemirkoparan/Projects/prompt-to-design/figma-plugin && npm run build`

**Step 5: Commit**

```bash
git add figma-plugin/src/code.ts
git commit -m "feat(plugin): integrate smart positioning into frame creation"
```

---

## Phase 3: Claude Code Agents

### Task 5: Design Agent Oluştur

**Files:**
- Create: `claude-plugin/agents/design-agent.md`
- Create: `claude-plugin/plugin.json`

**Step 1: Plugin dizini oluştur**

Run: `mkdir -p /Users/yusufdemirkoparan/Projects/prompt-to-design/claude-plugin/agents`

**Step 2: Design Agent tanımını yaz**

```markdown
<!-- claude-plugin/agents/design-agent.md -->
---
name: design-agent
description: |
  Mobile-first Figma tasarım planlayıcısı. Kullanıcı promptunu analiz eder,
  design kararları verir ve Execution Agent için detaylı plan oluşturur.

  Use when:
  - User wants to create a mobile app design
  - User describes a screen or UI component
  - User asks to design something in Figma

  Examples:
  - "Login ekranı tasarla"
  - "Bir profil sayfası oluştur"
  - "E-ticaret uygulaması için ana sayfa yap"
model: sonnet
tools:
  - design_session_create
  - design_session_get
  - design_session_list_devices
  - design_session_list_layouts
  - mcp__prompt-to-design__figma_get_design_tokens
  - mcp__prompt-to-design__figma_list_components
  - Task
---

# Design Agent

Sen bir mobil uygulama tasarım planlayıcısısın. Kullanıcının isteklerini analiz edip, Figma'da oluşturulacak tasarım için detaylı bir plan hazırlarsın.

## Görevlerin

1. **Analiz**: Kullanıcının ne istediğini anla
2. **Session Kontrolü**: Aktif session var mı kontrol et, yoksa oluştur
3. **Device Seçimi**: Uygun cihaz preset'ini belirle
4. **Layout Planı**: Ekran yapısını planla (header, content, footer)
5. **Component Seçimi**: Kullanılacak componentleri belirle
6. **Execution Plan**: Execution Agent için detaylı talimatlar oluştur

## Çalışma Akışı

### Adım 1: Session Kontrolü
```
design_session_get kullanarak aktif session var mı kontrol et.
Yoksa design_session_create ile yeni session oluştur.
```

### Adım 2: Tasarım Analizi
Kullanıcının promptunu analiz et:
- Ne tür bir ekran? (login, home, profile, settings, etc.)
- Hangi componentler gerekli?
- Layout nasıl olmalı?

### Adım 3: Plan Oluştur
Execution Agent için şu formatta plan hazırla:

```json
{
  "screenName": "Login",
  "device": "iphone-15",
  "layout": "standard",
  "theme": "dark",
  "components": [
    {
      "type": "navigation-bar",
      "region": "header",
      "props": { "title": "Giriş Yap" }
    },
    {
      "type": "input",
      "region": "content",
      "props": { "placeholder": "E-posta", "variant": "outline" }
    },
    {
      "type": "input",
      "region": "content",
      "props": { "placeholder": "Şifre", "variant": "outline" }
    },
    {
      "type": "button",
      "region": "content",
      "props": { "text": "Giriş Yap", "variant": "primary", "fullWidth": true }
    }
  ]
}
```

### Adım 4: Execution Agent'ı Çağır
Planı Execution Agent'a Task tool ile gönder:

```
Task(
  subagent_type="prompt-to-design:execution-agent",
  prompt="Bu planı Figma'da oluştur: [PLAN_JSON]"
)
```

## Önemli Kurallar

- Her zaman session kontrolü yap
- Mobile-first düşün
- Component library'den (shadcn, ios, liquid-glass) seçim yap
- Region-based layout kullan (header, content, footer)
- Tutarlı spacing ve alignment uygula
```

**Step 3: Execution Agent tanımını yaz**

```markdown
<!-- claude-plugin/agents/execution-agent.md -->
---
name: execution-agent
description: |
  Design Agent'ın planlarını Figma'da uygular. Frame oluşturur,
  componentleri yerleştirir, smart positioning uygular.

  Use when:
  - Design Agent passes an execution plan
  - Direct Figma creation is needed

  Examples:
  - Execution plan with components to create
  - Screen frame to build
model: sonnet
tools:
  - design_session_get
  - design_session_add_screen
  - design_session_register_component
  - mcp__prompt-to-design__figma_create_frame
  - mcp__prompt-to-design__figma_create_text
  - mcp__prompt-to-design__figma_create_button
  - mcp__prompt-to-design__figma_create_input
  - mcp__prompt-to-design__figma_create_card
  - mcp__prompt-to-design__figma_create_shadcn_component
  - mcp__prompt-to-design__figma_create_apple_component
  - mcp__prompt-to-design__figma_create_liquid_glass_component
  - mcp__prompt-to-design__figma_create_icon
  - mcp__prompt-to-design__figma_set_autolayout
  - mcp__prompt-to-design__figma_set_fill
  - mcp__prompt-to-design__figma_connection_status
---

# Execution Agent

Sen bir Figma tasarım uygulayıcısısın. Design Agent'ın hazırladığı planları Figma'da hayata geçirirsin.

## Görevlerin

1. **Bağlantı Kontrolü**: Figma bağlantısını kontrol et
2. **Session Bilgisi Al**: Aktif session'dan device ve theme bilgisi al
3. **Frame Oluştur**: Ana ekran frame'ini oluştur
4. **Componentleri Yerleştir**: Plana göre componentleri ekle
5. **Session'a Kaydet**: Oluşturulan ekranı session'a kaydet

## Çalışma Akışı

### Adım 1: Hazırlık
```
1. figma_connection_status ile bağlantı kontrol et
2. design_session_get ile session bilgisi al
3. Device boyutlarını al (width, height)
4. Theme bilgisini al
```

### Adım 2: Ana Frame Oluştur
```typescript
figma_create_frame({
  name: screenName,
  width: device.width,
  height: device.height,
  fill: { type: "SOLID", color: theme.background },
  autoLayout: {
    mode: "VERTICAL",
    spacing: theme.spacing.md,
    padding: theme.spacing.md
  }
})
```

### Adım 3: Region Frame'leri Oluştur
Layout'a göre region frame'lerini oluştur:

**Header Region:**
```typescript
figma_create_frame({
  name: "Header",
  parentId: mainFrameId,
  width: device.width,
  height: 60,
  autoLayout: { mode: "HORIZONTAL", padding: 16 }
})
```

**Content Region:**
```typescript
figma_create_frame({
  name: "Content",
  parentId: mainFrameId,
  autoLayout: { mode: "VERTICAL", spacing: 16, padding: 16 }
})
// layoutSizingVertical: "FILL" ayarla
```

**Footer Region:**
```typescript
figma_create_frame({
  name: "Footer",
  parentId: mainFrameId,
  width: device.width,
  height: 80,
  autoLayout: { mode: "HORIZONTAL", padding: 16 }
})
```

### Adım 4: Componentleri Ekle
Plan'daki her component için:

1. Region'u belirle (header, content, footer)
2. Uygun region frame'inin ID'sini al
3. Component'i oluştur ve parentId olarak region ID'sini ver
4. Session'a component'i kaydet

### Adım 5: Session'a Kaydet
```
design_session_add_screen({
  name: screenName,
  nodeId: mainFrameId,
  layout: layoutType
})
```

## Önemli Kurallar

- Her zaman parent frame'e auto-layout uygula
- Component'leri region frame'lerine ekle, ana frame'e değil
- FILL sizing kullan genişlik için
- Theme renklerini kullan
- Session'a her şeyi kaydet
```

**Step 4: Plugin manifest oluştur**

```json
// claude-plugin/plugin.json
{
  "name": "prompt-to-design",
  "version": "1.0.0",
  "description": "AI-powered Figma design automation",
  "agents": [
    {
      "path": "agents/design-agent.md"
    },
    {
      "path": "agents/execution-agent.md"
    }
  ]
}
```

**Step 5: Commit**

```bash
git add claude-plugin/
git commit -m "feat(agents): add Design Agent and Execution Agent for Claude Code"
```

---

## Phase 4: Integration & Testing

### Task 6: MCP Server Build ve Test

**Step 1: Tüm MCP Server değişikliklerini build et**

Run: `cd /Users/yusufdemirkoparan/Projects/prompt-to-design/mcp-server && npm run build`
Expected: Build successful, no errors

**Step 2: MCP Server'ı çalıştır**

Run: `cd /Users/yusufdemirkoparan/Projects/prompt-to-design/mcp-server && node dist/index.js`
Expected: Server starts, WebSocket listening on 9001

**Step 3: Commit final build**

```bash
git add -A
git commit -m "build: compile all changes"
```

---

### Task 7: Figma Plugin Build ve Test

**Step 1: Plugin build et**

Run: `cd /Users/yusufdemirkoparan/Projects/prompt-to-design/figma-plugin && npm run build`
Expected: Build successful

**Step 2: Figma'da plugin'i yükle**

Manual: Figma → Plugins → Development → Import plugin from manifest

**Step 3: Bağlantı test et**

MCP tool çağır: `figma_connection_status`
Expected: `{ connected: true }`

---

### Task 8: DEVELOPMENT.md Dokümantasyonu

**Files:**
- Create: `docs/DEVELOPMENT.md`

**Step 1: Dokümantasyon yaz**

```markdown
# Prompt-to-Design Development Guide

## Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────────────┐
│                        Claude Code CLI                           │
│  ┌─────────────────┐              ┌─────────────────┐           │
│  │  Design Agent   │──── plan ───▶│ Execution Agent │           │
│  │  (Planner)      │              │   (Builder)     │           │
│  └────────┬────────┘              └────────┬────────┘           │
│           │                                │                     │
│           ▼                                ▼                     │
│  ┌─────────────────────────────────────────────────────┐        │
│  │              Design Session State                    │        │
│  │  • Device preset  • Theme  • Screens  • Components  │        │
│  └─────────────────────────────────────────────────────┘        │
└───────────────────────────────┬─────────────────────────────────┘
                                │ MCP Protocol
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MCP Server                               │
│  • Session Tools  • Shape Tools  • Component Tools              │
│  • Design System Tools  • Prototype Tools                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │ WebSocket (ws://localhost:9001)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Figma Plugin                              │
│  • Smart Positioning  • Component Renderers  • Style Handlers   │
└─────────────────────────────────────────────────────────────────┘
```

## Dizin Yapısı

```
prompt-to-design/
├── mcp-server/
│   └── src/
│       ├── session/           # Session state management
│       │   ├── types.ts       # TypeScript interfaces
│       │   ├── presets.ts     # Device & theme presets
│       │   ├── state.ts       # Session manager
│       │   └── index.ts       # Exports
│       ├── tools/
│       │   ├── session.ts     # Session MCP tools
│       │   └── ...            # Other tool modules
│       └── index.ts
│
├── figma-plugin/
│   └── src/
│       ├── positioning/       # Smart positioning system
│       │   ├── types.ts
│       │   ├── calculator.ts
│       │   └── index.ts
│       └── code.ts
│
├── claude-plugin/
│   ├── agents/
│   │   ├── design-agent.md    # Design planner agent
│   │   └── execution-agent.md # Figma builder agent
│   └── plugin.json
│
└── docs/
    ├── DEVELOPMENT.md         # Bu dosya
    └── plans/
```

## Design Session State

Session, ekranlar arası bağlamı korur:

```typescript
interface DesignSession {
  sessionId: string;
  projectName: string;
  device: DevicePreset;      // iPhone 15, Pixel 8, etc.
  theme: ThemeConfig;        // Colors, spacing, radius
  components: Record<string, RegisteredComponent>;
  screens: Screen[];
  flows: PrototypeFlow[];
  activeScreen?: string;
}
```

### Session MCP Tools

| Tool | Açıklama |
|------|----------|
| `design_session_create` | Yeni session oluştur |
| `design_session_get` | Aktif session'ı al |
| `design_session_update` | Session'ı güncelle |
| `design_session_add_screen` | Ekran ekle |
| `design_session_register_component` | Component kaydet |
| `design_session_add_flow` | Prototype flow ekle |
| `design_session_list_devices` | Device preset'leri listele |
| `design_session_list_layouts` | Layout template'leri listele |

## Smart Positioning

Mobil frame içinde akıllı pozisyon hesaplama:

```typescript
// Region-based positioning
const bounds = calculateRegionBounds(frameHeight, hasHeader, hasFooter);
// → { header: {y: 0, height: 60}, content: {...}, footer: {...} }

// Smart position calculation
const position = calculatePosition(context, {
  width: 200,
  height: 48,
  region: "content",
  alignment: "stretch"
});
// → { x: 16, y: 180, width: 361, height: 48 }
```

## Agent Workflow

### Design Agent
1. Kullanıcı promptunu analiz et
2. Session kontrolü yap
3. Device ve layout seç
4. Component planı oluştur
5. Execution Agent'a gönder

### Execution Agent
1. Figma bağlantısını kontrol et
2. Session bilgisini al
3. Ana frame oluştur
4. Region frame'leri oluştur
5. Componentleri yerleştir
6. Session'a kaydet

## Geliştirme

### MCP Server

```bash
cd mcp-server
npm install
npm run build
node dist/index.js
```

### Figma Plugin

```bash
cd figma-plugin
npm install
npm run build
# Figma → Plugins → Development → Import
```

### Test

```bash
# Bağlantı testi
figma_connection_status

# Session oluştur
design_session_create({ projectName: "Test App", device: "iphone-15" })

# Frame oluştur
figma_create_frame({ name: "Home", width: 393, height: 852 })
```

## Troubleshooting

### "No active session"
Session oluşturmadan önce session tool'larını kullanmayın:
```
design_session_create({ projectName: "My App" })
```

### Pozisyonlama sorunları
- Auto-layout parent'ta x,y göz ardı edilir
- Region-based positioning kullanın
- `alignment: "stretch"` genişlik için

### WebSocket bağlantı hatası
1. Figma plugin'in çalıştığından emin olun
2. Port 9001'in boş olduğunu kontrol edin
3. Plugin'i yeniden başlatın
```

**Step 2: Commit**

```bash
git add docs/DEVELOPMENT.md
git commit -m "docs: add comprehensive development guide"
```

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 1. Session State | Task 1-2 | Ready |
| 2. Smart Positioning | Task 3-4 | Ready |
| 3. Claude Agents | Task 5 | Ready |
| 4. Integration | Task 6-8 | Ready |

**Toplam: 8 Task, ~35 Step**

Her task tamamlandığında commit yapılacak. Final commit'te tüm sistem test edilecek.
