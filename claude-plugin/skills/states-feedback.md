---
name: states-feedback
description: |
  State ve feedback pattern'leri: Loading, error, empty, skeleton, toast.
---

# States & Feedback Patterns

## LOADING STATE

### Full Screen Loading
```typescript
const loadingScreen = figma_create_frame({
  name: "LoadingScreen",
  parentId: mainFrame.nodeId,
  width: 393, height: 852,
  autoLayout: {
    mode: "VERTICAL",
    primaryAxisAlign: "CENTER",
    counterAxisAlign: "CENTER",
    spacing: 16
  },
  fill: { type: "SOLID", color: "#09090B" }
})

// Spinner placeholder (circle)
const spinner = figma_create_frame({
  name: "Spinner",
  parentId: loadingScreen.nodeId,
  width: 40, height: 40,
  stroke: { color: "#3B82F6", weight: 3 },
  cornerRadius: 20
})

figma_create_text({
  content: "Yukleniyor...",
  parentId: loadingScreen.nodeId,
  style: { fontSize: 14 },
  fill: { type: "SOLID", color: "#71717A" }
})
```

### Inline Loading Button
```typescript
const loadingBtn = figma_create_frame({
  name: "Button-Loading",
  parentId: content.nodeId,
  height: 48,
  autoLayout: {
    mode: "HORIZONTAL",
    spacing: 8,
    padding: 16,
    primaryAxisAlign: "CENTER",
    counterAxisAlign: "CENTER"
  },
  fill: { type: "SOLID", color: "#3B82F6" },
  cornerRadius: 8,
  layoutSizingHorizontal: "FILL"
})

// Mini spinner
figma_create_frame({
  name: "MiniSpinner",
  parentId: loadingBtn.nodeId,
  width: 16, height: 16,
  stroke: { color: "#FFFFFF", weight: 2 },
  cornerRadius: 8
})

figma_create_text({
  content: "Kaydediliyor...",
  parentId: loadingBtn.nodeId,
  style: { fontSize: 16, fontWeight: 500 },
  fill: { type: "SOLID", color: "#FFFFFF" }
})
```

---

## EMPTY STATE

```typescript
const emptyState = figma_create_frame({
  name: "EmptyState",
  parentId: content.nodeId,
  autoLayout: {
    mode: "VERTICAL",
    spacing: 16,
    padding: 32,
    primaryAxisAlign: "CENTER",
    counterAxisAlign: "CENTER"
  },
  layoutSizingHorizontal: "FILL",
  layoutSizingVertical: "FILL"
})

// Illustration placeholder
const illustration = figma_create_frame({
  name: "Illustration",
  parentId: emptyState.nodeId,
  width: 120, height: 120,
  fill: { type: "SOLID", color: "#27272A" },
  cornerRadius: 60
})

figma_create_icon({
  name: "inbox",
  size: 48,
  color: "#71717A",
  parentId: illustration.nodeId
})

figma_create_text({
  content: "Henuz icerik yok",
  parentId: emptyState.nodeId,
  style: { fontSize: 18, fontWeight: 600 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

figma_create_text({
  content: "Yeni bir sey ekleyerek baslayin",
  parentId: emptyState.nodeId,
  style: { fontSize: 14, textAlign: "CENTER" },
  fill: { type: "SOLID", color: "#71717A" }
})

figma_create_button({
  text: "Olustur",
  variant: "primary",
  parentId: emptyState.nodeId
})
```

---

## ERROR STATE

```typescript
const errorState = figma_create_frame({
  name: "ErrorState",
  parentId: content.nodeId,
  autoLayout: {
    mode: "VERTICAL",
    spacing: 16,
    padding: 32,
    primaryAxisAlign: "CENTER",
    counterAxisAlign: "CENTER"
  },
  layoutSizingHorizontal: "FILL",
  layoutSizingVertical: "FILL"
})

// Error icon
const errorIcon = figma_create_frame({
  name: "ErrorIcon",
  parentId: errorState.nodeId,
  width: 64, height: 64,
  autoLayout: {
    mode: "HORIZONTAL",
    primaryAxisAlign: "CENTER",
    counterAxisAlign: "CENTER"
  },
  fill: { type: "SOLID", color: "#7F1D1D" },  // dark red
  cornerRadius: 32
})

figma_create_icon({
  name: "alert-triangle",
  size: 32,
  color: "#EF4444",
  parentId: errorIcon.nodeId
})

figma_create_text({
  content: "Bir hata olustu",
  parentId: errorState.nodeId,
  style: { fontSize: 18, fontWeight: 600 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

figma_create_text({
  content: "Lutfen daha sonra tekrar deneyin",
  parentId: errorState.nodeId,
  style: { fontSize: 14, textAlign: "CENTER" },
  fill: { type: "SOLID", color: "#71717A" }
})

figma_create_button({
  text: "Tekrar Dene",
  variant: "secondary",
  parentId: errorState.nodeId
})
```

---

## SKELETON LOADING

```typescript
const skeletonCard = figma_create_frame({
  name: "SkeletonCard",
  parentId: content.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 12, padding: 16 },
  fill: { type: "SOLID", color: "#18181B" },
  cornerRadius: 12,
  layoutSizingHorizontal: "FILL"
})

// Skeleton line - title
figma_create_frame({
  name: "Skeleton-Title",
  parentId: skeletonCard.nodeId,
  width: 150, height: 20,
  fill: { type: "SOLID", color: "#27272A" },
  cornerRadius: 4
})

// Skeleton line - subtitle
figma_create_frame({
  name: "Skeleton-Subtitle",
  parentId: skeletonCard.nodeId,
  width: 200, height: 16,
  fill: { type: "SOLID", color: "#27272A" },
  cornerRadius: 4
})

// Skeleton block
figma_create_frame({
  name: "Skeleton-Block",
  parentId: skeletonCard.nodeId,
  height: 100,
  fill: { type: "SOLID", color: "#27272A" },
  cornerRadius: 8,
  layoutSizingHorizontal: "FILL"
})
```

---

## TOAST / SNACKBAR

```typescript
const toast = figma_create_frame({
  name: "Toast-Success",
  parentId: mainFrame.nodeId,
  autoLayout: {
    mode: "HORIZONTAL",
    spacing: 12,
    padding: 16,
    counterAxisAlign: "CENTER"
  },
  fill: { type: "SOLID", color: "#14532D" },  // dark green
  cornerRadius: 12,
  effects: [{ type: "DROP_SHADOW", blur: 16, offsetY: 4, opacity: 0.2 }]
})
// Position at bottom
figma_set_position({ nodeId: toast.nodeId, x: 16, y: 760 })

figma_create_icon({
  name: "check-circle",
  size: 20,
  color: "#22C55E",
  parentId: toast.nodeId
})

const toastText = figma_create_text({
  content: "Basariyla kaydedildi",
  parentId: toast.nodeId,
  style: { fontSize: 14, fontWeight: 500 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})
figma_set_layout_sizing({ nodeId: toastText.nodeId, horizontal: "FILL" })

figma_create_icon({
  name: "x",
  size: 16,
  color: "#71717A",
  parentId: toast.nodeId
})
```

### Toast Varyasyonlari
| Tip | Background | Icon | Icon Color |
|-----|------------|------|------------|
| Success | #14532D | check-circle | #22C55E |
| Error | #7F1D1D | x-circle | #EF4444 |
| Warning | #78350F | alert-triangle | #F59E0B |
| Info | #1E3A5F | info | #3B82F6 |

---

## STATE SECIM KURALLARI

| Durum | Pattern |
|-------|---------|
| Veri yukleniyor | Skeleton veya Spinner |
| Liste bos | Empty State |
| Islem basarili | Toast (Success) |
| Hata olustu | Error State veya Toast (Error) |
| Islem devam ediyor | Loading Button |
