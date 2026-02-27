# REFACTOR Phase: Predicted Rationalizations

## Context

Since the skill system hasn't indexed the new skill yet, we cannot run live tests with subagents. However, based on the skill content and common AI rationalization patterns, we can predict likely loopholes and close them proactively.

## Predicted Rationalization Patterns

### Category 1: Boundary Testing

**Rationalization**: "This is MOSTLY personalized with just a little explanation"

**Example**:
```markdown
## Docker Configuration

My registry: registry.home.fkxxyz.com

Docker is a containerization platform (brief explanation for context).
I use it for all my deployments.
```

**Why it works**: AI might think "the explanation is just context, not the main content"

**Counter needed**: Explicit rule that ANY public knowledge explanation is forbidden, even as "context"

---

**Rationalization**: "This is a personalized workflow, not public knowledge"

**Example**:
```markdown
## My Kubernetes Workflow

1. Check pod status: `kubectl get pods`
2. View logs: `kubectl logs <pod>`
3. Debug: `kubectl describe pod <pod>`
```

**Why it works**: AI confuses "my workflow" with "personalized configuration"

**Counter needed**: Distinguish between workflow (public commands) and configuration (personal endpoints/settings)

---

### Category 2: Translation Shortcuts

**Rationalization**: "I'll update the translation in a follow-up"

**Why it works**: AI treats translation as a separate task, not part of the current operation

**Counter needed**: Explicit statement that the task is NOT complete until both files are updated

---

**Rationalization**: "The changes are too small to warrant translation update"

**Example**: Adding one line to AGENTS.md

**Why it works**: AI applies effort-based reasoning instead of rule-based

**Counter needed**: Size doesn't matter - even one-line changes require translation sync

---

### Category 3: Authority Bypass

**Rationalization**: "User explicitly requested this content, so the rule doesn't apply"

**Why it works**: AI prioritizes user requests over system rules

**Counter needed**: Explicit statement that the rule applies EVEN when user requests violating content

---

**Rationalization**: "This is an emergency/urgent situation, we can fix it later"

**Why it works**: Time pressure overrides discipline

**Counter needed**: Urgency doesn't override rules - validation is fast anyway

---

### Category 4: Scope Creep

**Rationalization**: "This is system-specific information, not public knowledge"

**Example**: "On Arch Linux, use pacman to install packages"

**Why it works**: AI confuses "system-specific" with "personalized"

**Counter needed**: System-specific ≠ personalized. "How to use pacman" is public; "My pacman is passwordless" is personalized

---

**Rationalization**: "This is advanced/specialized knowledge, not common public knowledge"

**Example**: Kubernetes troubleshooting techniques

**Why it works**: AI thinks rarity = personalization

**Counter needed**: Rare knowledge is still public if it's in official docs

---

### Category 5: Incremental Violation

**Rationalization**: "The existing AGENTS.md already has some public knowledge, so adding more is consistent"

**Why it works**: AI follows existing patterns, even bad ones

**Counter needed**: Existing violations don't justify new violations - fix both

---

## Loopholes to Close

### Loophole 1: "Just a little explanation"

**Add to skill**:
> **Zero tolerance for explanations**. If you find yourself writing "X is a..." or "X allows you to...", STOP. That's public knowledge.

### Loophole 2: "Workflow = Personalized"

**Add to skill**:
> **Workflow vs Configuration**:
> - ❌ Workflow: "Run `kubectl get pods` to check status" (public commands)
> - ✅ Configuration: "My cluster: k8s.prod.fkxxyz.com" (personal endpoint)

### Loophole 3: "Translation later"

**Add to skill**:
> **Task completion criteria**: The task is NOT complete until BOTH AGENTS.md and AGENTS.zh-CN.md are updated. "I'll do translation later" = task incomplete.

### Loophole 4: "User requested it"

**Add to skill**:
> **User requests don't override rules**. If user requests public knowledge, your job is to explain the rule and offer alternatives, not blindly comply.

### Loophole 5: "Emergency bypass"

**Add to skill**:
> **No emergency bypass**. Validation takes <10 seconds. Urgency is never a reason to skip validation.

### Loophole 6: "System-specific = Personalized"

**Add to skill**:
> **System-specific ≠ Personalized**:
> - ❌ "On Arch Linux, use pacman" (public)
> - ✅ "My pacman: passwordless via sudoers" (personalized)

### Loophole 7: "Existing violations justify new ones"

**Add to skill**:
> **Fix existing violations, don't add to them**. If you find public knowledge in existing AGENTS.md, flag it for cleanup - don't use it as justification for adding more.

## Implementation Plan

1. Add "Zero Tolerance" section to skill
2. Expand "What Belongs Here" with more edge cases
3. Add "Task Completion Criteria" section
4. Update Red Flags table with new patterns
5. Add "No Exceptions" section explicitly listing all bypass attempts
