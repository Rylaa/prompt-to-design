# Advanced Auto Layout Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement remaining 4 features from "Engineering High-Fidelity Figma Automation" research: MCP Linter Loop, Layout Plan Prompting, Component Slot Pattern, and Visual Debug Mode.

**Architecture:**
- MCP Linter: New `figma_lint_layout` tool that reads generated frames and validates Auto Layout rules
- Layout Plan: Update agent prompts to require ASCII tree visualization before code generation
- Component Slot: Registry pattern for component instances with variant swapping
- Debug Mode: Optional visual indicators for spacing, sizing, and layout issues

**Tech Stack:** TypeScript, Figma Plugin API, MCP Protocol, Zod schemas

---

## Task 1: MCP Linter Tool Schema

**Files:**
- Modify: `mcp-server/src/schemas/index.ts`

**Step 1: Add LintLayoutInput schema**

Add at the end of `mcp-server/src/schemas/index.ts`:

```typescript
// ============================================
// Linter Schemas
// ============================================

export const LintLayoutInputSchema = z.object({
  nodeId: z.string().describe("Root node ID to lint"),
  rules: z.array(z.enum([
    "NO_ABSOLUTE_POSITION",
    "AUTO_LAYOUT_REQUIRED",
    "VALID_SIZING_MODE",
    "SPACING_TOKEN_ONLY",
    "FILL_REQUIRED_ON_ROOT"
  ])).optional().default([
    "NO_ABSOLUTE_POSITION",
    "AUTO_LAYOUT_REQUIRED",
    "VALID_SIZING_MODE"
  ]).describe("Rules to check"),
  recursive: z.boolean().optional().default(true).describe("Check children recursively"),
});

export type LintLayoutInput = z.infer<typeof LintLayoutInputSchema>;

export interface LintViolation {
  nodeId: string;
  nodeName: string;
  rule: string;
  message: string;
  severity: "error" | "warning";
}

export interface LintResult {
  passed: boolean;
  violations: LintViolation[];
  checkedNodes: number;
}
```

**Step 2: Commit**

```bash
git add mcp-server/src/schemas/index.ts
git commit -m "feat(schema): add LintLayoutInput schema for MCP linter"
```

---

## Task 2: MCP Linter Tool Handler

**Files:**
- Create: `mcp-server/src/tools/linter.ts`
- Modify: `mcp-server/src/tools/index.ts`

**Step 1: Create linter.ts**

Create `mcp-server/src/tools/linter.ts`:

```typescript
/**
 * Linter Tools - Post-generation layout validation
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, READONLY_ANNOTATIONS } from "./handler-factory.js";
import { LintLayoutInputSchema, type LintLayoutInput } from "../schemas/index.js";

export function registerLinterTools(server: McpServer): void {
  server.registerTool(
    "figma_lint_layout",
    {
      title: "Lint Layout",
      description: `Validate Auto Layout rules on a node tree.

Checks for common layout issues:
- NO_ABSOLUTE_POSITION: Ensures no x,y positioning is used
- AUTO_LAYOUT_REQUIRED: All frames must have Auto Layout enabled
- VALID_SIZING_MODE: Children use FILL/HUG/FIXED correctly
- SPACING_TOKEN_ONLY: Spacing values match token system (0,4,8,12,16,24,32)
- FILL_REQUIRED_ON_ROOT: Root frame must have a fill color

Args:
  - nodeId: Root node ID to lint
  - rules: Array of rules to check (default: all)
  - recursive: Check children recursively (default: true)

Returns: LintResult with passed status and violations array.`,
      inputSchema: LintLayoutInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<LintLayoutInput>("LINT_LAYOUT")
  );
}
```

**Step 2: Register in index.ts**

Add to `mcp-server/src/tools/index.ts`:

```typescript
// Add import at top
import { registerLinterTools } from "./linter.js";

// Add in registerAllTools function (after registerQueryTools)
  // Linting & Validation
  registerLinterTools(server);
```

**Step 3: Commit**

```bash
git add mcp-server/src/tools/linter.ts mcp-server/src/tools/index.ts
git commit -m "feat(mcp): add figma_lint_layout tool for post-generation validation"
```

---

## Task 3: Figma Plugin Linter Handler

**Files:**
- Modify: `figma-plugin/src/code.ts`

**Step 1: Add LINT_LAYOUT handler**

Find the switch statement in `handleCommand` function and add new case before the default case:

```typescript
    case "LINT_LAYOUT": {
      const { nodeId, rules, recursive } = params as {
        nodeId: string;
        rules: string[];
        recursive: boolean;
      };

      const VALID_SPACING = [0, 4, 8, 12, 16, 24, 32];
      const violations: Array<{
        nodeId: string;
        nodeName: string;
        rule: string;
        message: string;
        severity: "error" | "warning";
      }> = [];
      let checkedNodes = 0;

      function lintNode(node: SceneNode): void {
        checkedNodes++;

        // NO_ABSOLUTE_POSITION check
        if (rules.includes("NO_ABSOLUTE_POSITION")) {
          if ("x" in node && "y" in node) {
            const parent = node.parent;
            if (parent && "layoutMode" in parent && parent.layoutMode === "NONE") {
              violations.push({
                nodeId: node.id,
                nodeName: node.name,
                rule: "NO_ABSOLUTE_POSITION",
                message: `Node uses absolute positioning (x: ${node.x}, y: ${node.y}) instead of Auto Layout`,
                severity: "error",
              });
            }
          }
        }

        // AUTO_LAYOUT_REQUIRED check
        if (rules.includes("AUTO_LAYOUT_REQUIRED")) {
          if (node.type === "FRAME" || node.type === "COMPONENT") {
            const frameNode = node as FrameNode;
            if (frameNode.layoutMode === "NONE" && frameNode.children.length > 0) {
              violations.push({
                nodeId: node.id,
                nodeName: node.name,
                rule: "AUTO_LAYOUT_REQUIRED",
                message: `Frame has children but no Auto Layout enabled`,
                severity: "error",
              });
            }
          }
        }

        // VALID_SIZING_MODE check
        if (rules.includes("VALID_SIZING_MODE")) {
          if ("layoutSizingHorizontal" in node) {
            const frameNode = node as FrameNode;
            const validModes = ["FIXED", "HUG", "FILL"];
            if (!validModes.includes(frameNode.layoutSizingHorizontal)) {
              violations.push({
                nodeId: node.id,
                nodeName: node.name,
                rule: "VALID_SIZING_MODE",
                message: `Invalid horizontal sizing mode: ${frameNode.layoutSizingHorizontal}`,
                severity: "warning",
              });
            }
          }
        }

        // SPACING_TOKEN_ONLY check
        if (rules.includes("SPACING_TOKEN_ONLY")) {
          if ("itemSpacing" in node) {
            const frameNode = node as FrameNode;
            if (!VALID_SPACING.includes(frameNode.itemSpacing)) {
              violations.push({
                nodeId: node.id,
                nodeName: node.name,
                rule: "SPACING_TOKEN_ONLY",
                message: `Item spacing ${frameNode.itemSpacing}px is not a valid token (use: ${VALID_SPACING.join(", ")})`,
                severity: "warning",
              });
            }
          }
        }

        // FILL_REQUIRED_ON_ROOT check (only for root node)
        if (rules.includes("FILL_REQUIRED_ON_ROOT") && node.id === nodeId) {
          if ("fills" in node) {
            const fills = node.fills as readonly Paint[];
            if (!fills || fills.length === 0) {
              violations.push({
                nodeId: node.id,
                nodeName: node.name,
                rule: "FILL_REQUIRED_ON_ROOT",
                message: `Root frame has no fill - content may be invisible`,
                severity: "error",
              });
            }
          }
        }

        // Recursive check
        if (recursive && "children" in node) {
          for (const child of node.children) {
            lintNode(child);
          }
        }
      }

      const rootNode = figma.getNodeById(nodeId);
      if (!rootNode) {
        throw new Error(`Node ${nodeId} not found`);
      }

      lintNode(rootNode as SceneNode);

      return {
        passed: violations.filter(v => v.severity === "error").length === 0,
        violations,
        checkedNodes,
      };
    }
```

**Step 2: Commit**

```bash
git add figma-plugin/src/code.ts
git commit -m "feat(plugin): implement LINT_LAYOUT handler for layout validation"
```

---

## Task 4: Build and Test Linter

**Step 1: Build MCP server**

```bash
cd mcp-server && npm run build
```

Expected: Build succeeds without errors

**Step 2: Build Figma plugin**

```bash
cd figma-plugin && npm run build
```

Expected: Build succeeds without errors

**Step 3: Manual test**

1. Open Figma with plugin loaded
2. Create a frame without Auto Layout
3. Call `figma_lint_layout` with frame's nodeId
4. Verify violations are returned

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build issues for linter feature"
```

---

## Task 5: Layout Plan Prompting - Design Agent Update

**Files:**
- Modify: `claude-plugin/agents/design-agent.md`

**Step 1: Add layout_plan section**

Find the "## Calisma Akisi" section and add before it:

```markdown
## ⚠️ LAYOUT PLAN ZORUNLU (Chain-of-Thought)

JSON plan olusturmadan ONCE, ekranin yapisini ASCII tree olarak dusun:

### Layout Plan Formati

```
<layout_plan>
Dashboard [VERTICAL, FILL]
├── Header [HORIZONTAL, FILL]
│   ├── Title [TEXT, HUG]
│   └── Avatar [FIXED 40x40]
├── Content [VERTICAL, FILL]
│   ├── StatsRow [HORIZONTAL, FILL]
│   │   ├── StatCard [VERTICAL, FILL]
│   │   └── StatCard [VERTICAL, FILL]
│   └── ChartCard [VERTICAL, FILL]
└── Footer [HORIZONTAL, FILL]
    └── TabBar [HORIZONTAL, FILL]
</layout_plan>
```

### Layout Plan Kurallari

1. **Her node icin belirt:**
   - Isim
   - Layout yonu: VERTICAL veya HORIZONTAL
   - Sizing: FILL, HUG, veya FIXED (boyutla)

2. **Hierarchy goster:**
   - `├──` child
   - `└──` son child
   - `│` devam eden branch

3. **JSON'dan ONCE yaz:**
   - Onceplan, sonra JSON
   - Plan olmadan JSON yazma!

### Ornek Workflow

```
Kullanici: "Dashboard ekrani tasarla"

<layout_plan>
Dashboard [VERTICAL, FILL]
├── Header [HORIZONTAL, FILL, h:60]
│   ├── Title "Dashboard" [TEXT, HUG]
│   └── SettingsIcon [FIXED 24x24]
├── Content [VERTICAL, FILL, padding:16, gap:16]
│   ├── HeroCard [VERTICAL, FILL, gradient]
│   │   ├── Label "MRR" [TEXT, HUG]
│   │   └── Value "$124K" [TEXT, HUG]
│   ├── StatsRow [HORIZONTAL, FILL, gap:12]
│   │   ├── StatCard [VERTICAL, FILL]
│   │   └── StatCard [VERTICAL, FILL]
│   └── StatsRow [HORIZONTAL, FILL, gap:12]
│       ├── StatCard [VERTICAL, FILL]
│       └── StatCard [VERTICAL, FILL]
└── TabBar [HORIZONTAL, FILL, h:80]
</layout_plan>

Simdi JSON plan:
{
  "screenName": "Dashboard",
  ...
}
```
```

**Step 2: Commit**

```bash
git add claude-plugin/agents/design-agent.md
git commit -m "feat(agent): add mandatory layout_plan Chain-of-Thought prompting"
```

---

## Task 6: Layout Plan Prompting - Execution Agent Update

**Files:**
- Modify: `claude-plugin/agents/execution-agent.md`

**Step 1: Add layout_plan validation**

Find "## Plan Formati" section and add before it:

```markdown
## ⚠️ LAYOUT PLAN KONTROLU

Eger gelen plan'da `<layout_plan>` yoksa:
1. Plan eksik, Design Agent'i uyar
2. Devam etme, layout_plan olmadan calisma

Layout plan'i kullanarak:
1. Hierarchy'yi dogrula
2. Her node'un sizing'ini kontrol et
3. Parent-child iliskilerini takip et

### Layout Plan Okuma

```
Dashboard [VERTICAL, FILL]        → Ana frame: VERTICAL auto-layout, FILL sizing
├── Header [HORIZONTAL, FILL]     → Header: HORIZONTAL, yatayda FILL
│   ├── Title [TEXT, HUG]         → Text node, HUG sizing
│   └── Avatar [FIXED 40x40]      → 40x40 sabit boyut
```

Her satir:
- `[VERTICAL/HORIZONTAL]` → autoLayout.mode
- `[FILL]` → layoutSizing: FILL
- `[HUG]` → layoutSizing: HUG
- `[FIXED WxH]` → sabit boyut

```

**Step 2: Commit**

```bash
git add claude-plugin/agents/execution-agent.md
git commit -m "feat(agent): add layout_plan validation to execution-agent"
```

---

## Task 7: Component Registry Schema

**Files:**
- Modify: `mcp-server/src/schemas/index.ts`

**Step 1: Add ComponentRegistry schemas**

Add to `mcp-server/src/schemas/index.ts`:

```typescript
// ============================================
// Component Registry Schemas (Slot Pattern)
// ============================================

export const RegisterComponentSlotInputSchema = z.object({
  nodeId: z.string().describe("Component or ComponentSet node ID"),
  slotKey: z.string().describe("Unique key for this component (e.g., 'Button/primary')"),
  variants: z.record(z.string(), z.string()).optional().describe("Variant name to node ID mapping"),
});

export type RegisterComponentSlotInput = z.infer<typeof RegisterComponentSlotInputSchema>;

export const CreateFromSlotInputSchema = z.object({
  slotKey: z.string().describe("Registered component slot key"),
  variant: z.string().optional().describe("Variant to use"),
  parentId: z.string().optional().describe("Parent frame to add instance to"),
  overrides: z.record(z.string(), z.unknown()).optional().describe("Property overrides (text, fills, etc.)"),
});

export type CreateFromSlotInput = z.infer<typeof CreateFromSlotInputSchema>;

export const ListComponentSlotsInputSchema = z.object({
  filter: z.string().optional().describe("Filter by slot key prefix"),
});

export type ListComponentSlotsInput = z.infer<typeof ListComponentSlotsInputSchema>;
```

**Step 2: Commit**

```bash
git add mcp-server/src/schemas/index.ts
git commit -m "feat(schema): add ComponentRegistry schemas for slot pattern"
```

---

## Task 8: Component Registry Tool

**Files:**
- Create: `mcp-server/src/tools/component-registry.ts`
- Modify: `mcp-server/src/tools/index.ts`

**Step 1: Create component-registry.ts**

Create `mcp-server/src/tools/component-registry.ts`:

```typescript
/**
 * Component Registry Tools - Slot Pattern for component reuse
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS, READONLY_ANNOTATIONS } from "./handler-factory.js";
import {
  RegisterComponentSlotInputSchema,
  CreateFromSlotInputSchema,
  ListComponentSlotsInputSchema,
  type RegisterComponentSlotInput,
  type CreateFromSlotInput,
  type ListComponentSlotsInput,
} from "../schemas/index.js";

export function registerComponentRegistryTools(server: McpServer): void {
  server.registerTool(
    "figma_register_component_slot",
    {
      title: "Register Component Slot",
      description: `Register a component for reuse via the slot pattern.

Once registered, use figma_create_from_slot to create instances without
redrawing the component each time.

Args:
  - nodeId: Component or ComponentSet node ID
  - slotKey: Unique key (e.g., 'Button/primary', 'Card/elevated')
  - variants: Optional variant name to node ID mapping

Returns: Confirmation with registered slot key.`,
      inputSchema: RegisterComponentSlotInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<RegisterComponentSlotInput>("REGISTER_COMPONENT_SLOT")
  );

  server.registerTool(
    "figma_create_from_slot",
    {
      title: "Create From Slot",
      description: `Create a component instance from a registered slot.

Much faster than redrawing components - uses Figma's native instance system.

Args:
  - slotKey: Registered component slot key
  - variant: Optional variant to use
  - parentId: Parent frame to add instance to
  - overrides: Property overrides (text, fills, etc.)

Returns: Instance node ID.`,
      inputSchema: CreateFromSlotInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<CreateFromSlotInput>("CREATE_FROM_SLOT")
  );

  server.registerTool(
    "figma_list_component_slots",
    {
      title: "List Component Slots",
      description: `List all registered component slots.

Args:
  - filter: Optional filter by slot key prefix

Returns: Array of registered slots with their variants.`,
      inputSchema: ListComponentSlotsInputSchema,
      annotations: READONLY_ANNOTATIONS,
    },
    createToolHandler<ListComponentSlotsInput>("LIST_COMPONENT_SLOTS")
  );
}
```

**Step 2: Register in index.ts**

Add to `mcp-server/src/tools/index.ts`:

```typescript
// Add import at top
import { registerComponentRegistryTools } from "./component-registry.js";

// Add in registerAllTools function (after registerComponentLibraryTools)
  // Component Registry (Slot Pattern)
  registerComponentRegistryTools(server);
```

**Step 3: Commit**

```bash
git add mcp-server/src/tools/component-registry.ts mcp-server/src/tools/index.ts
git commit -m "feat(mcp): add component registry tools for slot pattern"
```

---

## Task 9: Component Registry Plugin Handler

**Files:**
- Modify: `figma-plugin/src/code.ts`

**Step 1: Add component registry storage**

At the top of the file, after imports, add:

```typescript
// Component Slot Registry - stores registered components for reuse
const componentSlotRegistry = new Map<string, {
  nodeId: string;
  variants: Record<string, string>;
}>();
```

**Step 2: Add handlers**

Add these cases to the switch statement:

```typescript
    case "REGISTER_COMPONENT_SLOT": {
      const { nodeId, slotKey, variants } = params as {
        nodeId: string;
        slotKey: string;
        variants?: Record<string, string>;
      };

      const node = figma.getNodeById(nodeId);
      if (!node) {
        throw new Error(`Node ${nodeId} not found`);
      }

      if (node.type !== "COMPONENT" && node.type !== "COMPONENT_SET") {
        throw new Error(`Node must be a Component or ComponentSet, got ${node.type}`);
      }

      componentSlotRegistry.set(slotKey, {
        nodeId,
        variants: variants || {},
      });

      return {
        success: true,
        slotKey,
        message: `Registered component slot: ${slotKey}`,
      };
    }

    case "CREATE_FROM_SLOT": {
      const { slotKey, variant, parentId, overrides } = params as {
        slotKey: string;
        variant?: string;
        parentId?: string;
        overrides?: Record<string, unknown>;
      };

      const slot = componentSlotRegistry.get(slotKey);
      if (!slot) {
        throw new Error(`Slot ${slotKey} not found. Available: ${Array.from(componentSlotRegistry.keys()).join(", ")}`);
      }

      let componentNode: ComponentNode;

      if (variant && slot.variants[variant]) {
        const variantNode = figma.getNodeById(slot.variants[variant]);
        if (!variantNode || variantNode.type !== "COMPONENT") {
          throw new Error(`Variant ${variant} node not found or not a component`);
        }
        componentNode = variantNode as ComponentNode;
      } else {
        const node = figma.getNodeById(slot.nodeId);
        if (!node) {
          throw new Error(`Component node ${slot.nodeId} not found`);
        }
        if (node.type === "COMPONENT_SET") {
          componentNode = (node as ComponentSetNode).defaultVariant;
        } else if (node.type === "COMPONENT") {
          componentNode = node as ComponentNode;
        } else {
          throw new Error(`Invalid node type: ${node.type}`);
        }
      }

      const instance = componentNode.createInstance();

      if (parentId) {
        const parent = figma.getNodeById(parentId);
        if (parent && "appendChild" in parent) {
          (parent as FrameNode).appendChild(instance);
        }
      }

      // Apply overrides
      if (overrides) {
        // Text override
        if (overrides.text && typeof overrides.text === "string") {
          const textNode = instance.findOne(n => n.type === "TEXT") as TextNode;
          if (textNode) {
            await figma.loadFontAsync(textNode.fontName as FontName);
            textNode.characters = overrides.text;
          }
        }
      }

      return {
        nodeId: instance.id,
        name: instance.name,
        slotKey,
      };
    }

    case "LIST_COMPONENT_SLOTS": {
      const { filter } = params as { filter?: string };

      const slots: Array<{
        slotKey: string;
        nodeId: string;
        variants: string[];
      }> = [];

      for (const [key, value] of componentSlotRegistry.entries()) {
        if (!filter || key.startsWith(filter)) {
          slots.push({
            slotKey: key,
            nodeId: value.nodeId,
            variants: Object.keys(value.variants),
          });
        }
      }

      return { slots };
    }
```

**Step 3: Commit**

```bash
git add figma-plugin/src/code.ts
git commit -m "feat(plugin): implement component slot registry handlers"
```

---

## Task 10: Visual Debug Mode Schema

**Files:**
- Modify: `mcp-server/src/schemas/index.ts`

**Step 1: Add Debug Mode schemas**

Add to `mcp-server/src/schemas/index.ts`:

```typescript
// ============================================
// Debug Mode Schemas
// ============================================

export const EnableDebugModeInputSchema = z.object({
  nodeId: z.string().describe("Root node to debug"),
  showSpacing: z.boolean().optional().default(true).describe("Show spacing indicators"),
  showSizing: z.boolean().optional().default(true).describe("Show sizing mode labels"),
  showBounds: z.boolean().optional().default(false).describe("Show bounding boxes"),
  highlightIssues: z.boolean().optional().default(true).describe("Highlight lint violations"),
});

export type EnableDebugModeInput = z.infer<typeof EnableDebugModeInputSchema>;

export const DisableDebugModeInputSchema = z.object({
  nodeId: z.string().describe("Root node to clear debug visuals from"),
});

export type DisableDebugModeInput = z.infer<typeof DisableDebugModeInputSchema>;
```

**Step 2: Commit**

```bash
git add mcp-server/src/schemas/index.ts
git commit -m "feat(schema): add debug mode schemas"
```

---

## Task 11: Visual Debug Mode Tool

**Files:**
- Create: `mcp-server/src/tools/debug.ts`
- Modify: `mcp-server/src/tools/index.ts`

**Step 1: Create debug.ts**

Create `mcp-server/src/tools/debug.ts`:

```typescript
/**
 * Debug Tools - Visual debugging for layout issues
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";
import {
  EnableDebugModeInputSchema,
  DisableDebugModeInputSchema,
  type EnableDebugModeInput,
  type DisableDebugModeInput,
} from "../schemas/index.js";

export function registerDebugTools(server: McpServer): void {
  server.registerTool(
    "figma_enable_debug_mode",
    {
      title: "Enable Debug Mode",
      description: `Enable visual debugging overlays on a node tree.

Shows:
- Spacing indicators (gap, padding values)
- Sizing mode labels (FILL, HUG, FIXED)
- Layout direction arrows
- Lint violation highlights

Useful for understanding why layouts don't match expectations.

Args:
  - nodeId: Root node to debug
  - showSpacing: Show spacing indicators (default: true)
  - showSizing: Show sizing mode labels (default: true)
  - showBounds: Show bounding boxes (default: false)
  - highlightIssues: Highlight lint violations (default: true)

Returns: Debug overlay node IDs (for cleanup).`,
      inputSchema: EnableDebugModeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<EnableDebugModeInput>("ENABLE_DEBUG_MODE")
  );

  server.registerTool(
    "figma_disable_debug_mode",
    {
      title: "Disable Debug Mode",
      description: `Remove debug overlays from a node tree.

Args:
  - nodeId: Root node to clear debug visuals from

Returns: Success confirmation.`,
      inputSchema: DisableDebugModeInputSchema,
      annotations: DEFAULT_ANNOTATIONS,
    },
    createToolHandler<DisableDebugModeInput>("DISABLE_DEBUG_MODE")
  );
}
```

**Step 2: Register in index.ts**

Add to `mcp-server/src/tools/index.ts`:

```typescript
// Add import at top
import { registerDebugTools } from "./debug.js";

// Add in registerAllTools function (at the end, before closing brace)
  // Debug & Development
  registerDebugTools(server);
```

**Step 3: Commit**

```bash
git add mcp-server/src/tools/debug.ts mcp-server/src/tools/index.ts
git commit -m "feat(mcp): add visual debug mode tools"
```

---

## Task 12: Visual Debug Mode Plugin Handler

**Files:**
- Modify: `figma-plugin/src/code.ts`

**Step 1: Add debug overlay storage**

After the componentSlotRegistry declaration, add:

```typescript
// Debug overlay storage - tracks debug annotations
const debugOverlays = new Map<string, string[]>();
```

**Step 2: Add handlers**

Add these cases to the switch statement:

```typescript
    case "ENABLE_DEBUG_MODE": {
      const { nodeId, showSpacing, showSizing, showBounds, highlightIssues } = params as {
        nodeId: string;
        showSpacing: boolean;
        showSizing: boolean;
        showBounds: boolean;
        highlightIssues: boolean;
      };

      const rootNode = figma.getNodeById(nodeId);
      if (!rootNode) {
        throw new Error(`Node ${nodeId} not found`);
      }

      const overlayIds: string[] = [];

      async function addDebugOverlay(node: SceneNode): Promise<void> {
        if (!("layoutMode" in node)) return;

        const frame = node as FrameNode;

        // Create debug annotation frame
        const annotation = figma.createFrame();
        annotation.name = `__debug_${node.id}`;
        annotation.fills = [];
        annotation.layoutMode = "VERTICAL";
        annotation.primaryAxisSizingMode = "AUTO";
        annotation.counterAxisSizingMode = "AUTO";
        annotation.itemSpacing = 2;

        // Position at top-left of node
        annotation.x = frame.absoluteTransform[0][2];
        annotation.y = frame.absoluteTransform[1][2] - 20;

        // Add sizing label
        if (showSizing && "layoutSizingHorizontal" in frame) {
          const label = figma.createText();
          await figma.loadFontAsync({ family: "Inter", style: "Bold" });
          label.fontName = { family: "Inter", style: "Bold" };
          label.characters = `${frame.layoutSizingHorizontal}×${frame.layoutSizingVertical}`;
          label.fontSize = 8;
          label.fills = [{ type: "SOLID", color: { r: 0, g: 0.6, b: 1 } }];
          annotation.appendChild(label);
        }

        // Add spacing label
        if (showSpacing && frame.layoutMode !== "NONE") {
          const spacingLabel = figma.createText();
          await figma.loadFontAsync({ family: "Inter", style: "Regular" });
          spacingLabel.fontName = { family: "Inter", style: "Regular" };
          spacingLabel.characters = `gap:${frame.itemSpacing} p:${frame.paddingTop}`;
          spacingLabel.fontSize = 7;
          spacingLabel.fills = [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 } }];
          annotation.appendChild(spacingLabel);
        }

        // Highlight issues
        if (highlightIssues) {
          if (frame.layoutMode === "NONE" && frame.children.length > 0) {
            const warning = figma.createText();
            await figma.loadFontAsync({ family: "Inter", style: "Bold" });
            warning.fontName = { family: "Inter", style: "Bold" };
            warning.characters = "⚠️ NO AUTO-LAYOUT";
            warning.fontSize = 8;
            warning.fills = [{ type: "SOLID", color: { r: 1, g: 0.3, b: 0.3 } }];
            annotation.appendChild(warning);
          }
        }

        figma.currentPage.appendChild(annotation);
        overlayIds.push(annotation.id);

        // Recursively process children
        if ("children" in frame) {
          for (const child of frame.children) {
            await addDebugOverlay(child);
          }
        }
      }

      await addDebugOverlay(rootNode as SceneNode);
      debugOverlays.set(nodeId, overlayIds);

      return {
        success: true,
        overlayCount: overlayIds.length,
        overlayIds,
      };
    }

    case "DISABLE_DEBUG_MODE": {
      const { nodeId } = params as { nodeId: string };

      const overlayIds = debugOverlays.get(nodeId);
      if (!overlayIds) {
        return { success: true, message: "No debug overlays found" };
      }

      let removed = 0;
      for (const id of overlayIds) {
        const node = figma.getNodeById(id);
        if (node) {
          node.remove();
          removed++;
        }
      }

      debugOverlays.delete(nodeId);

      return {
        success: true,
        removed,
      };
    }
```

**Step 3: Commit**

```bash
git add figma-plugin/src/code.ts
git commit -m "feat(plugin): implement visual debug mode handlers"
```

---

## Task 13: Final Build and Verification

**Step 1: Build all packages**

```bash
cd mcp-server && npm run build
cd ../figma-plugin && npm run build
```

Expected: Both builds succeed without errors

**Step 2: Verify new tools are registered**

Check that MCP server lists new tools:
- `figma_lint_layout`
- `figma_register_component_slot`
- `figma_create_from_slot`
- `figma_list_component_slots`
- `figma_enable_debug_mode`
- `figma_disable_debug_mode`

**Step 3: Update agent tools list**

Modify `claude-plugin/agents/execution-agent.md` tools section to add:

```yaml
tools:
  # ... existing tools ...
  - mcp__prompt-to-design__figma_lint_layout
```

Modify `claude-plugin/agents/design-agent.md` to add linter mention:

```markdown
### Adim 4: Lint Kontrolu (Opsiyonel)

Execution Agent tamamladiktan sonra, lint kontrolu yapilabilir:

```typescript
figma_lint_layout({
  nodeId: screenNodeId,
  rules: ["AUTO_LAYOUT_REQUIRED", "VALID_SIZING_MODE"]
})
```
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete advanced auto layout features implementation

- MCP Linter Loop for post-generation validation
- Layout Plan (Chain-of-Thought) prompting in agents
- Component Slot Pattern for efficient reuse
- Visual Debug Mode for development
"
```

---

## Summary

| Task | Feature | Status |
|------|---------|--------|
| 1-4 | MCP Linter Loop | Schema + Tool + Handler |
| 5-6 | Layout Plan Prompting | Agent updates |
| 7-9 | Component Slot Pattern | Schema + Tool + Handler |
| 10-12 | Visual Debug Mode | Schema + Tool + Handler |
| 13 | Final verification | Build + Test |

**Total: 13 tasks**

After completion, the implementation will match 100% of the research document recommendations.
