# Tasarim Hiyerarsisi Dogrulama Raporu

**Tarih:** 2026-02-08
**Kapsam:** prompt-to-design projesi - Figma Plugin + MCP Server
**Amac:** Istenen tasarim yapisi ile Figma'da olusturulan gercek yapi arasindaki farklari tespit etmek ve otomatik dogrulama sistemi tasarlamak.

---

## 1. Mevcut Dogrulama Kapsami

### 1.1 Aktif Lint Kurallari (layout.ts - LINT_LAYOUT handler)

| Kural | Aciklama | Seviye | Durum |
|-------|----------|--------|-------|
| `NO_ABSOLUTE_POSITION` | Frame'lerde x,y konumlama kullanilmamali | error | Aktif |
| `AUTO_LAYOUT_REQUIRED` | Tum frame'ler Auto Layout'a sahip olmali | error | Aktif |
| `VALID_SIZING_MODE` | FILL/HUG/FIXED dogru kullanilmali | error | Aktif |
| `SPACING_TOKEN_ONLY` | Spacing degerleri token sistemine uymali | error | Aktif |
| `FILL_REQUIRED_ON_ROOT` | Root frame'de fill rengi olmali | error | Aktif |
| `VISUAL_HIERARCHY` | Baslik/govde metin boyut hiyerarsisi | warning | Aktif |
| `CONSISTENT_SPACING` | Spacing token uyumlulugu (genisletilmis) | warning | Aktif |
| `TOUCH_TARGET_SIZE` | Interaktif elemanlar min 44x44px | warning | Aktif |
| `ALIGNMENT_CONSISTENCY` | Cocuk elemanlarin hizalama tutarliligi | warning | Aktif |
| `PROXIMITY_GROUPING` | Iliskili elemanlarin yakinlik kontrolu | warning | Aktif |
| `CONTRAST_RATIO` | Metin rengi kontrast orani (basitlestirilmis) | warning | Aktif |

### 1.2 Smart Layout Sistemi (smart-layout.ts)

Smart Layout sistemi tasarim optimizasyonu sunar ancak **dogrulama degil, duzeltme odaklidir**:
- Strateji tespiti: CARD_GRID, FORM_LAYOUT, NAVIGATION, CONTENT_STACK, HERO_SECTION
- 8-point grid uygulama (`snapToGrid`)
- Touch target dogrulama (platform bazli: web=44px, android=48px)
- Gorsel hiyerarsi optimizasyonu
- Rekursif cocuk frame optimizasyonu (max derinlik: 10)

### 1.3 Query Sistemi (query.ts)

Node sorgulama altyapisi mevcut:
- `GET_NODE_INFO`: Detayli node bilgisi (children, layout, fills, strokes, constraints)
- `FIND_NODES`: Tip ve isim bazli arama
- `FIND_CHILDREN`: Belirli parent altinda arama (rekursif destekli)
- `GET_PAGE_INFO`: Sayfa ustu node listesi

### 1.4 Eksik Olan Dogrulama Alanlari

| Alan | Aciklama | Oncelik |
|------|----------|---------|
| **Hiyerarsi Derinlik Kontrolu** | Max nesting seviyesi kontrolu yok | Yuksek |
| **Bos Container Kontrolu** | Cocugu olmayan frame'ler tespit edilmiyor | Yuksek |
| **Gereksiz Wrapper Kontrolu** | Tek cocuklu frame'ler kontrol edilmiyor | Yuksek |
| **Naming Convention Kontrolu** | Node isimlerinin tutarliligi kontrol edilmiyor | Orta |
| **Component Nesting Kurallari** | Button icinde button gibi yanlis nesting yok | Yuksek |
| **Z-order Kontrolu** | Layer siralama dogrulugu kontrol edilmiyor | Dusuk |
| **Overflow Kontrolu** | Cocuklarin parent sinirlarini asmasi kontrol edilmiyor | Orta |
| **Detached Auto-Layout** | Auto-layout kaybeden frame'ler tespit edilmiyor | Orta |
| **Constraint Celiskisi** | FILL sizing + auto-layout olmayan parent celiskisi kismen kontrol ediliyor (shapes.ts:177), ancak lint'te yok | Orta |
| **Orphan Node Kontrolu** | Parent'siz kalmis node'lar kontrol edilmiyor | Dusuk |

---

## 2. Tespit Edilen Yapisal Sorunlar

### 2.1 Tutarsiz Naming Convention

**Sorun:** Ayni kavram farkli dosyalarda farkli isimlerle olusturuluyor.

| Kaynak | Frame Adlandirma | Ornek |
|--------|-----------------|-------|
| `components.ts` - handleCreateButton | `params.name \|\| "Button"` | "Button" |
| `components.ts` - createButtonComponent | `Button/${variant}` | "Button/primary" |
| `shadcn/button.ts` | `Button/${variant}` | "Button/default" |
| `components.ts` - handleCreateInput | `params.name \|\| "Input"` | "Input" |
| `components.ts` - createInputComponent | `Input/${variant}` | "Input/outline" |
| `components.ts` - handleCreateCard | `params.name \|\| "Card"` | "Card" |
| `shadcn/card.ts` | `"Card"` (sabit) | "Card" |
| `shadcn/card.ts` - header | `"CardHeader"` (sabit) | "CardHeader" |
| `shadcn/card.ts` - content | `"CardContent"` (sabit) | "CardContent" |
| `shapes.ts` - handleCreateFrame | `params.name \|\| "Frame"` | "Frame" |

**Analiz:**
- Generic componentler (components.ts) ve design system componentleri (shadcn/) farkli naming kullanir
- shadcn componentleri PascalCase kullanir: `Card`, `CardHeader`, `CardContent`
- Generic componentler Slash notation kullanir: `Button/primary`, `Input/outline`
- Alt elementler tutarsiz: Bazi yerlerde `"Input Field"`, bazilarda `"checkbox-box"`
- Frame isimlendirmesi genellikle kullanici tarafindan belirlenir, varsayilan "Frame"

### 2.2 Parent-Child Iliski Sorunlari

**Sorun 1: parentId Dogrulamasi Yetersiz**

`attachToParentOrPage` fonksiyonu parent var mi diye kontrol ediyor, ancak parent tipini tam dogrulamiyor. Ornegin:
- Bir `TEXT` node'a child eklemeye calisma durumunda hata mesaji belirsiz olabilir
- `ComponentNode` vs `FrameNode` vs `GroupNode` farklari tam islenmiyor

**Sorun 2: Implicit vs Explicit Parent Atama**

```
handleCreateFrame: createAutoLayout ile parent atanir (config.parent)
handleCreateButton: attachToParentOrPage ile atanir
handleCreateRectangle: attachToParentOrPage ile atanir
shadcn components: Parent atamasi handleCreateShadcnComponent -> finalizeComponent icinde yapilir
```

Farkli yollarla parent atanmasi, hiyerarsi takibini zorlastirir.

**Sorun 3: Auto-Layout Icerisinde Children Siralamasi**

`handleReorderChildren` (layout.ts:213-229) mevcut, ancak:
- Sadece explicit olarak cagirildiginda calisir
- Olusturma sirasinda otomatik siralama yapilmaz
- Design system componentleri (shadcn/card.ts) dogru sirayla olusturur (header -> content), ancak bu sira zorunlu olarak dogrulanmaz

### 2.3 Gereksiz Wrapper Frame Sorunu

**Sorun:** Bazi componentler tek cocuk icin gereksiz wrapper frame olusturur.

Ornekler:
- `handleCreateInput` (components.ts:265-330): `container` frame olusturulur, icerisinde sadece `input` frame var (label yoksa)
- Eger label yoksa: `container > input > placeholder` - burada container gereksiz bir wrapper
- KPI Card'da `header` frame bazen tek child'a sahip (icon yoksa sadece titleText)

### 2.4 Component Nesting Riskleri

Sistem su an component nesting kurallarini dogrulamiyor:
- Button icinde Button olusturulabilir (parent olarak button ID verilirse)
- Input icinde Card olusturulabilir
- Dialog icinde Dialog olusturulabilir

**Kontrol edilmesi gereken nesting anti-pattern'ler:**
- Interactive element icinde interactive element (button > button, button > input)
- Card icinde Card (tasarim acidan kabul edilebilir ama derinlik siniri olmali)
- Navigation bar icinde navigation bar
- Tab bar icinde tab bar

### 2.5 Responsive Davranis Sorunlari

**FILL Sizing Dogrulamasi:**
- `handleSetLayoutSizing` (layout.ts:88-124): FILL icin parent auto-layout kontrolu **var** (iyi)
- `handleCreateFrame` (shapes.ts:177-184): FILL icin parent auto-layout kontrolu **var** (iyi)
- Ancak `handleCreateButton` fullWidth=true durumunda (components.ts:233-245): Parent auto-layout yoksa sessizce `resize` kullanir - bu davranis beklenmedik olabilir

**Constraints vs Auto-Layout Celiskisi:**
- Constraints (layout.ts:54-77) auto-layout icindeki node'lara da uygulanabilir, ancak auto-layout icinde constraints etkisiz olur
- Bu durum dogrulanmiyor ve sessizce basarisiz olur

**HUG vs FIXED Kararlari:**
- Card components (shadcn/card.ts:47): `primaryAxisSizingMode = height ? "FIXED" : "AUTO"` - dogru
- Button (shadcn/button.ts:147): `counterAxisSizingMode = "FIXED"` - sabit yukseklik
- Frame handler (shapes.ts:125-141): Width/height varsa direction'a gore sizing ayarlanir - dogru mantik

### 2.6 Z-Order (Layer Siralama) Eksikligi

- `handleReorderChildren` araciligi ile manuel siralama yapilabilir
- Ancak otomatik z-order dogrulama yok
- Overlay/modal gibi elementlerin ust layer'da olmasi dogrulanmiyor
- Maskeleme grubunda mask node'un ilk child olmasi gerekir (`handleCreateMask` bunu yapiyor, ama sonradan sira degistirilirse dogrulanmiyor)

---

## 3. Hiyerarsi Kurallari Onerisi

### 3.1 Yapisal Kurallar

| # | Kural Adi | Aciklama | Onem | Varsayilan |
|---|-----------|----------|------|------------|
| H1 | `MAX_NESTING_DEPTH` | Maksimum hiyerarsi derinligi (onerilir: 8-10) | Error | max=10 |
| H2 | `NO_EMPTY_CONTAINERS` | Cocugu olmayan frame/group'lar | Warning | aktif |
| H3 | `NO_SINGLE_CHILD_WRAPPER` | Tek cocuklu frame'ler (auto-layout veya styling amacli degilse) | Warning | aktif |
| H4 | `NO_NESTED_INTERACTIVE` | Interaktif eleman icinde interaktif eleman yok | Error | aktif |
| H5 | `VALID_PARENT_TYPE` | Parent node tipi uygun mu (TEXT/VECTOR parent olamaz) | Error | aktif |
| H6 | `NO_ORPHAN_NODES` | Her node'un gecerli bir parent'i olmali | Error | aktif |

### 3.2 Auto-Layout Kurallari

| # | Kural Adi | Aciklama | Onem | Varsayilan |
|---|-----------|----------|------|------------|
| L1 | `FILL_REQUIRES_AUTOLAYOUT_PARENT` | FILL sizing icin parent auto-layout zorunlu | Error | aktif |
| L2 | `NO_CONSTRAINTS_IN_AUTOLAYOUT` | Auto-layout icinde constraints etkisiz, uyari ver | Warning | aktif |
| L3 | `CONSISTENT_CHILD_SIZING` | Kardesler arasinda tutarsiz sizing modu (biri FILL, digeri FIXED ayni eksende) | Warning | aktif |
| L4 | `AUTOLAYOUT_DIRECTION_MATCH` | Children yonu ile layout yonu uyumlu mu | Warning | pasif |

### 3.3 Gorsel Tutarlilik Kurallari

| # | Kural Adi | Aciklama | Onem | Varsayilan |
|---|-----------|----------|------|------------|
| V1 | `SPACING_TOKEN_COMPLIANCE` | Tum spacing/padding degerleri token scale'dan gelmeli | Warning | aktif |
| V2 | `RADIUS_TOKEN_COMPLIANCE` | cornerRadius degerleri radius token'larindan gelmeli | Warning | pasif |
| V3 | `COLOR_TOKEN_COMPLIANCE` | Fill/stroke renkleri tema token'larindan gelmeli | Warning | pasif |
| V4 | `CONSISTENT_TYPOGRAPHY` | Ayni role sahip metinler ayni font/size kullanmali | Warning | pasif |

### 3.4 Erisilebilirlik Kurallari

| # | Kural Adi | Aciklama | Onem | Varsayilan |
|---|-----------|----------|------|------------|
| A1 | `TOUCH_TARGET_MINIMUM` | Interaktif elemanlar platform min boyutuna uymali | Warning | aktif (mevcut) |
| A2 | `TEXT_CONTRAST_RATIO` | WCAG AA (4.5:1 normal, 3:1 buyuk metin) | Warning | kismen (mevcut basitlestirilmis) |
| A3 | `FOCUS_INDICATOR_EXISTS` | Interaktif elemanlarda focus durumu gosterimi | Info | pasif |

---

## 4. Naming Convention Standardi

### 4.1 Onerilen Naming Kurallari

```
Kural 1: Component Isimleri - PascalCase + Slash notation
  Format: ComponentType/Variant
  Ornekler: Button/Primary, Input/Outline, Card/Elevated

Kural 2: Layout Container Isimleri - PascalCase
  Format: SemanticRole
  Ornekler: Header, Sidebar, ContentArea, Footer, NavigationBar

Kural 3: Semantik Parcalar - PascalCase
  Format: ParentComponent + PartName
  Ornekler: CardHeader, CardContent, CardFooter, DialogOverlay

Kural 4: Utility Frame'ler - kebab-case
  Format: amac-aciklama
  Ornekler: spacer-16, divider-horizontal, icon-wrapper

Kural 5: Auto-Layout Container'lar
  Asla: "Frame 123", "Group 1"
  Her zaman: Semantik isim - "Actions", "UserInfo", "PriceRow"
```

### 4.2 Anti-Pattern'ler

| Anti-Pattern | Ornek | Onerilen |
|-------------|-------|----------|
| Varsayilan Figma isimleri | "Frame 1", "Rectangle 1" | Semantik isim |
| Tutarsiz case | "card-header" vs "CardHeader" | PascalCase (component) |
| Belirsiz isimler | "Container", "Wrapper", "Box" | "UserCard", "ActionBar" |
| Numara eki | "Button 2", "Frame copy" | "SubmitButton", "SearchInput" |

### 4.3 Mevcut Durum Analizi

**shadcn componentleri:** PascalCase uyumu **iyi** (`Card`, `CardHeader`, `CardContent`)
**Generic componentler:** Slash notation kullanir (`Button/primary`) - **tutarli**
**Alt elemanlar:** Tutarsiz - `"Input Field"`, `"checkbox-box"`, `"knob"` - **iyilestirme gerekir**
**Icon'lar:** Prefix pattern tutarli (`icon-{name}`) - **iyi**

---

## 5. Responsive Davranis Kurallari

### 5.1 Sizing Mode Matrisi

| Parent | Child | Horizontal | Vertical | Gecerli? |
|--------|-------|-----------|----------|----------|
| Auto-Layout (H) | Frame | FILL | HUG | Evet |
| Auto-Layout (H) | Frame | FILL | FILL | Evet |
| Auto-Layout (V) | Frame | FILL | HUG | Evet |
| Auto-Layout (V) | Frame | FILL | FILL | Evet |
| No Auto-Layout | Frame | FILL | - | **HAYIR** |
| Page (root) | Frame | FILL | - | **HAYIR** |
| Auto-Layout (H) | Text | HUG | HUG | Evet |
| Auto-Layout (H) | Rectangle | FIXED | FIXED | Evet |
| Auto-Layout (V) | Rectangle | FILL | FIXED | Evet |

### 5.2 Constraint Kurallari

| Durum | Constraints | Beklenen Davranis |
|-------|------------|-------------------|
| Parent: Auto-Layout | Herhangi | **Etkisiz** - uyari verilmeli |
| Parent: No Auto-Layout | STRETCH horizontal | Cocuk parent genisligini doldurur |
| Parent: No Auto-Layout | MIN + MIN | Cocuk sol-ust korunur |
| Kucuk parent, STRETCH cocuk | STRETCH | Cocuk parent'tan buyuk olabilir - **uyari** |

### 5.3 Tespit Edilen Responsive Sorunlar

1. **fullWidth pattern'i tutarsiz:** `handleCreateButton` parent auto-layout yoksa sessizce `resize` kullanir, FILL yerine
2. **Card fixed width:** shadcn Card her zaman `counterAxisSizingMode = "FIXED"` kullanir, responsive davranmaz
3. **Root frame clip:** `handleCreateFrame` varsayilan `clipsContent = true` atar, ancak bazi durumlarda overflow istenilebilir

---

## 6. Otomatik Dogrulama Sistemi Tasarimi

### 6.1 Mimari

```
Dogrulama Akisi:

  Tasarim Olusturma ──> Post-Creation Hook ──> Validator Engine ──> Rapor
       |                                            |
       |                                    ┌───────┴───────┐
       |                                    │ Rule Registry  │
       |                                    │  - Structural  │
       |                                    │  - Layout      │
       |                                    │  - Naming      │
       |                                    │  - Visual      │
       |                                    │  - A11y        │
       |                                    └───────────────┘
       |
  Mevcut: LINT_LAYOUT (sadece layout kurallari)
  Yeni: VALIDATE_HIERARCHY (tum kurallar)
```

### 6.2 Yeni MCP Tool: `figma_validate_hierarchy`

```typescript
// Schema
const ValidateHierarchyInputSchema = z.object({
  nodeId: z.string().describe("Root node ID to validate"),
  rules: z.array(z.enum([
    // Yapisal
    "MAX_NESTING_DEPTH",
    "NO_EMPTY_CONTAINERS",
    "NO_SINGLE_CHILD_WRAPPER",
    "NO_NESTED_INTERACTIVE",
    "VALID_PARENT_TYPE",
    // Layout
    "FILL_REQUIRES_AUTOLAYOUT_PARENT",
    "NO_CONSTRAINTS_IN_AUTOLAYOUT",
    "CONSISTENT_CHILD_SIZING",
    // Naming
    "NAMING_CONVENTION",
    "NO_DEFAULT_NAMES",
    // Gorsel
    "SPACING_TOKEN_COMPLIANCE",
    "RADIUS_TOKEN_COMPLIANCE",
    // Erisilebilirlik
    "TOUCH_TARGET_MINIMUM",
    "TEXT_CONTRAST_RATIO",
  ])).optional().default(["MAX_NESTING_DEPTH", "NO_EMPTY_CONTAINERS",
    "NO_SINGLE_CHILD_WRAPPER", "NO_NESTED_INTERACTIVE"]),
  maxDepth: z.number().min(1).max(20).optional().default(10),
  recursive: z.boolean().optional().default(true),
});

// Sonuc
interface ValidationResult {
  passed: boolean;
  score: number;         // 0-100 puan
  checkedNodes: number;
  violations: ValidationViolation[];
  warnings: ValidationViolation[];
  summary: {
    totalNodes: number;
    maxDepthFound: number;
    emptyContainers: number;
    singleChildWrappers: number;
    namingIssues: number;
  };
}
```

### 6.3 Dogrulama Fonksiyonlari

```
checkMaxNestingDepth(node, maxDepth):
  - Rekursif derinlik sayaci
  - maxDepth asildiginda violation ekle
  - En derin yolu raporla

checkEmptyContainers(node):
  - Frame/Group/Component tipindeki node'larin children.length === 0 kontrolu
  - Istisna: Spacer, Divider gibi utility elemanlar (isimden tespit)
  - Istisna: Placeholder/skeleton elementleri

checkSingleChildWrapper(node):
  - children.length === 1 olan frame'ler
  - Istisna: Auto-layout ile padding/alignment amacli olanlar
  - Istisna: Clip mask icin kullanilan frame'ler
  - Istisna: Design system component parcalari (CardHeader gibi)

checkNestedInteractive(node):
  - Interaktif eleman tespiti: isim veya yapidan (button, input, link, toggle, switch, checkbox, radio)
  - Parent zincirinde baska interaktif eleman var mi kontrolu
  - Hata: button > button, input > button, link > button

checkNamingConvention(node):
  - "Frame", "Frame 1", "Rectangle 1" gibi varsayilan isimler
  - Tutarsiz case kullanimi
  - Anlamsiz isimler ("Container", "Wrapper", "Box" - baglamsal)

checkFillRequiresAutoLayout(node):
  - layoutSizingHorizontal === "FILL" || layoutSizingVertical === "FILL"
  - Parent.layoutMode !== "NONE" dogrulamasi

checkConstraintsInAutoLayout(node):
  - Parent auto-layout ise constraints set edilmis mi kontrolu
  - Uyari: Constraints etkisiz olacaktir
```

### 6.4 Puanlama Sistemi

```
Skor Hesaplama:
  baseScore = 100

  Her error icin: -10 puan
  Her warning icin: -3 puan
  Her info icin: -1 puan

  Minimum skor: 0

  Derecelendirme:
    90-100: Mukemmel (yesil)
    70-89:  Iyi (sari)
    50-69:  Orta (turuncu)
    0-49:   Zayif (kirmizi)
```

---

## 7. Uygulama Oncelikleri

### Faz 1: Kritik Yapisal Kontroller (Oncelik: Yuksek)

1. **`NO_EMPTY_CONTAINERS`** - En kolay uygulanan, en fazla deger sunan kural
   - Olusturma sonrasi bos frame tespiti
   - Uygulama suresi: Dusuk

2. **`NO_NESTED_INTERACTIVE`** - Erisebilirlik ve kullanilabilirlik icin kritik
   - Interaktif eleman icinde interaktif eleman yok
   - Uygulama suresi: Orta

3. **`MAX_NESTING_DEPTH`** - Performans ve okunabilirlik icin onemli
   - Varsayilan limit: 10 seviye
   - Uygulama suresi: Dusuk

4. **`NO_SINGLE_CHILD_WRAPPER`** - Gereksiz karmasikligi azaltir
   - Istisna listesi onemli (padding frame'ler, clip container'lar)
   - Uygulama suresi: Orta

### Faz 2: Layout Dogrulama (Oncelik: Orta)

5. **`FILL_REQUIRES_AUTOLAYOUT_PARENT`** - Mevcut kismen var, lint'e eklenmeli
6. **`NO_CONSTRAINTS_IN_AUTOLAYOUT`** - Sessiz hatalari onler
7. **`CONSISTENT_CHILD_SIZING`** - Layout bozukluklarini erken yakalar

### Faz 3: Naming ve Tutarlilik (Oncelik: Dusuk-Orta)

8. **`NO_DEFAULT_NAMES`** - Figma varsayilan isimleri kontrol
9. **`NAMING_CONVENTION`** - PascalCase/kebab-case tutarliligi
10. **Mevcut `SPACING_TOKEN_ONLY` kurali ile birlestirme** - `RADIUS_TOKEN_COMPLIANCE` eklenmesi

### Faz 4: Gelismis Dogrulama (Oncelik: Dusuk)

11. **Z-order dogrulamasi** - Overlay/modal layer siralama
12. **Overflow tespiti** - Cocuklarin parent sinirlari
13. **Component variant tutarliligi** - Ayni component'in farkli yerlerde farkli variant kullanilmasi

### Entegrasyon Stratejisi

Mevcut `LINT_LAYOUT` handler'ini genisletmek yerine, yeni bir `VALIDATE_HIERARCHY` handler olusturmak onerilir:

**Neden ayri handler:**
- LINT_LAYOUT layout odakli, iyi calisir, dokunulmamali
- Yeni kurallar yapisal, naming ve erisilebilirlik odakli
- Farkli kullanim senaryolari (lint = hizli kontrol, validate = kapsamli analiz)
- Puanlama sistemi sadece validate icin anlamli

**Entegrasyon noktasi:**
- MCP Server'da `figma_validate_hierarchy` tool olarak kayit
- Agent pipeline'inda tasarim olusturulduktan sonra otomatik cagri
- Sonuc agent'a donup, duzeltme icin tool cagrilari tetiklenebilir

---

## 8. Ozet Bulgular

### Guclu Yanlar
- Mevcut lint sistemi temel layout kurallarini kapsiyor
- Smart Layout strateji tespiti akilli ve genisletilebilir
- FILL sizing icin parent auto-layout dogrulamasi kritik yerlerde mevcut
- Design system componentleri (shadcn) tutarli hiyerarsi kullaniyor
- Touch target kontrolu platform bazli calisiyor

### Zayif Yanlar
- Hiyerarsi derinligi kontrolu yok - derin nesting performans etkiler
- Bos container ve gereksiz wrapper tespiti yok
- Component nesting kurallari (interactive icinde interactive) yok
- Naming convention zorunlu degil, tutarsizliklar var
- Constraints-AutoLayout celiskisi sessizce basarisiz oluyor
- Z-order/layer siralama dogrulamasi yok
- Dogrulama sonuclari puanlanmiyor, oncelik siralamasi yok

### Temel Oneri
`VALIDATE_HIERARCHY` adinda yeni bir MCP tool olusturularak mevcut lint sisteminin yanina **tamamlayici** bir dogrulama katmani eklenmeli. Bu tool:
- Yapisal, naming ve erisilebilirlik kurallarini kapsamali
- Puanlama sistemi ile sonuc ozetlemeli
- Agent pipeline'ina entegre edilmeli
- Faz 1'deki 4 kritik kural ile baslamali
