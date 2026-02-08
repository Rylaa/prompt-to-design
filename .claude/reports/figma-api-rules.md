# Figma API Kuralları ve Best Practices

> Analiz Tarihi: 2026-02-08
> Kapsam: Tüm MCP araçları, handler dosyaları, schema tanımları ve utility fonksiyonları

---

## 1. Genel Kurallar

### 1.1 Renk Yönetimi

#### RGB Değer Aralığı
- **Figma API**: RGB değerleri **0-1** aralığında (float)
- **Hex dönüşüm**: `parseInt(hex, 16) / 255` ile normalize edilir
- **Kritik**: Figma `{r: 255, g: 0, b: 0}` KABUL ETMEZ → `{r: 1, g: 0, b: 0}` olmalıdır

#### Desteklenen Renk Formatları
```
Hex 6-karakter: #RRGGBB (örn: #FF0000)
Hex 3-karakter: #RGB (örn: #F00 → #FF0000'e dönüştürülür)
RGB objesi: {r: 0-1, g: 0-1, b: 0-1, a?: 0-1}
```

#### Alpha Kanalı Davranışı
- Schema'da `a` default olarak `1` (tam opak)
- `createSolidPaint()` fonksiyonunda opacity ayrı bir parametre
- Figma'da renk alpha'sı ile node opacity'si FARKLI şeylerdir:
  - `fills[0].opacity` → paint seviyesinde saydamlık
  - `node.opacity` → tüm node'un saydamlığı (çocuklar dahil)

#### Fallback Davranışı
- Geçersiz hex → `{r: 0, g: 0, b: 0}` (siyah) döner (sessizce!)
- Schema validation hex'i doğrular ama runtime'da `hexToRgb()` hata fırlatmaz

**Potansiyel Sorun**: `hexToRgb()` geçersiz hex için sessizce siyah döner, kullanıcıya hata bildirimi yapılmaz.

### 1.2 Opacity ve Transparency

#### Transparent Background Yapma Yöntemleri
1. **`node.fills = []`** → Fill tamamen kaldırılır (DOĞRU yöntem)
   - Kullanım: `components.ts` → button ghost/outline varyantları
   - Kullanım: `components.ts` → input container, checkbox, tab
2. **`{type: "SOLID", color: ..., opacity: 0}`** → Görünmez fill ama hala var
3. **`node.visible = false`** → Tüm node gizlenir (farklı amaç)

#### Mevcut Kodda Transparent Kullanımı
- `handleCreateButton`: ghost/outline variant → `button.fills = []` ✅
- `handleCreateInput`: container → `container.fills = []` ✅
- `createButtonComponent`: `"#00000000"` kontrol → `component.fills = []` ✅
- `createTabComponent`: `component.fills = []` ✅

**Best Practice**: Transparent arka plan için **her zaman** `node.fills = []` kullanılmalıdır. Opacity: 0 ile SOLID fill kullanmak gereksiz bellek tüketir ve Figma'da "dolgu var" olarak görünür.

### 1.3 Font Yönetimi

#### loadFontAsync Gereksinimi
- **KRİTİK KURAL**: Figma'da `text.characters` atamadan ÖNCE `figma.loadFontAsync()` çağrılmalıdır
- Aksi halde runtime hatası alınır
- Mevcut text ayarlama SONRASI değil ÖNCESI font yüklenmeli

#### Font Weight → Style Mapping
```
100 → "Thin"
200 → "ExtraLight"
300 → "Light"
400 → "Regular"
500 → "Medium"
600 → "Semi Bold"    ← DİKKAT: "SemiBold" değil "Semi Bold" (boşluklu)
700 → "Bold"
800 → "ExtraBold"
900 → "Black"
```

**UYUMSUZLUK TESPİTİ**:
- `font-helpers.ts:18` → `"Semi Bold"` (boşluklu)
- `components.ts:146` → `"SemiBold"` (boşluksuz)
- Her ikisi de Inter font ailesi için kullanılıyor
- Bu tutarsızlık runtime'da font yükleme hatasına neden olabilir
- **Not**: Inter fontunda doğru stil adı `"Semi Bold"` (boşluklu) olmalıdır

#### Fallback Mekanizması
- İstenen font yüklenemezse → `Inter Regular` fallback
- `loadFont()` fonksiyonu asla hata fırlatmaz, sessizce fallback yapar
- Bu iyi bir pratik ama kullanıcıya fallback bilgisi dönülmüyor

#### SetTextContent Font Gerekliliği
- Mevcut text node'unun fontunu yüklemeden karakterleri değiştirilemez
- `handleSetTextContent()` bunu doğru yapıyor: önce `loadFontAsync`, sonra `characters` ataması
- **Mixed Fonts Sorunu**: `textNode.fontName as FontName` cast'ı, eğer text node'da birden fazla font stili varsa (`Symbol` döner), hata verebilir

### 1.4 Gradient Transform Matrisi

#### Figma Gradient Transform Formatı
```typescript
// 2x3 matris: [[cos, sin, tx], [-sin, cos, ty]]
// tx, ty = gradyanın merkez noktasını ayarlar
```

#### Açı → Transform Dönüşümü
```typescript
const radians = (angleDegrees * Math.PI) / 180;
const cos = Math.cos(radians);
const sin = Math.sin(radians);
// Transform: merkezi (0.5, 0.5)'e taşıyarak döndürme
transform = [
  [cos, sin, 0.5 - cos * 0.5 - sin * 0.5],
  [-sin, cos, 0.5 + sin * 0.5 - cos * 0.5],
];
```

#### Gradient Türleri Mapping
```
Schema türü → Figma API türü
"LINEAR"  → "GRADIENT_LINEAR"
"RADIAL"  → "GRADIENT_RADIAL"
"ANGULAR" → "GRADIENT_ANGULAR"
"DIAMOND" → "GRADIENT_DIAMOND"
```

**Not**: Gradient stop'larda alpha her zaman `1` olarak set ediliyor (`{...parseColor(stop.color), a: 1}`). Stop bazında alpha kontrolü yok.

---

## 2. Araç Bazlı Kurallar

### 2.1 figma_create_frame

**Eylem**: `CREATE_FRAME`
**Handler**: `figma-plugin/src/handlers/shapes.ts:46`

#### Parametreler ve Varsayılanlar
| Parametre | Tip | Varsayılan | Not |
|-----------|-----|-----------|-----|
| name | string | "Frame" | |
| width | number | 400 | min: 1 |
| height | number | 300 | min: 1 |
| x, y | number | - | **İGNORE EDİLİR** (Auto Layout) |
| parentId | string | - | Yoksa page'e eklenir |
| fill | FillSchema | dark: #09090B | Root frame için koyu tema default |
| stroke | StrokeSchema | - | |
| cornerRadius | number | - | Token'a yuvarlanır |
| autoLayout | AutoLayoutSchema | VERTICAL, gap:16px, padding:16px | Her zaman Auto Layout |
| effects | EffectSchema[] | - | |
| layoutSizingHorizontal | FIXED/HUG/FILL | - | Parent AL gerektirir |
| layoutSizingVertical | FIXED/HUG/FILL | - | Parent AL gerektirir |
| clipsContent | boolean | true | |

#### Kritik Davranışlar
1. **Her zaman Auto Layout**: Frame oluşturma `createAutoLayout()` factory'si ile yapılır
2. **x, y parametreleri görmezden geliniyor**: "Auto Layout parent determines position automatically"
3. **Root frame dark background**: parentId yoksa `#09090B` default fill uygulanır
4. **Child frame transparent**: parentId varsa ve fill belirtilmemişse fill uygulanmaz
5. **clipsContent default true**: İçerik frame dışına taşmaz
6. **FILL sizing validasyonu**: Parent'ın `layoutMode !== "NONE"` olması gerekir, aksi halde hata

#### Edge Case'ler
- Width/height verildiğinde `primaryAxisSizing: "FIXED"` veya `counterAxisSizing: "FIXED"` set edilir (yöne bağlı)
- Spacing değerleri `pxToSpacingKey()` ile en yakın token'a yuvarlanır
- Viewport otomatik scroll: Root frame oluşturulunca `scrollAndZoomIntoView` çağrılır

### 2.2 figma_create_rectangle

**Eylem**: `CREATE_RECTANGLE`
**Handler**: `figma-plugin/src/handlers/shapes.ts:217`

#### Parametreler ve Varsayılanlar
| Parametre | Tip | Varsayılan | Not |
|-----------|-----|-----------|-----|
| name | string | "Rectangle" | |
| width | number | 100 | min: 1 |
| height | number | 100 | min: 1 |
| x, y | number | - | Çalışır (frame gibi değil) |
| parentId | string | - | |
| fill | FillSchema | - | Belirtilmezse Figma default (beyaz) |
| stroke | StrokeSchema | - | |
| cornerRadius | number | - | Doğrudan pixel değeri |
| effects | EffectSchema[] | - | |

#### Dikkat Edilmesi Gerekenler
- Frame'den farklı olarak Auto Layout KULLANILMAZ
- x, y parametreleri ÇALIŞIR (frame'de çalışmıyor)
- Fill belirtilmezse Figma'nın kendi default'u uygulanır (beyaz veya gridir)
- cornerRadius burada token'a yuvarlanmaz (frame'de yuvarlanıyor - tutarsızlık)
- `resize()` kullanılır (width/height ataması değil)

### 2.3 figma_create_ellipse

**Eylem**: `CREATE_ELLIPSE`
**Handler**: `figma-plugin/src/handlers/shapes.ts:253`

#### Parametreler ve Varsayılanlar
| Parametre | Tip | Varsayılan | Not |
|-----------|-----|-----------|-----|
| name | string | "Ellipse" | |
| width | number | 100 | |
| height | number | 100 | |
| x, y | number | - | |
| parentId | string | - | |
| fill | FillSchema | - | |
| effects | EffectSchema[] | - | |

#### Dikkat Edilmesi Gerekenler
- **Stroke desteği yok** - Schema'da ve handler'da stroke parametresi yok (Rectangle ve Polygon'da var)
- cornerRadius desteklenmez (zaten daire/elips)

### 2.4 figma_create_line

**Eylem**: `CREATE_LINE`
**Handler**: `figma-plugin/src/handlers/shapes.ts:281`

#### Parametreler ve Varsayılanlar
| Parametre | Tip | Varsayılan | Not |
|-----------|-----|-----------|-----|
| name | string | "Line" | |
| startX, startY | number | zorunlu | Başlangıç noktası |
| endX, endY | number | zorunlu | Bitiş noktası |
| parentId | string | - | |
| stroke | StrokeSchema | #000000, weight:1 | |

#### Kritik Davranışlar
- Uzunluk ve açı start/end noktalarından hesaplanır: `Math.sqrt(dx² + dy²)` ve `atan2(dy, dx)`
- `line.resize(length, 0)` - yükseklik 0
- `line.rotation = -angle` (negatif açı!)
- Fill desteği yok (çizgiler stroke ile çizilir)
- Stroke belirtilmezse siyah 1px default

### 2.5 figma_create_polygon

**Eylem**: `CREATE_POLYGON`
**Handler**: `figma-plugin/src/handlers/shapes.ts:369`

#### Parametreler ve Varsayılanlar
| Parametre | Tip | Varsayılan | Not |
|-----------|-----|-----------|-----|
| name | string | "Polygon" | |
| pointCount | number | 6 | min: 3, max: 100 |
| width | number | 100 | |
| height | number | 100 | |
| x, y | number | - | |
| parentId | string | - | |
| fill | FillSchema | - | |
| stroke | StrokeSchema | - | |

### 2.6 figma_create_star

**Eylem**: `CREATE_STAR`
**Handler**: `figma-plugin/src/handlers/shapes.ts:405`

#### Parametreler ve Varsayılanlar
| Parametre | Tip | Varsayılan | Not |
|-----------|-----|-----------|-----|
| name | string | "Star" | |
| pointCount | number | 5 | min: 3, max: 100 |
| innerRadius | number | 0.4 | Schema default: 0.5, handler default: 0.4 (UYUMSUZ) |
| width | number | 100 | |
| height | number | 100 | |
| x, y | number | - | |
| parentId | string | - | |
| fill | FillSchema | - | |
| stroke | StrokeSchema | - | |

**UYUMSUZLUK**: Schema `innerRadius` default'u `0.5`, handler'da `0.4`. Zod schema default'u MCP tarafında geçerli olduğundan çelişki olmamalı ama dikkat edilmeli.

### 2.7 figma_create_vector

**Eylem**: `CREATE_VECTOR`
**Handler**: `figma-plugin/src/handlers/shapes.ts:324`

#### Parametreler ve Varsayılanlar
| Parametre | Tip | Varsayılan | Not |
|-----------|-----|-----------|-----|
| name | string | "Vector" | |
| paths | array | zorunlu | `{data: string, windingRule?: "EVENODD"/"NONZERO"}` |
| x, y | number | - | |
| parentId | string | - | |
| fill | FillSchema | - | |
| stroke | StrokeSchema | - | |

#### Kritik: Schema vs Handler Uyumsuzluğu
- **Schema**: `paths` array (çoklu path desteği)
- **Handler**: `params.pathData as string` (tek string) - UYUMSUZ
- Handler sadece tek bir `pathData` string bekliyor, schema birden fazla path objesi dizisi tanımlıyor
- `handleSetVectorPaths` çoklu path'i doğru destekliyor

### 2.8 figma_create_text

**Eylem**: `CREATE_TEXT`
**Handler**: `figma-plugin/src/handlers/text.ts:43`

#### Parametreler ve Varsayılanlar
| Parametre | Tip | Varsayılan | Not |
|-----------|-----|-----------|-----|
| content | string | "Text" | zorunlu (schema'da) |
| name | string | content'in ilk 20 karakteri | |
| x, y | number | - | |
| parentId | string | - | |
| width | number | - | Belirtilirse textAutoResize="HEIGHT" |
| style.fontFamily | string | "Inter" | |
| style.fontSize | number | 16 | min: 1 |
| style.fontWeight | number | 400 | 100-900 |
| style.lineHeight | number/string | - | number=PIXELS, "AUTO"=AUTO |
| style.letterSpacing | number | - | PIXELS birimi |
| style.textAlign | string | "LEFT" | LEFT/CENTER/RIGHT/JUSTIFIED |
| style.textCase | string | - | ORIGINAL/UPPER/LOWER/TITLE |
| style.textDecoration | string | - | NONE/UNDERLINE/STRIKETHROUGH |
| fill | FillSchema | - | Belirtilmezse Figma default |

#### Kritik Davranışlar
- Width belirtildiğinde: `resize(width, text.height)` + `textAutoResize = "HEIGHT"`
  - Text otomatik yüksekliğe sahip, sabit genişlikli olur
- Width belirtilmediğinde: text tek satırda genişler
- `textAlignHorizontal` property'si kullanılır (`textAlign` değil)

### 2.9 figma_set_text_content

**Eylem**: `SET_TEXT_CONTENT`
**Handler**: `figma-plugin/src/handlers/text.ts:118`

#### Kritik Kurallar
- Node TEXT türünde olmalı, aksi halde hata
- Font yükleme **zorunlu**: `figma.loadFontAsync(textNode.fontName)` ÖNCEDEN çağrılmalı
- **Mixed Fonts Riski**: `textNode.fontName as FontName` cast'ı mixed font durumunda sorunlu olabilir
  - Figma'da birden fazla stil varsa `fontName` `Symbol` döner, `FontName` değil

### 2.10 figma_create_button

**Eylem**: `CREATE_BUTTON`
**Handler**: `figma-plugin/src/handlers/components.ts:178`

#### Parametreler ve Varsayılanlar
| Parametre | Tip | Varsayılan | Not |
|-----------|-----|-----------|-----|
| text | string | "Button" | |
| name | string | "Button" | |
| variant | string | "primary" | primary/secondary/outline/ghost |
| size | string | "md" | sm/md/lg |
| fill | FillSchema | - | Override variant fill |
| textColor | ColorSchema | - | Override variant text color |
| cornerRadius | number | 8 | |
| paddingX | number | size-dependent | |
| paddingY | number | size-dependent | |
| fullWidth | boolean | false | Auto Layout parent gerektirir |
| parentId | string | - | |

#### Boyut Konfigürasyonu
```
sm: { paddingX: 12, paddingY: 6, fontSize: 14 }
md: { paddingX: 16, paddingY: 10, fontSize: 16 }
lg: { paddingX: 24, paddingY: 14, fontSize: 18 }
```

#### fullWidth Davranışı
- Parent auto-layout'lu olmalı → `layoutSizingHorizontal = "FILL"`
- Parent auto-layout'suz → sabit genişlik: `parent.width - 32`
- parentId yoksa fullWidth etkisiz

#### Hata Yönetimi
- Node oluşturmada hata olursa `button.remove()` ile temizlenir (iyi pratik)

### 2.11 figma_create_input

**Eylem**: `CREATE_INPUT`
**Handler**: `figma-plugin/src/handlers/components.ts:265`

#### Parametreler ve Varsayılanlar
| Parametre | Tip | Varsayılan | Not |
|-----------|-----|-----------|-----|
| placeholder | string | "Enter text..." | |
| label | string | - | Opsiyonel üst label |
| name | string | "Input" | |
| width | number | 280 | |
| variant | string | "outline" | default/filled/outline |
| parentId | string | - | |

#### Yapı
```
Container (VERTICAL, fills: [])
├── Label (opsiyonel, "Inter Medium", 14px, #A1A1AA)
└── Input Field (HORIZONTAL, 280x44)
    └── Placeholder Text ("Inter Regular", 15px, #52525B)
```

#### Variant Stilleri
- **outline**: bg=#18181B, border=#27272A (1px)
- **filled**: bg=#27272A, border yok
- **default**: Schema'da var ama handler'da "outline" ile aynı

### 2.12 figma_create_card

**Eylem**: `CREATE_CARD`
**Handler**: `figma-plugin/src/handlers/components.ts:341`

#### Parametreler ve Varsayılanlar
| Parametre | Tip | Varsayılan | Not |
|-----------|-----|-----------|-----|
| name | string | "Card" | |
| width | number | 320 | |
| height | number | - | Opsiyonel |
| padding | number | 24 (token "6") | |
| cornerRadius | number | 12 ("lg" token) | |
| fill | FillSchema | beyaz {r:1,g:1,b:1} | |
| shadow | boolean | true | |
| parentId | string | - | |

#### Shadow Default
```typescript
{
  type: "DROP_SHADOW",
  color: { r: 0, g: 0, b: 0, a: 0.1 },
  offset: { x: 0, y: 4 },
  radius: 8,
  spread: 0,
}
```

### 2.13 figma_set_fill

**Eylem**: `SET_FILL`
**Handler**: `figma-plugin/src/handlers/styling.ts:30`

#### Kritik Kurallar
- Node'un `fills` property'si olmalı (`"fills" in node` kontrolü)
- **Mevcut fill'leri SİLER**: `fills = [createFill(fill)]` - her zaman tek fill
- Birden fazla fill desteklenmez (her çağrıda override)
- SOLID ve GRADIENT fill desteklenir

### 2.14 figma_set_effects

**Eylem**: `SET_EFFECTS`
**Handler**: `figma-plugin/src/handlers/styling.ts:51`

#### Kritik Kurallar
- Node'un `effects` property'si olmalı
- **Mevcut effect'leri SİLER**: `effects = effects.map(createEffect)` - tümünü yeniden yazar
- Birden fazla effect **aynı anda** gönderilebilir (shadow + blur)
- **Effect Stacking**: Tek çağrıda tüm effect'ler gönderilmeli, birden fazla çağrı önceki effect'leri siler

#### Shadow Default Değerleri (Schema'dan)
```
type: "DROP_SHADOW"
color: "#000000"
offsetX: 0
offsetY: 4
blur: 8
spread: 0
opacity: 0.1
```

### 2.15 figma_set_opacity

**Eylem**: `SET_OPACITY`
**Handler**: `figma-plugin/src/handlers/styling.ts:72`

- Node seviyesinde opacity (0-1)
- Tüm çocuk node'ları etkiler
- Fill opacity'den FARKLI

### 2.16 figma_set_stroke

**Eylem**: `SET_STROKE`
**Handler**: `figma-plugin/src/handlers/styling.ts:95`

#### Parametreler ve Varsayılanlar
| Parametre | Tip | Varsayılan |
|-----------|-----|-----------|
| nodeId | string | zorunlu |
| color | ColorSchema | zorunlu |
| weight | number | 1 |
| align | string | "INSIDE" |

#### Stroke Alignment ve Auto Layout Etkisi
- **INSIDE**: Stroke node boyutunu değiştirmez, iç tarafa çizilir
- **OUTSIDE**: Node boyutunun dışına çizilir (Auto Layout spacing'i etkilemez ama görsel taşma olabilir)
- **CENTER**: Yarısı içte, yarısı dışta
- Auto Layout `strokesIncludedInLayout = true` ise stroke weight layout hesaplamalarına dahil edilir

### 2.17 figma_set_corner_radius

**Eylem**: `SET_CORNER_RADIUS`
**Handler**: `figma-plugin/src/handlers/styling.ts:124`

#### Bireysel Köşe Desteği
- `radius` → tüm köşeler aynı
- `topLeft/topRight/bottomRight/bottomLeft` → bireysel köşeler
- Bireysel köşe belirtildiğinde, belirtilmeyenler `radius` değerine fallback
- Node'un `cornerRadius` property'si olmalı (Frame, Rectangle)

**Figma API Quirk**: Bireysel köşeler set edildiğinde `node.cornerRadius` property `Symbol` döner. Tekrar okumak için bireysel property'ler kullanılmalı.

### 2.18 figma_set_auto_layout

**Eylem**: `SET_AUTO_LAYOUT`
**Handler**: `figma-plugin/src/handlers/layout.ts:32`

#### Parametreler ve Varsayılanlar
| Parametre | Tip | Varsayılan | Not |
|-----------|-----|-----------|-----|
| nodeId | string | zorunlu | FRAME olmalı |
| layout.mode | string | zorunlu | "HORIZONTAL"/"VERTICAL" |
| layout.spacing | number | 0 | min: 0 |
| layout.padding | number | 0 | Uniform, individual'ı override eder |
| layout.paddingTop/Right/Bottom/Left | number | 0 | |
| layout.primaryAxisAlign | string | "MIN" | MIN/CENTER/MAX/SPACE_BETWEEN |
| layout.counterAxisAlign | string | "MIN" | MIN/CENTER/MAX/BASELINE |
| layout.wrap | boolean | false | |
| layout.counterAxisSpacing | number | - | Sadece wrap=true iken çalışır |
| layout.strokesIncludedInLayout | boolean | false | |

#### Padding Öncelik Sırası
1. Bireysel padding (paddingTop vs.) belirtilmişse → bireysel kullanılır
2. Genel `padding` belirtilmişse → tüm taraflara uygulanır
3. İkisi de yoksa → 0

#### Auto Layout Sizing Modları
```
primaryAxisSizingMode:
  "AUTO" → HUG (içeriğe göre boyutlan)
  "FIXED" → Sabit boyut

counterAxisSizingMode:
  "AUTO" → HUG
  "FIXED" → Sabit boyut
```

#### FILL Sizing Gereksinimleri
- FILL sizing parent'ın auto-layout'lu olmasını gerektirir
- Parent `layoutMode === "NONE"` ise hata fırlatılır
- Parent yoksa veya PAGE ise hata fırlatılır

### 2.19 figma_set_constraints

**Eylem**: `SET_CONSTRAINTS`
**Handler**: `figma-plugin/src/handlers/layout.ts:54`

#### Constraint Türleri
```
horizontal: MIN | CENTER | MAX | STRETCH | SCALE
vertical:   MIN | CENTER | MAX | STRETCH | SCALE
```

**Önemli**: Constraints sadece auto-layout'suz parent'larda çalışır. Auto Layout parent'ta constraints görmezden gelinir.

### 2.20 figma_set_layout_sizing

**Eylem**: `SET_LAYOUT_SIZING`
**Handler**: `figma-plugin/src/handlers/layout.ts:88`

#### FILL Sizing Validasyonları
1. Parent yoksa → hata
2. Parent page ise → hata
3. Parent `layoutMode === "NONE"` ise → hata

### 2.21 figma_resize_node

**Eylem**: `RESIZE_NODE`
**Handler**: `figma-plugin/src/handlers/transform.ts:13`

#### `resize()` vs Doğrudan width/height Atama
- **`resize(width, height)`**: Figma'nın önerdiği yöntem
  - İçerik ve kısıtlamalara göre yeniden hesaplama yapar
  - Min-max boyut kısıtlamalarını uygular
- **Doğrudan atama** (`node.width = x`): Doğrudan boyut değişimi
  - Ölçekleme yapmaz
  - İç yapıyı etkilemez

### 2.22 figma_set_position (DEPRECATED)

**Eylem**: `SET_POSITION`
**Handler**: `figma-plugin/src/handlers/transform.ts:33`

**HER ZAMAN HATA FIRLATIYOR**: Bu araç kasıtlı olarak devre dışı bırakılmış. Auto Layout kullanılması öneriliyor.

### 2.23 figma_delete_node

**Eylem**: `DELETE_NODE`
**Handler**: `figma-plugin/src/handlers/manipulation.ts:39`

- `node.remove()` çağrılır
- Node registry'den de temizlenir
- Silinen node'un çocukları da silinir (Figma API davranışı)
- **Geri alınamaz** (MCP seviyesinde; Figma UI'da Ctrl+Z çalışır)

### 2.24 figma_clone_node

**Eylem**: `CLONE_NODE`
**Handler**: `figma-plugin/src/handlers/manipulation.ts:63`

#### Clone Davranışları
- `node.clone()` → Tam kopya oluşturur
- **Kopyalanan**: Fills, strokes, effects, children, text, layoutMode, boyutlar
- **Kopyalanmayan**: Node ID (yeni ID atanır), reactions (prototyping etkileşimleri)
- Clone aynı parent'a eklenir (orijinalin yanına)
- x, y parametreleri ile yeniden konumlandırılabilir

### 2.25 figma_move_node

**Eylem**: `MOVE_TO_PARENT`
**Handler**: `figma-plugin/src/handlers/manipulation.ts:131`

- Node farklı bir parent'a taşınır
- `index` belirtilirse `parent.insertChild(index, node)` kullanılır
- `index` belirtilmezse `parent.appendChild(node)` → en sona eklenir
- **Z-Index**: `insertChild(0)` → en alt, `appendChild` → en üst

### 2.26 figma_create_group

**Eylem**: `CREATE_GROUP`
**Handler**: `figma-plugin/src/handlers/manipulation.ts:267`

- Minimum 1 node gerekli (schema'da)
- **Tüm node'lar aynı parent'ta olmalı**
- `figma.group(nodes, parent)` kullanılır
- Group'un kendisi Auto Layout DESTEKLEMez

### 2.27 figma_ungroup

**Eylem**: `UNGROUP`
**Handler**: `figma-plugin/src/handlers/manipulation.ts:307`

- Node GROUP türünde olmalı
- Çocuklar parent'a taşınır
- Boş group silinir
- Parent yoksa `figma.currentPage` kullanılır

### 2.28 figma_boolean_operation

**Eylem**: `BOOLEAN_OPERATION`
**Handler**: `figma-plugin/src/handlers/manipulation.ts:430`

#### İşlem Türleri
- **UNION**: Birleştirme (tüm şekillerin birleşimi)
- **SUBTRACT**: İlk şekilden diğerlerini çıkarma
- **INTERSECT**: Kesişim (ortak alan)
- **EXCLUDE**: Dışlama (kesişim hariç)

- Minimum 2 node gerekli
- Sonuç `figma.currentPage`'e eklenir (sonra parent'a taşınabilir)

### 2.29 figma_create_mask

**Eylem**: `CREATE_MASK`
**Handler**: `figma-plugin/src/handlers/manipulation.ts:494`

- Mask node `isMask = true` olarak işaretlenir
- Tüm node'lar `figma.group()` ile gruplanır
- **Sıra önemli**: Mask node DİZİDE İLK olmalı, content sonra
- Mask node'un şekli clip alanını belirler

### 2.30 figma_create_image

**Eylem**: `CREATE_IMAGE`
**Handler**: `figma-plugin/src/handlers/media.ts:34`

- Base64 encoded veri → `figma.base64Decode()` → `figma.createImage()` → IMAGE fill
- Rectangle üzerine IMAGE fill olarak uygulanır (doğrudan image node oluşturulamaz)
- `scaleMode`: FILL/FIT/CROP/TILE (default: FILL)

### 2.31 figma_set_rotation / figma_set_transform / figma_scale_node

**Handler**: `figma-plugin/src/handlers/transform.ts`

#### Rotation
- Derece cinsinden açı
- Negatif değerler saat yönünde döndürür

#### Transform
- 2x3 matris: `[[a, b, tx], [c, d, ty]]`
- `relativeTransform` property'si set edilir

#### Scale
- `rescale()` varsa kullanılır (ölçekleme + boyut)
- Yoksa `resize(width * scale, height * scale)` fallback
- Scale origin desteği schema'da var ama handler'da kullanılmıyor (CENTER/TOP_LEFT vs.)

### 2.32 figma_lint_layout

**Eylem**: `LINT_LAYOUT`
**Handler**: `figma-plugin/src/handlers/layout.ts:453`

#### Lint Kuralları
| Kural | Açıklama | Seviye |
|-------|----------|--------|
| NO_ABSOLUTE_POSITION | Frame'ler absolute position kullanmamalı | error |
| AUTO_LAYOUT_REQUIRED | Frame'ler auto-layout'lu olmalı | error |
| VALID_SIZING_MODE | Geçerli sizing mode kullanılmalı | error |
| SPACING_TOKEN_ONLY | Spacing token sistemine uymalı | error |
| FILL_REQUIRED_ON_ROOT | Root frame fill'e sahip olmalı | error |
| VISUAL_HIERARCHY | Heading > body > caption font boyutu | warning |
| CONSISTENT_SPACING | Spacing standart token olmalı | warning |
| PROXIMITY_GROUPING | İlişkili öğeler yakın olmalı (>64px uyarı) | warning |
| ALIGNMENT_CONSISTENCY | Çocuklar tutarlı hizalanmalı | warning |
| CONTRAST_RATIO | Text kontrast yeterli olmalı | warning |
| TOUCH_TARGET_SIZE | İnteraktif öğeler min 44x44px | warning |

### 2.33 figma_create_shadcn_component

**Eylem**: `CREATE_SHADCN_COMPONENT`
**Handler**: `figma-plugin/src/handlers/design-system.ts:114`

#### Desteklenen Bileşenler
button, input, textarea, card, badge, avatar, avatar-group, checkbox, radio, switch, progress, slider, skeleton, alert, toast, tabs, separator, dialog, sheet, select, dropdown-menu, tooltip, popover, table, data-table, accordion, collapsible

- Theme desteği: light/dark
- Oluşturma sonrası viewport'a scroll + register

### 2.34 figma_create_apple_component

**Eylem**: `CREATE_APPLE_COMPONENT`
**Handler**: `figma-plugin/src/handlers/design-system.ts:135`

#### Platform Ayrımı
- **iOS**: button, navigation-bar, search-bar, tab-bar, cell, toggle, list, action-sheet, controls
- **macOS**: window, title-bar, sidebar, button, checkbox, text-field, controls

### 2.35 figma_create_liquid_glass_component

**Eylem**: `CREATE_LIQUID_GLASS_COMPONENT`
**Handler**: `figma-plugin/src/handlers/design-system.ts:163`

#### Desteklenen Bileşenler
button, tab-bar, navigation-bar, card, toggle, sidebar, floating-panel, modal, search-bar, toolbar

- Material: thin/regular/thick/ultraThin
- Tint rengi ile cam efekti tonu ayarlanabilir

### 2.36 figma_create_icon

**Eylem**: `CREATE_ICON`
**Handler**: `figma-plugin/src/handlers/components.ts:1048`

- Lucide SVG ikonları desteklenir
- `figma.createNodeFromSvg(svgString)` ile oluşturulur
- Renk recursive olarak tüm çocuklara uygulanır (stroke ve fill)
- İkon adı yoksa → mevcut ikon listesi döner
- İkon bulunamazsa → hata + ilk 20 ikon önerisi

### 2.37 figma_get_node_info

**Eylem**: `GET_NODE_INFO`
**Handler**: `figma-plugin/src/handlers/query.ts:107`

#### Dönen Bilgiler
- Temel: id, name, type, visible, x, y
- Boyut: width, height (varsa)
- Çocuklar: childCount, children [{id, name, type}]
- Layout: layoutMode, primaryAxisSizingMode, counterAxisSizingMode, layoutSizingHorizontal/Vertical, itemSpacing, paddingTop/Right/Bottom/Left
- Stil: fills, strokes, strokeWeight, cornerRadius, opacity, constraints

### 2.38 figma_find_nodes

**Eylem**: `FIND_NODES`
**Handler**: `figma-plugin/src/handlers/query.ts:219`

- `figma.currentPage.findAll()` kullanır → TÜM node'ları gezer
- **Performans uyarısı**: Çok sayıda node olan sayfalarda yavaş olabilir
- Schema'daki `limit` parametresi handler'da uygulanmıyor (schema: max 1000, handler: sınırsız)
- Regex pattern desteği: `name` için `/pattern/` formatı

---

## 3. Bilinen Sorunlar ve Uyumsuzluklar

### 3.1 Schema-Handler Uyumsuzlukları

| Sorun | Schema | Handler | Etki |
|-------|--------|---------|------|
| Star innerRadius default | 0.5 | 0.4 | Zod tarafından 0.5 gönderilir, sorun yok |
| Vector paths format | `paths: [{data, windingRule}]` | `pathData: string` | Handler sadece tek path kabul ediyor |
| FindNodes limit | max: 1000 | Uygulanmıyor | Sınırsız sonuç dönebilir |
| Font weight 600 | - | "Semi Bold" vs "SemiBold" | Tutarsız font stili adı |
| ScaleNode origin | CENTER/TOP_LEFT/... | Kullanılmıyor | Origin parametresi etkisiz |
| ScaleNode scaleX/scaleY | Ayrı X/Y scale | Tek `scale` parametresi | Y scale bağımsız ayarlanamıyor |

### 3.2 Sessiz Hata Durumları

1. **Geçersiz hex renk**: Siyah döner, hata bildirmez
2. **Font fallback**: Inter Regular'a düşer, bildirim yok
3. **x, y parametreleri frame'de**: Sessizce görmezden gelinir
4. **Fill override**: Mevcut fill'ler bildirim olmadan silinir
5. **Effect override**: Mevcut effect'ler bildirim olmadan silinir

### 3.3 API Kısıtlamaları

1. **Birden fazla fill**: `setFill` her zaman tek fill uygular
2. **Effect ekleme**: `setEffects` mevcut effect'leri siler, ekleme yapmaz
3. **SET_POSITION deprecated**: Doğrudan pozisyonlama desteklenmiyor
4. **Group Auto Layout**: GroupNode auto-layout desteklemez
5. **Video**: Figma gerçek video oynatmayı desteklemez, sadece placeholder
6. **Link Preview**: Sadece FigJam'de çalışır

---

## 4. Auto Layout Derinlemesine

### 4.1 Sizing Mode İlişkileri

```
                    Auto Layout Yönü
                    HORIZONTAL    VERTICAL
Width ayarı:       PRIMARY       COUNTER
Height ayarı:      COUNTER       PRIMARY

PRIMARY axis:      HUG(AUTO) veya FIXED
COUNTER axis:      HUG(AUTO) veya FIXED

Çocuk sizing:
  FILL = Parent'ın o eksenini doldur
  HUG  = İçeriğe göre boyutlan
  FIXED = Sabit boyut
```

### 4.2 FILL Sizing Zincir Kuralı
- FILL sizing kullanmak için parent'ın Auto Layout'lu olması ZORUNLU
- Parent'ın parent'ı FILL sizing yapıyorsa, parent da Auto Layout'lu olmalı
- Bu zincir kırılırsa Figma hata verir

### 4.3 Wrap Mode
- `layoutWrap = "WRAP"` → İçerik sığmazsa alt satıra geçer
- `counterAxisSpacing` sadece wrap modunda çalışır
- Wrap modunda `counterAxisAlignItems` satırlar arası hizalamayı kontrol eder

---

## 5. Node Hiyerarşi ve Z-Index

### 5.1 appendChild vs insertChild
- `appendChild(node)` → En üste ekler (son çocuk = en üstte)
- `insertChild(0, node)` → En alta ekler (ilk çocuk = en altta)
- **Figma'da z-index**: children dizisinde son eleman en üstte gösterilir

### 5.2 Reparenting Kuralları
- Node zaten bir parent'a sahipse, yeni parent'a eklenince eski parent'tan otomatik kaldırılır
- Page'den frame'e taşıma: position değişebilir (local koordinata dönüşür)
- Auto Layout parent'a ekleme: x, y otomatik hesaplanır, manuel pozisyon görmezden gelinir

---

## 6. Performans Notları

1. **findAll()**: Büyük sayfalarda yavaş, mümkünse scope kullanın
2. **loadFontAsync**: Her text oluşturmada çağrılır, cache mekanizması yok
3. **nodeRegistry**: Memory leak riski - silinen node'lar registry'den kaldırılmalı (handleDeleteNode bunu yapıyor ama clone edilen orijinal node'lar kalabilir)
4. **SVG icon oluşturma**: `createNodeFromSvg` pahalı bir operasyon, her icon için çağrılıyor
5. **Gradient transform hesaplama**: Trigonometrik hesaplamalar her gradient için yapılır

---

## 7. Önerilen İyileştirmeler

### 7.1 Yüksek Öncelik
1. **Vector paths uyumsuzluğu düzeltilmeli** - Schema çoklu path, handler tek string bekliyor
2. **Font weight mapping tutarlı hale getirilmeli** - "Semi Bold" vs "SemiBold"
3. **FindNodes limit uygulanmalı** - Schema 1000 limit tanımlıyor ama handler'da uygulanmıyor
4. **ScaleNode origin parametresi implement edilmeli** - Schema'da var ama kullanılmıyor

### 7.2 Orta Öncelik
5. **Geçersiz hex için hata fırlatılmalı** - Sessiz siyah fallback yerine
6. **Font fallback bildirimi** - Response'a fallback kullanıldığı bilgisi eklenmeli
7. **Ellipse stroke desteği eklenmeli** - Rectangle'da var, Ellipse'de yok
8. **Effect ekleme modu** - Mevcut effect'lerin üzerine yazmak yerine ekleme seçeneği
9. **Fill çoklu destek** - Tek fill yerine birden fazla fill desteği

### 7.3 Düşük Öncelik
10. **Mixed font handling** - SetTextContent'te mixed font durumu kontrol edilmeli
11. **Font cache mekanizması** - Aynı font tekrar tekrar yüklenmemeli
12. **Node registry temizliği** - Periyodik temizlik veya WeakRef kullanımı
13. **x, y deprecated uyarısı** - Frame oluşturmada x, y verilirse kullanıcıya bilgi
14. **Gradient stop alpha desteği** - Şu an tüm stop'lar alpha=1

---

## 8. WebSocket İletişim Kuralları

### 8.1 Mesaj Akışı
```
MCP Server → WebSocket → Figma Plugin
     ↓                        ↓
  sendToFigma()          handleCommand()
     ↓                        ↓
  Promise (timeout: 30s)  Response geri gönder
```

### 8.2 Timeout
- Komut timeout: 30 saniye (varsayılan)
- Heartbeat: 15 saniyede bir PING
- Bağlantı kopma: 45 saniye PONG olmadan

### 8.3 Hata Formatı
```json
{
  "type": "RESPONSE",
  "id": "...",
  "success": false,
  "error": "Hata mesajı"
}
```

---

## 9. Design Token Sistemi

### 9.1 Spacing Token'ları
```
pxToSpacingKey(px) → en yakın token key
Token key → Gerçek px değeri

Geçerli spacing değerleri: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
```

### 9.2 Corner Radius Token'ları
```
pxToRadiusKey(px) → en yakın radius token
```

### 9.3 Theme Sistemi
- Global theme: light/dark
- Platform: shadcn/ios/macos/liquid-glass
- `themeManager.getTheme()` / `themeManager.setTheme()`
- Custom color token'ları `setCustomColors()` ile override edilebilir
- GetDesignTokens çağrılırken theme geçici olarak değiştirilip geri alınır (side effect riski minimum)

---

## 10. Özet Kontrol Listesi

### Yeni Tool Eklerken
- [ ] Zod schema default'ları handler default'ları ile uyumlu mu?
- [ ] Node null kontrolü yapılıyor mu?
- [ ] Font yükleme text işlemlerinden ÖNCE yapılıyor mu?
- [ ] Parent Auto Layout kontrolü FILL sizing için yapılıyor mu?
- [ ] Node registry'ye kayıt yapılıyor mu?
- [ ] Hata durumunda node temizliği yapılıyor mu?
- [ ] Response bilgilendirici mi (nodeId, success, hata detayı)?

### Mevcut Tool Kullanırken
- [ ] RGB değerleri 0-1 aralığında mı?
- [ ] fills = [] mi yoksa fill atandı mı? (transparent vs opak)
- [ ] Effect override olacak mı? (tüm effect'ler tek çağrıda mı?)
- [ ] Parent auto-layout'lu mu? (FILL sizing için)
- [ ] Font loadFontAsync çağrıldı mı? (text işlemleri için)
