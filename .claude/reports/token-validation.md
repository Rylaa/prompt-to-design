# Design Token Validation Report

**Tarih:** 2026-02-08
**Kapsam:** `figma-plugin/src/tokens/` ve tum component dosyalari
**Durum:** Tamamlandi

---

## 1. Token Sistemi Genel Degerlendirme

### 1.1 Dosya Yapisi

| Dosya | Satir | Durum |
|-------|-------|-------|
| `tokens/colors.ts` | ~522 | Iyi yapilandirilmis |
| `tokens/spacing.ts` | ~283 | Iyi yapilandirilmis |
| `tokens/typography.ts` | ~513 | Iyi yapilandirilmis |
| `tokens/shadows.ts` | ~321 | Iyi yapilandirilmis |
| `tokens/animations.ts` | ~305 | Iyi yapilandirilmis |
| `tokens/index.ts` | ~372 | Iyi yapilandirilmis |

### 1.2 Genel Puan: 7/10

Token sistemi iyi tasarlanmis ancak component katmaninda tutarsiz kullanim mevcut. Token tanimlari Figma API ile uyumlu, ancak componentlerin buyuk kismi token'lari bypass ediyor.

---

## 2. Token Tanimlari - Detayli Analiz

### 2.1 Renkler (`colors.ts`)

**RGB Degerleri (0-1 Aralik):** GECERLI
`hexToRgb()` fonksiyonu dogru sekilde 255'e bolerek 0-1 araligina donusturuyor.

**Hex Kodlari:** GECERLI
Tum hex kodlari `#RRGGBB` formatinda ve gecerli.

**Tema Kapsami:**
- shadcn: light/dark - TAMAM
- Apple iOS: light/dark - TAMAM
- Apple macOS: light/dark - TAMAM
- Liquid Glass: light/dark - TAMAM
- Liquid Glass Effects: light/dark - TAMAM

**Sorun - iOS Label Renkleri:**
```
iOS tertiaryLabel ve quaternaryLabel ayni hex degerlerine sahip:
  Light: tertiaryLabel = #3C3C43, quaternaryLabel = #3C3C43
  Dark:  tertiaryLabel = #EBEBF5, quaternaryLabel = #EBEBF5

Apple HIG'e gore bunlar farkli opacity degerleri olmali:
  tertiaryLabel: 0.3 opacity
  quaternaryLabel: 0.18 opacity
```
**Oncelik:** Orta

### 2.2 Spacing (`spacing.ts`)

**Olcek Tutarliligi:** GECERLI
4px base unit ile tutarli Tailwind-esintili olcek (0-384px).

**Platform Spacing:**
- `iosSpacing`: Apple HIG degerlerine uygun
- `macOSSpacing`: Apple HIG degerlerine uygun
- `shadcnSpacing`: shadcn/ui degerlerine uygun

**Radius Olcegi:** GECERLI
none(0) -> sm(2) -> default(4) -> md(6) -> lg(8) -> xl(12) -> 2xl(16) -> 3xl(24) -> full(9999)

**Sorun yok.**

### 2.3 Tipografi (`typography.ts`)

**Font Aileleri:** GECERLI
- Web: Inter, Geist Sans, Geist Mono
- Apple: SF Pro Display, SF Pro Text, SF Pro Rounded, SF Mono, SF Compact

**getFigmaFontStyle() Eslesmesi:**
| Weight | Cikti | Figma Uyumu |
|--------|-------|-------------|
| 100 | "Thin" | TAMAM |
| 200 | "ExtraLight" | TAMAM |
| 300 | "Light" | TAMAM |
| 400 | "Regular" | TAMAM |
| 500 | "Medium" | TAMAM |
| 600 | "Semi Bold" | TAMAM (Figma'da "SemiBold" olabilir) |
| 700 | "Bold" | TAMAM |
| 800 | "ExtraBold" | RISKLI - Inter'de "ExtraBold" stili olmayabilir |
| 900 | "Black" | TAMAM |

**Sorun - Weight 800 Riski:**
```
shadcnTypography.h1 weight=800 kullanir -> getFigmaFontStyle "ExtraBold" dondurur
Inter fontunda "ExtraBold" stili mevcut olmayabilir.
Figma'da "Extra Bold" (bosluklu) veya "ExtraBold" (bosluks) farkli muamele gorebilir.
```
**Oncelik:** Dusuk (fallback mekanizmasi applyTypography'de mevcut)

### 2.4 Golge Tokenlari (`shadows.ts`)

**Figma Effect Formati:** GECERLI
`shadowsToFigmaEffects()` dogru donusum yapiyor:
- `type`: "DROP_SHADOW" | "INNER_SHADOW" -> Figma Effect type
- `color`: `{r, g, b, a}` -> 0-1 araliginda
- `offset`: `{x, y}` -> pixel cinsinden
- `radius`: blur degeri
- `spread`: spread degeri
- `blendMode`: "NORMAL"
- `visible`: true

**Platform Golgeleri:** TAMAM
- shadcn: sm, default, md, lg, xl, 2xl, inner, none
- iOS Light/Dark: navBar, card, actionSheet, modal
- macOS Light/Dark: window, dialog, popover, menu, toolbar

**Sorun yok.**

### 2.5 Animasyon Tokenlari (`animations.ts`)

**Durum:** GECERLI
Figma Plugin API'sinde animasyon dogrudan desteklenmez, bu tokenlar referans/dokumasyon amacli.
- Duration, easing, z-index, breakpoints, opacity, grid tokenlari dogru tanimlanmis.

### 2.6 Index (`index.ts`)

**Theme Manager:** GECERLI
- Light/dark/custom tema degisimi dogru calisiyor
- Platform degisimi (shadcn/ios/macos) dogru calisiyor
- Custom color overlay mekanizmasi mevcut

**Helper Fonksiyonlar:** GECERLI
- `colorTokenToPaint()`: ColorToken -> SolidPaint donusumu dogru
- `applyTypography()`: Font yukleme + fallback mekanizmasi dogru
- `applyShadow()`: Shadow preset -> Figma effects dogru
- Glass effect helpers: Blur, shadow, specular effect olusturma dogru

---

## 3. Component-Token Uyumu

### 3.1 Duplike hexToRgb() Fonksiyonlari

Birden fazla component kendi `hexToRgb()` fonksiyonunu tanimliyor, `tokens/colors.ts`'deki merkezi fonksiyonu import etmek yerine:

| Dosya | Satir (yaklasik) |
|-------|------------------|
| `components/shadcn/badge.ts` | ~15 |
| `components/shadcn/avatar.ts` | ~10 |
| `components/apple-ios/button.ts` | ~10 |
| `components/apple-ios/navigation-bar.ts` | ~10 |
| `components/apple-macos/button.ts` | ~10 |

**Etki:** Kod tekrari, bakimda tutarsizlik riski
**Oncelik:** Yuksek

### 3.2 Hardcoded Degerler - shadcn Componentleri

| Dosya | Hardcoded Deger | Beklenen Token |
|-------|----------------|----------------|
| `shadcn/button.ts` | `cornerRadius = 6` | `radius["md"]` (6) |
| `shadcn/button.ts` | `itemSpacing = 8` | `spacing["2"]` (8) |
| `shadcn/button.ts` | Manuel hex parse `parseInt(hex.slice(...))` | Token'in `.rgb` property'si |
| `shadcn/card.ts` | `cornerRadius = 12` | `radius["xl"]` (12) |
| `shadcn/badge.ts` | `fontSize = 12` | `shadcnTypography.small.size` (14) |
| `shadcn/checkbox.ts` | Label `fontSize = 14` | `shadcnTypography.body.size` |
| `shadcn/checkbox.ts` | Font `"Inter", "Regular"` | `shadcnTypography.body.family/weight` |
| `shadcn/switch.ts` | Thumb shadow `{a:0.1}, y:1, r:2` | `shadcnShadows.sm` |
| `shadcn/switch.ts` | Label `fontSize = 14` | `shadcnTypography.body.size` |
| `shadcn/progress.ts` | Slider thumb shadow hardcoded | `shadcnShadows.sm` |
| `shadcn/tabs.ts` | Active tab shadow `{a:0.05}, y:1, r:2` | `shadcnShadows.sm` |
| `shadcn/tabs.ts` | TabList padding `4` | `spacing["1"]` (4) |
| `shadcn/tabs.ts` | Font `fontSize = 14` | `shadcnTypography.body.size` |
| `shadcn/dialog.ts` | Title `fontSize = 18` | `shadcnTypography.large.size` (18) - deger ayni ama token kullanilmali |
| `shadcn/dialog.ts` | Sheet padding `24` | `shadcnSpacing.dialogPadding` (24) - deger ayni ama token kullanilmali |
| `shadcn/alert.ts` | Toast padding `16` | `shadcnSpacing.alertPadding` (16) |
| `shadcn/alert.ts` | Toast shadow hardcoded | `shadcnShadows.lg` |
| `shadcn/tooltip.ts` | Tooltip padding `12/6` | `shadcnSpacing.tooltipPadding` (12) |
| `shadcn/tooltip.ts` | Popover shadow hardcoded | `shadcnShadows.md` |
| `shadcn/table.ts` | Cell padding `16/12` | Spacing token yok (yeni token gerekli) |
| `shadcn/table.ts` | Status renkleri: paid `{r:0.13,g:0.55,b:0.13}` | Token sisteminde yok |
| `shadcn/table.ts` | Status renkleri: pending `{r:0.85,g:0.65,b:0.13}` | Token sisteminde yok |
| `shadcn/accordion.ts` | Trigger padding `16` | `spacing["4"]` (16) |
| `shadcn/accordion.ts` | Font `fontSize = 14` | `shadcnTypography.body.size` |
| `shadcn/avatar.ts` | Status online `#22C55E` | Token sisteminde yok |
| `shadcn/avatar.ts` | Status offline `#71717A` | Token sisteminde yok |
| `shadcn/avatar.ts` | Status away `#F59E0B` | Token sisteminde yok |
| `shadcn/avatar.ts` | Status busy `#EF4444` | Token sisteminde yok |
| `shadcn/select.ts` | Dropdown shadow hardcoded | `shadcnShadows.md` |
| `shadcn/select.ts` | Dropdown padding `4/8` | `spacing` token |
| `shadcn/input.ts` | Textarea `fontSize = 14` | `shadcnTypography.input.size` |

### 3.3 Hardcoded Degerler - Apple iOS Componentleri

| Dosya | Hardcoded Deger | Beklenen Token |
|-------|----------------|----------------|
| `apple-ios/button.ts` | Foreground `"#FFFFFF"` | Token rgb property |
| `apple-ios/button.ts` | Button boyutlari (height/padding/fontSize) | `iosSpacing` + `iosTypography` |
| `apple-ios/tab-bar.ts` | Label `fontSize = 10` | `iosTypography.caption2.size` (11) |
| `apple-ios/list.ts` | Toggle boyutlari `51x31` | Yeni token gerekli |
| `apple-ios/controls.ts` | iOS Slider thumb shadow hardcoded | `iosShadowsLight/Dark` |
| `apple-ios/controls.ts` | Font `"Inter"` kullanimi | `fontFamilies.apple` (SF Pro) |
| `apple-ios/action-sheet.ts` | Light bg `{r:0.95, g:0.95, b:0.97}` | `appleIOSLight` token |
| `apple-ios/action-sheet.ts` | Alert bg `{r:0.97, g:0.97, b:0.98}` | Yeni token gerekli |
| `apple-ios/action-sheet.ts` | Alert shadow hardcoded | `iosShadowsLight.modal` |

### 3.4 Hardcoded Degerler - Apple macOS Componentleri

| Dosya | Hardcoded Deger | Beklenen Token |
|-------|----------------|----------------|
| `apple-macos/window.ts` | Sidebar bg `{r:0.96, g:0.96, b:0.97}` | `appleMacOSLight` token |
| `apple-macos/button.ts` | Push button bg `{r:1, g:1, b:1}` | Token gerekli |
| `apple-macos/button.ts` | Gradient stops hardcoded | Yeni token gerekli |
| `apple-macos/controls.ts` | Toolbar bg `{r:0.95, g:0.95, b:0.95}` | Yeni token gerekli |
| `apple-macos/controls.ts` | Table header bg `{r:0.96, g:0.96, b:0.96}` | Yeni token gerekli |
| `apple-macos/controls.ts` | Alternating row `{r:0.98, g:0.98, b:0.98}` | Yeni token gerekli |
| `apple-macos/controls.ts` | Font `"Inter"` kullanimi | `fontFamilies.apple` (SF Pro) |

### 3.5 Liquid Glass Componentleri

**Durum:** EN IYI TOKEN KULLANIMI

Tum Liquid Glass componentleri (`liquid-glass/index.ts`) token sistemini dogru ve tutarli sekilde kullaniyor:
- `getLiquidGlassColors()` ile renk tokenlari
- `getLiquidGlassEffects()` ile efekt tokenlari
- `applyGlassMaterial()` merkezi fonksiyonu ile blur, shadow, specular efektleri
- Tema degisikligini tam destekliyor

**Tek Sorun:** Font olarak `"Inter"` kullaniyor (SF Pro yerine). Bu kabul edilebilir cunku Figma'da SF Pro her zaman mevcut degil.

---

## 4. Eksik Tokenlar

Componentlerde kullanilan ancak token sisteminde tanimlanmamis degerler:

| Kategori | Eksik Token | Kullanan Component |
|----------|------------|-------------------|
| Renk | Status renkleri (success/warning/error/info) | avatar.ts, table.ts |
| Renk | iOS actionSheet/alert arkaplan renkleri | action-sheet.ts |
| Renk | macOS sidebar/toolbar arkaplan renkleri | window.ts, controls.ts |
| Spacing | Table cell padding (cellPaddingH/V) | table.ts |
| Spacing | iOS toggle boyutlari | list.ts |
| Spacing | macOS alternating row/header renkleri | controls.ts |

---

## 5. Kullanilmayan (Dead) Tokenlar

Potansiyel olarak kullanilmayan tokenlar:

| Token | Dosya | Neden |
|-------|-------|-------|
| `animations.ts` (tamami) | animations.ts | Figma Plugin API animasyon desteklemiyor, referans amacli |
| `BASE_UNIT` | spacing.ts:43 | Tanimlanmis ama hicbir yerde kullanilmiyor |
| `getSpacing()` | spacing.ts:240 | `spacing[key]` dogrudan kullaniliyor, wrapper gereksiz |
| `getRadius()` | spacing.ts:245 | `radius[key]` dogrudan kullaniliyor, wrapper gereksiz |
| `pxToSpacingKey()` | spacing.ts:250 | Componentlerde kullanilmiyor |
| `pxToRadiusKey()` | spacing.ts:269 | Componentlerde kullanilmiyor |
| `getAllTokens()` | index.ts:276 | Export ediliyor ama kullanim bulunamadi |
| `getColor()` | index.ts:130 | Export ediliyor ama kullanim bulunamadi |
| `themeManager.toggleTheme()` | index.ts:87 | Export ediliyor ama kullanim bulunamadi |

---

## 6. Token Cakismalari

### 6.1 hexToRgb Cakismasi
5 farkli dosyada tanimlanan `hexToRgb()` fonksiyonu, `tokens/colors.ts`'deki merkezi versiyonla cakisiyor. Hepsi ayni islevi goruyor ancak bagimsiz kopyalar.

### 6.2 cornerRadius Tutarsizligi
shadcn componentlerinde cornerRadius degerleri dogrudan sayi olarak kullaniliyor (`6`, `12`) ancak `radius` token sistemi mevcut (`md: 6`, `xl: 12`). Token sistemi bypass ediliyor.

### 6.3 fontSize Tutarsizligi
Badge'de `fontSize = 12` hardcoded ama `shadcnTypography.small.size = 14`. Deger uyumsuzlugu mevcut.

### 6.4 iOS Tab Bar Label Boyutu
`tab-bar.ts`'de `fontSize = 10` hardcoded ama `iosTypography.caption2.size = 11`. Apple HIG'e gore caption2 = 11pt olmali.

---

## 7. Tema Degisikligi Destegi

| Platform | Tema Destegi | Not |
|----------|-------------|-----|
| shadcn | TAMAM | Light/dark/custom destegi |
| Apple iOS | TAMAM | Light/dark destegi |
| Apple macOS | KISMEN | Hardcoded arkaplan renkleri tema degisikliginde guncellenmez |
| Liquid Glass | TAMAM | Light/dark tam destek |

**Sorunlu Alanlar:**
- macOS sidebar bg hardcoded `{r:0.96, g:0.96, b:0.97}` -> dark modda beyaz kalir
- macOS toolbar bg hardcoded `{r:0.95, g:0.95, b:0.95}` -> dark modda beyaz kalir
- iOS actionSheet bg hardcoded -> dark modda yanlislikla acik renk gosterir

---

## 8. Ozet ve Oncelikli Aksiyonlar

### Kritik (Hemen Yapilmali)
1. **Duplike `hexToRgb()` fonksiyonlarini kaldir** - 5 dosyadan sil, `tokens/colors.ts`'den import et
2. **iOS tab-bar label fontSize duzelt** - 10 -> `iosTypography.caption2.size` (11)
3. **Badge fontSize duzelt** - 12 -> typography token kullan

### Yuksek Oncelik
4. **cornerRadius degerlerini token'a bagla** - `radius["md"]`, `radius["xl"]` vb. kullan
5. **Shadow degerlerini token'a bagla** - switch, slider, tabs, tooltip, select, alert/toast
6. **Eksik status renklerini token'a ekle** - success, warning, error, info renkleri
7. **macOS hardcoded arkaplan renklerini token'a bagla** - sidebar, toolbar, table header

### Orta Oncelik
8. **iOS tertiaryLabel/quaternaryLabel degerlerini duzelt** - Farkli opacity ekle
9. **Font kullanimi standardize et** - Apple componentlerinde SF Pro vs Inter tutarliligi
10. **Typography token kullanimi yayginlastir** - Label/body fontSize degerlerini token'dan al

### Dusuk Oncelik
11. **Kullanilmayan token'lari temizle** - `BASE_UNIT`, wrapper fonksiyonlar
12. **Table cell padding token'i ekle** - `shadcnSpacing`'e ekle
13. **iOS toggle boyut token'i ekle** - `iosSpacing`'e ekle

---

## 9. Istatistikler

| Metrik | Deger |
|--------|-------|
| Toplam token dosyasi | 6 |
| Toplam component dosyasi | ~25 |
| Hardcoded deger sayisi | ~45 |
| Duplike fonksiyon | 5 (hexToRgb) |
| Eksik token | ~12 |
| Kullanilmayan token | ~8 |
| Token cakismasi | 4 |
| En iyi token kullanimi | Liquid Glass |
| En kotu token kullanimi | shadcn (hardcoded deger sayisi en fazla) |
