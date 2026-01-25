---
name: navigation-patterns
description: |
  Navigasyon pattern'leri: Navigation bar, Tab bar, Bottom sheet, Modal.
---

# Navigation Patterns

## NAVIGATION BAR

### Standard Nav Bar (Back + Title + Action)
```typescript
const navBar = figma_create_frame({
  name: "NavigationBar",
  parentId: mainFrame.nodeId,
  height: 56,
  autoLayout: {
    mode: "HORIZONTAL",
    padding: 16,
    primaryAxisAlign: "SPACE_BETWEEN",
    counterAxisAlign: "CENTER"
  }
})
figma_set_layout_sizing({ nodeId: navBar.nodeId, horizontal: "FILL" })

// Left: Back button
const backBtn = figma_create_frame({
  name: "BackButton",
  parentId: navBar.nodeId,
  width: 40, height: 40,
  autoLayout: {
    mode: "HORIZONTAL",
    primaryAxisAlign: "CENTER",
    counterAxisAlign: "CENTER"
  }
})

figma_create_icon({
  name: "chevron-left",
  size: 24,
  color: "#FAFAFA",
  parentId: backBtn.nodeId
})

// Center: Title
figma_create_text({
  content: "Sayfa Basligi",
  parentId: navBar.nodeId,
  style: { fontSize: 18, fontWeight: 600 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

// Right: Action button
figma_create_icon({
  name: "more-vertical",
  size: 24,
  color: "#FAFAFA",
  parentId: navBar.nodeId
})
```

### Large Title Nav Bar (iOS Style)
```typescript
const navBarLarge = figma_create_frame({
  name: "NavigationBarLarge",
  parentId: mainFrame.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 8, padding: 16 }
})
figma_set_layout_sizing({ nodeId: navBarLarge.nodeId, horizontal: "FILL" })

// Top row: back + actions
const topRow = figma_create_frame({
  name: "TopRow",
  parentId: navBarLarge.nodeId,
  autoLayout: { mode: "HORIZONTAL", primaryAxisAlign: "SPACE_BETWEEN" }
})
figma_set_layout_sizing({ nodeId: topRow.nodeId, horizontal: "FILL" })

// Large title
figma_create_text({
  content: "Ayarlar",
  parentId: navBarLarge.nodeId,
  style: { fontSize: 34, fontWeight: 700 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})
```

---

## TAB BAR

### Standard Tab Bar (5 items max)
```typescript
const tabBar = figma_create_frame({
  name: "TabBar",
  parentId: mainFrame.nodeId,
  height: 80,
  autoLayout: {
    mode: "HORIZONTAL",
    paddingTop: 8,
    paddingBottom: 24,  // safe area
    paddingLeft: 16,
    paddingRight: 16,
    primaryAxisAlign: "SPACE_BETWEEN"
  },
  fill: { type: "SOLID", color: "#18181B" }
})
figma_set_layout_sizing({ nodeId: tabBar.nodeId, horizontal: "FILL" })

const tabs = [
  { icon: "home", label: "Ana Sayfa", active: true },
  { icon: "search", label: "Ara", active: false },
  { icon: "plus-circle", label: "Ekle", active: false },
  { icon: "bell", label: "Bildirimler", active: false },
  { icon: "user", label: "Profil", active: false }
]

tabs.forEach(tab => {
  const tabItem = figma_create_frame({
    name: `Tab-${tab.label}`,
    parentId: tabBar.nodeId,
    autoLayout: {
      mode: "VERTICAL",
      spacing: 4,
      primaryAxisAlign: "CENTER",
      counterAxisAlign: "CENTER"
    }
  })
  figma_set_layout_sizing({ nodeId: tabItem.nodeId, horizontal: "FILL" })

  figma_create_icon({
    name: tab.icon,
    size: 24,
    color: tab.active ? "#FAFAFA" : "#71717A",
    parentId: tabItem.nodeId
  })

  figma_create_text({
    content: tab.label,
    parentId: tabItem.nodeId,
    style: { fontSize: 10, fontWeight: 500 },
    fill: { type: "SOLID", color: tab.active ? "#FAFAFA" : "#71717A" }
  })
})
```

---

## BOTTOM SHEET

```typescript
// Overlay background
const overlay = figma_create_frame({
  name: "Overlay",
  parentId: mainFrame.nodeId,
  width: 393, height: 852,
  fill: { type: "SOLID", color: { r: 0, g: 0, b: 0, a: 0.5 } }
})

// Bottom sheet
const sheet = figma_create_frame({
  name: "BottomSheet",
  parentId: mainFrame.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 16, padding: 24 },
  fill: { type: "SOLID", color: "#18181B" },
  cornerRadius: 24  // sadece ust koseler
})
figma_set_layout_sizing({ nodeId: sheet.nodeId, horizontal: "FILL" })
figma_set_position({ nodeId: sheet.nodeId, x: 0, y: 500 })  // alttan yukari

// Handle bar
const handle = figma_create_frame({
  name: "Handle",
  parentId: sheet.nodeId,
  width: 36, height: 4,
  fill: { type: "SOLID", color: "#27272A" },
  cornerRadius: 2
})

// Sheet content
figma_create_text({
  content: "Sheet Title",
  parentId: sheet.nodeId,
  style: { fontSize: 20, fontWeight: 600 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})
```

---

## MODAL / DIALOG

```typescript
// Centered modal
const modalContainer = figma_create_frame({
  name: "ModalContainer",
  parentId: mainFrame.nodeId,
  width: 393, height: 852,
  autoLayout: {
    mode: "VERTICAL",
    primaryAxisAlign: "CENTER",
    counterAxisAlign: "CENTER",
    padding: 24
  },
  fill: { type: "SOLID", color: { r: 0, g: 0, b: 0, a: 0.5 } }
})

const modal = figma_create_frame({
  name: "Modal",
  parentId: modalContainer.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 16, padding: 24 },
  fill: { type: "SOLID", color: "#18181B" },
  cornerRadius: 16
})

// Modal header
figma_create_text({
  content: "Emin misiniz?",
  parentId: modal.nodeId,
  style: { fontSize: 18, fontWeight: 600 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

// Modal body
figma_create_text({
  content: "Bu islemi geri alamazsiniz.",
  parentId: modal.nodeId,
  style: { fontSize: 14 },
  fill: { type: "SOLID", color: "#A1A1AA" }
})

// Modal actions
const actions = figma_create_frame({
  name: "ModalActions",
  parentId: modal.nodeId,
  autoLayout: { mode: "HORIZONTAL", spacing: 12 }
})
figma_set_layout_sizing({ nodeId: actions.nodeId, horizontal: "FILL" })

figma_create_button({
  text: "Iptal",
  variant: "ghost",
  parentId: actions.nodeId
})

figma_create_button({
  text: "Sil",
  variant: "destructive",
  parentId: actions.nodeId
})
```

---

## NAVIGASYON SECIM KURALLARI

| Senaryo | Pattern |
|---------|---------|
| 3-5 ana bolum | Tab Bar |
| Detay sayfasi | Nav Bar + Back |
| Secenekler, actions | Bottom Sheet |
| Onay, uyari | Modal |
| Buyuk menu | Drawer/Sidebar |
