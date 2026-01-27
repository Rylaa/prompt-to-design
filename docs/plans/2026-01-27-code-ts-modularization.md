# code.ts Modülarizasyon Planı

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 5,626 satırlık monolitik code.ts dosyasını güvenli şekilde modüllere ayırmak

**Architecture:** Hibrit yaklaşım - önce paylaşılan utility'leri çıkar, sonra handler'ları kategorilere göre grupla. Her adımda build kontrolü ile sıfır kırılma garantisi.

**Tech Stack:** TypeScript, Figma Plugin API, esbuild

---

## Hedef Yapı

```
figma-plugin/src/
├── code.ts                 (~300 satır - orchestrator)
├── handlers/
│   ├── utils/
│   │   ├── types.ts        (interface tanımları)
│   │   ├── node-helpers.ts (getNode, registerNode, finalizeNode)
│   │   ├── paint-helpers.ts(createFill, createEffect, applyStroke)
│   │   ├── font-helpers.ts (loadFont, getFontStyle)
│   │   └── index.ts        (re-export)
│   ├── shapes.ts           (7 handler)
│   ├── text.ts             (3 handler)
│   ├── components.ts       (7 handler)
│   ├── design-system.ts    (7 handler)
│   ├── layout.ts           (6 handler)
│   ├── styling.ts          (6 handler)
│   ├── transform.ts        (5 handler)
│   ├── manipulation.ts     (10 handler)
│   ├── component-lib.ts    (7 handler)
│   ├── media.ts            (6 handler)
│   ├── styles.ts           (5 handler)
│   ├── variables.ts        (5 handler)
│   ├── query.ts            (6 handler)
│   ├── data.ts             (11 handler - plugin/shared/client data)
│   ├── viewport.ts         (5 handler)
│   ├── pages.ts            (4 handler)
│   ├── editor.ts           (2 handler)
│   ├── debug.ts            (3 handler - lint + debug)
│   └── index.ts            (tüm handler'ları birleştir)
```

---

## Faz 1: Utils Çıkarma

### Task 1.1: types.ts oluştur

**Files:**
- Create: `figma-plugin/src/handlers/utils/types.ts`

**Step 1: Dosyayı oluştur**

```typescript
// figma-plugin/src/handlers/utils/types.ts
/**
 * Shared type definitions for all handlers
 */

export interface Command {
  type: "COMMAND";
  id: string;
  action: string;
  params: Record<string, unknown>;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface GradientStop {
  position: number;
  color: string | RGBColor;
}

export interface GradientConfig {
  type: "LINEAR" | "RADIAL" | "ANGULAR" | "DIAMOND";
  stops: GradientStop[];
  angle?: number;
}

export interface FillConfig {
  type: "SOLID" | "GRADIENT";
  color?: string | RGBColor;
  opacity?: number;
  gradient?: GradientConfig;
}

export interface ShadowConfig {
  type: "DROP_SHADOW" | "INNER_SHADOW";
  color?: string | RGBColor;
  offsetX?: number;
  offsetY?: number;
  blur?: number;
  spread?: number;
  opacity?: number;
}

export interface BlurConfig {
  type: "LAYER_BLUR" | "BACKGROUND_BLUR";
  radius: number;
}

export type EffectConfig = ShadowConfig | BlurConfig;

export interface AutoLayoutConfig {
  mode: "HORIZONTAL" | "VERTICAL";
  spacing?: number;
  counterAxisSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  padding?: number;
  primaryAxisAlign?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlign?: "MIN" | "CENTER" | "MAX" | "BASELINE";
  wrap?: boolean;
  strokesIncludedInLayout?: boolean;
}

export interface TextStyleConfig {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number | string;
  letterSpacing?: number;
  textAlign?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
}

export interface StrokeConfig {
  color: string | RGBColor;
  weight?: number;
  align?: "INSIDE" | "OUTSIDE" | "CENTER";
}

export interface FinalizeOptions {
  parentId?: string;
  x?: number;
  y?: number;
}

// Handler tipleri
export type CommandHandler = (params: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>;
export type NoParamsHandler = () => Promise<Record<string, unknown>> | Record<string, unknown>;
```

**Step 2: Build kontrolü**

```bash
cd figma-plugin && npm run build
```

Expected: Build başarılı (henüz import yok)

**Step 3: Commit**

```bash
git add figma-plugin/src/handlers/utils/types.ts
git commit -m "refactor(plugin): extract shared types to handlers/utils/types.ts"
```

---

### Task 1.2: node-helpers.ts oluştur

**Files:**
- Create: `figma-plugin/src/handlers/utils/node-helpers.ts`

**Step 1: Dosyayı oluştur**

```typescript
// figma-plugin/src/handlers/utils/node-helpers.ts
/**
 * Node registry and helper functions
 */

import type { FinalizeOptions } from "./types";

// Node Registry - Oluşturulan node'ları takip et
export const nodeRegistry: Map<string, SceneNode> = new Map();

export function registerNode(node: SceneNode): void {
  nodeRegistry.set(node.id, node);
}

export async function getNode(nodeId: string): Promise<SceneNode | null> {
  // Önce registry'den bak
  if (nodeRegistry.has(nodeId)) {
    return nodeRegistry.get(nodeId) || null;
  }
  // Sonra async olarak Figma'dan al
  const node = await figma.getNodeByIdAsync(nodeId);
  if (node && "type" in node) {
    return node as SceneNode;
  }
  return null;
}

/**
 * Node'u ID ile al, bulunamazsa hata fırlat
 */
export async function getNodeOrThrow(nodeId: string, errorMessage?: string): Promise<SceneNode> {
  const node = await getNode(nodeId);
  if (!node) {
    throw new Error(errorMessage || `Node not found: ${nodeId}`);
  }
  return node;
}

/**
 * Node'u parent'a veya sayfaya ekle
 */
export async function attachToParentOrPage(node: SceneNode, parentId?: string): Promise<void> {
  if (parentId) {
    const parent = await getNode(parentId);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(node);
    }
  } else {
    figma.currentPage.appendChild(node);
  }
}

/**
 * Node pozisyonunu ayarla
 */
export function setPosition(node: SceneNode, x?: number, y?: number): void {
  if (x !== undefined) node.x = x;
  if (y !== undefined) node.y = y;
}

/**
 * Node'u finalize et: parent'a ekle ve pozisyonu ayarla
 */
export async function finalizeNode(node: SceneNode, options: FinalizeOptions): Promise<void> {
  await attachToParentOrPage(node, options.parentId);
  setPosition(node, options.x, options.y);
}
```

**Step 2: Build kontrolü**

```bash
cd figma-plugin && npm run build
```

Expected: Build başarılı

**Step 3: Commit**

```bash
git add figma-plugin/src/handlers/utils/node-helpers.ts
git commit -m "refactor(plugin): extract node helpers to handlers/utils/node-helpers.ts"
```

---

### Task 1.3: paint-helpers.ts oluştur

**Files:**
- Create: `figma-plugin/src/handlers/utils/paint-helpers.ts`

**Step 1: Dosyayı oluştur**

```typescript
// figma-plugin/src/handlers/utils/paint-helpers.ts
/**
 * Paint, fill, stroke, and effect helper functions
 */

import type {
  RGBColor,
  FillConfig,
  GradientConfig,
  StrokeConfig,
  EffectConfig,
  ShadowConfig,
  BlurConfig,
  AutoLayoutConfig
} from "./types";

export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    };
  }
  // 3 karakter hex desteği
  const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
  if (shortResult) {
    return {
      r: parseInt(shortResult[1] + shortResult[1], 16) / 255,
      g: parseInt(shortResult[2] + shortResult[2], 16) / 255,
      b: parseInt(shortResult[3] + shortResult[3], 16) / 255,
    };
  }
  return { r: 0, g: 0, b: 0 };
}

export function parseColor(color: string | RGBColor): RGB {
  if (typeof color === "string") {
    return hexToRgb(color);
  }
  return { r: color.r, g: color.g, b: color.b };
}

export function createSolidPaint(color: string | RGBColor, opacity?: number): SolidPaint {
  const rgb = parseColor(color);
  return {
    type: "SOLID",
    color: rgb,
    opacity: opacity !== undefined ? opacity : 1,
  };
}

export function createStrokePaint(config: StrokeConfig): SolidPaint {
  const rgb = parseColor(config.color);
  return {
    type: "SOLID",
    color: rgb,
    opacity: 1,
  };
}

export function createGradientPaint(config: GradientConfig): GradientPaint {
  const stops: ColorStop[] = config.stops.map((stop) => ({
    position: stop.position,
    color: { ...parseColor(stop.color), a: 1 },
  }));

  const angle = config.angle || 0;
  const radians = (angle * Math.PI) / 180;

  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    type: "GRADIENT_LINEAR",
    gradientTransform: [
      [cos, sin, 0.5 - cos * 0.5 - sin * 0.5],
      [-sin, cos, 0.5 + sin * 0.5 - cos * 0.5],
    ],
    gradientStops: stops,
  };
}

export function createFill(config: FillConfig): Paint {
  if (config.type === "SOLID" && config.color) {
    return createSolidPaint(config.color, config.opacity);
  }
  if (config.type === "GRADIENT" && config.gradient) {
    return createGradientPaint(config.gradient);
  }
  return createSolidPaint("#000000");
}

export function createEffect(config: EffectConfig): Effect {
  if (config.type === "DROP_SHADOW" || config.type === "INNER_SHADOW") {
    const shadow = config as ShadowConfig;
    const color = shadow.color ? parseColor(shadow.color) : { r: 0, g: 0, b: 0 };
    return {
      type: shadow.type,
      color: { ...color, a: shadow.opacity !== undefined ? shadow.opacity : 0.25 },
      offset: {
        x: shadow.offsetX !== undefined ? shadow.offsetX : 0,
        y: shadow.offsetY !== undefined ? shadow.offsetY : 4
      },
      radius: shadow.blur !== undefined ? shadow.blur : 8,
      spread: shadow.spread !== undefined ? shadow.spread : 0,
      visible: true,
      blendMode: "NORMAL",
    };
  }

  const blur = config as BlurConfig;
  return {
    type: blur.type,
    radius: blur.radius,
    visible: true,
  } as BlurEffect;
}

export function applyAutoLayout(node: FrameNode, config: AutoLayoutConfig): void {
  node.layoutMode = config.mode;
  node.itemSpacing = config.spacing !== undefined ? config.spacing : 0;

  const padding = config.padding !== undefined ? config.padding : 0;
  node.paddingTop = config.paddingTop !== undefined ? config.paddingTop : padding;
  node.paddingRight = config.paddingRight !== undefined ? config.paddingRight : padding;
  node.paddingBottom = config.paddingBottom !== undefined ? config.paddingBottom : padding;
  node.paddingLeft = config.paddingLeft !== undefined ? config.paddingLeft : padding;

  node.primaryAxisAlignItems = config.primaryAxisAlign || "MIN";
  node.counterAxisAlignItems = config.counterAxisAlign || "CENTER";

  if (config.wrap) {
    node.layoutWrap = "WRAP";
    if (config.counterAxisSpacing !== undefined) {
      node.counterAxisSpacing = config.counterAxisSpacing;
    }
  }

  if (config.strokesIncludedInLayout !== undefined) {
    node.strokesIncludedInLayout = config.strokesIncludedInLayout;
  }
}

export function applyStroke(node: GeometryMixin & MinimalStrokesMixin, config: StrokeConfig): void {
  node.strokes = [createSolidPaint(config.color)];
  node.strokeWeight = config.weight !== undefined ? config.weight : 1;
  if ("strokeAlign" in node && config.align) {
    (node as FrameNode).strokeAlign = config.align;
  }
}
```

**Step 2: Build kontrolü**

```bash
cd figma-plugin && npm run build
```

Expected: Build başarılı

**Step 3: Commit**

```bash
git add figma-plugin/src/handlers/utils/paint-helpers.ts
git commit -m "refactor(plugin): extract paint helpers to handlers/utils/paint-helpers.ts"
```

---

### Task 1.4: font-helpers.ts oluştur

**Files:**
- Create: `figma-plugin/src/handlers/utils/font-helpers.ts`

**Step 1: Dosyayı oluştur**

```typescript
// figma-plugin/src/handlers/utils/font-helpers.ts
/**
 * Font loading and style helper functions
 */

export function getFontStyle(weight: number): string {
  if (weight <= 100) return "Thin";
  if (weight <= 200) return "ExtraLight";
  if (weight <= 300) return "Light";
  if (weight <= 400) return "Regular";
  if (weight <= 500) return "Medium";
  if (weight <= 600) return "Semi Bold";
  if (weight <= 700) return "Bold";
  if (weight <= 800) return "ExtraBold";
  return "Black";
}

export async function loadFont(fontFamily: string, fontWeight: number): Promise<FontName> {
  const fontName: FontName = {
    family: fontFamily,
    style: getFontStyle(fontWeight),
  };

  try {
    await figma.loadFontAsync(fontName);
    return fontName;
  } catch {
    const fallback: FontName = { family: "Inter", style: "Regular" };
    await figma.loadFontAsync(fallback);
    return fallback;
  }
}
```

**Step 2: Build kontrolü**

```bash
cd figma-plugin && npm run build
```

Expected: Build başarılı

**Step 3: Commit**

```bash
git add figma-plugin/src/handlers/utils/font-helpers.ts
git commit -m "refactor(plugin): extract font helpers to handlers/utils/font-helpers.ts"
```

---

### Task 1.5: utils/index.ts oluştur

**Files:**
- Create: `figma-plugin/src/handlers/utils/index.ts`

**Step 1: Dosyayı oluştur**

```typescript
// figma-plugin/src/handlers/utils/index.ts
/**
 * Re-export all utilities
 */

// Types
export * from "./types";

// Node helpers
export {
  nodeRegistry,
  registerNode,
  getNode,
  getNodeOrThrow,
  attachToParentOrPage,
  setPosition,
  finalizeNode,
} from "./node-helpers";

// Paint helpers
export {
  hexToRgb,
  parseColor,
  createSolidPaint,
  createStrokePaint,
  createGradientPaint,
  createFill,
  createEffect,
  applyAutoLayout,
  applyStroke,
} from "./paint-helpers";

// Font helpers
export {
  getFontStyle,
  loadFont,
} from "./font-helpers";
```

**Step 2: Build kontrolü**

```bash
cd figma-plugin && npm run build
```

Expected: Build başarılı

**Step 3: Commit**

```bash
git add figma-plugin/src/handlers/utils/index.ts
git commit -m "refactor(plugin): add utils index with re-exports"
```

---

### Task 1.6: code.ts'de utils'i kullan

**Files:**
- Modify: `figma-plugin/src/code.ts`

**Step 1: Import ekle (dosyanın başına)**

code.ts'in başına şu import'u ekle (mevcut import'ların altına):

```typescript
// Handler utilities
import {
  // Types
  type Command,
  type RGBColor,
  type GradientStop,
  type GradientConfig,
  type FillConfig,
  type ShadowConfig,
  type BlurConfig,
  type EffectConfig,
  type AutoLayoutConfig,
  type TextStyleConfig,
  type StrokeConfig,
  type FinalizeOptions,
  type CommandHandler,
  type NoParamsHandler,
  // Node helpers
  nodeRegistry,
  registerNode,
  getNode,
  getNodeOrThrow,
  attachToParentOrPage,
  setPosition,
  finalizeNode,
  // Paint helpers
  hexToRgb,
  parseColor,
  createSolidPaint,
  createStrokePaint,
  createGradientPaint,
  createFill,
  createEffect,
  applyAutoLayout,
  applyStroke,
  // Font helpers
  getFontStyle,
  loadFont,
} from "./handlers/utils";
```

**Step 2: Eski tanımları sil**

code.ts'den şu bölümleri sil:
- Lines 43-130: Interface tanımları (Command, RGBColor, vb.)
- Lines 135-247: nodeRegistry, registerNode, getNode, getNodeOrThrow, attachToParentOrPage, setPosition, finalizeNode, FinalizeOptions
- Lines 253-418: hexToRgb, parseColor, createSolidPaint, vb. helper fonksiyonlar
- Lines 5399-5401: CommandHandler, NoParamsHandler type tanımları

**Step 3: Build kontrolü**

```bash
cd figma-plugin && npm run build
```

Expected: Build başarılı - tüm handler'lar çalışmaya devam ediyor

**Step 4: Commit**

```bash
git add figma-plugin/src/code.ts
git commit -m "refactor(plugin): use extracted utils in code.ts

- Import types from handlers/utils/types.ts
- Import node helpers from handlers/utils/node-helpers.ts
- Import paint helpers from handlers/utils/paint-helpers.ts
- Import font helpers from handlers/utils/font-helpers.ts
- Remove duplicate definitions from code.ts

No functional changes - all handlers work identically."
```

---

## Faz 2: Handler Dosyalarını Çıkarma

### Task 2.1: handlers/shapes.ts oluştur

**Files:**
- Create: `figma-plugin/src/handlers/shapes.ts`

**Step 1: Shape handler'larını çıkar**

code.ts'den şu handler'ları shapes.ts'e taşı:
- handleCreateFrame
- handleCreateRectangle
- handleCreateEllipse
- handleCreateLine
- handleCreatePolygon
- handleCreateStar
- handleCreateVector

**Step 2: Import'ları ekle**

```typescript
// figma-plugin/src/handlers/shapes.ts
import {
  type FillConfig,
  type StrokeConfig,
  type EffectConfig,
  type AutoLayoutConfig,
  getNode,
  registerNode,
  finalizeNode,
  createFill,
  createEffect,
  applyAutoLayout,
  applyStroke,
} from "./utils";

// Core layout system import'ları (code.ts'den kopyala)
import { createAutoLayout } from "../core";
import type { AutoLayoutConfig as CoreAutoLayoutConfig } from "../core/types";

// ... handler fonksiyonları buraya
```

**Step 3: Export et**

```typescript
export {
  handleCreateFrame,
  handleCreateRectangle,
  handleCreateEllipse,
  handleCreateLine,
  handleCreatePolygon,
  handleCreateStar,
  handleCreateVector,
};
```

**Step 4: Build kontrolü**

```bash
cd figma-plugin && npm run build
```

**Step 5: Commit**

```bash
git add figma-plugin/src/handlers/shapes.ts
git commit -m "refactor(plugin): extract shape handlers to handlers/shapes.ts"
```

---

### Task 2.2-2.18: Diğer handler dosyaları

Aynı pattern'i şu dosyalar için tekrarla:

| Task | Dosya | Handler'lar |
|------|-------|-------------|
| 2.2 | text.ts | handleCreateText, handleSetTextContent, handleListAvailableFonts |
| 2.3 | components.ts | handleCreateButton, handleCreateInput, handleCreateCard, handleCreateUIComponent, handleCreateKPICard, handleCreateIcon, handleListIcons |
| 2.4 | design-system.ts | handleSetTheme, handleSetThemeTokens, handleCreateShadcnComponent, handleCreateAppleComponent, handleCreateLiquidGlassComponent, handleListComponents, handleGetDesignTokens |
| 2.5 | layout.ts | handleSetAutoLayout, handleSetConstraints, handleSetLayoutSizing, handleSetLayoutGrid, handleGetLayoutGrid, handleReorderChildren |
| 2.6 | styling.ts | handleSetFill, handleSetStroke, handleSetEffects, handleSetOpacity, handleSetBlendMode, handleSetCornerRadius |
| 2.7 | transform.ts | handleSetRotation, handleSetTransform, handleScaleNode, handleSetPosition, handleResizeNode |
| 2.8 | manipulation.ts | handleDeleteNode, handleCloneNode, handleModifyNode, handleMoveToParent, handleAppendChild, handleCreateGroup, handleUngroup, handleFlattenNode, handleSetVisibility, handleSetLocked |
| 2.9 | component-lib.ts | handleCreateComponent, handleCreateComponentInstance, handleGetLocalComponents, handleRegisterComponent, handleRegisterComponentSlot, handleCreateFromSlot, handleListComponentSlots |
| 2.10 | media.ts | handleCreateImage, handleSetImageFill, handleCreateVideo, handleSetVideoFill, handleCreateLinkPreview, handleSetVectorPaths |
| 2.11 | styles.ts | handleGetLocalStyles, handleCreatePaintStyle, handleCreateTextStyle, handleCreateEffectStyle, handleApplyStyle |
| 2.12 | variables.ts | handleGetLocalVariables, handleGetVariableCollections, handleCreateVariable, handleCreateVariableCollection, handleBindVariable |
| 2.13 | query.ts | handleGetSelection, handleSelectNodes, handleFindNodes, handleFindChildren, handleGetNodeInfo, handleGetPageInfo |
| 2.14 | data.ts | Plugin Data (4) + Shared Plugin Data (3) + Client Storage (4) = 11 handler |
| 2.15 | viewport.ts | handleGetViewport, handleSetViewport, handleScrollToNode, handleZoomToFit, handleZoomToSelection |
| 2.16 | pages.ts | handleGetCurrentPage, handleSetCurrentPage, handleCreatePage, handleGetAllPages |
| 2.17 | editor.ts | handleGetEditorType, handleGetMode |
| 2.18 | debug.ts | handleLintLayout, handleToggleDebugMode, handleGetDebugInfo |

---

### Task 2.19: handlers/index.ts oluştur

**Files:**
- Create: `figma-plugin/src/handlers/index.ts`

**Step 1: Tüm handler'ları birleştir**

```typescript
// figma-plugin/src/handlers/index.ts
/**
 * Command handler registry
 * All handlers are imported and registered here
 */

import type { CommandHandler, NoParamsHandler } from "./utils";

// Import all handlers
import * as shapes from "./shapes";
import * as text from "./text";
import * as components from "./components";
import * as designSystem from "./design-system";
import * as layout from "./layout";
import * as styling from "./styling";
import * as transform from "./transform";
import * as manipulation from "./manipulation";
import * as componentLib from "./component-lib";
import * as media from "./media";
import * as styles from "./styles";
import * as variables from "./variables";
import * as query from "./query";
import * as data from "./data";
import * as viewport from "./viewport";
import * as pages from "./pages";
import * as editor from "./editor";
import * as debug from "./debug";

// Command handler map
export const commandHandlers: Record<string, CommandHandler | NoParamsHandler> = {
  // === Temel Şekiller ===
  CREATE_FRAME: shapes.handleCreateFrame,
  CREATE_RECTANGLE: shapes.handleCreateRectangle,
  CREATE_ELLIPSE: shapes.handleCreateEllipse,
  CREATE_LINE: shapes.handleCreateLine,
  CREATE_POLYGON: shapes.handleCreatePolygon,
  CREATE_STAR: shapes.handleCreateStar,
  CREATE_VECTOR: shapes.handleCreateVector,

  // === Metin ===
  CREATE_TEXT: text.handleCreateText,
  SET_TEXT_CONTENT: text.handleSetTextContent,
  LIST_AVAILABLE_FONTS: text.handleListAvailableFonts,

  // ... diğer tüm handler'lar
};
```

**Step 2: Build kontrolü**

```bash
cd figma-plugin && npm run build
```

**Step 3: Commit**

```bash
git add figma-plugin/src/handlers/index.ts
git commit -m "refactor(plugin): create handlers/index.ts with command registry"
```

---

### Task 2.20: code.ts'i orchestrator yap

**Files:**
- Modify: `figma-plugin/src/code.ts`

**Step 1: Handler registry'yi import et**

```typescript
import { commandHandlers } from "./handlers";
```

**Step 2: Tüm handler fonksiyonlarını sil**

code.ts'den tüm `handleXxx` fonksiyonlarını sil. Sadece şunlar kalmalı:
- Import'lar
- figma.showUI
- handleCommand fonksiyonu
- figma.ui.onmessage listener
- figma.notify

**Step 3: Build kontrolü**

```bash
cd figma-plugin && npm run build
```

Expected: Build başarılı, ~300 satır code.ts

**Step 4: Commit**

```bash
git add figma-plugin/src/code.ts
git commit -m "refactor(plugin): convert code.ts to orchestrator

- Import handlers from handlers/index.ts
- Remove all handler implementations
- Keep only command dispatch and UI message handling
- Reduced from ~5600 lines to ~300 lines"
```

---

## Final: Doğrulama

### Task 3.1: Tam build ve test

**Step 1: Clean build**

```bash
cd figma-plugin && rm -rf dist && npm run build
```

**Step 2: Satır sayısını doğrula**

```bash
wc -l figma-plugin/src/code.ts
# Expected: ~300 satır

wc -l figma-plugin/src/handlers/*.ts
# Expected: Toplam ~5000 satır (19 dosya)

wc -l figma-plugin/src/handlers/utils/*.ts
# Expected: Toplam ~300 satır (4 dosya)
```

**Step 3: Final commit**

```bash
git add -A
git commit -m "refactor(plugin): complete code.ts modularization

Summary:
- Extracted shared types to handlers/utils/types.ts
- Extracted node helpers to handlers/utils/node-helpers.ts
- Extracted paint helpers to handlers/utils/paint-helpers.ts
- Extracted font helpers to handlers/utils/font-helpers.ts
- Split 100+ handlers into 18 domain-specific files
- Reduced code.ts from 5626 lines to ~300 lines

No functional changes - all commands work identically."
```

---

## Risk Azaltma Kontrol Listesi

Her task sonrası:
- [ ] `npm run build` başarılı
- [ ] TypeScript hatası yok
- [ ] Import path'leri doğru
- [ ] Export'lar eksiksiz

Sorun olursa:
```bash
git checkout -- figma-plugin/src/  # Tüm değişiklikleri geri al
```

---

## Notlar

- **Build hatası alırsan**: Hemen `git diff` ile neyin değiştiğine bak, gerekirse `git checkout` ile geri al
- **Import hatası alırsan**: Dosya yollarının `.js` uzantısı olmadan yazıldığından emin ol (esbuild halleder)
- **Circular dependency**: Utils sadece Figma API kullanır, handler'lar utils'i kullanır, code.ts handlers'ı kullanır - tek yönlü bağımlılık

