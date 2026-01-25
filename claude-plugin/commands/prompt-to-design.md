---
name: prompt-to-design
description: Start a new Figma design workflow - just describe what you want
arguments:
  - name: prompt
    description: What do you want to design?
    required: true
---

# Design Workflow Starter

Kullanıcı bir tasarım isteği ile geldi. Design Agent'ı başlat.

## Kullanıcının İsteği

$ARGUMENTS

## Görev

Design Agent'ı çağırarak tasarım workflow'unu başlat:

```
Task(
  subagent_type="design-agent",
  prompt="Kullanıcı şunu istiyor: $ARGUMENTS"
)
```

Design Agent:
1. Session oluşturacak
2. Device seçecek
3. Layout planlayacak
4. Component'leri belirleyecek
5. Execution Agent'ı çağıracak

Execution Agent:
1. Figma bağlantısını kontrol edecek
2. Frame'leri oluşturacak
3. Component'leri yerleştirecek
4. Session'a kaydedecek
