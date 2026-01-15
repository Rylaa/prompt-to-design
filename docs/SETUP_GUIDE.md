# 🎨 Figma AI Design System

**Claude Code CLI ile Figma'da Prompt Tabanlı Tasarım Oluşturma Sistemi**

---

## 📋 İçindekiler

1. [Genel Bakış](#1-genel-bakış)
2. [Mimari Yapı](#2-mimari-yapı)
3. [Gereksinimler](#3-gereksinimler)
4. [Bileşenler](#4-bileşenler)
5. [Kurulum Adımları](#5-kurulum-adımları)
6. [Kullanım](#6-kullanım)
7. [Desteklenen Özellikler](#7-desteklenen-özellikler)
8. [Prompt Örnekleri](#8-prompt-örnekleri)
9. [Kısıtlamalar](#9-kısıtlamalar)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Genel Bakış

Bu sistem, Claude Code CLI'dan girdiğin promptları Figma'da gerçek tasarımlara dönüştürür.

### Ne Yapabilirsin?

```
Sen: "Mavi gradient arka planlı, beyaz yazılı, 16px padding'li bir buton oluştur"

Figma: ✨ Buton oluşur ✨
```

### Temel Akış

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Claude Code │───▶│ MCP Server  │───▶│  WebSocket  │───▶│   Figma     │
│    (CLI)    │    │  (Bridge)   │    │   Server    │    │  Plugin     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │
   Prompt            AI Parse          İletişim            Tasarım
   girersin          & Convert         köprüsü            oluşur
```

---

## 2. Mimari Yapı

### 2.1 Bileşenler Arası İletişim

```
┌────────────────────────────────────────────────────────────────────┐
│                         KULLANICI                                   │
│                            │                                        │
│                     Claude Code CLI                                 │
│                    "Login formu yap"                               │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                      MCP SERVER (Node.js)                          │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 1. Prompt'u al                                                │ │
│  │ 2. Claude AI ile parse et (design intent → figma commands)   │ │
│  │ 3. Figma komutlarını oluştur                                 │ │
│  │ 4. WebSocket üzerinden gönder                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                             │
                             │ WebSocket (ws://localhost:9001)
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                     WEBSOCKET SERVER                               │
│            (MCP Server ile Figma Plugin arasında köprü)            │
└────────────────────────────────────────────────────────────────────┘
                             │
                             │ WebSocket Connection
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                         FIGMA                                       │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    FIGMA PLUGIN                               │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │ 1. WebSocket'e bağlan                                  │  │ │
│  │  │ 2. Komutları dinle                                     │  │ │
│  │  │ 3. Figma Plugin API ile tasarım oluştur               │  │ │
│  │  │    - figma.createFrame()                              │  │ │
│  │  │    - figma.createRectangle()                          │  │ │
│  │  │    - figma.createText()                               │  │ │
│  │  │    - node.layoutMode = "VERTICAL"                     │  │ │
│  │  │    - node.fills = [{ type: "GRADIENT_LINEAR" }]       │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                             │                                       │
│                             ▼                                       │
│                    ✨ TASARIM OLUŞUR ✨                             │
└────────────────────────────────────────────────────────────────────┘
```

### 2.2 Veri Akışı

```
PROMPT                          FIGMA KOMUTLARI                    TASARIM
───────────────────────────────────────────────────────────────────────────

"Mavi buton yap"        →       {                           →      ┌─────────┐
                                  type: "CREATE_BUTTON",           │  Buton  │
                                  fill: "#3B82F6",                 └─────────┘
                                  text: "Button",
                                  padding: 16
                                }

"Login formu,           →       {                           →      ┌──────────────┐
 2 input,                         type: "CREATE_FORM",             │ ┌──────────┐ │
 dikey layout"                    layout: "VERTICAL",              │ │ Email    │ │
                                  children: [                      │ └──────────┘ │
                                    { type: "INPUT" },             │ ┌──────────┐ │
                                    { type: "INPUT" },             │ │ Password │ │
                                    { type: "BUTTON" }             │ └──────────┘ │
                                  ]                                │ ┌──────────┐ │
                                }                                  │ │  Login   │ │
                                                                   │ └──────────┘ │
                                                                   └──────────────┘
```

---

## 3. Gereksinimler

### 3.1 Yazılım Gereksinimleri

| Gereksinim | Versiyon | Açıklama |
|------------|----------|----------|
| Node.js | v18+ | MCP Server ve WebSocket için |
| npm | v9+ | Paket yönetimi |
| Figma Desktop | Latest | Plugin çalıştırmak için |
| Claude Code | Latest | CLI aracı |

### 3.2 Hesap Gereksinimleri

| Hesap | Neden Gerekli |
|-------|---------------|
| Figma Hesabı | Tasarım yapılacak platform |
| Anthropic API Key | Prompt'u parse etmek için (isteğe bağlı) |

### 3.3 Dosya Yapısı

```
figma-ai-design/
├── mcp-server/                    # Claude Code MCP Server
│   ├── src/
│   │   ├── index.ts              # Ana MCP server
│   │   ├── websocket-bridge.ts   # WebSocket client
│   │   ├── prompt-parser.ts      # Prompt → Figma commands
│   │   └── schemas/              # Zod şemaları
│   ├── package.json
│   └── tsconfig.json
│
├── websocket-server/              # Bağımsız WebSocket server
│   ├── index.ts
│   └── package.json
│
├── figma-plugin/                  # Figma Plugin
│   ├── manifest.json             # Plugin manifest
│   ├── code.ts                   # Plugin ana kodu
│   ├── ui.html                   # Plugin UI (opsiyonel)
│   └── package.json
│
└── docs/
    └── SETUP_GUIDE.md            # Bu döküman
```

---

## 4. Bileşenler

### 4.1 MCP Server

**Konum:** `mcp-server/`

**Görevleri:**
- Claude Code'dan prompt almak
- Prompt'u Figma komutlarına dönüştürmek
- WebSocket üzerinden Figma Plugin'e göndermek

**Araçlar (Tools):**

| Tool | Açıklama |
|------|----------|
| `figma_create_design` | Prompt'tan tasarım oluşturur |
| `figma_create_frame` | Frame/Container oluşturur |
| `figma_create_text` | Text elementi oluşturur |
| `figma_create_rectangle` | Rectangle oluşturur |
| `figma_create_button` | Buton komponenti oluşturur |
| `figma_create_input` | Input field oluşturur |
| `figma_create_card` | Kart komponenti oluşturur |
| `figma_set_autolayout` | Auto layout ayarlar |
| `figma_set_fill` | Fill (solid/gradient) ayarlar |
| `figma_set_effects` | Shadow/blur efektleri |
| `figma_create_component` | Reusable component |
| `figma_get_selection` | Seçili node bilgisi |
| `figma_modify_node` | Var olan node'u düzenle |

---

### 4.2 WebSocket Server

**Konum:** `websocket-server/`

**Görevleri:**
- MCP Server ile Figma Plugin arasında köprü
- Bağlantı yönetimi
- Mesaj routing

**Port:** `9001` (varsayılan)

**Protokol:**
```typescript
// MCP Server → WebSocket Server → Figma Plugin
{
  type: "COMMAND",
  id: "unique-id",
  action: "CREATE_FRAME",
  params: {
    name: "Login Form",
    width: 400,
    height: 300,
    layoutMode: "VERTICAL",
    padding: 24,
    itemSpacing: 16,
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }]
  }
}

// Figma Plugin → WebSocket Server → MCP Server (Response)
{
  type: "RESPONSE",
  id: "unique-id",
  success: true,
  nodeId: "123:456",
  message: "Frame created successfully"
}
```

---

### 4.3 Figma Plugin

**Konum:** `figma-plugin/`

**Görevleri:**
- WebSocket server'a bağlanmak
- Komutları Figma Plugin API ile uygulamak
- Sonuçları geri bildirmek

**Manifest:**
```json
{
  "name": "AI Design Assistant",
  "id": "ai-design-assistant",
  "api": "1.0.0",
  "main": "code.js",
  "capabilities": [],
  "enableProposedApi": false,
  "editorType": ["figma"],
  "networkAccess": {
    "allowedDomains": ["localhost"]
  }
}
```

---

## 5. Kurulum Adımları

### Adım 1: Repository'yi Oluştur

```bash
mkdir figma-ai-design
cd figma-ai-design
```

### Adım 2: WebSocket Server Kurulumu

```bash
mkdir websocket-server
cd websocket-server
npm init -y
npm install ws
npm install -D typescript @types/ws @types/node
```

### Adım 3: MCP Server Kurulumu

```bash
cd ..
mkdir mcp-server
cd mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod ws
npm install -D typescript @types/ws @types/node
```

### Adım 4: Figma Plugin Kurulumu

```bash
cd ..
mkdir figma-plugin
cd figma-plugin
npm init -y
npm install -D typescript @figma/plugin-typings
```

### Adım 5: Kodu Yaz (veya Claude'dan al)

> Bu adımda ben tüm kodları yazacağım.

### Adım 6: Build Et

```bash
# WebSocket Server
cd websocket-server
npx tsc

# MCP Server  
cd ../mcp-server
npm run build

# Figma Plugin
cd ../figma-plugin
npx tsc
```

### Adım 7: Figma'da Plugin'i Yükle

1. Figma Desktop'ı aç
2. Herhangi bir dosyayı aç
3. `Menu` → `Plugins` → `Development` → `Import plugin from manifest...`
4. `figma-plugin/manifest.json` dosyasını seç

### Adım 8: Claude Code'a MCP Server'ı Ekle

`~/.claude/mcp_settings.json` dosyasını düzenle:

```json
{
  "mcpServers": {
    "figma-ai-design": {
      "command": "node",
      "args": ["/FULL/PATH/TO/figma-ai-design/mcp-server/dist/index.js"],
      "env": {
        "WEBSOCKET_URL": "ws://localhost:9001"
      }
    }
  }
}
```

### Adım 9: Sistemi Başlat

```bash
# Terminal 1: WebSocket Server
cd websocket-server
node dist/index.js

# Terminal 2: Figma'da plugin'i aç
# Plugins → Development → AI Design Assistant

# Terminal 3: Claude Code'u başlat
claude
```

---

## 6. Kullanım

### 6.1 Temel Kullanım

```bash
# Claude Code CLI'da
> Figma'da mavi bir buton oluştur

# Veya daha detaylı
> Figma'da şunları yap:
  - 400x600 boyutunda bir frame oluştur
  - Dikey auto layout ekle
  - 24px padding ver
  - İçine bir başlık texti ekle "Welcome Back"
  - Altına email input'u ekle
  - Altına şifre input'u ekle  
  - En alta mavi gradient butonlu "Sign In" ekle
```

### 6.2 Komut Formatları

```bash
# Basit
> Kırmızı kare oluştur

# Orta
> 200x50 boyutunda, köşeleri 8px yuvarlatılmış, mavi buton yap

# Detaylı
> Login kartı oluştur:
  - Beyaz arka plan
  - 16px border radius
  - Soft drop shadow (0, 4, 12, 0.1 opacity)
  - 32px padding
  - İçinde:
    - "Sign In" başlığı (24px, bold, #1a1a1a)
    - Email input
    - Password input
    - "Forgot Password?" linki (sağa hizalı, mavi)
    - "Sign In" butonu (full width, mavi gradient)
```

---

## 7. Desteklenen Özellikler

### 7.1 Şekiller ve Containerlar

| Özellik | Destek | Örnek Prompt |
|---------|--------|--------------|
| Frame | ✅ | "800x600 frame oluştur" |
| Rectangle | ✅ | "200x100 dikdörtgen" |
| Ellipse | ✅ | "100x100 daire" |
| Line | ✅ | "Yatay çizgi ekle" |
| Polygon | ✅ | "Üçgen oluştur" |
| Vector | ✅ | "Custom vector path" |
| Group | ✅ | "Seçili elemanları grupla" |

### 7.2 Auto Layout

| Özellik | Destek | Örnek Prompt |
|---------|--------|--------------|
| Direction | ✅ | "Dikey/Yatay auto layout" |
| Spacing | ✅ | "Elemanlar arası 16px boşluk" |
| Padding | ✅ | "24px padding" veya "16px top, 24px sides" |
| Alignment | ✅ | "Ortala" / "Sola hizala" |
| Distribution | ✅ | "Space between" |
| Wrap | ✅ | "Wrap enabled" |
| Sizing | ✅ | "Hug contents" / "Fill container" |

### 7.3 Renkler ve Doldurma

| Özellik | Destek | Örnek Prompt |
|---------|--------|--------------|
| Solid Color | ✅ | "Mavi arka plan" / "#3B82F6" |
| Linear Gradient | ✅ | "Maviden mora gradient" |
| Radial Gradient | ✅ | "Radial gradient" |
| Angular Gradient | ✅ | "Açısal gradient" |
| Diamond Gradient | ✅ | "Diamond gradient" |
| Image Fill | ✅ | "Resim ekle" |
| Opacity | ✅ | "%50 opacity" |

### 7.4 Stroke

| Özellik | Destek | Örnek Prompt |
|---------|--------|--------------|
| Stroke Color | ✅ | "1px gri border" |
| Stroke Weight | ✅ | "2px kalınlığında çizgi" |
| Stroke Align | ✅ | "Inside/Outside/Center border" |
| Dash Pattern | ✅ | "Kesik çizgili border" |
| Cap | ✅ | "Yuvarlak uçlu çizgi" |

### 7.5 Efektler

| Özellik | Destek | Örnek Prompt |
|---------|--------|--------------|
| Drop Shadow | ✅ | "Soft shadow ekle" |
| Inner Shadow | ✅ | "Inner shadow" |
| Layer Blur | ✅ | "8px blur" |
| Background Blur | ✅ | "Arka plan blur (glassmorphism)" |

### 7.6 Text

| Özellik | Destek | Örnek Prompt |
|---------|--------|--------------|
| Content | ✅ | "'Hello World' yazısı" |
| Font Family | ✅ | "Inter font" |
| Font Size | ✅ | "24px yazı" |
| Font Weight | ✅ | "Bold başlık" |
| Line Height | ✅ | "1.5 satır yüksekliği" |
| Letter Spacing | ✅ | "2px harf aralığı" |
| Text Align | ✅ | "Ortala" |
| Text Decoration | ✅ | "Altı çizili" |
| Text Case | ✅ | "Büyük harf" |

### 7.7 Layout Constraints

| Özellik | Destek | Örnek Prompt |
|---------|--------|--------------|
| Left | ✅ | "Sola sabitlenmiş" |
| Right | ✅ | "Sağa sabitlenmiş" |
| Top | ✅ | "Üste sabitlenmiş" |
| Bottom | ✅ | "Alta sabitlenmiş" |
| Center | ✅ | "Ortada sabitlenmiş" |
| Scale | ✅ | "Ölçeklenen" |
| Left & Right | ✅ | "Yatay stretch" |
| Top & Bottom | ✅ | "Dikey stretch" |

### 7.8 Components

| Özellik | Destek | Örnek Prompt |
|---------|--------|--------------|
| Create Component | ✅ | "Bunu component yap" |
| Create Instance | ✅ | "Bu component'tan instance" |
| Variants | ✅ | "Primary/Secondary variant" |
| Component Properties | ✅ | "Text property ekle" |

### 7.9 Hazır Bileşenler (Presets)

| Bileşen | Destek | Prompt |
|---------|--------|--------|
| Button | ✅ | "Buton oluştur" |
| Input | ✅ | "Text input" |
| Checkbox | ✅ | "Checkbox" |
| Radio | ✅ | "Radio button" |
| Toggle | ✅ | "Toggle switch" |
| Card | ✅ | "Kart komponenti" |
| Avatar | ✅ | "Avatar" |
| Badge | ✅ | "Badge/Tag" |
| Modal | ✅ | "Modal dialog" |
| Navbar | ✅ | "Navigation bar" |
| Sidebar | ✅ | "Sidebar menu" |
| Footer | ✅ | "Footer" |
| Form | ✅ | "Form" |
| Table | ✅ | "Tablo" |
| List | ✅ | "Liste" |

---

## 8. Prompt Örnekleri

### 8.1 Basit Elemanlar

```
"Mavi buton oluştur"

"100x100 kırmızı kare yap"

"24px Inter Bold 'Hello World' yazısı ekle"

"Maviden yeşile linear gradient'lı 200x50 rectangle"
```

### 8.2 Auto Layout

```
"400px genişliğinde dikey auto layout frame oluştur,
 16px padding, 12px item spacing"

"Yatay auto layout, space-between, center aligned"

"3 buton yan yana, eşit boşluklarla"
```

### 8.3 Kompleks Bileşenler

```
"Login formu oluştur:
 - 400px genişlik
 - Beyaz arka plan
 - 32px padding
 - 20px köşe yuvarlaklığı
 - Soft shadow
 - İçinde:
   - 'Welcome Back' başlığı (28px, bold)
   - 'Sign in to continue' alt başlık (14px, gray)
   - 24px boşluk
   - Email input (placeholder: 'Email address')
   - 12px boşluk
   - Password input (placeholder: 'Password')
   - 8px boşluk
   - 'Forgot Password?' linki (sağa hizalı, mavi, 12px)
   - 24px boşluk
   - 'Sign In' butonu (full width, mavi, beyaz yazı)"
```

### 8.4 Dashboard Örneği

```
"Dashboard layout oluştur:
 - Sol tarafta 240px genişliğinde koyu sidebar
   - Logo üstte
   - Navigation linkleri (Home, Analytics, Users, Settings)
   - Her link'te icon placeholder + text
 - Sağ tarafta ana içerik alanı
   - Üstte 64px yüksekliğinde header (beyaz, bottom border)
   - Header'da: Sayfa başlığı solda, profil avatar sağda
   - Ana içerik alanında 4 stat card yan yana
   - Altında 2 sütunlu grid: Chart placeholder sol, Recent activity sağ"
```

### 8.5 Mobile App Screen

```
"iPhone 14 boyutlarında mobil login ekranı:
 - Safe area padding
 - Üstte logo (centered)
 - Ortada form alanı
   - Email input
   - Password input
   - 'Forgot Password?' link
   - 'Sign In' primary button
   - 'Or continue with' divider
   - Social login butonları (Google, Apple yan yana)
 - Altta 'Don't have account? Sign Up' text"
```

---

## 9. Kısıtlamalar

### 9.1 Yapılamayan İşlemler

| İşlem | Neden | Alternatif |
|-------|-------|------------|
| **Prototype Links** | API read-only | Figma'da manuel yap |
| **Interactions** | API desteklemiyor | Manuel |
| **Animations** | Smart Animate API yok | Manuel |
| **Comments** | Farklı API (REST) | REST API ile ayrı |
| **Version History** | API yok | - |
| **Real-time Collab** | Farklı sistem | - |

### 9.2 Performans Limitleri

| Durum | Limit | Öneri |
|-------|-------|-------|
| Çok fazla node | ~1000 node/işlem | Parçalara böl |
| Büyük image | ~5MB | Optimize et |
| Karmaşık vector | Yavaşlayabilir | Basitleştir |
| Çok fazla efekt | GPU yükü | Minimum efekt |

### 9.3 Bağlantı Gereksinimleri

- WebSocket server çalışıyor olmalı
- Figma Plugin açık olmalı
- Aynı network'te olmalı (localhost)

---

## 10. Troubleshooting

### Problem: "WebSocket bağlantısı kurulamıyor"

**Çözüm:**
```bash
# 1. WebSocket server'ın çalıştığını kontrol et
lsof -i :9001

# 2. Çalışmıyorsa başlat
cd websocket-server && node dist/index.js

# 3. Figma plugin'i yeniden başlat
```

### Problem: "Plugin Figma'da görünmüyor"

**Çözüm:**
1. Figma'yı kapat ve tekrar aç
2. `Plugins` → `Development` → `Import plugin from manifest...`
3. Doğru `manifest.json` dosyasını seç

### Problem: "Komut Figma'ya ulaşmıyor"

**Çözüm:**
```bash
# 1. MCP Server loglarını kontrol et
# 2. WebSocket Server loglarını kontrol et
# 3. Figma Plugin console'unu kontrol et (DevTools)
```

### Problem: "Font bulunamıyor"

**Çözüm:**
- Figma'da o font yüklü olmalı
- Varsayılan font kullan: "Inter"

### Problem: "Tasarım yanlış çıkıyor"

**Çözüm:**
- Prompt'u daha spesifik yaz
- Boyutları ve renkleri açıkça belirt
- Adım adım oluştur (önce frame, sonra içerik)

---

## 📝 Sonraki Adımlar

Bu dökümanı okuduktan sonra:

1. ✅ Gereksinimleri kontrol et
2. ⏳ Claude'dan kodları iste
3. ⏳ Kurulumu yap
4. ⏳ Test et
5. ⏳ Kullanmaya başla!

---

**Hazır olduğunda "kodları yaz" de, tüm bileşenleri oluşturacağım.**
