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
    autoLayout: { mode: "VERTICAL", spacing: 6 },
    layoutSizingHorizontal: "FILL"
  })

  // Label
  figma_create_text({
    content: label,
    parentId: group.nodeId,
    style: { fontSize: 14, fontWeight: 500 },
    fill: { type: "SOLID", color: "#FAFAFA" }
  })

  // Input
  figma_create_input({
    placeholder: placeholder,
    parentId: group.nodeId
  })

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
  cornerRadius: 8,
  layoutSizingHorizontal: "FILL"
})

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

### Success Input Pattern
```typescript
const successInput = figma_create_frame({
  name: "Input-Success",
  parentId: group.nodeId,
  autoLayout: { mode: "HORIZONTAL", spacing: 12, padding: 12 },
  fill: { type: "SOLID", color: "#18181B" },
  stroke: { color: "#22C55E", weight: 1 },  // green border
  cornerRadius: 8,
  layoutSizingHorizontal: "FILL"
})

const successText = figma_create_text({
  content: "valid@email.com",
  parentId: successInput.nodeId,
  style: { fontSize: 16 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})
figma_set_layout_sizing({ nodeId: successText.nodeId, horizontal: "FILL" })

figma_create_icon({
  name: "check-circle",
  size: 20,
  color: "#22C55E",
  parentId: successInput.nodeId
})
```

---

## PASSWORD INPUT PATTERN

```typescript
const passwordGroup = figma_create_frame({
  name: "PasswordInput",
  parentId: form.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 6 },
  layoutSizingHorizontal: "FILL"
})

// Label row (label + forgot link)
const labelRow = figma_create_frame({
  name: "LabelRow",
  parentId: passwordGroup.nodeId,
  autoLayout: { mode: "HORIZONTAL", primaryAxisAlign: "SPACE_BETWEEN" },
  layoutSizingHorizontal: "FILL"
})

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
  cornerRadius: 8,
  layoutSizingHorizontal: "FILL"
})

const passwordText = figma_create_text({
  content: "••••••••",
  parentId: inputRow.nodeId,
  style: { fontSize: 16 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})
figma_set_layout_sizing({ nodeId: passwordText.nodeId, horizontal: "FILL" })

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
  autoLayout: { mode: "VERTICAL", spacing: 12 },
  layoutSizingHorizontal: "FILL"
})

// Primary action
figma_create_button({
  text: "Kaydet",
  variant: "primary",
  fullWidth: true,
  parentId: actions.nodeId
})

// Secondary action
figma_create_button({
  text: "Iptal",
  variant: "ghost",
  fullWidth: true,
  parentId: actions.nodeId
})
```

### Inline Actions Pattern
```typescript
// Horizontal button group
const inlineActions = figma_create_frame({
  name: "InlineActions",
  parentId: form.nodeId,
  autoLayout: {
    mode: "HORIZONTAL",
    spacing: 12,
    primaryAxisAlign: "MAX"  // right aligned
  },
  layoutSizingHorizontal: "FILL"
})

figma_create_button({
  text: "Iptal",
  variant: "ghost",
  parentId: inlineActions.nodeId
})

figma_create_button({
  text: "Kaydet",
  variant: "primary",
  parentId: inlineActions.nodeId
})
```

---

## CHECKBOX GROUP PATTERN

```typescript
const checkboxGroup = figma_create_frame({
  name: "CheckboxGroup",
  parentId: form.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 12 },
  layoutSizingHorizontal: "FILL"
})

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

## RADIO GROUP PATTERN

```typescript
const radioGroup = figma_create_frame({
  name: "RadioGroup",
  parentId: form.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 12 },
  layoutSizingHorizontal: "FILL"
})

figma_create_text({
  content: "Tema Secimi",
  parentId: radioGroup.nodeId,
  style: { fontSize: 14, fontWeight: 600 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

const radioOptions = ["Acik Tema", "Koyu Tema", "Sistem Varsayilani"]
radioOptions.forEach((option, index) => {
  figma_create_shadcn_component({
    component: "radio",
    label: option,
    checked: index === 1,  // Koyu Tema secili
    theme: "dark",
    parentId: radioGroup.nodeId
  })
})
```

---

## SELECT / DROPDOWN PATTERN

```typescript
const selectGroup = figma_create_frame({
  name: "SelectGroup",
  parentId: form.nodeId,
  autoLayout: { mode: "VERTICAL", spacing: 6 },
  layoutSizingHorizontal: "FILL"
})

figma_create_text({
  content: "Ulke",
  parentId: selectGroup.nodeId,
  style: { fontSize: 14, fontWeight: 500 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

// Select field
const select = figma_create_frame({
  name: "Select",
  parentId: selectGroup.nodeId,
  autoLayout: {
    mode: "HORIZONTAL",
    padding: 12,
    primaryAxisAlign: "SPACE_BETWEEN",
    counterAxisAlign: "CENTER"
  },
  fill: { type: "SOLID", color: "#18181B" },
  cornerRadius: 8,
  layoutSizingHorizontal: "FILL"
})

figma_create_text({
  content: "Turkiye",
  parentId: select.nodeId,
  style: { fontSize: 16 },
  fill: { type: "SOLID", color: "#FAFAFA" }
})

figma_create_icon({
  name: "chevron-down",
  size: 20,
  color: "#71717A",
  parentId: select.nodeId
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

5. **Field Order**
   - Sikca kullanilan alanlar uste
   - Opsiyonel alanlar alta
   - Iliskili alanlar grupla (ad-soyad, sehir-ulke)

---

## MULTI-STEP FORM PATTERN

```typescript
// Progress bar
const progressBar = figma_create_frame({
  name: "ProgressBar",
  parentId: content.nodeId,
  autoLayout: { mode: "HORIZONTAL", spacing: 8 },
  layoutSizingHorizontal: "FILL"
})

const steps = 3
const currentStep = 1

for (let i = 0; i < steps; i++) {
  figma_create_frame({
    name: `Step-${i + 1}`,
    parentId: progressBar.nodeId,
    height: 4,
    fill: { type: "SOLID", color: i < currentStep ? "#3B82F6" : "#27272A" },
    cornerRadius: 2,
    layoutSizingHorizontal: "FILL"
  })
}

// Step indicator text
figma_create_text({
  content: `Adim ${currentStep}/${steps}`,
  parentId: content.nodeId,
  style: { fontSize: 12, fontWeight: 500 },
  fill: { type: "SOLID", color: "#71717A" }
})
```
