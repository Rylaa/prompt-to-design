# Layout Core Properties Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add missing Figma Auto Layout properties (counterAxisSpacing, strokesIncludedInLayout) and Dashboard KPI Card blueprint component.

**Architecture:** Extend AutoLayoutSchema with new properties, update applyAutoLayout function to apply them, add Dashboard KPI Card as a reusable shadcn component.

**Tech Stack:** TypeScript, Zod schemas, Figma Plugin API

---

## Overview

Bu plan, playbook değerlendirmesinde eksik bulunan P1 ve P2 öğeleri kapsar:

| Priority | Feature | Status |
|----------|---------|--------|
| P1 | counterAxisSpacing | ❌ Missing |
| P1 | strokesIncludedInLayout | ❌ Missing |
| P2 | Dashboard KPI Card | ❌ Missing |

**Not:** Layout Audit Tool, Layout Plan Prompting, Component Slot Pattern ve Visual Debug Mode zaten `docs/plans/2026-01-26-advanced-auto-layout-features.md` planında kapsanmaktadır.

---

## Task 1: Add counterAxisSpacing to AutoLayoutSchema

**Files:**
- Modify: `mcp-server/src/schemas/base.ts:70-81`

**Step 1: Write the test case documentation**

counterAxisSpacing ne yapar:
- WRAP modunda satırlar/sütunlar arası boşluk
- itemSpacing ana eksen (primary axis) için
- counterAxisSpacing karşı eksen (counter axis) için
- Örnek: 3 sütunlu kart grid'de satırlar arası 24px boşluk

**Step 2: Add counterAxisSpacing to AutoLayoutSchema**

```typescript
export const AutoLayoutSchema = z.object({
  mode: z.enum(["HORIZONTAL", "VERTICAL"]).describe("Layout direction"),
  spacing: z.number().min(0).optional().default(0).describe("Gap between items on primary axis"),
  counterAxisSpacing: z.number().min(0).optional().describe("Gap between rows/columns when wrap is enabled"),
  paddingTop: z.number().min(0).optional().default(0),
  paddingRight: z.number().min(0).optional().default(0),
  paddingBottom: z.number().min(0).optional().default(0),
  paddingLeft: z.number().min(0).optional().default(0),
  padding: z.number().min(0).optional().describe("Uniform padding (overrides individual)"),
  primaryAxisAlign: z.enum(["MIN", "CENTER", "MAX", "SPACE_BETWEEN"]).optional().default("MIN"),
  counterAxisAlign: z.enum(["MIN", "CENTER", "MAX", "BASELINE"]).optional().default("MIN"),
  wrap: z.boolean().optional().default(false),
});
```

**Step 3: Build and verify no TypeScript errors**

Run: `cd mcp-server && npm run build`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add mcp-server/src/schemas/base.ts
git commit -m "$(cat <<'EOF'
feat(schema): add counterAxisSpacing to AutoLayoutSchema

Enables gap between rows/columns in WRAP mode layouts.
Essential for card grids and responsive designs.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add strokesIncludedInLayout to AutoLayoutSchema

**Files:**
- Modify: `mcp-server/src/schemas/base.ts:70-81`

**Step 1: Understand strokesIncludedInLayout**

Figma'da `strokesIncludedInLayout` property'si:
- `true`: Stroke weight layout hesaplamasına dahil edilir
- `false` (default): Stroke weight göz ardı edilir
- Önemli: Stroke'lu elementlerin boyutunu doğru hesaplamak için

**Step 2: Add strokesIncludedInLayout to AutoLayoutSchema**

```typescript
export const AutoLayoutSchema = z.object({
  mode: z.enum(["HORIZONTAL", "VERTICAL"]).describe("Layout direction"),
  spacing: z.number().min(0).optional().default(0).describe("Gap between items on primary axis"),
  counterAxisSpacing: z.number().min(0).optional().describe("Gap between rows/columns when wrap is enabled"),
  paddingTop: z.number().min(0).optional().default(0),
  paddingRight: z.number().min(0).optional().default(0),
  paddingBottom: z.number().min(0).optional().default(0),
  paddingLeft: z.number().min(0).optional().default(0),
  padding: z.number().min(0).optional().describe("Uniform padding (overrides individual)"),
  primaryAxisAlign: z.enum(["MIN", "CENTER", "MAX", "SPACE_BETWEEN"]).optional().default("MIN"),
  counterAxisAlign: z.enum(["MIN", "CENTER", "MAX", "BASELINE"]).optional().default("MIN"),
  wrap: z.boolean().optional().default(false),
  strokesIncludedInLayout: z.boolean().optional().default(false).describe("Include stroke weight in layout calculations"),
});
```

**Step 3: Build and verify**

Run: `cd mcp-server && npm run build`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add mcp-server/src/schemas/base.ts
git commit -m "$(cat <<'EOF'
feat(schema): add strokesIncludedInLayout to AutoLayoutSchema

Controls whether stroke weight is included in layout size calculations.
Important for pixel-perfect layouts with bordered elements.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Update AutoLayoutConfig type in code.ts

**Files:**
- Modify: `figma-plugin/src/code.ts` (AutoLayoutConfig interface)

**Step 1: Find AutoLayoutConfig interface**

Search for `interface AutoLayoutConfig` or `type AutoLayoutConfig` in code.ts

**Step 2: Add new properties to interface**

```typescript
interface AutoLayoutConfig {
  mode: "HORIZONTAL" | "VERTICAL";
  spacing?: number;
  counterAxisSpacing?: number;  // NEW
  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  primaryAxisAlign?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlign?: "MIN" | "CENTER" | "MAX" | "BASELINE";
  wrap?: boolean;
  strokesIncludedInLayout?: boolean;  // NEW
}
```

**Step 3: Build and verify**

Run: `cd figma-plugin && npm run build`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add figma-plugin/src/code.ts
git commit -m "$(cat <<'EOF'
feat(plugin): add counterAxisSpacing and strokesIncludedInLayout to AutoLayoutConfig

Syncs plugin interface with updated MCP schema.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Update applyAutoLayout function

**Files:**
- Modify: `figma-plugin/src/code.ts:300-316`

**Step 1: Read current applyAutoLayout implementation**

Current code:
```typescript
function applyAutoLayout(node: FrameNode, config: AutoLayoutConfig): void {
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
  }
}
```

**Step 2: Add counterAxisSpacing support**

```typescript
function applyAutoLayout(node: FrameNode, config: AutoLayoutConfig): void {
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
    // counterAxisSpacing only applies when wrap is enabled
    if (config.counterAxisSpacing !== undefined) {
      node.counterAxisSpacing = config.counterAxisSpacing;
    }
  }

  // strokesIncludedInLayout - default false
  if (config.strokesIncludedInLayout !== undefined) {
    node.strokesIncludedInLayout = config.strokesIncludedInLayout;
  }
}
```

**Step 3: Build and verify**

Run: `cd figma-plugin && npm run build`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add figma-plugin/src/code.ts
git commit -m "$(cat <<'EOF'
feat(plugin): implement counterAxisSpacing and strokesIncludedInLayout

- counterAxisSpacing sets gap between rows/columns in WRAP mode
- strokesIncludedInLayout controls stroke weight in layout calculations

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Create Dashboard KPI Card Component Schema

**Files:**
- Modify: `mcp-server/src/schemas/index.ts`

**Step 1: Design KPI Card structure**

Dashboard KPI Card yapısı:
```
┌─────────────────────────────┐
│ 📊 Total Revenue            │  ← Icon + Title
│ $45,231.89                  │  ← Value (large)
│ +20.1% from last month      │  ← Change indicator
└─────────────────────────────┘
```

**Step 2: Add KPI Card schema**

```typescript
export const KPICardInputSchema = z.object({
  title: z.string().describe("Card title (e.g., 'Total Revenue')"),
  value: z.string().describe("Main value to display (e.g., '$45,231.89')"),
  change: z.string().optional().describe("Change indicator (e.g., '+20.1% from last month')"),
  changeType: z.enum(["positive", "negative", "neutral"]).optional().default("neutral"),
  icon: z.string().optional().describe("Lucide icon name (e.g., 'dollar-sign')"),
  width: z.number().min(1).optional().default(280),
  theme: z.enum(["light", "dark"]).optional().default("dark"),
  parentId: z.string().optional().describe("Parent frame to add card to"),
});

export type KPICardInput = z.infer<typeof KPICardInputSchema>;
```

**Step 3: Build and verify**

Run: `cd mcp-server && npm run build`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add mcp-server/src/schemas/index.ts
git commit -m "$(cat <<'EOF'
feat(schema): add KPICardInputSchema for dashboard cards

Defines structure for dashboard KPI cards with title, value,
change indicator, and optional icon.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Register KPI Card MCP Tool

**Files:**
- Modify: `mcp-server/src/tools/components.ts`

**Step 1: Add KPI Card tool registration**

```typescript
import { KPICardInputSchema, KPICardInput } from "../schemas/index.js";

// In registerComponentTools function:
server.tool(
  "figma_create_kpi_card",
  "Create a dashboard KPI card with title, value, and optional change indicator",
  KPICardInputSchema.shape,
  createToolHandler<KPICardInput>("CREATE_KPI_CARD")
);
```

**Step 2: Build and verify**

Run: `cd mcp-server && npm run build`
Expected: BUILD SUCCESS

**Step 3: Commit**

```bash
git add mcp-server/src/tools/components.ts
git commit -m "$(cat <<'EOF'
feat(mcp): register figma_create_kpi_card tool

Dashboard KPI cards are a common pattern for analytics dashboards.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Implement KPI Card Handler in Figma Plugin

**Files:**
- Modify: `figma-plugin/src/code.ts`

**Step 1: Add CREATE_KPI_CARD case handler**

```typescript
case "CREATE_KPI_CARD": {
  const {
    title,
    value,
    change,
    changeType = "neutral",
    icon,
    width = 280,
    theme = "dark",
    parentId,
  } = params as {
    title: string;
    value: string;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    icon?: string;
    width?: number;
    theme?: "light" | "dark";
    parentId?: string;
  };

  const isDark = theme === "dark";
  const colors = {
    background: isDark ? "#18181B" : "#FFFFFF",
    border: isDark ? "#27272A" : "#E4E4E7",
    title: isDark ? "#A1A1AA" : "#71717A",
    value: isDark ? "#FAFAFA" : "#09090B",
    positive: "#22C55E",
    negative: "#EF4444",
    neutral: isDark ? "#A1A1AA" : "#71717A",
  };

  // Create card frame
  const card = figma.createFrame();
  card.name = `KPI Card - ${title}`;
  card.resize(width, 120);
  card.cornerRadius = 12;
  card.fills = [createSolidPaint(colors.background)];
  card.strokes = [createSolidPaint(colors.border)];
  card.strokeWeight = 1;
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "FIXED";
  card.paddingTop = 24;
  card.paddingRight = 24;
  card.paddingBottom = 24;
  card.paddingLeft = 24;
  card.itemSpacing = 8;

  // Title row (icon + title)
  const titleRow = figma.createFrame();
  titleRow.name = "Title Row";
  titleRow.layoutMode = "HORIZONTAL";
  titleRow.primaryAxisSizingMode = "AUTO";
  titleRow.counterAxisSizingMode = "AUTO";
  titleRow.itemSpacing = 8;
  titleRow.fills = [];
  card.appendChild(titleRow);
  titleRow.layoutSizingHorizontal = "FILL";

  // Icon (if provided)
  if (icon) {
    const iconFrame = await createLucideIcon(icon, 16, colors.title);
    if (iconFrame) {
      titleRow.appendChild(iconFrame);
    }
  }

  // Title text
  const titleText = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  titleText.characters = title;
  titleText.fontSize = 14;
  titleText.fontName = { family: "Inter", style: "Medium" };
  titleText.fills = [createSolidPaint(colors.title)];
  titleRow.appendChild(titleText);

  // Value text
  const valueText = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  valueText.characters = value;
  valueText.fontSize = 28;
  valueText.fontName = { family: "Inter", style: "Bold" };
  valueText.fills = [createSolidPaint(colors.value)];
  card.appendChild(valueText);
  valueText.layoutSizingHorizontal = "FILL";

  // Change indicator (if provided)
  if (change) {
    const changeText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    changeText.characters = change;
    changeText.fontSize = 12;
    changeText.fontName = { family: "Inter", style: "Regular" };
    changeText.fills = [createSolidPaint(colors[changeType])];
    card.appendChild(changeText);
    changeText.layoutSizingHorizontal = "FILL";
  }

  // Add to parent if specified
  if (parentId) {
    const parent = figma.getNodeById(parentId) as FrameNode;
    if (parent && "appendChild" in parent) {
      parent.appendChild(card);
    }
  }

  return {
    nodeId: card.id,
    name: card.name,
    width: card.width,
    height: card.height,
  };
}
```

**Step 2: Build and verify**

Run: `cd figma-plugin && npm run build`
Expected: BUILD SUCCESS

**Step 3: Test manually**

1. Load plugin in Figma
2. Call `figma_create_kpi_card` with test data
3. Verify card renders correctly

**Step 4: Commit**

```bash
git add figma-plugin/src/code.ts
git commit -m "$(cat <<'EOF'
feat(plugin): implement KPI Card component handler

Creates dashboard-style KPI cards with:
- Title with optional icon
- Large value display
- Change indicator (positive/negative/neutral)
- Dark/light theme support

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Add KPI Card to design-agent documentation

**Files:**
- Modify: `claude-plugin/agents/design-agent.md`

**Step 1: Add KPI Card to component reference**

Document KPI Card usage in design-agent:

```markdown
### Dashboard Components

**KPI Card** - Metrik kartları için:
```json
{
  "type": "kpi-card",
  "props": {
    "title": "Total Revenue",
    "value": "$45,231.89",
    "change": "+20.1% from last month",
    "changeType": "positive",
    "icon": "dollar-sign"
  }
}
```
```

**Step 2: Commit**

```bash
git add claude-plugin/agents/design-agent.md
git commit -m "$(cat <<'EOF'
docs(agent): add KPI Card component to design-agent reference

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Update execution-agent for new auto-layout properties

**Files:**
- Modify: `claude-plugin/agents/execution-agent.md`

**Step 1: Add counterAxisSpacing to documentation**

```markdown
### WRAP Grid Pattern

Card grid'ler için WRAP modu ile counterAxisSpacing kullan:

```typescript
figma_create_frame({
  name: "Card Grid",
  parentId: contentId,
  autoLayout: {
    mode: "HORIZONTAL",
    spacing: 16,           // Kartlar arası yatay boşluk
    counterAxisSpacing: 24, // Satırlar arası dikey boşluk
    wrap: true,
    padding: 16
  }
})
```
```

**Step 2: Add strokesIncludedInLayout documentation**

```markdown
### Stroke Handling

Border'lı elementler için `strokesIncludedInLayout` kullan:

```typescript
figma_create_frame({
  autoLayout: {
    mode: "VERTICAL",
    spacing: 8,
    strokesIncludedInLayout: true  // Stroke weight'i layout'a dahil et
  }
})
```
```

**Step 3: Commit**

```bash
git add claude-plugin/agents/execution-agent.md
git commit -m "$(cat <<'EOF'
docs(agent): add counterAxisSpacing and strokesIncludedInLayout docs

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Build and Integration Test

**Files:**
- All modified files

**Step 1: Build all packages**

```bash
cd mcp-server && npm run build
cd ../figma-plugin && npm run build
```

Expected: Both BUILD SUCCESS

**Step 2: Test counterAxisSpacing**

1. Load plugin in Figma
2. Create WRAP grid:
```json
{
  "autoLayout": {
    "mode": "HORIZONTAL",
    "spacing": 16,
    "counterAxisSpacing": 24,
    "wrap": true
  }
}
```
3. Add 6 child frames
4. Verify: Rows have 24px gap between them

**Step 3: Test strokesIncludedInLayout**

1. Create frame with `strokesIncludedInLayout: true`
2. Add stroked child
3. Verify: Layout accounts for stroke weight

**Step 4: Test KPI Card**

1. Call `figma_create_kpi_card`:
```json
{
  "title": "Total Revenue",
  "value": "$45,231.89",
  "change": "+20.1% from last month",
  "changeType": "positive",
  "icon": "dollar-sign",
  "theme": "dark"
}
```
2. Verify: Card renders with correct styling

**Step 5: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
test: verify layout properties and KPI card integration

All features working:
- counterAxisSpacing in WRAP mode
- strokesIncludedInLayout for bordered elements
- KPI Card component

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

Bu plan tamamlandığında:

1. ✅ **counterAxisSpacing** - WRAP grid'lerde satır/sütun arası boşluk
2. ✅ **strokesIncludedInLayout** - Stroke weight layout hesaplamasına dahil
3. ✅ **Dashboard KPI Card** - Metrik kartları için blueprint component
4. ✅ **Documentation** - Agent'lar için güncellenmis dökümantasyon

**İlgili Plan:** `docs/plans/2026-01-26-advanced-auto-layout-features.md` diğer iyileştirmeleri (MCP Linter, Layout Plan Prompting, Component Slot Pattern, Visual Debug Mode) kapsar.
