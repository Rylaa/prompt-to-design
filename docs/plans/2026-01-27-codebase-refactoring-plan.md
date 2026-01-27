# Codebase Refactoring Plan

**Tarih:** 2026-01-27
**Durum:** Onaylandı
**Risk Seviyesi:** Düşük (Faz 1), Orta (Faz 2-3)

## Özet

prompt-to-design projesinin mimari analizi tamamlandı. İki kritik sorun tespit edildi:
1. `code.ts` - 5,707 satırlık monolith
2. `schemas/index.ts` - 1,577 satırlık coupling hub

Bu plan, hiçbir çalışan işlevselliği bozmadan kademeli iyileştirmeler yapmayı hedefliyor.

---

## Mevcut Durum

### Proje İstatistikleri
- Toplam: ~24,000 satır TypeScript
- figma-plugin: ~22,300 satır (40+ dosya)
- mcp-server: ~7,000 satır (28+ dosya)

### Güçlü Yanlar ✅
- Circular dependency yok
- Modül ayrımı temiz (plugin vs server)
- Factory + Registration pattern tutarlı
- Hata yönetimi iyi

### Zayıf Yanlar ⚠️
- `code.ts` tüm komutları tek switch'te işliyor
- `schemas/index.ts` 26 tool'un bağımlılık noktası
- Tekrar eden kod paternleri (~250 satır)

---

## Faz 1: Hızlı Kazanımlar

**Risk:** ⚪ Çok Düşük
**Tahmini Etki:** ~250 satır dedupe

### 1.1 StrokeSchema Çıkarma
**Dosya:** `mcp-server/src/schemas/base/common.ts`

Mevcut durum: 6 farklı yerde inline tanımlanmış
```typescript
stroke: z.object({
  color: ColorSchema,
  weight: z.number().min(0).default(1),
}).optional()
```

Hedef:
```typescript
export const StrokeSchema = z.object({
  color: ColorSchema,
  weight: z.number().min(0).default(1),
  align: z.enum(["INSIDE", "OUTSIDE", "CENTER"]).optional().default("INSIDE"),
});
```

### 1.2 PositionSchema + ParentSchema Çıkarma
**Dosya:** `mcp-server/src/schemas/base/common.ts`

25+ şemada tekrar eden pattern:
```typescript
export const PositionSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
});

export const ParentSchema = z.object({
  parentId: z.string().optional().describe("Parent frame to add element to"),
});
```

### 1.3 EmptyInputSchema Sabiti
**Dosya:** `mcp-server/src/schemas/base/common.ts`

14 yerde tekrar eden:
```typescript
export const EmptyInputSchema = z.object({}).strict();
```

### 1.4 getNodeOrThrow() Utility
**Dosya:** `figma-plugin/src/code.ts`

50+ handler'da tekrar eden pattern:
```typescript
async function getNodeOrThrow(nodeId: string): Promise<SceneNode> {
  const node = await getNode(nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  return node;
}
```

### 1.5 attachToParentOrPage() Utility
**Dosya:** `figma-plugin/src/code.ts`

20+ handler'da tekrar eden pattern:
```typescript
async function attachToParentOrPage(node: SceneNode, parentId?: string): Promise<void> {
  if (parentId) {
    const parent = await getNode(parentId);
    if (parent && "appendChild" in parent) {
      (parent as FrameNode).appendChild(node);
    }
  } else {
    figma.currentPage.appendChild(node);
  }
}
```

### 1.6 setPosition() Utility
**Dosya:** `figma-plugin/src/code.ts`

15+ handler'da tekrar eden pattern:
```typescript
function setPosition(node: SceneNode, x?: number, y?: number): void {
  if (x !== undefined) node.x = x;
  if (y !== undefined) node.y = y;
}
```

---

## Faz 2: Yapısal İyileştirmeler

**Risk:** 🟡 Düşük-Orta
**Ön Koşul:** Faz 1 tamamlanmış olmalı

### 2.1 Schema Dizin Yapısı
```
mcp-server/src/schemas/
├── base/
│   ├── colors.ts
│   ├── fills.ts
│   ├── effects.ts
│   ├── layout.ts
│   ├── text.ts
│   ├── common.ts
│   └── index.ts
├── tools/
│   ├── shapes.ts
│   ├── text.ts
│   ├── components.ts
│   ├── design-system.ts
│   ├── layout.ts
│   ├── styling.ts
│   ├── manipulation.ts
│   ├── query.ts
│   ├── prototype.ts
│   ├── figjam.ts
│   ├── export.ts
│   ├── variables.ts
│   ├── annotations.ts
│   ├── viewport.ts
│   ├── pages.ts
│   ├── linter.ts
│   └── index.ts
└── index.ts
```

### 2.2 Switch → Handler Map
**Dosya:** `figma-plugin/src/code.ts`

Mevcut (305 satır switch):
```typescript
switch (action) {
  case "CREATE_FRAME":
    return await handleCreateFrame(params);
  // ... 110+ case
}
```

Hedef:
```typescript
const handlers: Record<string, Handler> = {
  CREATE_FRAME: handleCreateFrame,
  CREATE_RECTANGLE: handleCreateRectangle,
  // ...
};

const handler = handlers[action];
if (!handler) throw new Error(`Unknown action: ${action}`);
return await handler(params);
```

### 2.3 finalizeNode() Utility
Faz 1 utility'lerini birleştiren wrapper:
```typescript
interface FinalizeOptions {
  parentId?: string;
  x?: number;
  y?: number;
}

async function finalizeNode(node: SceneNode, options: FinalizeOptions): Promise<void> {
  await attachToParentOrPage(node, options.parentId);
  setPosition(node, options.x, options.y);
}
```

---

## Faz 3: Uzun Vadeli

**Risk:** 🟠 Orta
**Ön Koşul:** Faz 1-2 tamamlanmış, test coverage artırılmış

### 3.1 code.ts Handler Modülleri
```
figma-plugin/src/
├── code.ts (orchestrator, ~500 satır)
├── handlers/
│   ├── shapes.ts
│   ├── text.ts
│   ├── components.ts
│   ├── styling.ts
│   ├── layout.ts
│   ├── prototype.ts
│   ├── figjam.ts
│   └── index.ts
└── utils/
    ├── paint-converter.ts
    ├── color-parser.ts
    └── node-helpers.ts
```

### 3.2 Component Factory Pattern
UI component oluşturma mantığını standartlaştırma.

### 3.3 Liquid Glass Dosya Bölümü
1,339 satırlık tek dosyayı kategorilere ayırma.

---

## Uygulama Kuralları

1. **Her değişiklik öncesi onay** alınacak
2. **Küçük PR'lar** - her görev ayrı commit
3. **Build kontrolü** - her adım sonrası `npm run build`
4. **Rollback** - sorun olursa `git checkout` ile geri alma

---

## Başarı Kriterleri

| Metrik | Mevcut | Faz 1 Sonrası | Faz 2 Sonrası |
|--------|--------|---------------|---------------|
| Tekrar eden pattern | 50+ | 10-15 | 5-10 |
| schemas/index.ts | 1,577 satır | ~1,400 satır | ~100 satır (re-export) |
| code.ts switch cases | 110+ | 110+ | 0 (map) |
| Build durumu | ✅ | ✅ | ✅ |

---

## Notlar

- Hiçbir işlevsellik değişmeyecek
- Tüm tool'lar aynı şekilde çalışmaya devam edecek
- Import path'leri güncellenecek ama API aynı kalacak
