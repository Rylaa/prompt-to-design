# Prompt-to-Design

**Prompt-based design creation system for Figma via Claude Code CLI**

```
"Create a login form with blue gradient" → Design appears in Figma
```

---

## Project Structure

```
prompt-to-design/
├── websocket-server/     # WebSocket bridge server
├── mcp-server/           # Claude Code MCP server
├── figma-plugin/         # Figma plugin
└── docs/                 # Documentation
```

## Quick Setup

### 1. Install Dependencies

```bash
# WebSocket Server
cd websocket-server
npm install

# MCP Server
cd ../mcp-server
npm install

# Figma Plugin
cd ../figma-plugin
npm install
```

### 2. Build Projects

```bash
# WebSocket Server
cd websocket-server
npm run build

# MCP Server
cd ../mcp-server
npm run build

# Figma Plugin
cd ../figma-plugin
npm run build
```

### 3. Load Figma Plugin

1. Open **Figma Desktop** app
2. Open any file
3. `Menu` → `Plugins` → `Development` → `Import plugin from manifest...`
4. Select `figma-plugin/manifest.json`

### 4. Add MCP Server to Claude Code

Edit `~/.claude/mcp_settings.json`:

```json
{
  "mcpServers": {
    "prompt-to-design": {
      "command": "node",
      "args": ["/FULL/PATH/TO/prompt-to-design/mcp-server/dist/index.js"],
      "env": {
        "WEBSOCKET_URL": "ws://localhost:9001"
      }
    }
  }
}
```

## Starting

### Terminal 1: WebSocket Server

```bash
cd websocket-server
npm start
```

Output:
```
WebSocket Bridge Server running on ws://localhost:9001
```

### Terminal 2: Figma Plugin

1. Open a file in Figma
2. `Plugins` → `Development` → `AI Design Assistant`
3. Plugin will automatically connect to WebSocket

### Terminal 3: Claude Code

```bash
claude
```

## Usage Examples

### Basic Shapes

```
> Create a 200x100 blue rectangle in Figma
> Make a red circle
> Add "Hello World" text, 24px, bold
```

### Buttons

```
> Create a blue primary button
> Green button with "Sign Up" text, 16px padding
> Outline style secondary button
```

### Auto Layout

```
> Vertical auto layout frame, 16px spacing, 24px padding
> Horizontal layout, space-between, center aligned
```

### Cards

```
> 320px wide card with shadow, 24px padding
> Login card: email input, password input, submit button
```

### Gradients

```
> Button with blue to purple linear gradient
> Frame with radial gradient background
```

### Complex Layout

```
> Create a login form:
  - 400px width
  - White background
  - 32px padding
  - Soft shadow
  - "Welcome Back" title
  - Email input
  - Password input
  - "Sign In" button (blue, full width)
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `figma_create_frame` | Create frame/container |
| `figma_create_rectangle` | Create rectangle |
| `figma_create_ellipse` | Create circle/ellipse |
| `figma_create_text` | Create text element |
| `figma_create_button` | Styled button |
| `figma_create_input` | Input field |
| `figma_create_card` | Card component |
| `figma_set_autolayout` | Apply auto layout |
| `figma_set_fill` | Set color/gradient |
| `figma_set_effects` | Add shadow/blur |
| `figma_modify_node` | Modify node |
| `figma_create_component` | Create component |
| `figma_get_selection` | Get selected nodes |
| `figma_append_child` | Add child |
| `figma_connection_status` | Connection status |

## Supported Features

| Feature | Status |
|---------|--------|
| Frame/Rectangle/Ellipse | ✅ |
| Text (font, size, weight) | ✅ |
| Auto Layout | ✅ |
| Padding/Spacing | ✅ |
| Solid Fill | ✅ |
| Gradient Fill | ✅ |
| Drop Shadow | ✅ |
| Inner Shadow | ✅ |
| Blur Effects | ✅ |
| Border Radius | ✅ |
| Stroke | ✅ |
| Components | ✅ |
| **Prototype Links** | ❌ (API limitation) |

## Troubleshooting

### "WebSocket connection failed"

```bash
# Check if WebSocket server is running
lsof -i :9001

# If not running, start it
cd websocket-server && npm start
```

### "Plugin not visible"

1. Close and reopen Figma
2. `Plugins` → `Development` → `Import plugin from manifest...`
3. Select `figma-plugin/manifest.json`

### "Font not found"

- Inter font must be installed in Figma
- Or use a different font: `style: { fontFamily: "Arial" }`

## License

MIT

---

**Questions:** Use GitHub Issues
