---
name: list-patterns
description: |
  Liste pattern'leri: List item varyasyonlari, grouped list, swipeable.
---

# List Patterns

## BASIC LIST ITEM

```typescript
const listItem = figma_create_frame({
  name: "ListItem",
  parentId: list.nodeId,
  height: 56,
  autoLayout: {
    mode: "HORIZONTAL",
    padding: 16,
    spacing: 12,
    counterAxisAlign: "CENTER"
  },
  fill: { type: "SOLID", color: "#18181B" },
  layoutSizingHorizontal: "FILL"
})

const titleText = figma_create_text({
  content: "List Item Title",
  parentId: listItem.nodeId,
  style: { fontSize: 16, fontWeight: 500 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})
figma_set_layout_sizing({ nodeId: titleText.nodeId, horizontal: "FILL" })

figma_create_icon({
  name: "chevron-right",
  size: 20,
  color: "#71717A",
  parentId: listItem.nodeId
})
```

---

## LIST ITEM WITH ICON

```typescript
const listItemIcon = figma_create_frame({
  name: "ListItemWithIcon",
  parentId: list.nodeId,
  height: 56,
  autoLayout: {
    mode: "HORIZONTAL",
    padding: 16,
    spacing: 12,
    counterAxisAlign: "CENTER"
  },
  fill: { type: "SOLID", color: "#18181B" },
  layoutSizingHorizontal: "FILL"
})

// Icon container
const iconContainer = figma_create_frame({
  name: "IconContainer",
  parentId: listItemIcon.nodeId,
  width: 32, height: 32,
  autoLayout: {
    mode: "HORIZONTAL",
    primaryAxisAlign: "CENTER",
    counterAxisAlign: "CENTER"
  },
  fill: { type: "SOLID", color: "#27272A" },
  cornerRadius: 8
})

figma_create_icon({
  name: "settings",
  size: 18,
  color: "#FAFAFA",
  parentId: iconContainer.nodeId
})

// Text
const settingsText = figma_create_text({
  content: "Ayarlar",
  parentId: listItemIcon.nodeId,
  style: { fontSize: 16, fontWeight: 500 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})
figma_set_layout_sizing({ nodeId: settingsText.nodeId, horizontal: "FILL" })

// Chevron
figma_create_icon({
  name: "chevron-right",
  size: 20,
  color: "#71717A",
  parentId: listItemIcon.nodeId
})
```

---

## LIST ITEM WITH AVATAR

```typescript
const listItemAvatar = figma_create_frame({
  name: "ListItemWithAvatar",
  parentId: list.nodeId,
  height: 72,
  autoLayout: {
    mode: "HORIZONTAL",
    padding: 16,
    spacing: 12,
    counterAxisAlign: "CENTER"
  },
  fill: { type: "SOLID", color: "#18181B" },
  layoutSizingHorizontal: "FILL"
})

// Avatar
const avatar = figma_create_frame({
  name: "Avatar",
  parentId: listItemAvatar.nodeId,
  width: 40, height: 40,
  fill: { type: "SOLID", color: "#27272A" },
  cornerRadius: 20
})

// Text group
const textGroup = figma_create_frame({
  name: "TextGroup",
  parentId: listItemAvatar.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 2 },
  layoutSizingHorizontal: "FILL"
})

figma_create_text({
  content: "John Doe",
  parentId: textGroup.nodeId,
  style: { fontSize: 16, fontWeight: 500 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

figma_create_text({
  content: "john@example.com",
  parentId: textGroup.nodeId,
  style: { fontSize: 14 },
  fill: { type: "SOLID", color: "#71717A" }
})
```

---

## LIST ITEM WITH VALUE

```typescript
const listItemValue = figma_create_frame({
  name: "ListItemWithValue",
  parentId: list.nodeId,
  height: 56,
  autoLayout: {
    mode: "HORIZONTAL",
    padding: 16,
    spacing: 12,
    counterAxisAlign: "CENTER"
  },
  fill: { type: "SOLID", color: "#18181B" },
  layoutSizingHorizontal: "FILL"
})

const labelText = figma_create_text({
  content: "Dil",
  parentId: listItemValue.nodeId,
  style: { fontSize: 16, fontWeight: 500 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})
figma_set_layout_sizing({ nodeId: labelText.nodeId, horizontal: "FILL" })

figma_create_text({
  content: "Turkce",
  parentId: listItemValue.nodeId,
  style: { fontSize: 16 },
  fill: { type: "SOLID", color: "#71717A" }
})

figma_create_icon({
  name: "chevron-right",
  size: 20,
  color: "#71717A",
  parentId: listItemValue.nodeId
})
```

---

## GROUPED LIST (Sections)

```typescript
// Section
const section = figma_create_frame({
  name: "Section-Account",
  parentId: content.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 0 },
  layoutSizingHorizontal: "FILL"
})

// Section header
figma_create_text({
  content: "HESAP",
  parentId: section.nodeId,
  style: { fontSize: 12, fontWeight: 600 },
  fill: { type: "SOLID", color: "#71717A" }
})

// Section card (list items container)
const sectionCard = figma_create_frame({
  name: "SectionCard",
  parentId: section.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 0 },
  fill: { type: "SOLID", color: "#18181B" },
  cornerRadius: 12,
  layoutSizingHorizontal: "FILL"
})

// Items inside card
// ... list items with dividers between them
```

---

## DIVIDER

```typescript
const divider = figma_create_frame({
  name: "Divider",
  parentId: sectionCard.nodeId,
  height: 1,
  fill: { type: "SOLID", color: "#27272A" },
  layoutSizingHorizontal: "FILL"
})
```

---

## LIST ITEM VARYASYONLARI

| Tip | Kullanim | Yukseklik |
|-----|----------|-----------|
| Basic | Basit navigasyon | 56px |
| With Icon | Kategorili menu | 56px |
| With Avatar | Kullanici listesi | 72px |
| With Value | Ayar degeri goster | 56px |
| With Toggle | On/off ayar | 56px |
| With Badge | Bildirim sayisi | 56px |
