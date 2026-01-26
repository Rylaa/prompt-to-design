# Auto Layout Rewrite - Tam Yeniden Yazım Planı

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Figma plugin mimarisini Gemini DeepSearch araştırmasına göre yeniden yazarak absolute positioning'i kaldırıp pure Auto Layout sistemine geçmek.

**Architecture:** Mevcut x,y koordinat hesaplama sistemi (`positioning/`) tamamen silinecek. Yerine `core/layout-factory.ts` ile Auto Layout wrapper pattern uygulanacak. Tüm frame/component oluşturma bu factory'den geçecek. Token enforcement ile hex kodları yasaklanacak.

**Tech Stack:** TypeScript, Figma Plugin API, Auto Layout, Design Tokens

---

## Task 1: Positioning Modülünü Sil

**Files:**
- Delete: `figma-plugin/src/positioning/calculator.ts`
- Delete: `figma-plugin/src/positioning/types.ts`
- Delete: `figma-plugin/src/positioning/index.ts`

**Step 1: positioning klasörünü sil**

```bash
rm -rf figma-plugin/src/positioning/
```

**Step 2: code.ts'den import'u kaldır**

`figma-plugin/src/code.ts:17-18` satırlarını sil:
```typescript
// SİLİNECEK SATIRLAR:
import { calculatePosition, getLayoutContextFromNode } from "./positioning/index";
import type { PositionRequest } from "./positioning/types";
```

**Step 3: applySmartPosition fonksiyonunu sil**

`figma-plugin/src/code.ts:370-412` satırlarını sil (tüm `applySmartPosition` fonksiyonu)

**Step 4: Build test**

Run: `cd figma-plugin && npm run build`
Expected: Build FAIL - eksik referanslar olacak (bu beklenen davranış)

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove absolute positioning system

BREAKING CHANGE: positioning/ module deleted
- Removed calculator.ts (x,y coordinate calculation)
- Removed types.ts (PositionRequest, PositionResult)
- Removed applySmartPosition function
- Build intentionally broken, will be fixed in next commits"
```

---

## Task 2: Core Layout Factory Oluştur

**Files:**
- Create: `figma-plugin/src/core/layout-factory.ts`
- Create: `figma-plugin/src/core/types.ts`
- Create: `figma-plugin/src/core/index.ts`

**Step 1: core/types.ts oluştur**

```typescript
/**
 * Core Layout Types
 * Auto Layout tabanlı type-safe frame oluşturma
 */

import type { SpacingKey, RadiusKey } from "../tokens/spacing";

// Layout direction
export type LayoutDirection = "VERTICAL" | "HORIZONTAL";

// Sizing modes
export type SizingMode = "FIXED" | "HUG" | "FILL";

// Alignment
export type PrimaryAxisAlign = "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
export type CounterAxisAlign = "MIN" | "CENTER" | "MAX" | "BASELINE";

// Spacing - sadece token key kabul eder, raw number YASAK
export interface SpacingConfig {
  gap?: SpacingKey;
  paddingTop?: SpacingKey;
  paddingRight?: SpacingKey;
  paddingBottom?: SpacingKey;
  paddingLeft?: SpacingKey;
  // Shorthand - tüm padding'leri aynı yapar
  padding?: SpacingKey;
}

// Fill config - hex YASAK, sadece token veya semantic color
export interface SemanticFillConfig {
  type: "SEMANTIC";
  token: "background" | "foreground" | "card" | "primary" | "secondary" | "muted" | "accent" | "destructive" | "border" | "input" | "ring";
  opacity?: number;
}

export interface SolidFillConfig {
  type: "SOLID";
  color: { r: number; g: number; b: number };
  opacity?: number;
}

export type FillConfig = SemanticFillConfig | SolidFillConfig;

// Auto Layout Frame Config
export interface AutoLayoutConfig {
  name?: string;
  direction: LayoutDirection;
  spacing: SpacingConfig;
  primaryAxisAlign?: PrimaryAxisAlign;
  counterAxisAlign?: CounterAxisAlign;
  primaryAxisSizing?: SizingMode;
  counterAxisSizing?: SizingMode;
  fill?: FillConfig;
  cornerRadius?: RadiusKey;
  // Parent - undefined ise currentPage'e eklenir
  parent?: FrameNode | ComponentNode;
  // Explicit width/height - sadece FIXED sizing için
  width?: number;
  height?: number;
}

// Layout sizing ayarı için
export interface LayoutSizingConfig {
  horizontal?: SizingMode;
  vertical?: SizingMode;
}
```

**Step 2: core/layout-factory.ts oluştur**

```typescript
/**
 * Layout Factory
 * Tüm frame oluşturma BU modülden geçmek ZORUNDA
 * Raw figma.createFrame() YASAK
 */

import type {
  AutoLayoutConfig,
  LayoutSizingConfig,
  FillConfig,
  SpacingConfig,
} from "./types";
import { spacing, radius } from "../tokens/spacing";
import { getShadcnColors } from "../tokens";
import type { SpacingKey, RadiusKey } from "../tokens/spacing";

/**
 * Spacing key'i pixel değerine çevir
 */
function resolveSpacing(key: SpacingKey | undefined): number {
  if (!key) return 0;
  return spacing[key] ?? 0;
}

/**
 * Radius key'i pixel değerine çevir
 */
function resolveRadius(key: RadiusKey | undefined): number {
  if (!key) return 0;
  return radius[key] ?? 0;
}

/**
 * Semantic fill'i Figma paint'e çevir
 */
function resolveFill(fill: FillConfig | undefined, theme: "light" | "dark" = "light"): Paint[] {
  if (!fill) return [];

  if (fill.type === "SEMANTIC") {
    const colors = getShadcnColors(theme);
    const colorToken = colors[fill.token as keyof typeof colors];
    if (colorToken && "rgb" in colorToken) {
      return [{
        type: "SOLID",
        color: colorToken.rgb,
        opacity: fill.opacity ?? 1,
      }];
    }
    return [];
  }

  if (fill.type === "SOLID") {
    return [{
      type: "SOLID",
      color: fill.color,
      opacity: fill.opacity ?? 1,
    }];
  }

  return [];
}

/**
 * Spacing config'i uygula
 */
function applySpacing(frame: FrameNode, config: SpacingConfig): void {
  // Gap
  frame.itemSpacing = resolveSpacing(config.gap);

  // Padding - shorthand varsa onu kullan
  if (config.padding) {
    const p = resolveSpacing(config.padding);
    frame.paddingTop = p;
    frame.paddingRight = p;
    frame.paddingBottom = p;
    frame.paddingLeft = p;
  } else {
    frame.paddingTop = resolveSpacing(config.paddingTop);
    frame.paddingRight = resolveSpacing(config.paddingRight);
    frame.paddingBottom = resolveSpacing(config.paddingBottom);
    frame.paddingLeft = resolveSpacing(config.paddingLeft);
  }
}

/**
 * ANA FACTORY FONKSİYONU
 * Tüm frame oluşturma buradan geçmeli
 */
export function createAutoLayout(config: AutoLayoutConfig): FrameNode {
  const frame = figma.createFrame();

  // İsim
  frame.name = config.name ?? "Frame";

  // ZORUNLU: Auto Layout aktif
  frame.layoutMode = config.direction;

  // Sizing modes
  frame.primaryAxisSizingMode = config.primaryAxisSizing === "FIXED" ? "FIXED" : "AUTO";
  frame.counterAxisSizingMode = config.counterAxisSizing === "FIXED" ? "FIXED" : "AUTO";

  // Alignment
  frame.primaryAxisAlignItems = config.primaryAxisAlign ?? "MIN";
  frame.counterAxisAlignItems = config.counterAxisAlign ?? "MIN";

  // Spacing
  applySpacing(frame, config.spacing);

  // Fill
  if (config.fill) {
    frame.fills = resolveFill(config.fill);
  }

  // Corner radius
  if (config.cornerRadius) {
    frame.cornerRadius = resolveRadius(config.cornerRadius);
  }

  // Explicit dimensions (sadece FIXED için)
  if (config.width && config.primaryAxisSizing === "FIXED") {
    frame.resize(config.width, frame.height);
  }
  if (config.height && config.counterAxisSizing === "FIXED") {
    frame.resize(frame.width, config.height);
  }

  // Parent'a ekle
  if (config.parent) {
    config.parent.appendChild(frame);
  } else {
    figma.currentPage.appendChild(frame);
  }

  return frame;
}

/**
 * Layout sizing ayarla
 * Auto Layout child'ları için FILL/HUG/FIXED
 */
export function setLayoutSizing(node: SceneNode, config: LayoutSizingConfig): void {
  if (!("layoutSizingHorizontal" in node)) return;

  const n = node as FrameNode;

  if (config.horizontal) {
    n.layoutSizingHorizontal = config.horizontal;
  }

  if (config.vertical) {
    n.layoutSizingVertical = config.vertical;
  }
}

/**
 * Mevcut frame'e Auto Layout ekle
 */
export function enableAutoLayout(
  frame: FrameNode,
  direction: "VERTICAL" | "HORIZONTAL",
  spacing: SpacingConfig
): void {
  frame.layoutMode = direction;
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  applySpacing(frame, spacing);
}

// Export helpers
export { resolveSpacing, resolveRadius, resolveFill };
```

**Step 3: core/index.ts oluştur**

```typescript
/**
 * Core Module Exports
 */

export * from "./types";
export {
  createAutoLayout,
  setLayoutSizing,
  enableAutoLayout,
  resolveSpacing,
  resolveRadius,
  resolveFill,
} from "./layout-factory";
```

**Step 4: Build test**

Run: `cd figma-plugin && npm run build`
Expected: Build FAIL - code.ts hala eski import'ları kullanıyor

**Step 5: Commit**

```bash
git add figma-plugin/src/core/
git commit -m "feat(core): add Auto Layout factory system

- Add layout-factory.ts with createAutoLayout()
- Add types.ts with type-safe configs
- Spacing only via tokens (raw numbers banned)
- Fill supports semantic tokens
- All frames MUST use Auto Layout"
```

---

## Task 3: code.ts'i Yeni Sisteme Geçir - Import'lar

**Files:**
- Modify: `figma-plugin/src/code.ts:1-20`

**Step 1: Eski import'ları kaldır, yenilerini ekle**

Dosyanın başındaki import bölümünü şu şekilde güncelle:

```typescript
/// <reference types="@figma/plugin-typings" />
/**
 * Figma Plugin - AI Design Assistant v3
 * Auto Layout tabanlı yeni mimari
 */

// Core layout system
import {
  createAutoLayout,
  setLayoutSizing,
  enableAutoLayout,
  resolveSpacing,
} from "./core";
import type {
  AutoLayoutConfig,
  LayoutSizingConfig,
  FillConfig as CoreFillConfig,
  SpacingConfig,
} from "./core/types";

// Import component libraries
import { themeManager, getColors, Theme, Platform, ThemeColors, createColorToken } from "./tokens";
import { createShadcnComponent, listShadcnComponents } from "./components/shadcn";
import { createIOSComponent, listIOSComponents } from "./components/apple-ios";
import { createMacOSComponent, listMacOSComponents } from "./components/apple-macos";
import { createLiquidGlassComponent, listLiquidGlassComponents } from "./components/liquid-glass";
import { listComponents, ComponentLibrary } from "./components";
import { LUCIDE_ICONS, hasIcon, getAvailableIcons } from "./icons/lucide-svgs";

// NOT: positioning import'ları SİLİNDİ
```

**Step 2: Build test**

Run: `cd figma-plugin && npm run build`
Expected: Build FAIL - handleCreateFrame hala eski kodu kullanıyor

**Step 3: Commit**

```bash
git add figma-plugin/src/code.ts
git commit -m "refactor(code): update imports to use core layout system"
```

---

## Task 4: handleCreateFrame'i Yeniden Yaz

**Files:**
- Modify: `figma-plugin/src/code.ts` - handleCreateFrame fonksiyonu

**Step 1: Yeni handleCreateFrame fonksiyonunu yaz**

Eski `handleCreateFrame` fonksiyonunu (satır 420-472 civarı) şu şekilde değiştir:

```typescript
async function handleCreateFrame(params: Record<string, unknown>): Promise<{ nodeId: string; fill?: string; name?: string }> {
  // Parent'ı bul
  let parent: FrameNode | ComponentNode | undefined;
  if (params.parentId) {
    const parentNode = await getNode(params.parentId as string);
    if (parentNode && "appendChild" in parentNode) {
      parent = parentNode as FrameNode | ComponentNode;
    }
  }

  // Auto Layout config oluştur
  const config: AutoLayoutConfig = {
    name: (params.name as string) || "Frame",
    direction: (params.autoLayout as { mode?: string })?.mode === "HORIZONTAL" ? "HORIZONTAL" : "VERTICAL",
    spacing: {
      gap: "4" as const, // Default 16px
      padding: "4" as const, // Default 16px
    },
    parent,
  };

  // Auto Layout params varsa override et
  if (params.autoLayout) {
    const al = params.autoLayout as Record<string, unknown>;

    // Spacing - raw number'ı en yakın token'a çevir
    if (typeof al.spacing === "number") {
      config.spacing.gap = pxToSpacingKey(al.spacing as number);
    }
    if (typeof al.padding === "number") {
      const paddingKey = pxToSpacingKey(al.padding as number);
      config.spacing.padding = paddingKey;
    }
    if (typeof al.paddingTop === "number") {
      config.spacing.paddingTop = pxToSpacingKey(al.paddingTop as number);
    }
    if (typeof al.paddingRight === "number") {
      config.spacing.paddingRight = pxToSpacingKey(al.paddingRight as number);
    }
    if (typeof al.paddingBottom === "number") {
      config.spacing.paddingBottom = pxToSpacingKey(al.paddingBottom as number);
    }
    if (typeof al.paddingLeft === "number") {
      config.spacing.paddingLeft = pxToSpacingKey(al.paddingLeft as number);
    }

    // Alignment
    if (al.primaryAxisAlign) {
      config.primaryAxisAlign = al.primaryAxisAlign as "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
    }
    if (al.counterAxisAlign) {
      config.counterAxisAlign = al.counterAxisAlign as "MIN" | "CENTER" | "MAX" | "BASELINE";
    }
  }

  // Fill - hex'i RGB'ye çevir
  if (params.fill) {
    const fillParam = params.fill as { type?: string; color?: string | { r: number; g: number; b: number } };
    if (fillParam.type === "SOLID" && fillParam.color) {
      if (typeof fillParam.color === "string") {
        const rgb = hexToRgb(fillParam.color);
        config.fill = { type: "SOLID", color: rgb };
      } else {
        config.fill = { type: "SOLID", color: fillParam.color };
      }
    }
  }

  // Corner radius
  if (typeof params.cornerRadius === "number") {
    // Raw number'ı en yakın radius token'a çevir
    const radiusMap: Record<number, RadiusKey> = {
      0: "none", 2: "sm", 4: "default", 6: "md",
      8: "lg", 12: "xl", 16: "2xl", 24: "3xl"
    };
    const closest = Object.entries(radiusMap)
      .reduce((prev, [px, key]) =>
        Math.abs(Number(px) - (params.cornerRadius as number)) < Math.abs(Number(prev[0]) - (params.cornerRadius as number))
          ? [px, key] : prev
      );
    config.cornerRadius = closest[1] as RadiusKey;
  }

  // Explicit dimensions
  if (params.width) {
    config.width = params.width as number;
    config.primaryAxisSizing = "FIXED";
  }
  if (params.height) {
    config.height = params.height as number;
    config.counterAxisSizing = "FIXED";
  }

  // Frame oluştur (factory kullanarak)
  const frame = createAutoLayout(config);

  // x, y PARAMETRELERİ ARTIK GÖRMEZDEN GELİNİYOR
  // Auto Layout parent pozisyonu otomatik belirler
  // Eski kod: if (params.x !== undefined) frame.x = params.x; // KALDIRILDI

  registerNode(frame);

  if (!params.parentId) {
    figma.viewport.scrollAndZoomIntoView([frame]);
  }

  // Response
  const fills = frame.fills as readonly Paint[];
  let fillInfo: string | null = null;
  if (fills.length > 0 && fills[0].type === "SOLID") {
    const solid = fills[0] as SolidPaint;
    const r = Math.round(solid.color.r * 255);
    const g = Math.round(solid.color.g * 255);
    const b = Math.round(solid.color.b * 255);
    fillInfo = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();
  }

  return { nodeId: frame.id, fill: fillInfo ?? undefined, name: frame.name };
}
```

**Step 2: pxToSpacingKey import ekle**

tokens/spacing.ts'den import et:

```typescript
import { pxToSpacingKey } from "./tokens/spacing";
```

**Step 3: RadiusKey import ekle**

```typescript
import type { RadiusKey } from "./tokens/spacing";
```

**Step 4: Build test**

Run: `cd figma-plugin && npm run build`
Expected: PASS

**Step 5: Commit**

```bash
git add figma-plugin/src/code.ts
git commit -m "refactor(code): rewrite handleCreateFrame with Auto Layout factory

- Use createAutoLayout() instead of raw figma.createFrame()
- x, y parameters now IGNORED (Auto Layout determines position)
- Spacing converted to nearest token
- Corner radius converted to token"
```

---

## Task 5: Diğer Handler'ları Güncelle

**Files:**
- Modify: `figma-plugin/src/code.ts` - handleCreateRectangle, handleCreateCard, handleCreateButton, handleCreateInput

**Step 1: handleCreateCard'ı güncelle**

Card zaten frame tabanlı, Auto Layout factory kullanacak şekilde güncelle:

```typescript
async function handleCreateCard(params: Record<string, unknown>): Promise<{ nodeId: string }> {
  // Auto Layout config
  const config: AutoLayoutConfig = {
    name: (params.name as string) || "Card",
    direction: "VERTICAL",
    spacing: {
      padding: "6" as const, // 24px default
    },
    fill: {
      type: "SOLID",
      color: { r: 1, g: 1, b: 1 }, // White background
    },
    cornerRadius: "lg",
  };

  // Parent
  if (params.parentId) {
    const parentNode = await getNode(params.parentId as string);
    if (parentNode && "appendChild" in parentNode) {
      config.parent = parentNode as FrameNode | ComponentNode;
    }
  }

  // Custom fill
  if (params.fill) {
    const fillParam = params.fill as { type?: string; color?: string | { r: number; g: number; b: number } };
    if (fillParam.type === "SOLID" && fillParam.color) {
      if (typeof fillParam.color === "string") {
        config.fill = { type: "SOLID", color: hexToRgb(fillParam.color) };
      } else {
        config.fill = { type: "SOLID", color: fillParam.color };
      }
    }
  }

  // Dimensions
  if (params.width) {
    config.width = params.width as number;
    config.primaryAxisSizing = "FIXED";
  }
  if (params.height) {
    config.height = params.height as number;
    config.counterAxisSizing = "FIXED";
  }

  const card = createAutoLayout(config);

  // Shadow efekti
  if (params.shadow !== false) {
    card.effects = [{
      type: "DROP_SHADOW",
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 4 },
      radius: 8,
      spread: 0,
      visible: true,
      blendMode: "NORMAL",
    }];
  }

  registerNode(card);
  return { nodeId: card.id };
}
```

**Step 2: Build ve test**

Run: `cd figma-plugin && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add figma-plugin/src/code.ts
git commit -m "refactor(code): update handleCreateCard to use Auto Layout factory"
```

---

## Task 6: SET_POSITION Handler'ını Devre Dışı Bırak

**Files:**
- Modify: `figma-plugin/src/code.ts` - handleSetPosition

**Step 1: handleSetPosition'ı warning döndürecek şekilde değiştir**

```typescript
async function handleSetPosition(params: Record<string, unknown>): Promise<{ success: boolean; warning: string }> {
  // x, y koordinat ayarlamak artık YASAK
  // Auto Layout parent pozisyonu belirler
  console.warn("SET_POSITION is deprecated. Auto Layout determines position automatically.");

  return {
    success: false,
    warning: "SET_POSITION is deprecated. Use Auto Layout parent with proper spacing instead. Child position is determined by parent's Auto Layout."
  };
}
```

**Step 2: Build test**

Run: `cd figma-plugin && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add figma-plugin/src/code.ts
git commit -m "refactor(code): deprecate SET_POSITION handler

BREAKING CHANGE: SET_POSITION no longer works
- Returns warning instead of setting x,y
- Position determined by Auto Layout parent"
```

---

## Task 7: Agent Prompt'larını Güncelle

**Files:**
- Modify: `claude-plugin/agents/execution-agent.md`
- Modify: `claude-plugin/agents/design-agent.md` (varsa)

**Step 1: execution-agent.md'yi güncelle**

Auto Layout zorunluluğu ve x,y yasağı ekle:

```markdown
## ⚠️ KRİTİK MİMARİ KURALLARI

### YASAK İŞLEMLER (KESİNLİKLE YAPMA!)

1. **x, y koordinat KULLANMA** - Auto Layout pozisyonu belirler
2. **SET_POSITION çağırma** - Deprecated, çalışmaz
3. **Raw pixel değeri kullanma** - Sadece spacing token'ları kullan

### ZORUNLU PATTERN

Her frame oluşturma şu yapıda olmalı:

```typescript
// 1. Parent frame (VERTICAL auto-layout)
figma_create_frame({
  name: "Screen",
  width: 393,
  height: 852,
  autoLayout: { mode: "VERTICAL", spacing: 0, padding: 0 },
  fill: { type: "SOLID", color: "#09090B" }
})

// 2. Child frame (FILL sizing ile parent'a yapışır)
figma_create_frame({
  name: "Header",
  parentId: screenId,
  autoLayout: { mode: "HORIZONTAL", padding: 16 }
})
figma_set_layout_sizing({ nodeId: headerId, horizontal: "FILL" })

// 3. İçerik ekle (yine Auto Layout child olarak)
figma_create_text({
  content: "Title",
  parentId: headerId
})
```

### SPACING TOKEN'LARI

Raw pixel değeri KULLANMA. Şu token'ları kullan:
- `0`: 0px
- `1`: 4px
- `2`: 8px
- `3`: 12px
- `4`: 16px
- `5`: 20px
- `6`: 24px
- `8`: 32px

Örnek: `autoLayout: { spacing: 16 }` yerine `autoLayout: { spacing: 4 }` token kullan
```

**Step 2: Commit**

```bash
git add claude-plugin/agents/
git commit -m "docs(agents): update prompts with Auto Layout rules

- Add banned operations (x,y, SET_POSITION)
- Add required Auto Layout pattern
- Add spacing token reference"
```

---

## Task 8: Final Build ve Test

**Step 1: Clean build**

```bash
cd figma-plugin
rm -rf dist/
npm run build
```

Expected: PASS - sıfır hata

**Step 2: Type check**

```bash
cd figma-plugin
npx tsc --noEmit
```

Expected: PASS

**Step 3: Test in Figma**

1. Figma'yı aç
2. Plugin'i yükle (Development > Import plugin from manifest)
3. Test komutu: `figma_create_frame({ name: "Test", width: 393, height: 852, autoLayout: { mode: "VERTICAL", spacing: 16 } })`
4. Verify: Frame Auto Layout VERTICAL mode'da olmalı

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Auto Layout rewrite

- Removed absolute positioning system
- All frames use Auto Layout factory
- x,y coordinates ignored
- Spacing via tokens only
- SET_POSITION deprecated"
```

---

## Özet

| Task | Açıklama | Dosyalar |
|------|----------|----------|
| 1 | positioning/ sil | positioning/*.ts |
| 2 | core/layout-factory oluştur | core/*.ts |
| 3 | Import'ları güncelle | code.ts |
| 4 | handleCreateFrame yeniden yaz | code.ts |
| 5 | Diğer handler'ları güncelle | code.ts |
| 6 | SET_POSITION deprecate | code.ts |
| 7 | Agent prompt'ları güncelle | agents/*.md |
| 8 | Final build ve test | - |

**Toplam değişiklik:** ~500 satır silme, ~300 satır ekleme
