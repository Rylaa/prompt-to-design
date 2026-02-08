# MCP Developer Audit Report

**Tarih:** 2026-02-08
**Proje:** prompt-to-design
**Versiyon:** 1.0.0
**Denetçi:** MCP Developer Agent

---

## 1. Teknik Borç Özeti

### Kritik (P0)
1. **Prototype/Interaction Tool'ları Eksik**: Zod schema'lar tanımlı (`SetReactionsInputSchema`, `AddReactionInputSchema`, `GetReactionsInputSchema`, `RemoveReactionsInputSchema`, `SetFlowStartingPointInputSchema`, `GetFlowStartingPointsInputSchema`, `RemoveFlowStartingPointInputSchema`) ancak MCP tool kaydı yapılmamış ve plugin tarafında handler implementasyonu yok.
2. **Export Tool'ları Eksik**: `ExportNodeInputSchema` ve `ExportMultipleInputSchema` schema'da tanımlı ama tool kaydı ve plugin handler'ı yok. Kullanıcılar Figma'dan tasarımlarını dışarı aktaramıyor.
3. **Session Tool'ları Eski API Kullanıyor**: `session.ts` `server.tool()` (eski API) kullanırken diğer tüm modüller `server.registerTool()` (yeni API) kullanıyor. Bu tutarsızlık bakım riskidir.

### Yüksek (P1)
4. **WebSocket 0.0.0.0 Binding**: `embedded-ws-server.ts:92` sunucuyu `host: "0.0.0.0"` ile tüm arayüzlere bağlıyor. Güvenlik açığı - sadece `127.0.0.1` olmalı.
5. **Manifest `allowedDomains: ["*"]`**: `figma-plugin/manifest.json:13` tüm domainlere ağ erişimi veriyor. Sadece `localhost` yeterli olmalı.
6. **MCP Tool → Plugin Action Uyumsuzluğu**: MCP'de `MOVE_NODE` action'ı gönderiliyor, plugin'de `MOVE_TO_PARENT` olarak işleniyor. Bu uyumsuzluk çalışma zamanı hatasına yol açar.
7. **Dead Schema'lar**: Prototype, Export ve bazı ek schema'lar tanımlı ama hiçbir yerde kullanılmıyor - ölü kod.

### Orta (P2)
8. **Test Altyapısı Yok**: Proje genelinde hiçbir test framework'ü kurulmamış. `package.json`'larda test scripti yok.
9. **Linting/Formatting Yok**: ESLint veya Prettier yapılandırması mevcut değil.
10. **`components.ts` Handler Dosyası Çok Büyük**: 1158 satır - bölünmesi gerekiyor.

---

## 2. Kod Kalitesi Puanı (Modül Bazında)

| Modül | Puan | Açıklama |
|-------|------|----------|
| **mcp-server/src/index.ts** | 9/10 | Temiz entry point, graceful shutdown iyi handle ediliyor |
| **mcp-server/src/embedded-ws-server.ts** | 7/10 | İyi yapı ama 0.0.0.0 binding güvenlik riski, tek client sınırlaması |
| **mcp-server/src/websocket-bridge.ts** | 8/10 | Auto-reconnect, message queue, health monitoring iyi |
| **mcp-server/src/tools/handler-factory.ts** | 9/10 | Temiz factory pattern, annotations iyi tanımlı |
| **mcp-server/src/tools/index.ts** | 9/10 | Düzenli modül kaydı, mantıksal gruplandırma |
| **mcp-server/src/tools/*.ts (28 modül)** | 8/10 | Tutarlı pattern, annotation kullanımı doğru |
| **mcp-server/src/schemas/base.ts** | 9/10 | İyi organize edilmiş base schema'lar, tip export'ları |
| **mcp-server/src/schemas/index.ts** | 7/10 | Çok büyük (1404 satır), ölü schema'lar var |
| **mcp-server/src/session/*.ts** | 7/10 | İyi yapı ama eski tool API kullanımı |
| **figma-plugin/src/code.ts** | 9/10 | Temiz orchestrator (~510 satır), command router pattern |
| **figma-plugin/src/handlers/index.ts** | 9/10 | Düzenli barrel export |
| **figma-plugin/src/handlers/*.ts** | 7/10 | components.ts çok büyük (1158 satır) |

**Genel Kod Kalitesi: 8.0/10**

### Olumlu Noktalar
- Handler factory pattern tutarlı kullanılıyor (119 tool kaydı)
- TypeScript strict mode aktif (her iki projede)
- Zod schema validasyonu kapsamlı
- Plugin command router pattern çok temiz
- Modüler handler yapısı (21 handler dosyası)
- Annotation sistemi (READONLY, DEFAULT, DESTRUCTIVE) doğru kullanılıyor
- Base schema'lar iyi ayrılmış (base.ts vs index.ts)

### İyileştirilmesi Gereken Noktalar
- Schema dosyası çok büyük (1404 satır) - domain bazında bölünmeli
- Bazı handler dosyaları çok büyük (components.ts: 1158, smart-layout.ts: 643)
- Error handling tutarlı ama granüler değil (sadece "Error: mesaj" formatı)

---

## 3. Eksik Araçlar Listesi (Öncelik Sırasıyla)

### P0 - Kritik (Schema var, implementasyon yok)

| # | Araç | Schema | MCP Tool | Plugin Handler | Durum |
|---|------|--------|----------|----------------|-------|
| 1 | `figma_set_reactions` | SetReactionsInputSchema | YOK | YOK | Schema tanımlı, hiçbir yerde kullanılmıyor |
| 2 | `figma_add_reaction` | AddReactionInputSchema | YOK | YOK | " |
| 3 | `figma_get_reactions` | GetReactionsInputSchema | YOK | YOK | " |
| 4 | `figma_remove_reactions` | RemoveReactionsInputSchema | YOK | YOK | " |
| 5 | `figma_set_flow_starting_point` | SetFlowStartingPointInputSchema | YOK | YOK | " |
| 6 | `figma_get_flow_starting_points` | GetFlowStartingPointsInputSchema | YOK | YOK | " |
| 7 | `figma_remove_flow_starting_point` | RemoveFlowStartingPointInputSchema | YOK | YOK | " |
| 8 | `figma_export_node` | ExportNodeInputSchema | YOK | YOK | " |
| 9 | `figma_export_multiple` | ExportMultipleInputSchema | YOK | YOK | " |

### P1 - Yüksek Öncelik (Eksik API kapsam)

| # | Özellik | Açıklama | Figma API Desteği |
|---|---------|----------|-------------------|
| 10 | Batch Node Oluşturma | Tek komutla birden fazla node oluşturma | Mümkün (Plugin API ile) |
| 11 | Undo/Redo Desteği | Geri alma/yineleme | Sınırlı (Plugin API desteklemiyor, sadece `figma.commitUndo()`) |
| 12 | Min/Max Width/Height | Node'lara min/max boyut kısıtlaması | `minWidth`, `maxWidth`, `minHeight`, `maxHeight` (Figma API var) |
| 13 | Component Set Variant Yönetimi | Variant oluşturma, düzenleme, silme | Mevcut ama `handleGenerateVariants` sınırlı |
| 14 | Responsive Constraints | Breakpoint bazlı layout | Plugin API desteklemiyor doğrudan |

### P2 - Orta Öncelik

| # | Özellik | Açıklama |
|---|---------|----------|
| 15 | Annotation/Comment Desteği | Figma yorum API'si |
| 16 | Section Node Oluşturma | Figma section frame'leri |
| 17 | Font Arama/Filtreleme | Daha granüler font sorgulama |
| 18 | Batch Style Uygulama | Çoklu node'a aynı anda style uygulama |
| 19 | Node Sıralama (z-index) | Açık z-index yönetimi |
| 20 | Export Preset Yönetimi | Node'lara export preset ekleme |

---

## 4. WebSocket İyileştirme Planı

### 4.1 Mevcut Durum Analizi

**Embedded WS Server (`embedded-ws-server.ts`)**
- Singleton pattern: Doğru
- Heartbeat: 15s interval, native WS ping
- Command timeout: 30s
- Pending callback tracking: Map ile
- Graceful shutdown: Tüm pending callback'ler cevaplanıyor

**WS Bridge Client (`websocket-bridge.ts`)**
- Auto-reconnect: Var (exponential backoff + jitter)
- Max reconnect: 5 deneme
- Message queue: Var (bağlantı koptuğunda kuyruklanıyor)
- Health monitor: 20s interval
- Force reconnect: Destekleniyor

### 4.2 Tespit Edilen Sorunlar

| # | Sorun | Ciddiyet | Açıklama |
|---|-------|----------|----------|
| 1 | **0.0.0.0 Binding** | Yüksek | Sunucu tüm network arayüzlerinde dinliyor, 127.0.0.1 olmalı |
| 2 | **Tek Client Limiti** | Orta | Sadece 1 Figma client'a izin veriliyor, yeni bağlantı eskiyi kapatıyor |
| 3 | **Timeout Leak Riski** | Düşük | `sendCommand` timeout'u `clearTimeout` ile temizlenmiyor (embedded server'da) |
| 4 | **Message Queue Boyut Limiti Yok** | Orta | Bridge'de message queue sınırsız büyüyebilir |
| 5 | **Race Condition** | Düşük | `processQueue` fonksiyonunda queue'dan mesaj çıkarılırken ve gönderilirken race condition olabilir |
| 6 | **Bridge Kullanılmıyor** | Bilgi | `websocket-bridge.ts` standalone WS server için yazılmış, embedded modda kullanılmıyor ama bakım maliyeti taşıyor |

### 4.3 İyileştirme Önerileri

1. **Host binding'i `127.0.0.1` olarak değiştir** - Güvenlik
2. **Message queue boyut limiti ekle** (max 1000 mesaj)
3. **Timeout'ları doğru temizle** - Memory leak önleme
4. **Çoklu client desteği** veya queue-based round robin
5. **Bağlantı metrikleri** - Ortalama latency, başarısız komut sayısı
6. **websocket-bridge.ts değerlendirmesi** - Kullanılmıyorsa kaldırılmalı veya tek modüle birleştirilmeli

---

## 5. Performans İyileştirme Önerileri

### 5.1 Plugin Performansı

| # | Alan | Mevcut Durum | Öneri |
|---|------|-------------|-------|
| 1 | Font Loading | Her text oluşturmada `loadFont` çağrılıyor | Font cache mekanizması ekle (session bazlı) |
| 2 | `findAll()` Kullanımı | `query.ts`'de `findAll` + filter pattern | `findOne` veya erken çıkış optimize et |
| 3 | Node Registry | In-memory Map, boyut sınırı yok | LRU cache veya WeakRef kullanımı |
| 4 | components.ts | 1158 satırlık monolitik dosya | Domain bazında bölünmeli (button, input, card, vb.) |
| 5 | Design System Components | Her çağrıda tüm bileşen ağacı oluşturuluyor | Component slot pattern'ı daha aktif kullanılmalı |

### 5.2 MCP Server Performansı

| # | Alan | Mevcut Durum | Öneri |
|---|------|-------------|-------|
| 1 | Schema Index | 1404 satırlık tek dosya | Build time'da etkili değil ama okunabilirlik zayıf |
| 2 | Tool Kaydı | 119 tool senkron kayıt ediliyor | Lazy loading pattern değerlendirilmeli |
| 3 | JSON Serialization | Tüm response'lar `JSON.stringify(_, null, 2)` | Pretty print production'da gereksiz |

### 5.3 Batch Rendering

Mevcut durumda her komut tekil gönderilip yanıt bekleniyor. Batch operation desteği eklenirse:
- Tek WebSocket mesajında birden fazla komut gönderilebilir
- Plugin tarafında transaction benzeri bir mekanizma kurulabilir
- Tahmini performans artışı: %40-60 (çoklu node oluşturma senaryolarında)

---

## 6. Build Sistemi Değerlendirmesi

### 6.1 MCP Server

| Özellik | Değer | Değerlendirme |
|---------|-------|---------------|
| Build Tool | tsc | Yeterli |
| Target | ES2022 | Güncel |
| Module | NodeNext | Doğru |
| Strict Mode | true | Doğru |
| Declaration | true | API tüketicileri için iyi |
| Dependencies | @modelcontextprotocol/sdk ^1.0.0, ws ^8.18.0, zod ^3.23.8 | Güncel |
| Dev Dependencies | typescript ^5.5.0, @types/node ^22.0.0 | Güncel |

### 6.2 Figma Plugin

| Özellik | Değer | Değerlendirme |
|---------|-------|---------------|
| Build Tool | esbuild | Çok hızlı, doğru seçim |
| Target | es6 | Figma uyumluluğu için doğru |
| Bundle Format | iife | Figma Plugin API gerekliliği |
| TypeScript | ^5.5.0, strict: true | Doğru |
| Plugin Typings | @figma/plugin-typings ^1.98.0 | Güncel |
| Watch Mode | esbuild --watch | Doğru |

### 6.3 İyileştirme Önerileri

1. **Root package.json eksik** - Monorepo yönetimi için workspace yapılandırması gerekli
2. **Lint script ekle** - ESLint + Prettier
3. **Typecheck script MCP'ye de ekle** - `"typecheck": "tsc --noEmit"`
4. **Source maps** - Debug için esbuild'e `--sourcemap` ekle
5. **CI/CD pipeline** - Build + typecheck + lint otomasyonu

---

## 7. Test Stratejisi

### 7.1 Önerilen Framework

- **Test Runner**: Vitest (TypeScript native, hızlı, ESM uyumlu)
- **Mock Framework**: Vitest built-in mocks
- **Figma API Mock**: Custom mock factory (`@figma/plugin-typings` bazlı)
- **WebSocket Mock**: `mock-socket` veya custom mock

### 7.2 İlk 10 Kritik Test

| # | Test | Dosya | Öncelik |
|---|------|-------|---------|
| 1 | Handler factory doğru action gönderiyor mu | handler-factory.test.ts | P0 |
| 2 | Zod schema validasyonu (geçerli/geçersiz input) | schemas.test.ts | P0 |
| 3 | WebSocket bağlantı lifecycle (connect/disconnect/reconnect) | embedded-ws-server.test.ts | P0 |
| 4 | Command timeout doğru çalışıyor mu | embedded-ws-server.test.ts | P0 |
| 5 | Heartbeat dead connection tespit ediyor mu | embedded-ws-server.test.ts | P1 |
| 6 | Session manager CRUD operasyonları | session/state.test.ts | P1 |
| 7 | Message queue (offline → online geçişte mesajlar iletiliyor mu) | websocket-bridge.test.ts | P1 |
| 8 | Tool kaydı - tüm tool'lar başarıyla kayıt oluyor mu | tools/index.test.ts | P1 |
| 9 | Color schema parsing (hex, RGB, gradient) | schemas/base.test.ts | P2 |
| 10 | Plugin command router - bilinmeyen action hata fırlatıyor mu | code.test.ts | P2 |

### 7.3 Mock Stratejisi

```
Test Katmanları:
┌─────────────────────────────┐
│  Integration Tests          │  → Gerçek WebSocket, mock Figma API
│  (MCP → WS → Plugin mock)  │
├─────────────────────────────┤
│  Unit Tests                 │  → Mock WebSocket, mock Figma API
│  (Handler, Schema, Session) │
├─────────────────────────────┤
│  Schema Validation Tests    │  → Sadece Zod schema, mock yok
│  (Input/Output contracts)   │
└─────────────────────────────┘
```

**Figma API Mock Factory:**
```typescript
// Her test dosyasında kullanılabilir
function createMockFigmaAPI() {
  return {
    createFrame: vi.fn(() => mockFrameNode()),
    createText: vi.fn(() => mockTextNode()),
    getNodeById: vi.fn(),
    currentPage: { selection: [], findAll: vi.fn() },
    loadFontAsync: vi.fn(),
    // ...
  };
}
```

---

## 8. Bakım Yol Haritası

### 1 Ay (Acil)

- [ ] **Güvenlik**: WebSocket binding'i 0.0.0.0 → 127.0.0.1 değiştir
- [ ] **Güvenlik**: Manifest `allowedDomains` → `["localhost"]` kısıtla
- [ ] **Bug Fix**: MCP `MOVE_NODE` → Plugin `MOVE_TO_PARENT` action uyumsuzluğunu düzelt
- [ ] **Eksik Araç**: Prototype/Reaction tool'larını implemente et (7 tool)
- [ ] **Eksik Araç**: Export tool'larını implemente et (2 tool)
- [ ] **Temizlik**: Ölü schema'ları kaldır veya ilgili tool'ları implemente et
- [ ] **Test**: Vitest kurulumu + ilk 5 kritik test
- [ ] **Session Tutarlılığı**: `session.ts`'yi `server.registerTool()` API'sine geçir

### 3 Ay (İyileştirme)

- [ ] **Schema Bölme**: `schemas/index.ts`'yi domain bazında bölme (shapes, components, styles, vb.)
- [ ] **Handler Bölme**: `components.ts` (1158 satır) → button.ts, input.ts, card.ts, ...
- [ ] **Batch Operations**: Çoklu node oluşturma desteği
- [ ] **Min/Max Boyut**: `minWidth`/`maxWidth`/`minHeight`/`maxHeight` tool'ları
- [ ] **Font Cache**: Session bazlı font loading cache
- [ ] **Linting**: ESLint + Prettier kurulumu
- [ ] **Test**: Toplam 30+ test, %60 kapsam hedefi
- [ ] **Metrics**: WebSocket bağlantı metrikleri (latency, hata oranı)
- [ ] **CI/CD**: GitHub Actions - build + typecheck + lint + test

### 6 Ay (Genişleme)

- [ ] **Component Set Yönetimi**: Gelişmiş variant CRUD
- [ ] **Section Node Desteği**: Figma section API entegrasyonu
- [ ] **Annotation/Comment API**: Yorum desteği
- [ ] **Batch Style Uygulama**: Çoklu node'a style uygulama
- [ ] **Responsive Breakpoints**: Multi-device layout yönetimi (manuel, API sınırlı)
- [ ] **websocket-bridge.ts Kararı**: Kullanılmıyorsa kaldır, kullanılıyorsa birleştir
- [ ] **Test**: %80 kapsam hedefi, E2E testler
- [ ] **Documentation**: API reference, katkıda bulunma rehberi
- [ ] **Performance**: Lazy tool loading, response streaming

---

## Ek A: Araç Envanteri

**Toplam Kayıtlı MCP Tool: 119**

| Kategori | Tool Sayısı | Modül |
|----------|------------|-------|
| Shapes | 8 | shapes.ts |
| Text | 3 | text.ts |
| Components | 5 | components.ts |
| Design System | 5 | design-system.ts |
| Icons | 2 | icons.ts |
| Layout | 8 | layout.ts |
| Styling | 6 | styling.ts |
| Transform | 3 | transform.ts |
| Manipulation | 10 | manipulation.ts |
| Query | 6 | query.ts |
| Boolean | 1 | boolean.ts |
| Masks | 2 | masks.ts |
| Component Library | 4 | component-library.ts |
| Component Registry | 3 | component-registry.ts |
| Styles & Variables | 10 | styles-variables.ts |
| Plugin Data | 4 | plugin-data.ts |
| Storage | 7 | storage.ts |
| Media | 5 | media.ts |
| Viewport | 5 | viewport.ts |
| Pages | 6 | pages.ts |
| Theme | 2 | theme.ts |
| Connection | 1 | connection.ts |
| Session | 8 | session.ts |
| Linter | 1 | linter.ts |
| Smart Layout | 1 | smart-layout.ts |
| Debug | 2 | debug.ts |
| Variant Generator | 1 | variant-generator.ts |

**Schema'da Tanımlı Ama Kayıt Dışı: 9 araç** (Prototype: 7, Export: 2)

## Ek B: Dosya Boyutu Analizi

### MCP Server
| Dosya | Satır |
|-------|-------|
| schemas/index.ts | 1404 |
| schemas/base.ts | 150 |
| embedded-ws-server.ts | 561 |
| websocket-bridge.ts | 450 |
| tools/index.ts | 92 |
| tools/handler-factory.ts | 64 |
| index.ts | 92 |

### Figma Plugin Handlers
| Dosya | Satır |
|-------|-------|
| components.ts | 1158 |
| smart-layout.ts | 643 |
| layout.ts | 628 |
| manipulation.ts | 563 |
| shapes.ts | 482 |
| component-lib.ts | 418 |
| variant-generator.ts | 392 |
| debug.ts | 388 |
| query.ts | 320 |
| design-system.ts | 286 |
| index.ts (barrel) | 254 |

**Toplam Plugin Handler Satırı: ~7148**

---

## Ek C: API Tutarlılık Tablosu

### Session Tool'ları API Uyumsuzluğu

| Dosya | API Kullanımı | Not |
|-------|--------------|-----|
| shapes.ts | `server.registerTool()` | Yeni API |
| text.ts | `server.registerTool()` | Yeni API |
| components.ts | `server.registerTool()` | Yeni API |
| ... (tüm diğerleri) | `server.registerTool()` | Yeni API |
| **session.ts** | **`server.tool()`** | **Eski API - Tutarsız** |

### MCP Action → Plugin Handler Uyumsuzlukları

| MCP Action | Plugin Handler | Durum |
|-----------|----------------|-------|
| MOVE_NODE | MOVE_TO_PARENT | UYUMSUZ - farklı isim |
| SET_REACTIONS | (yok) | EKSİK |
| ADD_REACTION | (yok) | EKSİK |
| GET_REACTIONS | (yok) | EKSİK |
| REMOVE_REACTIONS | (yok) | EKSİK |
| SET_FLOW_STARTING_POINT | (yok) | EKSİK |
| GET_FLOW_STARTING_POINTS | (yok) | EKSİK |
| REMOVE_FLOW_STARTING_POINT | (yok) | EKSİK |
| EXPORT_NODE | (yok) | EKSİK |
| EXPORT_MULTIPLE | (yok) | EKSİK |
