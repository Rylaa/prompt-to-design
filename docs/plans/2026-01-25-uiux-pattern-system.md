# UI/UX Pattern System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Design Agent'a kapsamlı UI/UX pattern bilgisi ekleyerek profesyonel seviyede tasarımlar üretebilmesini sağlamak.

**Architecture:** Modüler skill sistemi - Design Agent orchestrator olarak kalır, UI/UX pattern'leri kategorize edilmiş skill dosyalarında tutulur. Her skill bağımsız olarak geliştirilebilir ve test edilebilir.

**Tech Stack:** Claude Code Plugin System (agents, skills, commands), Markdown

---

## Strateji

### Mevcut Sorun
Design Agent 400+ satır ve sadece dashboard pattern'leri var. Tüm UI/UX bilgisini tek dosyaya eklemek:
- Dosyayı 1000+ satıra çıkarır
- Bakımı zorlaştırır
- Context window'u gereksiz doldurur

### Çözüm: Modüler Skill Sistemi
```
claude-plugin/
├── agents/
│   └── design-agent.md (orchestrator, skill referansları)
├── skills/                    # YENİ
│   ├── screen-patterns.md     # Login, Profile, Settings, etc.
│   ├── form-patterns.md       # Input groups, validation
│   ├── navigation-patterns.md # Tab bar, Nav bar, Modal
│   ├── list-patterns.md       # List items, grouped lists
│   └── states-feedback.md     # Loading, error, empty states
└── plugin.json (skills array eklenir)
```

### Avantajlar
1. **Modülerlik** - Her skill bağımsız geliştirilebilir
2. **Lazy Loading** - Sadece gerekli skill yüklenir
3. **Maintainability** - Değişiklikler izole
4. **Scalability** - Yeni pattern'ler kolayca eklenir

---

## Task 1: Skill Altyapısı Kurulumu

**Files:**
- Create: `claude-plugin/skills/` directory
- Modify: `claude-plugin/plugin.json`

**Step 1: Skills klasörü oluştur**

```bash
mkdir -p claude-plugin/skills
```

**Step 2: plugin.json'a skills array ekle**

Modify `claude-plugin/plugin.json`:
```json
{
  "name": "prompt-to-design",
  "version": "1.0.0",
  "description": "AI-powered Figma design automation",
  "agents": [
    { "path": "agents/design-agent.md" },
    { "path": "agents/execution-agent.md" }
  ],
  "skills": [
    { "path": "skills/screen-patterns.md" },
    { "path": "skills/form-patterns.md" },
    { "path": "skills/navigation-patterns.md" },
    { "path": "skills/list-patterns.md" },
    { "path": "skills/states-feedback.md" }
  ],
  "commands": [
    { "path": "commands/plan.md" },
    { "path": "commands/prompt-to-design.md" }
  ]
}
```

**Step 3: Commit**

```bash
git add claude-plugin/plugin.json
git commit -m "chore: add skills array to plugin.json"
```

---

## Task 2: Screen Patterns Skill

**Files:**
- Create: `claude-plugin/skills/screen-patterns.md`

**Step 1: Screen Patterns skill dosyasını oluştur**

Create `claude-plugin/skills/screen-patterns.md`:

```markdown
---
name: screen-patterns
description: |
  Temel ekran sablonlari: Login, Signup, Profile, Settings, Onboarding.
  Design Agent bu skill'i ekran tipi belirlerken kullanir.
---

# Screen Patterns

Bu skill, yaygin ekran turleri icin hazir sablonlar icerir.

## LOGIN EKRANI

### Yapi
```
[Main Frame - device size]
├── [Content - vertical, center aligned]
│   ├── [Logo/App Icon - 64x64]
│   ├── [Title - "Hosgeldiniz"]
│   ├── [Subtitle - muted text]
│   ├── [Spacer - 32px]
│   ├── [Email Input]
│   ├── [Password Input]
│   ├── [Forgot Password Link - right aligned]
│   ├── [Spacer - 24px]
│   ├── [Login Button - primary, full width]
│   ├── [Divider - "veya"]
│   ├── [Social Login Buttons]
│   └── [Signup Link - "Hesabiniz yok mu?"]
```

### Kod Ornegi
```typescript
// Login Screen
const mainFrame = figma_create_frame({
  name: "Login",
  width: 393, height: 852,
  fill: { type: "SOLID", color: "#09090B" },
  autoLayout: { mode: "VERTICAL", spacing: 0, padding: 0 }
})

const content = figma_create_frame({
  name: "Content",
  parentId: mainFrame.nodeId,
  autoLayout: {
    mode: "VERTICAL",
    spacing: 16,
    padding: 24,
    primaryAxisAlign: "CENTER",
    counterAxisAlign: "CENTER"
  }
})
figma_set_layout_sizing({ nodeId: content.nodeId, horizontal: "FILL", vertical: "FILL" })

// Logo placeholder
const logo = figma_create_frame({
  name: "Logo",
  parentId: content.nodeId,
  width: 64, height: 64,
  fill: { type: "SOLID", color: "#27272A" },
  cornerRadius: 16
})

// Title
figma_create_text({
  content: "Hosgeldiniz",
  parentId: content.nodeId,
  style: { fontSize: 28, fontWeight: 700 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

// Subtitle
figma_create_text({
  content: "Devam etmek icin giris yapin",
  parentId: content.nodeId,
  style: { fontSize: 14, fontWeight: 400 },
  fill: { type: "SOLID", color: "#A1A1AA" }
})

// Input Group Frame
const inputGroup = figma_create_frame({
  name: "InputGroup",
  parentId: content.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 12 }
})
figma_set_layout_sizing({ nodeId: inputGroup.nodeId, horizontal: "FILL" })

// Email Input
const emailInput = figma_create_input({
  placeholder: "E-posta adresiniz",
  parentId: inputGroup.nodeId
})
figma_set_layout_sizing({ nodeId: emailInput.nodeId, horizontal: "FILL" })

// Password Input
const passwordInput = figma_create_input({
  placeholder: "Sifreniz",
  parentId: inputGroup.nodeId
})
figma_set_layout_sizing({ nodeId: passwordInput.nodeId, horizontal: "FILL" })

// Login Button
const loginBtn = figma_create_button({
  text: "Giris Yap",
  variant: "primary",
  parentId: content.nodeId
})
figma_set_layout_sizing({ nodeId: loginBtn.nodeId, horizontal: "FILL" })
```

---

## SIGNUP EKRANI

### Yapi
```
[Main Frame]
├── [Header - back button + progress indicator]
├── [Content]
│   ├── [Title - "Hesap Olustur"]
│   ├── [Full Name Input]
│   ├── [Email Input]
│   ├── [Password Input]
│   ├── [Confirm Password Input]
│   ├── [Terms Checkbox]
│   └── [Signup Button]
└── [Footer - "Zaten hesabiniz var mi?"]
```

### Ozellikler
- Progress indicator (step 1/3 gibi)
- Password strength indicator
- Terms & conditions checkbox
- Back navigation

---

## PROFILE EKRANI

### Yapi
```
[Main Frame]
├── [Header - "Profil" + Settings icon]
├── [Content]
│   ├── [Avatar Section]
│   │   ├── [Avatar - 80x80, circular]
│   │   ├── [Name - 20px bold]
│   │   └── [Email - 14px muted]
│   ├── [Stats Row - 3 columns]
│   │   ├── [Posts count]
│   │   ├── [Followers count]
│   │   └── [Following count]
│   ├── [Section: Account]
│   │   ├── [Edit Profile - list item]
│   │   ├── [Change Password - list item]
│   │   └── [Notifications - list item]
│   └── [Section: More]
│       ├── [Help & Support]
│       ├── [Privacy Policy]
│       └── [Logout - destructive]
└── [Tab Bar]
```

### Avatar Pattern
```typescript
const avatarSection = figma_create_frame({
  name: "AvatarSection",
  parentId: content.nodeId,
  autoLayout: {
    mode: "VERTICAL",
    spacing: 8,
    primaryAxisAlign: "CENTER",
    counterAxisAlign: "CENTER"
  }
})
figma_set_layout_sizing({ nodeId: avatarSection.nodeId, horizontal: "FILL" })

// Avatar circle
const avatar = figma_create_frame({
  name: "Avatar",
  parentId: avatarSection.nodeId,
  width: 80, height: 80,
  fill: { type: "SOLID", color: "#27272A" },
  cornerRadius: 40  // tam yuvarlak
})

// Name
figma_create_text({
  content: "John Doe",
  parentId: avatarSection.nodeId,
  style: { fontSize: 20, fontWeight: 600 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

// Email
figma_create_text({
  content: "john@example.com",
  parentId: avatarSection.nodeId,
  style: { fontSize: 14, fontWeight: 400 },
  fill: { type: "SOLID", color: "#A1A1AA" }
})
```

---

## SETTINGS EKRANI

### Yapi
```
[Main Frame]
├── [Header - back + "Ayarlar"]
├── [Content - scrollable]
│   ├── [Section: Gorunum]
│   │   ├── [Dark Mode Toggle]
│   │   └── [Language Selector]
│   ├── [Section: Bildirimler]
│   │   ├── [Push Notifications Toggle]
│   │   ├── [Email Notifications Toggle]
│   │   └── [Sound Toggle]
│   ├── [Section: Guvenlik]
│   │   ├── [Change Password]
│   │   ├── [Two-Factor Auth]
│   │   └── [Biometric Login]
│   └── [Section: Hakkinda]
│       ├── [Version Info]
│       ├── [Terms of Service]
│       └── [Privacy Policy]
```

### Toggle List Item Pattern
```typescript
const toggleItem = figma_create_frame({
  name: "ToggleItem",
  parentId: section.nodeId,
  autoLayout: {
    mode: "HORIZONTAL",
    padding: 16,
    primaryAxisAlign: "SPACE_BETWEEN",
    counterAxisAlign: "CENTER"
  },
  fill: { type: "SOLID", color: "#18181B" },
  cornerRadius: 12
})
figma_set_layout_sizing({ nodeId: toggleItem.nodeId, horizontal: "FILL" })

// Label
figma_create_text({
  content: "Dark Mode",
  parentId: toggleItem.nodeId,
  style: { fontSize: 16, fontWeight: 500 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

// Toggle
figma_create_shadcn_component({
  component: "switch",
  checked: true,
  theme: "dark",
  parentId: toggleItem.nodeId
})
```

---

## ONBOARDING EKRANI

### Yapi (Carousel Style)
```
[Main Frame]
├── [Content - centered]
│   ├── [Illustration - 200x200]
│   ├── [Title - 24px bold]
│   ├── [Description - 16px muted, centered]
│   └── [Page Indicators - dots]
├── [Footer]
│   ├── [Skip Button - ghost]
│   └── [Next Button - primary]
```

### Page Indicator Pattern
```typescript
const indicators = figma_create_frame({
  name: "PageIndicators",
  parentId: content.nodeId,
  autoLayout: { mode: "HORIZONTAL", spacing: 8 }
})

// Active dot
figma_create_frame({
  name: "Dot-Active",
  parentId: indicators.nodeId,
  width: 24, height: 8,
  fill: { type: "SOLID", color: "#FAFAFA" },
  cornerRadius: 4
})

// Inactive dots
for (let i = 0; i < 2; i++) {
  figma_create_frame({
    name: `Dot-${i}`,
    parentId: indicators.nodeId,
    width: 8, height: 8,
    fill: { type: "SOLID", color: "#27272A" },
    cornerRadius: 4
  })
}
```

---

## EKRAN TIPI SECIM KURALLARI

| Prompt Icerigi | Ekran Tipi |
|----------------|------------|
| "login", "giris", "oturum ac" | Login |
| "signup", "kayit", "hesap olustur" | Signup |
| "profil", "profile", "hesabim" | Profile |
| "ayarlar", "settings", "tercihler" | Settings |
| "onboarding", "karsilama", "baslangic" | Onboarding |
| "dashboard", "ana sayfa", "home" | Dashboard |
```

**Step 2: Verify file created**

```bash
cat claude-plugin/skills/screen-patterns.md | head -50
```

**Step 3: Commit**

```bash
git add claude-plugin/skills/screen-patterns.md
git commit -m "feat(skills): add screen-patterns skill with Login, Signup, Profile, Settings, Onboarding"
```

---

## Task 3: Form Patterns Skill

**Files:**
- Create: `claude-plugin/skills/form-patterns.md`

**Step 1: Form Patterns skill dosyasını oluştur**

Create `claude-plugin/skills/form-patterns.md`:

```markdown
---
name: form-patterns
description: |
  Form tasarim pattern'leri: Input gruplari, validation states,
  button hierarchy, form layout kurallari.
---

# Form Patterns

## INPUT GROUP PATTERN

Her input'un standart yapisi:
```
[InputGroup Frame - vertical, spacing: 6]
├── [Label - 14px, medium, text-primary]
├── [Input Field]
└── [Helper/Error Text - 12px, muted or error]
```

### Kod Ornegi
```typescript
const createInputGroup = (label, placeholder, error = null) => {
  const group = figma_create_frame({
    name: `InputGroup-${label}`,
    parentId: form.nodeId,
    autoLayout: { mode: "VERTICAL", spacing: 6 }
  })
  figma_set_layout_sizing({ nodeId: group.nodeId, horizontal: "FILL" })

  // Label
  figma_create_text({
    content: label,
    parentId: group.nodeId,
    style: { fontSize: 14, fontWeight: 500 },
    fill: { type: "SOLID", color: "#FAFAFA" }
  })

  // Input
  const input = figma_create_input({
    placeholder: placeholder,
    parentId: group.nodeId
  })
  figma_set_layout_sizing({ nodeId: input.nodeId, horizontal: "FILL" })

  // Error text (if any)
  if (error) {
    figma_create_text({
      content: error,
      parentId: group.nodeId,
      style: { fontSize: 12, fontWeight: 400 },
      fill: { type: "SOLID", color: "#EF4444" }  // error red
    })
  }

  return group
}
```

---

## VALIDATION STATES

### Visual Indicators
| State | Border Color | Icon | Helper Text Color |
|-------|--------------|------|-------------------|
| Default | #27272A | - | #71717A |
| Focus | #3B82F6 (blue) | - | #71717A |
| Success | #22C55E (green) | ✓ | #22C55E |
| Error | #EF4444 (red) | ✗ | #EF4444 |
| Disabled | #27272A | - | #52525B |

### Error Input Pattern
```typescript
// Input with error state
const errorInput = figma_create_frame({
  name: "Input-Error",
  parentId: group.nodeId,
  autoLayout: { mode: "HORIZONTAL", spacing: 12, padding: 12 },
  fill: { type: "SOLID", color: "#18181B" },
  stroke: { color: "#EF4444", weight: 1 },  // red border
  cornerRadius: 8
})
figma_set_layout_sizing({ nodeId: errorInput.nodeId, horizontal: "FILL" })

// Input text
figma_create_text({
  content: "invalid@email",
  parentId: errorInput.nodeId,
  style: { fontSize: 16 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

// Error icon
figma_create_icon({
  name: "x-circle",
  size: 20,
  color: "#EF4444",
  parentId: errorInput.nodeId
})
```

---

## PASSWORD INPUT PATTERN

```typescript
const passwordGroup = figma_create_frame({
  name: "PasswordInput",
  parentId: form.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 6 }
})
figma_set_layout_sizing({ nodeId: passwordGroup.nodeId, horizontal: "FILL" })

// Label row (label + forgot link)
const labelRow = figma_create_frame({
  name: "LabelRow",
  parentId: passwordGroup.nodeId,
  autoLayout: { mode: "HORIZONTAL", primaryAxisAlign: "SPACE_BETWEEN" }
})
figma_set_layout_sizing({ nodeId: labelRow.nodeId, horizontal: "FILL" })

figma_create_text({
  content: "Sifre",
  parentId: labelRow.nodeId,
  style: { fontSize: 14, fontWeight: 500 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

figma_create_text({
  content: "Sifremi unuttum",
  parentId: labelRow.nodeId,
  style: { fontSize: 12, fontWeight: 500 },
  fill: { type: "SOLID", color: "#3B82F6" }  // link blue
})

// Password input with eye icon
const inputRow = figma_create_frame({
  name: "InputWithIcon",
  parentId: passwordGroup.nodeId,
  autoLayout: {
    mode: "HORIZONTAL",
    spacing: 12,
    padding: 12,
    counterAxisAlign: "CENTER"
  },
  fill: { type: "SOLID", color: "#18181B" },
  cornerRadius: 8
})
figma_set_layout_sizing({ nodeId: inputRow.nodeId, horizontal: "FILL" })

figma_create_text({
  content: "••••••••",
  parentId: inputRow.nodeId,
  style: { fontSize: 16 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})
figma_set_layout_sizing({ nodeId: "text-node", horizontal: "FILL" })

figma_create_icon({
  name: "eye-off",
  size: 20,
  color: "#71717A",
  parentId: inputRow.nodeId
})
```

---

## BUTTON HIERARCHY

| Tip | Kullanim | Variant |
|-----|----------|---------|
| Primary | Ana aksiyon (1 tane) | `variant: "primary"` |
| Secondary | Ikincil aksiyonlar | `variant: "secondary"` |
| Ghost | Tertiary, cancel | `variant: "ghost"` |
| Destructive | Silme, iptal | `variant: "destructive"` |
| Link | Navigasyon | `variant: "link"` |

### Form Actions Pattern
```typescript
// Primary + Secondary buttons
const actions = figma_create_frame({
  name: "FormActions",
  parentId: form.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 12 }
})
figma_set_layout_sizing({ nodeId: actions.nodeId, horizontal: "FILL" })

// Primary action
const primaryBtn = figma_create_button({
  text: "Kaydet",
  variant: "primary",
  parentId: actions.nodeId
})
figma_set_layout_sizing({ nodeId: primaryBtn.nodeId, horizontal: "FILL" })

// Secondary action
const secondaryBtn = figma_create_button({
  text: "Iptal",
  variant: "ghost",
  parentId: actions.nodeId
})
figma_set_layout_sizing({ nodeId: secondaryBtn.nodeId, horizontal: "FILL" })
```

---

## CHECKBOX GROUP PATTERN

```typescript
const checkboxGroup = figma_create_frame({
  name: "CheckboxGroup",
  parentId: form.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 12 }
})
figma_set_layout_sizing({ nodeId: checkboxGroup.nodeId, horizontal: "FILL" })

// Group label
figma_create_text({
  content: "Bildirim Tercihleri",
  parentId: checkboxGroup.nodeId,
  style: { fontSize: 14, fontWeight: 600 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

// Checkbox items
const options = ["E-posta bildirimleri", "SMS bildirimleri", "Push bildirimleri"]
options.forEach(option => {
  figma_create_shadcn_component({
    component: "checkbox",
    label: option,
    theme: "dark",
    parentId: checkboxGroup.nodeId
  })
})
```

---

## FORM LAYOUT KURALLARI

1. **Spacing**
   - Label-to-input: 6px
   - Input-to-input: 16px
   - Section-to-section: 24px
   - Form-to-buttons: 32px

2. **Alignment**
   - Labels: left-aligned
   - Inputs: full-width
   - Buttons: full-width veya right-aligned (inline form)

3. **Visual Weight**
   - Required fields: label + "*"
   - Optional fields: label + "(opsiyonel)"

4. **Mobile Considerations**
   - Minimum touch target: 44px
   - Input height: 48px
   - Button height: 48px
```

**Step 2: Commit**

```bash
git add claude-plugin/skills/form-patterns.md
git commit -m "feat(skills): add form-patterns skill with input groups, validation, password, buttons"
```

---

## Task 4: Navigation Patterns Skill

**Files:**
- Create: `claude-plugin/skills/navigation-patterns.md`

**Step 1: Navigation Patterns skill dosyasını oluştur**

Create `claude-plugin/skills/navigation-patterns.md`:

```markdown
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
```

**Step 2: Commit**

```bash
git add claude-plugin/skills/navigation-patterns.md
git commit -m "feat(skills): add navigation-patterns skill with nav bar, tab bar, bottom sheet, modal"
```

---

## Task 5: List Patterns Skill

**Files:**
- Create: `claude-plugin/skills/list-patterns.md`

**Step 1: List Patterns skill dosyasını oluştur**

Create `claude-plugin/skills/list-patterns.md`:

```markdown
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
  fill: { type: "SOLID", color: "#18181B" }
})
figma_set_layout_sizing({ nodeId: listItem.nodeId, horizontal: "FILL" })

figma_create_text({
  content: "List Item Title",
  parentId: listItem.nodeId,
  style: { fontSize: 16, fontWeight: 500 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})
figma_set_layout_sizing({ nodeId: "text", horizontal: "FILL" })

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
  fill: { type: "SOLID", color: "#18181B" }
})
figma_set_layout_sizing({ nodeId: listItemIcon.nodeId, horizontal: "FILL" })

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
figma_create_text({
  content: "Ayarlar",
  parentId: listItemIcon.nodeId,
  style: { fontSize: 16, fontWeight: 500 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})
figma_set_layout_sizing({ nodeId: "text", horizontal: "FILL" })

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
  fill: { type: "SOLID", color: "#18181B" }
})
figma_set_layout_sizing({ nodeId: listItemAvatar.nodeId, horizontal: "FILL" })

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
  autoLayout: { mode: "VERTICAL", spacing: 2 }
})
figma_set_layout_sizing({ nodeId: textGroup.nodeId, horizontal: "FILL" })

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
  fill: { type: "SOLID", color: "#18181B" }
})
figma_set_layout_sizing({ nodeId: listItemValue.nodeId, horizontal: "FILL" })

figma_create_text({
  content: "Dil",
  parentId: listItemValue.nodeId,
  style: { fontSize: 16, fontWeight: 500 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})
figma_set_layout_sizing({ nodeId: "text", horizontal: "FILL" })

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
  autoLayout: { mode: "VERTICAL", spacing: 0 }
})
figma_set_layout_sizing({ nodeId: section.nodeId, horizontal: "FILL" })

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
  cornerRadius: 12
})
figma_set_layout_sizing({ nodeId: sectionCard.nodeId, horizontal: "FILL" })

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
  fill: { type: "SOLID", color: "#27272A" }
})
figma_set_layout_sizing({ nodeId: divider.nodeId, horizontal: "FILL" })
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
```

**Step 2: Commit**

```bash
git add claude-plugin/skills/list-patterns.md
git commit -m "feat(skills): add list-patterns skill with item variations and grouped lists"
```

---

## Task 6: States & Feedback Skill

**Files:**
- Create: `claude-plugin/skills/states-feedback.md`

**Step 1: States & Feedback skill dosyasını oluştur**

Create `claude-plugin/skills/states-feedback.md`:

```markdown
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
  cornerRadius: 8
})
figma_set_layout_sizing({ nodeId: loadingBtn.nodeId, horizontal: "FILL" })

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
  }
})
figma_set_layout_sizing({ nodeId: emptyState.nodeId, horizontal: "FILL", vertical: "FILL" })

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
  }
})
figma_set_layout_sizing({ nodeId: errorState.nodeId, horizontal: "FILL", vertical: "FILL" })

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
  cornerRadius: 12
})
figma_set_layout_sizing({ nodeId: skeletonCard.nodeId, horizontal: "FILL" })

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
  cornerRadius: 8
})
figma_set_layout_sizing({ nodeId: "skeleton-block", horizontal: "FILL" })
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

figma_create_text({
  content: "Basariyla kaydedildi",
  parentId: toast.nodeId,
  style: { fontSize: 14, fontWeight: 500 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})
figma_set_layout_sizing({ nodeId: "text", horizontal: "FILL" })

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
```

**Step 2: Commit**

```bash
git add claude-plugin/skills/states-feedback.md
git commit -m "feat(skills): add states-feedback skill with loading, empty, error, skeleton, toast"
```

---

## Task 7: Design Agent Güncellemesi

**Files:**
- Modify: `claude-plugin/agents/design-agent.md`

**Step 1: Design Agent'a skill referansları ekle**

Add to `claude-plugin/agents/design-agent.md` after the KRITIK KURAL section:

```markdown
## SKILL REFERANSLARI

Tasarim yaparken asagidaki skill'leri kullan:

| Ekran Tipi | Skill |
|------------|-------|
| Login, Signup, Profile, Settings | @screen-patterns |
| Form iceren ekranlar | @form-patterns |
| Tab bar, nav bar, modal | @navigation-patterns |
| Liste iceren ekranlar | @list-patterns |
| Loading, error, empty states | @states-feedback |

### Nasil Kullanilir
1. Kullanicinin istegini analiz et
2. Uygun skill'i sec
3. Skill'deki pattern'i AYNEN uygula
4. Theme ve sizing kurallarini unut MA!
```

**Step 2: Ekran tipi tespit bölümü ekle**

Add after skill references:

```markdown
## EKRAN TIPI TESPITI

Kullanicinin promptundan ekran tipini tespit et:

| Anahtar Kelimeler | Ekran Tipi | Primary Skill |
|-------------------|------------|---------------|
| "login", "giris", "oturum" | Login | @screen-patterns |
| "signup", "kayit", "hesap olustur" | Signup | @screen-patterns |
| "profil", "profile", "hesabim" | Profile | @screen-patterns + @list-patterns |
| "ayarlar", "settings" | Settings | @screen-patterns + @list-patterns |
| "dashboard", "panel", "metrik" | Dashboard | (mevcut pattern'ler) |
| "liste", "list", "feed" | List | @list-patterns |
| "form", "doldur", "kaydet" | Form | @form-patterns |
| "onboarding", "karsilama" | Onboarding | @screen-patterns |
```

**Step 3: Commit**

```bash
git add claude-plugin/agents/design-agent.md
git commit -m "feat(design-agent): add skill references and screen type detection"
```

---

## Task 8: Final Test & Verification

**Step 1: Tüm skill dosyalarının varlığını doğrula**

```bash
ls -la claude-plugin/skills/
```

Expected output:
```
screen-patterns.md
form-patterns.md
navigation-patterns.md
list-patterns.md
states-feedback.md
```

**Step 2: plugin.json'un doğruluğunu kontrol et**

```bash
cat claude-plugin/plugin.json | jq .
```

**Step 3: Design Agent'ın skill referanslarını kontrol et**

```bash
grep -n "@screen-patterns\|@form-patterns\|@navigation-patterns\|@list-patterns\|@states-feedback" claude-plugin/agents/design-agent.md
```

**Step 4: Git log ile tüm commit'leri doğrula**

```bash
git log --oneline -10
```

---

## Özet

| Task | Dosya | İçerik |
|------|-------|--------|
| 1 | plugin.json | Skills array eklendi |
| 2 | screen-patterns.md | Login, Signup, Profile, Settings, Onboarding |
| 3 | form-patterns.md | Input groups, validation, password, buttons |
| 4 | navigation-patterns.md | Nav bar, Tab bar, Bottom sheet, Modal |
| 5 | list-patterns.md | List item variations, grouped lists |
| 6 | states-feedback.md | Loading, empty, error, skeleton, toast |
| 7 | design-agent.md | Skill references, screen type detection |
| 8 | - | Verification |

**Toplam:** 5 yeni skill dosyası, 2 güncellenen dosya, 8 commit
