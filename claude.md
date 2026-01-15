# Prompt-to-Design

AI-powered Figma design automation via Claude Code CLI.

## Overview

Natural language prompts → Figma designs. MCP server bridges Claude and Figma Plugin via WebSocket.

```
User: "Create a blue button with rounded corners"
     ↓
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Claude Code    │────▶│   MCP Server     │────▶│  Figma Plugin   │
│  (CLI/stdio)    │     │  (WS:9001)       │     │  (Plugin API)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          ↓
                                                 ✨ Design in Figma
```

## Tech Stack

- **Language**: TypeScript (ES2022, strict mode)
- **Runtime**: Node.js v18+
- **Protocol**: MCP (Model Context Protocol)
- **Communication**: WebSocket (ws://localhost:9001)
- **Validation**: Zod schemas
- **Build**: esbuild (plugin), tsc (servers)

## Directory Structure

```
prompt-to-design/
├── figma-plugin/           # Figma Plugin
│   ├── src/
│   │   ├── code.ts         # Main plugin logic
│   │   ├── ui.html         # Plugin UI
│   │   ├── components/     # Design system components
│   │   │   ├── shadcn/
│   │   │   ├── apple-ios/
│   │   │   ├── apple-macos/
│   │   │   └── liquid-glass/
│   │   ├── icons/          # Lucide SVG icons
│   │   └── tokens/         # Design tokens
│   └── manifest.json
│
├── mcp-server/             # MCP Server (100+ tools)
│   ├── src/
│   │   ├── index.ts        # Entry point
│   │   ├── embedded-ws-server.ts
│   │   ├── websocket-bridge.ts
│   │   ├── tools/          # Tool modules
│   │   │   ├── index.ts
│   │   │   ├── shapes.ts
│   │   │   ├── text.ts
│   │   │   ├── components.ts
│   │   │   ├── design-system.ts
│   │   │   ├── layout.ts
│   │   │   ├── styling.ts
│   │   │   └── ...
│   │   └── schemas/        # Zod schemas
│   └── package.json
│
├── websocket-server/       # Standalone WS bridge
│   └── src/index.ts
│
└── docs/
    └── SETUP_GUIDE.md
```

## MCP Tool Categories

| Module | Tools | Purpose |
|--------|-------|---------|
| shapes.ts | frame, rectangle, ellipse, line, polygon, star, vector | Basic shapes |
| text.ts | text, set_text_content, list_fonts | Text operations |
| components.ts | button, input, card, ui_component | UI components |
| design-system.ts | shadcn, apple, liquid_glass | Design libraries |
| layout.ts | autolayout, constraints, position, resize | Layout system |
| styling.ts | fill, stroke, effects, opacity, blend_mode | Appearance |
| transform.ts | rotation, scale, transform_matrix | Transformations |
| manipulation.ts | move, delete, clone, group, ungroup | Node operations |
| query.ts | selection, find_nodes, get_node_info | Node queries |
| icons.ts | create_icon, list_icons | Lucide icons |
| prototype.ts | reactions, flows | Prototyping |
| export.ts | export_node, export_multiple | PNG/JPG/SVG/PDF |

## Adding New MCP Tool

### 1. Define Zod Schema (mcp-server/src/schemas/index.ts)

```typescript
export const CreateMyComponentInputSchema = z.object({
  name: z.string().optional().default("MyComponent"),
  width: z.number().min(1).default(100),
  height: z.number().min(1).default(100),
  fill: FillSchema.optional(),
  parentId: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
});

export type CreateMyComponentInput = z.infer<typeof CreateMyComponentInputSchema>;
```

### 2. Create Tool Handler (mcp-server/src/tools/my-tool.ts)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CreateMyComponentInputSchema, CreateMyComponentInput } from "../schemas/index.js";
import { createToolHandler, DEFAULT_ANNOTATIONS } from "./handler-factory.js";

export function registerMyTools(server: McpServer): void {
  server.tool(
    "figma_create_my_component",
    "Create a custom component in Figma",
    CreateMyComponentInputSchema.shape,
    createToolHandler<CreateMyComponentInput>("CREATE_MY_COMPONENT")
  );
}
```

### 3. Register in Index (mcp-server/src/tools/index.ts)

```typescript
import { registerMyTools } from "./my-tool.js";

export function registerAllTools(server: McpServer): void {
  // ... existing registrations
  registerMyTools(server);
}
```

### 4. Handle in Figma Plugin (figma-plugin/src/code.ts)

```typescript
case "CREATE_MY_COMPONENT": {
  const { name, width, height, fill, parentId, x, y } = params;

  const frame = figma.createFrame();
  frame.name = name;
  frame.resize(width, height);

  if (fill) {
    frame.fills = [convertToFigmaPaint(fill)];
  }

  if (parentId) {
    const parent = figma.getNodeById(parentId) as FrameNode;
    if (parent) parent.appendChild(frame);
  }

  if (x !== undefined && y !== undefined) {
    frame.x = x;
    frame.y = y;
  }

  return { nodeId: frame.id, name: frame.name };
}
```

## Common Zod Patterns

### Color Schema
```typescript
const ColorSchema = z.union([
  z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  z.object({
    r: z.number().min(0).max(1),
    g: z.number().min(0).max(1),
    b: z.number().min(0).max(1),
    a: z.number().min(0).max(1).optional().default(1),
  }),
]);
```

### Fill Schema
```typescript
const SolidFillSchema = z.object({
  type: z.literal("SOLID"),
  color: ColorSchema,
  opacity: z.number().min(0).max(1).optional(),
});

const GradientFillSchema = z.object({
  type: z.literal("GRADIENT"),
  gradient: z.object({
    type: z.enum(["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"]).default("LINEAR"),
    stops: z.array(z.object({
      position: z.number().min(0).max(1),
      color: ColorSchema,
    })).min(2),
    angle: z.number().optional(),
  }),
});

const FillSchema = z.union([SolidFillSchema, GradientFillSchema]);
```

### Effect Schema
```typescript
const ShadowEffectSchema = z.object({
  type: z.enum(["DROP_SHADOW", "INNER_SHADOW"]).default("DROP_SHADOW"),
  color: ColorSchema.optional().default("#000000"),
  offsetX: z.number().default(0),
  offsetY: z.number().default(4),
  blur: z.number().min(0).default(8),
  spread: z.number().default(0),
  opacity: z.number().min(0).max(1).default(0.1),
});

const BlurEffectSchema = z.object({
  type: z.enum(["LAYER_BLUR", "BACKGROUND_BLUR"]).default("LAYER_BLUR"),
  radius: z.number().min(0),
});

const EffectSchema = z.union([ShadowEffectSchema, BlurEffectSchema]);
```

### Auto-Layout Schema
```typescript
const AutoLayoutSchema = z.object({
  mode: z.enum(["HORIZONTAL", "VERTICAL"]),
  spacing: z.number().min(0).default(0),
  padding: z.number().min(0).optional(),
  paddingTop: z.number().min(0).default(0),
  paddingRight: z.number().min(0).default(0),
  paddingBottom: z.number().min(0).default(0),
  paddingLeft: z.number().min(0).default(0),
  primaryAxisAlign: z.enum(["MIN", "CENTER", "MAX", "SPACE_BETWEEN"]).default("MIN"),
  counterAxisAlign: z.enum(["MIN", "CENTER", "MAX", "BASELINE"]).default("MIN"),
  wrap: z.boolean().default(false),
});
```

## Design Systems

### shadcn/ui Components
```typescript
// Available: button, input, textarea, card, badge, avatar, checkbox,
// radio, switch, progress, slider, skeleton, alert, toast, tabs,
// separator, dialog, sheet, select, dropdown-menu, tooltip, popover,
// table, data-table, accordion, collapsible

figma_create_shadcn_component({
  component: "button",
  variant: "default",  // default, destructive, outline, secondary, ghost, link
  size: "default",     // sm, default, lg, icon
  text: "Click me",
  theme: "light",      // light, dark
});
```

### Apple iOS Components
```typescript
// Available: button, navigation-bar, search-bar, tab-bar, cell, toggle, list

figma_create_apple_component({
  platform: "ios",
  component: "button",
  style: "filled",     // filled, tinted, gray, plain
  text: "Continue",
  theme: "light",
});
```

### Apple macOS Components
```typescript
// Available: window, title-bar, sidebar, button, checkbox, text-field

figma_create_apple_component({
  platform: "macos",
  component: "window",
  variant: "document", // document, utility, panel
  title: "My App",
  hasSidebar: true,
  hasToolbar: true,
});
```

### Liquid Glass (iOS 26)
```typescript
// Available: button, tab-bar, navigation-bar, card, toggle,
// sidebar, floating-panel, modal, search-bar, toolbar

figma_create_liquid_glass_component({
  component: "button",
  text: "Glass Button",
  material: "regular", // thin, regular, thick, ultraThin
  theme: "light",
  tint: "#007AFF",
});
```

## WebSocket Message Protocol

### Message Structure
```typescript
interface Message {
  type: "COMMAND" | "RESPONSE" | "PING" | "PONG" | "REGISTER";
  id?: string;           // Unique message ID
  source?: "mcp" | "figma";
  action?: string;       // Command action (e.g., "CREATE_FRAME")
  params?: object;       // Command parameters
  success?: boolean;     // Response status
  data?: unknown;        // Response data
  error?: string;        // Error message
}
```

### Command Flow
```typescript
// MCP sends command
{ type: "COMMAND", id: "abc123", action: "CREATE_FRAME", params: { width: 400 } }

// Figma responds
{ type: "RESPONSE", id: "abc123", success: true, data: { nodeId: "1:23" } }

// Or error
{ type: "RESPONSE", id: "abc123", success: false, error: "Invalid params" }
```

### Heartbeat
```typescript
// MCP → Figma (every 15s)
{ type: "PING" }

// Figma → MCP
{ type: "PONG" }

// Timeout: 45s without PONG = connection lost
```

## Figma Plugin API Patterns

### Creating Nodes
```typescript
// Frame with auto-layout
const frame = figma.createFrame();
frame.name = "Container";
frame.resize(400, 300);
frame.layoutMode = "VERTICAL";
frame.primaryAxisSizingMode = "AUTO";
frame.counterAxisSizingMode = "AUTO";
frame.itemSpacing = 16;
frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = 24;

// Rectangle
const rect = figma.createRectangle();
rect.resize(100, 100);
rect.cornerRadius = 8;
rect.fills = [{ type: "SOLID", color: { r: 0, g: 0.5, b: 1 } }];

// Text
const text = figma.createText();
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
text.characters = "Hello World";
text.fontSize = 24;
text.fontName = { family: "Inter", style: "Bold" };
```

### Styling
```typescript
// Solid fill
node.fills = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];

// Gradient fill
node.fills = [{
  type: "GRADIENT_LINEAR",
  gradientTransform: [[1, 0, 0], [0, 1, 0]],
  gradientStops: [
    { position: 0, color: { r: 1, g: 0, b: 0, a: 1 } },
    { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },
  ],
}];

// Drop shadow
node.effects = [{
  type: "DROP_SHADOW",
  color: { r: 0, g: 0, b: 0, a: 0.25 },
  offset: { x: 0, y: 4 },
  radius: 8,
  spread: 0,
  visible: true,
  blendMode: "NORMAL",
}];

// Stroke
node.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
node.strokeWeight = 1;
node.strokeAlign = "INSIDE";
```

### Node Operations
```typescript
// Get node by ID
const node = figma.getNodeById("1:23");

// Find nodes
const frames = figma.currentPage.findAll(n => n.type === "FRAME");

// Clone
const clone = node.clone();

// Delete
node.remove();

// Move to parent
parent.appendChild(node);

// Selection
figma.currentPage.selection = [node];
```

## Build & Development

### Install Dependencies
```bash
# All packages
npm install

# Individual
cd figma-plugin && npm install
cd mcp-server && npm install
cd websocket-server && npm install
```

### Build Commands
```bash
# Figma Plugin
cd figma-plugin && npm run build

# MCP Server
cd mcp-server && npm run build

# WebSocket Server (if standalone)
cd websocket-server && npm run build
```

### Watch Mode
```bash
# Figma Plugin (auto-rebuild)
cd figma-plugin && npm run watch

# MCP Server
cd mcp-server && npm run build -- --watch
```

### Run MCP Server
```bash
cd mcp-server && node dist/index.js
```

## Testing Checklist

1. **Build all packages** - No TypeScript errors
2. **Load Figma plugin** - Plugins → Development → Import plugin from manifest
3. **Start MCP server** - Check WebSocket on port 9001
4. **Test connection** - Use `figma_connection_status` tool
5. **Create basic shape** - `figma_create_frame` with params
6. **Verify in Figma** - Shape appears on canvas

## Troubleshooting

### "WebSocket not connected"
- Check if Figma plugin is running
- Verify port 9001 is not blocked
- Restart plugin and reconnect

### "Node not found"
- Node ID may be stale (page changed)
- Use `figma_get_selection` to get current IDs
- Node may have been deleted

### "Font not loaded"
- Use `figma_list_available_fonts` first
- Ensure font is installed in Figma
- Fallback to "Inter" which is always available

### "Invalid color format"
- Use hex (#FF0000) or RGB object ({r:1, g:0, b:0})
- RGB values are 0-1, not 0-255
- Include alpha if needed (a: 0.5)

### Build Errors
```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

### TypeScript Errors
- Check Zod schema matches handler types
- Ensure all imports use .js extension
- Verify tsconfig target is ES2022

## Code Style

- Use TypeScript strict mode
- Validate all inputs with Zod
- Use factory pattern for tool handlers
- Keep tools focused (single responsibility)
- Handle errors gracefully with clear messages
- Use async/await for Figma API calls
- Document complex logic with inline comments

## Important Files

| File | Purpose |
|------|---------|
| mcp-server/src/index.ts | Server entry, tool registration |
| mcp-server/src/tools/handler-factory.ts | Tool handler pattern |
| mcp-server/src/schemas/base.ts | Core Zod schemas |
| figma-plugin/src/code.ts | Plugin logic, command handling |
| figma-plugin/src/tokens/index.ts | Design tokens |
| figma-plugin/manifest.json | Plugin configuration |

## Performance Tips

- Batch node operations when possible
- Use `figma.skipInvisibleInstanceChildren = true`
- Avoid deep recursion in node traversal
- Cache font loading results
- Use specific queries vs findAll

## Security Notes

- WebSocket runs on localhost only
- No external network calls from plugin
- Validate all incoming message params
- Sanitize user-provided text content
