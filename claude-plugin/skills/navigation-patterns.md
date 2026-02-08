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
  },
  layoutSizingHorizontal: "FILL"
})

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
  autoLayout: { mode: "VERTICAL", spacing: 8, padding: 16 },
  layoutSizingHorizontal: "FILL"
})

// Top row: back + actions
const topRow = figma_create_frame({
  name: "TopRow",
  parentId: navBarLarge.nodeId,
  autoLayout: { mode: "HORIZONTAL", primaryAxisAlign: "SPACE_BETWEEN" },
  layoutSizingHorizontal: "FILL"
})

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

### Standard Tab Bar (3-5 items, CRITICAL dimensions!)

**DIMENSIONS**: Total height = 83px (49px tabs + 34px safe area bottom)

```
┌────────────────────────────────┐
│ ─ ─ ─ ─ ─ separator ─ ─ ─ ─  │  1px (#27272A)
│  🏠     📊     💳     👤    │  49px (icon + label + spacing)
│        [safe area]            │  34px (paddingBottom)
└────────────────────────────────┘
```

```typescript
// Tab bar wrapper with top separator
const tabBarWrapper = figma_create_frame({
  name: "TabBar",
  parentId: mainFrame.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 0 },
  fill: { type: "SOLID", color: "#18181B" },
  layoutSizingHorizontal: "FILL"
})

// Top separator line (1px)
figma_create_frame({
  name: "TabBarSeparator",
  parentId: tabBarWrapper.nodeId,
  height: 1,
  fill: { type: "SOLID", color: "#27272A" },
  layoutSizingHorizontal: "FILL"
})

// Tab items container
const tabItems = figma_create_frame({
  name: "TabItems",
  parentId: tabBarWrapper.nodeId,
  autoLayout: {
    mode: "HORIZONTAL",
    paddingTop: 8,
    paddingBottom: 34,  // iPhone safe area!
    paddingLeft: 16,
    paddingRight: 16
  },
  layoutSizingHorizontal: "FILL"
})

const tabs = [
  { icon: "home", label: "Home", active: true },
  { icon: "bar-chart-3", label: "Analytics", active: false },
  { icon: "credit-card", label: "Cards", active: false },
  { icon: "user", label: "Profile", active: false }
]

tabs.forEach(tab => {
  const tabItem = figma_create_frame({
    name: `Tab-${tab.label}`,
    parentId: tabItems.nodeId,
    autoLayout: {
      mode: "VERTICAL",
      spacing: 4,
      primaryAxisAlign: "CENTER",
      counterAxisAlign: "CENTER"
    },
    layoutSizingHorizontal: "FILL"
  })

  figma_create_icon({
    name: tab.icon,
    size: 22,
    color: tab.active ? "#FAFAFA" : "#71717A",
    parentId: tabItem.nodeId
  })

  figma_create_text({
    content: tab.label,
    parentId: tabItem.nodeId,
    style: { fontSize: 10, fontWeight: tab.active ? 600 : 400 },
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
  cornerRadius: 24,  // sadece ust koseler
  layoutSizingHorizontal: "FILL"
})
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
  autoLayout: { mode: "HORIZONTAL", spacing: 12 },
  layoutSizingHorizontal: "FILL"
})

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

## TAB BAR ICON REFERENCE

Common tab items and their Lucide icons:

| Tab Label | Icon Name | Category |
|-----------|-----------|----------|
| Home | home | General |
| Search / Explore | search | General |
| Analytics | bar-chart-3 | Finance |
| Cards / Wallet | credit-card | Finance |
| Profile / Account | user | General |
| Settings | settings | General |
| Messages / Chat | message-circle | Social |
| Notifications | bell | General |
| Cart / Shopping | shopping-cart | E-commerce |
| Orders | package | E-commerce |
| Favorites / Saved | heart | General |
| Add / Create | plus-circle | Action |
| Calendar | calendar | Productivity |
| Map / Location | map-pin | Location |
| Activity / Feed | activity | Health |

### Tab Bar Rules
1. **ALWAYS icon + label** (never text-only or icon-only)
2. **Max 5 tabs** (3-4 is ideal for mobile)
3. **Active tab**: white icon + bold label (#FAFAFA, fontWeight: 600)
4. **Inactive tab**: muted icon + regular label (#71717A, fontWeight: 400)
5. **Icon size**: 22px (not 24 - slightly smaller for balance)
6. **Label size**: 10px
7. **Tab bar background**: #18181B (dark) or #FFFFFF (light)
8. **Top separator**: 1px line (#27272A dark, #E4E4E7 light)
9. **Safe area padding**: paddingBottom: 34px (iPhone)

---

## NAVIGASYON SECIM KURALLARI

| Senaryo | Pattern |
|---------|---------|
| 3-5 ana bolum | Tab Bar |
| Detay sayfasi | Nav Bar + Back |
| Secenekler, actions | Bottom Sheet |
| Onay, uyari | Modal |
| Buyuk menu | Drawer/Sidebar |
