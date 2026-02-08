# Prompt-to-Design Uygulama Plani

**Tarih:** 2026-02-08
**Kaynak:** 6 uzman ajan raporu (UI, UX, Figma API, Token, Hiyerarsi, MCP Developer)
**Toplam Bulgu:** 87 sorun, 14 kritik, 23 yuksek, 31 orta, 19 dusuk oncelik

---

## Faz 0: Kritik Duzeltmeler (1-2 Gun)

> Guvenlik aciklari ve calisma zamani hatalari. Hemen yapilmali.

### 0.1 [GUVENLIK] WebSocket 0.0.0.0 → 127.0.0.1
- **Dosya:** `mcp-server/src/embedded-ws-server.ts:92`
- **Sorun:** Sunucu tum network arayuzlerine acik
- **Cozum:** `host: "0.0.0.0"` → `host: "127.0.0.1"`
- **Kaynak:** MCP Developer Audit

### 0.2 [GUVENLIK] Manifest allowedDomains kisitla
- **Dosya:** `figma-plugin/manifest.json:13`
- **Sorun:** `allowedDomains: ["*"]` tum domainlere erisim
- **Cozum:** `allowedDomains: ["localhost", "127.0.0.1"]`
- **Kaynak:** MCP Developer Audit

### 0.3 [BUG] MOVE_NODE → MOVE_TO_PARENT action uyumsuzlugu
- **Dosyalar:** MCP tool kaydinda `MOVE_NODE`, plugin handler'da `MOVE_TO_PARENT`
- **Sorun:** Runtime hatasi - move komutu calismaz
- **Cozum:** MCP tarafinda action adini `MOVE_TO_PARENT` olarak duzelt
- **Kaynak:** MCP Developer Audit

### 0.4 [BUG] Font weight 600 tutarsizligi
- **Dosyalar:** `font-helpers.ts:18` ("Semi Bold") vs `components.ts:146` ("SemiBold")
- **Sorun:** Font yukleme hatasi riski
- **Cozum:** Tum dosyalarda "Semi Bold" (bosluklu) standardize et
- **Kaynak:** Figma API Raporu

---

## Faz 1: Temel Altyapi (Hafta 1)

> Kod kalitesi ve tutarlilik. Sonraki fazlar icin onkosul.

### 1.1 Duplike hexToRgb fonksiyonlarini kaldir
- **Etkilenen dosyalar (5 adet):**
  - `components/shadcn/badge.ts`
  - `components/shadcn/avatar.ts`
  - `components/apple-ios/button.ts`
  - `components/apple-ios/navigation-bar.ts`
  - `components/apple-macos/button.ts`
- **Cozum:** Tum yerel hexToRgb fonksiyonlarini sil, `tokens/colors.ts`'den import et
- **Kaynak:** Token Validation, UI Design Audit

### 1.2 Schema-Handler uyumsuzluklarini duzelt
| Sorun | Dosya | Cozum |
|-------|-------|-------|
| Vector paths: schema array, handler tek string | schemas/index.ts + handlers/shapes.ts | Handler'i coklu path destekleyecek sekilde guncelle |
| FindNodes limit: schema max:1000, handler sinirsiz | handlers/query.ts | Handler'a limit uygula |
| ScaleNode origin: schema'da var, handler'da yok | handlers/transform.ts | Origin parametresini implement et |
| Star innerRadius: schema 0.5, handler 0.4 | schemas/index.ts | Schema default'u 0.4 yap |

### 1.3 Session tool API tutarliligini sagla
- **Dosya:** `mcp-server/src/tools/session.ts`
- **Sorun:** `server.tool()` (eski API) kullaniliyor, diger 26 modul `server.registerTool()` kullaniyor
- **Cozum:** `server.registerTool()` API'sine gecir

### 1.4 Olu schemalari temizle veya implement et
- **Dosya:** `mcp-server/src/schemas/index.ts`
- **Sorun:** 9 schema tanimli ama hicbir yerde kullanilmiyor (7 Prototype + 2 Export)
- **Cozum:** Faz 2.3'te implement edilecekler icin birak, diger olu kodlari temizle

### 1.5 Sessiz hatalari duzelt
| Sessiz Hata | Dosya | Cozum |
|-------------|-------|-------|
| Gecersiz hex → sessizce siyah | paint-helpers.ts | Hata firlat veya response'a uyari ekle |
| Font fallback → sessizce Inter | font-helpers.ts | Response'a "fallback kullanildi" bilgisi ekle |
| Frame x,y → sessizce ignore | handlers/shapes.ts | Response'a uyari mesaji ekle |
| Fill/Effect override | handlers/styling.ts | Onceki degerlerin uzerine yazildigini bildir |

---

## Faz 2: Temel Iyilestirmeler (Hafta 2-4)

> Profesyonel gorunum ve eksik araclar.

### 2.1 [KRITIK] Emoji ikonlari Lucide SVG ile degistir
- **Etki:** Tum tasarim sistemleri, profesyonel gorunumu ciddi etkiliyor
- **Mevcut:** Proje zaten Lucide SVG ikon sistemi iceriyor (`figma-plugin/src/icons/`)
- **Degistirilecek emoji'ler:**

| Dosya | Mevcut | Hedef |
|-------|--------|-------|
| apple-ios/tab-bar.ts | "🏠","🔍","➕","💬","👤" | home, search, plus, message-circle, user |
| apple-ios/navigation-bar.ts | "🔍", "←" | search, arrow-left |
| apple-ios/list.ts | ">" | chevron-right |
| shadcn/alert.ts | "⚠","ℹ" | alert-triangle, info |
| shadcn/accordion.ts | "▲","▼" | chevron-up, chevron-down |
| shadcn/select.ts | "▲","▼" | chevron-up, chevron-down |
| apple-macos/window.ts | sidebar emojiler | sidebar SVG ikonlar |
| liquid-glass/index.ts | "🏠","🔍" vb. | Lucide ikonlar |

- **Uygulama:** `figma.createNodeFromSvg()` ile SVG path olustur, mevcut `handleCreateIcon` pattern'ini kullan

### 2.2 Hardcoded degerleri token referanslarina cevir
- **~45 hardcoded deger tespit edildi**
- **Oncelik sirasi:**

**Kritik (tema degisikligini etkiler):**
- macOS sidebar/toolbar/table bg renkleri → `appleMacOSLight/Dark` token
- iOS actionSheet/alert bg renkleri → `appleIOSLight/Dark` token
- Avatar status renkleri → yeni status token'lari
- Table status renkleri → yeni status token'lari

**Yuksek:**
- cornerRadius degerleri (6, 8, 12) → `radius["md"]`, `radius["lg"]`, `radius["xl"]`
- Shadow degerleri (switch, slider, tabs, tooltip, select) → `shadcnShadows`
- fontSize degerleri → ilgili typography token

**Eksik token'lari ekle:**
```typescript
// tokens/colors.ts'e eklenecek
status: {
  success: "#22C55E",  // avatar online, table paid
  warning: "#F59E0B",  // avatar away, table pending
  error: "#EF4444",    // avatar busy, table failed
  info: "#3B82F6",     // bildirim, alert
}
```

### 2.3 Eksik P0 araclari implement et (9 arac)
- **Prototype/Interaction (7 arac):**
  - `figma_set_reactions`
  - `figma_add_reaction`
  - `figma_get_reactions`
  - `figma_remove_reactions`
  - `figma_set_flow_starting_point`
  - `figma_get_flow_starting_points`
  - `figma_remove_flow_starting_point`

- **Export (2 arac):**
  - `figma_export_node` (PNG/JPG/SVG/PDF)
  - `figma_export_multiple`

- **Adimlar:** Schema zaten var → MCP tool kaydini yap → Plugin handler'larini implement et

### 2.4 VALIDATE_HIERARCHY tool olustur
- **Yeni dosyalar:**
  - `mcp-server/src/tools/hierarchy-validator.ts`
  - `figma-plugin/src/handlers/hierarchy-validator.ts`
- **14 dogrulama kurali:**
  - Yapisal: MAX_NESTING_DEPTH, NO_EMPTY_CONTAINERS, NO_SINGLE_CHILD_WRAPPER, NO_NESTED_INTERACTIVE, VALID_PARENT_TYPE, NO_ORPHAN_NODES
  - Layout: FILL_REQUIRES_AUTOLAYOUT_PARENT, NO_CONSTRAINTS_IN_AUTOLAYOUT, CONSISTENT_CHILD_SIZING
  - Gorsel: SPACING_TOKEN_COMPLIANCE, RADIUS_TOKEN_COMPLIANCE, COLOR_TOKEN_COMPLIANCE
  - A11y: TOUCH_TARGET_MINIMUM, TEXT_CONTRAST_RATIO
- **Puanlama:** 0-100 skor (90+=Mukemmel, 70+=Iyi, 50+=Orta, <50=Zayif)

### 2.5 Liquid Glass modularizasyonu
- **Sorun:** `liquid-glass/index.ts` tek dosyada 900+ satir
- **Cozum:** Her bilesen ayri dosyaya:
  ```
  liquid-glass/
  ├── index.ts        (barrel export + ortak helper'lar)
  ├── button.ts
  ├── tab-bar.ts
  ├── navigation-bar.ts
  ├── card.ts
  ├── toggle.ts
  ├── sidebar.ts
  ├── floating-panel.ts
  ├── modal.ts
  ├── search-bar.ts
  └── toolbar.ts
  ```

### 2.6 Hata mesajlarini iyilestir
- **Mevcut format:** `"Error: Unknown error"`
- **Hedef format:** `"X yapilamadi. Muhtemelen Y nedeniyle. Z'yi deneyin."`
- **Error taxonomy olustur:**
  - `CONNECTION_ERROR`: Figma plugin baglantisi yok
  - `TIMEOUT_ERROR`: Komut zamani asimi
  - `VALIDATION_ERROR`: Gecersiz parametre
  - `NODE_NOT_FOUND`: Node bulunamadi
  - `FONT_NOT_FOUND`: Font yuklenemedi
  - `PARENT_REQUIRED`: Parent gerekli
  - `AUTOLAYOUT_REQUIRED`: Auto-layout gerekli

### 2.7 iOS tab-bar label fontSize duzelt
- **Dosya:** `apple-ios/tab-bar.ts`
- **Sorun:** `fontSize = 10` hardcoded, `iosTypography.caption2.size = 11` olmali
- **Kaynak:** Token Validation

---

## Faz 3: Kullanici Deneyimi (Ay 2)

> UX iyilestirmeleri ve kullanici memnuniyeti.

### 3.1 [KRITIK] Tasarim duzenleme (Edit Mode) mekanizmasi
- **Mevcut sorun:** Her degisiklik icin tasarim sifirdan olusturuluyor
- **Cozum:**
  1. Edit Mode Agent olustur (mevcut node'lari bulup degistirme)
  2. `figma_find_nodes` + `figma_modify_node` + `figma_set_fill` vb. ile incremental update
  3. Session'a olustrulan node ID'lerini kaydet (later reference icin)
- **Onem:** UX Audit'te #1 oncelikli sorun (C1)

### 3.2 Session persistence (dosya bazli kayit)
- **Dosya:** `mcp-server/src/session/state.ts`
- **Sorun:** Tum session'lar in-memory, server restart = veri kaybi
- **Cozum:**
  - Her session olusturma/guncelleme'de JSON dosyaya yaz
  - Server basladiginda mevcut session'lari restore et
  - Auto-save her kritik operasyonda

### 3.3 Real-time ilerleme gostergesi
- **Plugin UI'da:**
  - "Design Activity" paneli (suanki olusturulan bilesen)
  - Progress bar (X/Y bilesen tamamlandi)
  - Son action bilgisi
- **CLI'da:**
  - MCP response'larina progress bilgisi ekle
  - "3/15 bilesen olusturuluyor..." gibi mesajlar

### 3.4 Plugin UI iyilestirmeleri
- **Quick Start Guide guncelle:** "Start WebSocket server" → "MCP server embedded WS kullaniyor"
- **Design Activity paneli ekle** (UX Audit mockup'larina gore)
- **Help/About modallari** icin gercek icerik
- **Version badge'i** package.json'dan oku
- **Dark mode destegi** ekle
- **Auto-connect** exponential backoff ile iyilestir

### 3.5 Coklu ekran is akisi
- **Design Agent'a coklu ekran plan formati ekle**
- **Batch execution** (birden fazla ekrani sirayla olustur)
- **Ekranlar arasi prototip flow** (Faz 2.3'teki prototype araclariyla)

### 3.6 Baglanti kopmasinda kurtarma (Recovery)
- **Command queue** ile retry mekanizmasi
- **Execution log'dan devam etme** (resume) ozelligi
- **Figma Plugin'de offline buffer**

---

## Faz 4: Kod Kalitesi ve Test (Ay 2-3)

> Surdurulebilirlik ve guvenilirlik.

### 4.1 Test altyapisi kur
- **Framework:** Vitest (TypeScript native, hizli, ESM uyumlu)
- **Oncelikli 10 test:**
  1. Handler factory dogru action gonderiyor mu
  2. Zod schema validasyonu (gecerli/gecersiz input)
  3. WebSocket baglanti lifecycle
  4. Command timeout
  5. Heartbeat dead connection tespiti
  6. Session manager CRUD
  7. Message queue (offline → online)
  8. Tool kaydi (tum 119 tool)
  9. Color schema parsing
  10. Plugin command router
- **Hedef:** 3 ayda %60 kapsam

### 4.2 Buyuk dosyalari bol
| Dosya | Satir | Bolunme Plani |
|-------|-------|---------------|
| schemas/index.ts | 1404 | shapes.ts, components.ts, styles.ts, layout.ts, prototype.ts |
| handlers/components.ts | 1158 | button.ts, input.ts, card.ts, kpi-card.ts, icon.ts |
| handlers/smart-layout.ts | 643 | strategies.ts, optimizer.ts, grid.ts |

### 4.3 Lint ve format araclarini kur
- ESLint + TypeScript plugin
- Prettier
- `npm run lint` ve `npm run format` scriptleri
- Pre-commit hook

### 4.4 Root workspace yonetimi
- Root `package.json` olustur (monorepo workspace)
- `npm run build:all`, `npm run test:all`, `npm run lint:all`
- Ortak dependency'leri root'a tasi

### 4.5 CI/CD pipeline
- GitHub Actions:
  - Build (tum paketler)
  - Typecheck (`tsc --noEmit`)
  - Lint
  - Test
  - PR check

---

## Faz 5: Buyume ve Genisleme (Ay 3-6)

> Yeni ozellikler ve performans.

### 5.1 Eksik shadcn bilesenleri ekle (oncelik sirasi)
| Bilesen | Oncelik | Aciklama |
|---------|---------|----------|
| Breadcrumb | Yuksek | Navigasyon temeli |
| Pagination | Yuksek | DataTable ile gerekli |
| Navigation Menu | Yuksek | Sayfa navigasyonu |
| Command (CMDK) | Yuksek | Komut paleti |
| Calendar | Orta | Tarih secimi |
| Date Picker | Orta | Calendar ile birlikte |
| Context Menu | Orta | Sag tiklama |
| Menubar | Orta | Uygulama menusu |
| Hover Card | Orta | Onizleme |
| Toggle Group | Orta | Gruplu toggle |

### 5.2 Batch operasyonlar
- Tek WebSocket mesajinda coklu komut
- Plugin tarafinda transaction mekanizmasi
- Tahmini performans artisi: %40-60

### 5.3 Min/Max boyut kisitlamalari
- `minWidth`, `maxWidth`, `minHeight`, `maxHeight` tool'lari
- Figma API zaten destekliyor, sadece MCP tool + handler gerekli

### 5.4 Erisilebilirlik iyilestirmeleri
- Renk kontrast oranlari dogrulamasi (WCAG 2.1 AA)
- Focus durumlari bilesenlere eklenmesi
- Touch target kontrolunun genisletilmesi

### 5.5 Performans optimizasyonlari
- Font loading cache (session bazli)
- findAll() yerine scope'lu arama
- Node registry LRU cache veya WeakRef
- JSON.stringify pretty print'i production'da kaldirma
- SVG icon olusturma cache'leme

### 5.6 Responsive destek
- Breakpoint token'larinin bilesenlere entegrasyonu
- Device preset'lerine gore otomatik boyutlandirma
- Multi-device layout yonetimi

---

## Ozet Tablo

| Faz | Sure | Gorev Sayisi | Oncelik |
|-----|------|-------------|---------|
| Faz 0: Kritik Duzeltmeler | 1-2 gun | 4 | ACIL |
| Faz 1: Temel Altyapi | 1 hafta | 5 | Yuksek |
| Faz 2: Temel Iyilestirmeler | 2-4 hafta | 7 | Yuksek |
| Faz 3: Kullanici Deneyimi | 1 ay | 6 | Orta-Yuksek |
| Faz 4: Kod Kalitesi | 1-2 ay | 5 | Orta |
| Faz 5: Buyume | 3-6 ay | 6 | Orta-Dusuk |

### Bagimlilk Grafigi

```
Faz 0 ──→ Faz 1 ──→ Faz 2 ──→ Faz 3
                 │              │
                 └──→ Faz 4 ───┘
                                │
                                └──→ Faz 5
```

- Faz 0 → Faz 1: Guvenlik ve bug fix'ler oncekosul
- Faz 1 → Faz 2: Token/schema tutarliligi oncekosul
- Faz 1 → Faz 4: Test altyapisi Faz 1'den sonra baslatilabilir
- Faz 2 + Faz 4 → Faz 3: UX iyilestirmeleri icin araclar ve testler hazir olmali
- Faz 3 + Faz 4 → Faz 5: Buyume icin temel hazir olmali

---

## Metrikler ve Basari Kriterleri

| Metrik | Mevcut | Faz 2 Sonrasi | Faz 5 Sonrasi |
|--------|--------|---------------|---------------|
| Kod Kalitesi | 8.0/10 | 8.5/10 | 9.0/10 |
| UI Kalitesi | 7.0/10 | 8.0/10 | 9.0/10 |
| Token Tutarliligi | 7/10 | 9/10 | 9.5/10 |
| Test Kapsami | %0 | %30 | %80 |
| Hardcoded Deger | ~45 | <10 | 0 |
| Emoji Ikon | 15+ | 0 | 0 |
| Eksik Arac | 9 | 0 | 0 |
| UX Puani | 2.7/5 | 3.5/5 | 4.5/5 |
| Guvenlik Sorunlari | 2 | 0 | 0 |
