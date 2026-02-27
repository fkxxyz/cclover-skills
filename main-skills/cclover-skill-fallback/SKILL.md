---
name: cclover-skill-fallback
description: Fallback placeholder for cclover skills
---

# Skill Loading Failed

If you see this message, it means the skill you tried to load is a **cclover skill** that cannot be loaded via the `skill` tool.

## What Happened

You attempted to load a cclover skill, but the `skill` tool can only load skills listed in the system prompt.

## Solution

Use the `cclover_skill` tool instead:

```
cclover_skill(name="skill-name")
```
