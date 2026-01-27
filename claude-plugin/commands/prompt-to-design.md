---
name: prompt-to-design
description: Start a new Figma design workflow - just describe what you want
arguments:
  - name: prompt
    description: What do you want to design?
    required: true
---

# Design Workflow Starter

The user has come with a design request. Start the Design Agent.

## User's Request

$ARGUMENTS

## Task

Start the design workflow by calling the Design Agent:

```
Task(
  subagent_type="design-agent",
  prompt="User wants: $ARGUMENTS"
)
```

Design Agent will:
1. Create a session
2. Select device
3. Plan layout
4. Determine components
5. Call Execution Agent

Execution Agent will:
1. Check Figma connection
2. Create frames
3. Place components
4. Save to session
