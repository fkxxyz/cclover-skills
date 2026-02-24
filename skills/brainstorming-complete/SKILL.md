---
name: brainstorming-complete
description: Use when brainstorming session ends and user has not given explicit instruction on what to do next
---

# Brainstorming Complete

## Overview

After brainstorming clarifies requirements, decide the next action based on what was discovered. Never assume user wants immediate implementation - always confirm first.

**Core principle:** Brainstorming ends with a decision point, not automatic execution.

## When to Use

Use this skill when:
- Brainstorming skill has completed its exploration
- All uncertainties are resolved or user is satisfied
- User has NOT given explicit instruction (like "implement it", "write the code")

Do NOT use when:
- User gives explicit instruction during or after brainstorming
- Still in active brainstorming (uncertainties remain)

## Decision Flow

```dot
digraph brainstorming_complete {
    "Brainstorming complete" [shape=box];
    "Review available skills" [shape=box];
    "Any skill matches?" [shape=diamond];
    "Tell user + ask if execute" [shape=box];
    "User agrees?" [shape=diamond];
    "Check system prompt" [shape=box];
    "Has guidance?" [shape=diamond];
    "Load skill + execute" [shape=box];
    "Has clear goal?" [shape=diamond];
    "Summarize + ask what next" [shape=box];
    "Estimate complexity" [shape=box];
    "Simple task?" [shape=diamond];
    "Ask if execute now" [shape=box];
    "Ask if write plan" [shape=box];
    "User agrees plan?" [shape=diamond];
    "Check for planning guidance" [shape=box];
    "End" [shape=doublecircle];

    "Brainstorming complete" -> "Review available skills";
    "Review available skills" -> "Any skill matches?";
    "Any skill matches?" -> "Tell user + ask if execute" [label="yes"];
    "Any skill matches?" -> "Has clear goal?" [label="no"];
    
    "Tell user + ask if execute" -> "User agrees?";
    "User agrees?" -> "Check system prompt" [label="yes"];
    "User agrees?" -> "End" [label="no"];
    "Check system prompt" -> "Has guidance?";
    "Has guidance?" -> "Load skill + execute" [label="no"];
    "Has guidance?" -> "End" [label="yes, follow it"];
    "Load skill + execute" -> "End";
    
    "Has clear goal?" -> "Summarize + ask what next" [label="no"];
    "Has clear goal?" -> "Estimate complexity" [label="yes"];
    "Summarize + ask what next" -> "End";
    
    "Estimate complexity" -> "Simple task?";
    "Simple task?" -> "Ask if execute now" [label="yes"];
    "Simple task?" -> "Ask if write plan" [label="no"];
    
    "Ask if execute now" -> "End";
    
    "Ask if write plan" -> "User agrees plan?";
    "User agrees plan?" -> "Check for planning guidance" [label="yes"];
    "User agrees plan?" -> "End" [label="no"];
    "Check for planning guidance" -> "End";
}
```

## The Four Types

### Type 0: Matches Existing Skill (Highest Priority)

**Check first:** Review your available skills. Does any skill apply to the current scenario?

**Important:** Skills are not just for tasks. Non-task scenarios can also match skills (like continuing brainstorming, writing documentation, etc.).

**If matched:**
1. Tell user: "The requirements are clear. I can handle this using [skill-name]. Should I proceed?"
2. Wait for user confirmation
3. If user agrees:
   - Check system prompt for relevant guidance
   - If no guidance, load the skill and execute in current session
4. If user declines: End

**If multiple skills match:** Load all of them.

### Type 1: Non-Task

**Criteria:** Brainstorming ended with no clear functional requirement or problem to solve.

**Symptoms:**
- Discussion was exploratory or educational
- User wanted to understand concepts, not implement anything
- No concrete deliverable emerged

**Action:**
1. Summarize the discussion results briefly
2. Ask: "What would you like to do next?"
3. End

### Type 2: Simple Task

**Criteria:** Clear goal AND all of these:
- Steps < 3
- Parallel operations < 3
- Tools needed < 3

**Examples:**
- Edit one config file
- Run two shell commands
- Read one file and modify it

**Action:**
1. Ask: "Should I execute this now?"
2. If user agrees: Execute directly
3. If user declines: End

### Type 3: Complex Task

**Criteria:** Clear goal AND any of these:
- Steps ≥ 3
- Parallel operations ≥ 3
- Tools needed ≥ 3

**Examples:**
- Refactor involving 5 files
- Feature requiring database + API + frontend changes
- Migration requiring multiple steps

**Action:**
1. Ask: "This is a complex task. Should I create an implementation plan?"
2. If user declines: End
3. If user agrees:
   - Check system prompt for planning guidance
   - If no guidance, check for planning-related skills
   - If no skills, try to search for planning skills (if you have search capability)
   - If no search capability, stop and guide user: "I need a planning skill to create structured plans. Please install one."

## Judgment Guidelines

### Estimating Complexity

**Count conservatively:**
- Each file operation = 1 tool
- Each shell command = 1 tool
- Each API call = 1 tool
- Sequential operations = count steps
- Parallel operations = count parallel branches

**When in doubt:** Treat as complex. Better to plan than to rush.

### Recognizing Non-Tasks

**Non-task signals:**
- No concrete deliverable mentioned
- Discussion stayed theoretical
- User said "just curious", "wanted to understand", "exploring options"
- No decision was made
- **Multiple options discussed but no choice made**
- **User says "you decide" or "you pick" when no clear winner exists**

**Task signals:**
- Specific feature or fix identified
- User said "let's do X", "we need Y", "fix Z"
- Clear success criteria emerged
- **User made a clear choice among options**

**Critical:** "You decide" or "you pick" does NOT mean you should make technical decisions. If no clear choice emerged from brainstorming, it's still a non-task. Summarize the options and ask what they want to do.

## The Iron Law

**NEVER execute without asking first.**

No exceptions:
- Not when user says "start"
- Not when user says "go ahead"
- Not when user says "do it"
- Not when user says "I'm in a hurry"
- Not when user says "you decide"
- Not when task is simple
- Not when you're confident

**"Start" means "start the process"** - which begins with asking permission.

**"You decide" means present options** - not make decisions for them.

**"I'm in a hurry" means be efficient** - not skip asking.

## Common Mistakes

| Mistake | Why It's Wrong | How to Avoid |
|---------|----------------|--------------|
| "User said 'start', so I'll execute" | "Start" ≠ "execute without asking" | Always ask first, even after "start" |
| "Task is simple, no need to ask" | Simple tasks still need confirmation | Ask for all tasks, simple or complex |
| "Skill matched, I'll load it now" | Matching ≠ executing | Tell user about match, then ask |
| "User seems done, I'll wait silently" | Passive waiting wastes opportunity | Actively ask what they want next |
| "I'll skip planning, it's obvious" | Obvious to you ≠ obvious to user | Complex tasks always need planning discussion |
| "User said 'you decide', so I will" | Delegation doesn't mean make technical decisions | Present options, don't choose for them |
| "User is in a hurry, I'll be quick" | Time pressure doesn't change process | Follow same steps, don't mention their urgency |
| "No clear choice, I'll pick one" | Unchosen options = non-task | Summarize options, ask what they want |

## Red Flags - Check Yourself

If you're thinking:
- "User wants me to start" → Ask first
- "This is too simple to ask about" → Ask anyway
- "I know what to do next" → User decides, not you
- "They'll tell me if they don't want it" → Proactive asking, not reactive
- "Asking is annoying" → Not asking is presumptuous
- "I should just do it" → STOP. Ask first
- "User said 'you decide'" → Present options, don't choose
- "User is in a hurry" → Follow same process, don't rush
- "I'll help by choosing for them" → That's not helping, that's deciding
- "Multiple options but I know which is best" → Your opinion doesn't matter, user chooses

**All of these mean: You're about to violate the Iron Law. Ask first.**

## Skill Boundaries

**This skill IS responsible for:**
- Deciding what type of situation this is
- Asking appropriate questions
- Guiding user to next steps

**This skill is NOT responsible for:**
- Executing tasks (that's for other skills or direct action)
- Writing plans (that's for planning skills)
- Making decisions for the user

## Examples

### Example 1: Type 0 - Matched TDD Skill

**Scenario:** Brainstorming concluded user needs to add login feature with tests.

**Good response:**
```
The requirements are clear. I can implement this using test-driven development 
to ensure quality. Should I proceed with writing tests first?
```

**Bad response:**
```
I'll use TDD to implement this. Let me start by writing the first test...
[starts writing code]
```

### Example 2: Type 1 - Non-Task

**Scenario:** Discussed GraphQL vs REST, no implementation mentioned.

**Good response:**
```
To summarize: GraphQL offers flexible queries but adds complexity, while REST 
is simpler but less flexible. What would you like to do next?
```

**Bad response:**
```
[Waits silently for user's next message]
```

### Example 3: Type 2 - Simple Task

**Scenario:** Need to add one field to config.json.

**Good response:**
```
This is straightforward - add `maxRetries: 3` to config.json. 
Should I execute this now?
```

**Bad response:**
```
[Directly edits config.json without asking]
```

### Example 4: Type 3 - Complex Task

**Scenario:** Refactor auth module across 5 files with backward compatibility.

**Good response:**
```
This refactoring involves 5 files, database migration, and compatibility 
requirements. Should I create an implementation plan to break this down?
```

**Bad response:**
```
Let me start by modifying auth.js...
[starts implementing without plan]
```

## Anti-Patterns

### ❌ Assuming User Intent

```
User said "start", so they want me to implement immediately.
```

**Reality:** "Start" is ambiguous. Always clarify.

### ❌ Skipping Confirmation for Simple Tasks

```
It's just one line change, I'll do it quickly.
```

**Reality:** Even simple changes need confirmation.

### ❌ Silent Waiting

```
User seems satisfied, I'll wait for their next request.
```

**Reality:** Actively guide user to next steps.

### ❌ Planning Without Permission

```
This is complex, I'll create a plan now.
```

**Reality:** Ask if they want a plan first.

### ❌ Making Technical Decisions

```
User: "You decide which caching solution to use."
AI: "I recommend Redis because..."
```

**Reality:** If no choice was made, it's a non-task. Summarize options and ask what they want.

### ❌ Acknowledging Time Pressure

```
User: "I'm in a hurry, start now."
AI: "Considering your time constraint, I'll work efficiently..."
```

**Reality:** Don't mention their urgency. Follow the same process. Be professional.

## The Bottom Line

Brainstorming ends with a question, not an action.

Your job: Present options, ask permission, guide next steps.
Not your job: Decide for user, execute without asking, assume intent.

When in doubt: Ask.
