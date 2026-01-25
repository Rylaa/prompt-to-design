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
