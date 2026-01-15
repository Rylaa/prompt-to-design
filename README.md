# 🎨 Prompt-to-Design

**Claude Code CLI ile Figma'da prompt tabanlı tasarım oluşturma sistemi**

```
"Mavi gradient'lı login formu yap" → ✨ Figma'da tasarım oluşur ✨
```

---

## 📁 Proje Yapısı

```
prompt-to-design/
├── websocket-server/     # WebSocket köprü sunucusu
├── mcp-server/           # Claude Code MCP sunucusu  
├── figma-plugin/         # Figma eklentisi
└── docs/                 # Dökümanlar
```

## 🚀 Hızlı Kurulum

### 1. Bağımlılıkları Yükle

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

### 2. Projeleri Derle

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

### 3. Figma Plugin'i Yükle

1. **Figma Desktop** uygulamasını aç
2. Herhangi bir dosya aç
3. `Menu` → `Plugins` → `Development` → `Import plugin from manifest...`
4. `figma-plugin/manifest.json` dosyasını seç

### 4. Claude Code'a MCP Server'ı Ekle

`~/.claude/mcp_settings.json` dosyasını düzenle:

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

## ▶️ Başlatma

### Terminal 1: WebSocket Server

```bash
cd websocket-server
npm start
```

Çıktı:
```
🚀 WebSocket Bridge Server running on ws://localhost:9001
```

### Terminal 2: Figma Plugin

1. Figma'da bir dosya aç
2. `Plugins` → `Development` → `AI Design Assistant`
3. Plugin otomatik olarak WebSocket'e bağlanacak

### Terminal 3: Claude Code

```bash
claude
```

## 💬 Kullanım Örnekleri

### Basit Şekiller

```
> Figma'da 200x100 boyutunda mavi dikdörtgen oluştur
> Kırmızı daire yap
> "Hello World" yazısı ekle, 24px, bold
```

### Butonlar

```
> Mavi primary buton oluştur
> "Sign Up" yazılı yeşil buton, 16px padding
> Outline tarzında secondary buton
```

### Auto Layout

```
> Dikey auto layout frame, 16px spacing, 24px padding
> Yatay layout, space-between, center aligned
```

### Kartlar

```
> 320px genişliğinde kart, shadow'lu, 24px padding
> Login kartı: email input, password input, submit butonu
```

### Gradientler

```
> Maviden mora linear gradient'lı buton
> Radial gradient arka planlı frame
```

### Kompleks Layout

```
> Login formu oluştur:
  - 400px genişlik
  - Beyaz arka plan
  - 32px padding
  - Soft shadow
  - "Welcome Back" başlığı
  - Email input
  - Password input
  - "Sign In" butonu (mavi, full width)
```

## 🛠️ MCP Araçları

| Araç | Açıklama |
|------|----------|
| `figma_create_frame` | Frame/container oluştur |
| `figma_create_rectangle` | Dikdörtgen oluştur |
| `figma_create_ellipse` | Daire/elips oluştur |
| `figma_create_text` | Text elementi oluştur |
| `figma_create_button` | Stillenmiş buton |
| `figma_create_input` | Input field |
| `figma_create_card` | Kart komponenti |
| `figma_set_autolayout` | Auto layout uygula |
| `figma_set_fill` | Renk/gradient ayarla |
| `figma_set_effects` | Shadow/blur ekle |
| `figma_modify_node` | Node düzenle |
| `figma_create_component` | Component oluştur |
| `figma_get_selection` | Seçili node'ları al |
| `figma_append_child` | Child ekle |
| `figma_connection_status` | Bağlantı durumu |

## ✅ Desteklenen Özellikler

| Özellik | Durum |
|---------|-------|
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
| **Prototype Links** | ❌ (API limiti) |

## 🔧 Troubleshooting

### "WebSocket bağlantısı kurulamıyor"

```bash
# WebSocket server çalışıyor mu kontrol et
lsof -i :9001

# Çalışmıyorsa başlat
cd websocket-server && npm start
```

### "Plugin görünmüyor"

1. Figma'yı kapat ve tekrar aç
2. `Plugins` → `Development` → `Import plugin from manifest...`
3. `figma-plugin/manifest.json` seç

### "Font bulunamıyor"

- Figma'da Inter font'u yüklü olmalı
- Veya farklı font kullan: `style: { fontFamily: "Arial" }`

## 📄 Lisans

MIT

---

**Sorular için:** GitHub Issues kullan
