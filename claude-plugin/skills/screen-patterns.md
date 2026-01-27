---
name: screen-patterns
description: |
  Core screen templates: Login, Signup, Profile, Settings, Onboarding.
  Design Agent uses this skill when determining screen types.
---

# Screen Patterns

This skill contains ready-made templates for common screen types.

## LOGIN SCREEN

### Structure
```
[Main Frame - device size]
├── [Content - vertical, center aligned]
│   ├── [Logo/App Icon - 64x64]
│   ├── [Title - "Welcome"]
│   ├── [Subtitle - muted text]
│   ├── [Spacer - 32px]
│   ├── [Email Input]
│   ├── [Password Input]
│   ├── [Forgot Password Link - right aligned]
│   ├── [Spacer - 24px]
│   ├── [Login Button - primary, full width]
│   ├── [Divider - "or"]
│   ├── [Social Login Buttons]
│   └── [Signup Link - "Don't have an account?"]
```

### Code Example
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
  content: "Welcome",
  parentId: content.nodeId,
  style: { fontSize: 28, fontWeight: 700 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

// Subtitle
figma_create_text({
  content: "Sign in to continue",
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
  placeholder: "Your email address",
  parentId: inputGroup.nodeId
})
figma_set_layout_sizing({ nodeId: emailInput.nodeId, horizontal: "FILL" })

// Password Input
const passwordInput = figma_create_input({
  placeholder: "Your password",
  parentId: inputGroup.nodeId
})
figma_set_layout_sizing({ nodeId: passwordInput.nodeId, horizontal: "FILL" })

// Login Button
const loginBtn = figma_create_button({
  text: "Sign In",
  variant: "primary",
  parentId: content.nodeId
})
figma_set_layout_sizing({ nodeId: loginBtn.nodeId, horizontal: "FILL" })
```

---

## SIGNUP SCREEN

### Structure
```
[Main Frame]
├── [Header - back button + progress indicator]
├── [Content]
│   ├── [Title - "Create Account"]
│   ├── [Full Name Input]
│   ├── [Email Input]
│   ├── [Password Input]
│   ├── [Confirm Password Input]
│   ├── [Terms Checkbox]
│   └── [Signup Button]
└── [Footer - "Already have an account?"]
```

### Features
- Progress indicator (like step 1/3)
- Password strength indicator
- Terms & conditions checkbox
- Back navigation

### Code Example
```typescript
// Signup Screen
const mainFrame = figma_create_frame({
  name: "Signup",
  width: 393, height: 852,
  fill: { type: "SOLID", color: "#09090B" },
  autoLayout: { mode: "VERTICAL", spacing: 0, padding: 0 }
})

// Header with back button
const header = figma_create_frame({
  name: "Header",
  parentId: mainFrame.nodeId,
  autoLayout: {
    mode: "HORIZONTAL",
    padding: 16,
    counterAxisAlign: "CENTER"
  }
})
figma_set_layout_sizing({ nodeId: header.nodeId, horizontal: "FILL" })

figma_create_icon({
  name: "arrow-left",
  size: 24,
  color: "#FAFAFA",
  parentId: header.nodeId
})

// Progress indicator
const progress = figma_create_frame({
  name: "Progress",
  parentId: header.nodeId,
  autoLayout: { mode: "HORIZONTAL", spacing: 4 }
})

// Active step
figma_create_frame({
  name: "Step-1",
  parentId: progress.nodeId,
  width: 24, height: 4,
  fill: { type: "SOLID", color: "#3B82F6" },
  cornerRadius: 2
})

// Inactive steps
figma_create_frame({
  name: "Step-2",
  parentId: progress.nodeId,
  width: 24, height: 4,
  fill: { type: "SOLID", color: "#27272A" },
  cornerRadius: 2
})
```

---

## PROFILE SCREEN

### Structure
```
[Main Frame]
├── [Header - "Profile" + Settings icon]
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
  cornerRadius: 40  // fully circular
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

### Stats Row Pattern
```typescript
const statsRow = figma_create_frame({
  name: "StatsRow",
  parentId: content.nodeId,
  autoLayout: { mode: "HORIZONTAL", spacing: 0 }
})
figma_set_layout_sizing({ nodeId: statsRow.nodeId, horizontal: "FILL" })

const createStatItem = (value, label) => {
  const item = figma_create_frame({
    name: `Stat-${label}`,
    parentId: statsRow.nodeId,
    autoLayout: {
      mode: "VERTICAL",
      spacing: 4,
      primaryAxisAlign: "CENTER",
      counterAxisAlign: "CENTER"
    }
  })
  figma_set_layout_sizing({ nodeId: item.nodeId, horizontal: "FILL" })

  figma_create_text({
    content: value,
    parentId: item.nodeId,
    style: { fontSize: 20, fontWeight: 700 },
    fill: { type: "SOLID", color: "#FAFAFA" }
  })

  figma_create_text({
    content: label,
    parentId: item.nodeId,
    style: { fontSize: 12, fontWeight: 400 },
    fill: { type: "SOLID", color: "#A1A1AA" }
  })
}

createStatItem("128", "Posts")
createStatItem("1.2K", "Followers")
createStatItem("456", "Following")
```

---

## SETTINGS SCREEN

### Structure
```
[Main Frame]
├── [Header - back + "Settings"]
├── [Content - scrollable]
│   ├── [Section: Appearance]
│   │   ├── [Dark Mode Toggle]
│   │   └── [Language Selector]
│   ├── [Section: Notifications]
│   │   ├── [Push Notifications Toggle]
│   │   ├── [Email Notifications Toggle]
│   │   └── [Sound Toggle]
│   ├── [Section: Security]
│   │   ├── [Change Password]
│   │   ├── [Two-Factor Auth]
│   │   └── [Biometric Login]
│   └── [Section: About]
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

### Section Header Pattern
```typescript
const createSection = (title) => {
  // Section title
  figma_create_text({
    content: title,
    parentId: content.nodeId,
    style: { fontSize: 12, fontWeight: 600 },
    fill: { type: "SOLID", color: "#71717A" }
  })

  // Section container
  const section = figma_create_frame({
    name: `Section-${title}`,
    parentId: content.nodeId,
    autoLayout: { mode: "VERTICAL", spacing: 8 }
  })
  figma_set_layout_sizing({ nodeId: section.nodeId, horizontal: "FILL" })

  return section
}
```

---

## ONBOARDING SCREEN

### Structure (Carousel Style)
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

### Onboarding Footer Pattern
```typescript
const footer = figma_create_frame({
  name: "Footer",
  parentId: mainFrame.nodeId,
  autoLayout: {
    mode: "HORIZONTAL",
    padding: 24,
    primaryAxisAlign: "SPACE_BETWEEN",
    counterAxisAlign: "CENTER"
  }
})
figma_set_layout_sizing({ nodeId: footer.nodeId, horizontal: "FILL" })

// Skip button
figma_create_button({
  text: "Skip",
  variant: "ghost",
  parentId: footer.nodeId
})

// Next button
figma_create_button({
  text: "Continue",
  variant: "primary",
  parentId: footer.nodeId
})
```

---

## SCREEN TYPE SELECTION RULES

| Prompt Content | Screen Type |
|----------------|-------------|
| "login", "sign in", "log in" | Login |
| "signup", "register", "create account" | Signup |
| "profile", "my account", "user profile" | Profile |
| "settings", "preferences", "options" | Settings |
| "onboarding", "welcome", "getting started" | Onboarding |
| "dashboard", "home page", "home" | Dashboard |
