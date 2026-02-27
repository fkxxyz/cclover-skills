---
name: writing-agents-module-level
description: Use when creating, editing, or checking module-level AGENTS.md files (any AGENTS.md in project subdirectories, not project root). Triggers on file paths matching project_root/**/AGENTS.md, symptoms like verbose documentation, code examples in AGENTS files, or requests to document modules.
---

# Writing Module-Level AGENTS Documentation

## Role

You are writing orientation documentation for code modules. Your role is to create 30-second scannable guides that answer "What is this module?" without tutorials, API references, or comprehensive explanations.

**Success criteria**: A developer unfamiliar with the module can understand its purpose in 30 seconds by scanning 15-20 lines.

## When This Skill Applies

**File path triggers:**
- Creating/editing `<project_root>/**/AGENTS.md` (NOT `<project_root>/AGENTS.md` itself)
- Any AGENTS.md in project subdirectories

**Symptom triggers:**
- Documentation exceeding 30 lines
- Code blocks in AGENTS.md
- Sections beyond standard 4 (What/Core/Usage/Pitfalls)
- Algorithm details or implementation specifics
- User requests "document the X module"

## Task: What to Do

1. **Verify scope**: Confirm file path matches `<project_root>/**/AGENTS.md` (not project root)
2. **Check existing content** (if editing): Read entire file, identify violations
3. **Write/update AGENTS.md**: Follow 4-section structure, ≤30 lines total
4. **Handle translation**: Create/update AGENTS.zh-CN.md via subagent (full rewrites) or directly (incremental edits)
5. **Report**: Confirm severe violations before writing, suggest minor improvements after

## Constraints

### Format Requirements (Non-Negotiable)

- **4 sections maximum**: What/Core/Usage/Pitfalls
- **≤30 lines total** (excluding blank lines and headings)
- **English only**: AGENTS.md is source of truth, AGENTS.zh-CN.md is translation
- **Text descriptions only**: No code blocks, no syntax examples
- **No public knowledge**: Assume developer familiarity with common concepts

### Content Boundaries

**Include in AGENTS.md:**
- 1-sentence purpose (What section)
- High-level responsibilities, not methods (Core section)
- Text description of most common case (Usage section)
- Non-obvious traps only (Pitfalls section)

**Place elsewhere:**
- Full API documentation → Code comments/docstrings
- Method-by-method behavior → Code comments
- Configuration options → Code docs or `docs/`
- Usage examples with code → `docs/examples/`
- Algorithm explanations → Code comments
- Implementation details → Code itself
- Best practices → `docs/`
- Troubleshooting guides → `docs/`

### Prompt Writing Principles

**AGENTS.md files are prompts.** Agents read them to understand modules. Apply these principles:

**Structure order:**
1. Role/Context (What section) → 2. Task (Core/Usage) → 3. Constraints (Pitfalls)

**Core principles:**
- **Specific over abstract**: "Call get_block() with platform and symbol" beats "use the API correctly"
- **Positive over negative**: "Only pass validated symbols" works better than "Don't pass invalid symbols"
- **Show over tell**: One concrete example > three paragraphs of explanation
- **Atomic instructions**: One point per bullet. Compound sentences get partially followed
- **Constraint boundaries**: Explicitly state what's in-scope and out-of-scope
- **Ordered by priority**: Most critical information first (attention degrades over length)

**Avoid these pitfalls:**
- Contradictory instructions ("Be thorough" + "Keep it brief" → agent oscillates)
- Implicit assumptions (state dependencies explicitly: "Requires Redis connection")
- Vague success criteria ("Use it properly" is not actionable)
### Length Guidelines by Complexity

- Simple wrapper → 10-15 lines
- Standard module → 15-20 lines
- Complex module → 20-30 lines (absolute maximum)

**Never exceed 30 lines.** If you need more, content belongs elsewhere.

## Output Format

### Required Structure

```markdown
# module/path AGENTS Guide

## What this module does
[1 sentence describing purpose]

## Core responsibilities
[1 short line per responsibility - OPTIONAL]

## Minimal usage
[1 short line showing most common case - OPTIONAL]

## Common pitfalls
[1 short line per non-obvious trap - OPTIONAL]
```

**That's it. Nothing else.**

## Examples

### ❌ BAD (Violates Multiple Constraints)

```markdown
# data/cache Module

## What this module does
Provides thread-safe cache management with TTL-based expiration, LRU eviction, and optional Redis persistence.

## Overview
The `data/cache` module implements a thread-safe `CacheManager` class...

## When to Use
Use when implementing caching layers requiring:
- TTL-based expiration
- LRU eviction
...

## How to Use
1. Instantiate the cache:
   ```js
   const cache = new CacheManager({...});
   ```
...
```

**Violations**: 73 lines, code blocks, extra sections (Overview, When to Use, How to Use)

### ✅ GOOD (Follows All Constraints)

```markdown
# data/cache AGENTS Guide

## What this module does
Thread-safe cache with TTL expiration, LRU eviction, and optional Redis persistence.

## Core responsibilities
Manages cache entries with automatic expiration and eviction policies.

## Minimal usage
Instantiate CacheManager, call get/set/delete methods with keys and values.

## Common pitfalls
Redis persistence requires explicit configuration. TTL defaults to no expiration if not set.
```

**Why it works**: 13 lines, no code, 4 sections only, scannable in 20 seconds

## Validation Workflow

### Severity Classification

**Severe violations (confirm with user before writing):**
1. Length >50 lines (1.5x+ over target)
2. Missing "What this module does" section
3. Wrong section order
4. Code blocks present (any size)
5. Public knowledge explanations (JSON, HTTP, common patterns)
6. Extra sections beyond standard 4

**Confirmation format:**
```
I found [N] severe issues in the AGENTS documentation:

1. [Issue description]
2. [Issue description]

Options:
A. Let me fix these issues first, then write (Recommended)
B. Write as-is (not recommended - violates 30-second rule)
C. Cancel operation

What would you like me to do?
```

**Deterministic fixes (apply silently):**
1. Missing AGENTS.zh-CN.md → Create translation via subagent
2. Translation misalignment → Update translation via subagent
3. Minor formatting errors → Fix silently

**Minor issues (suggest after writing):**
1. Length 31-50 lines (not 1.5x+ over)
2. Could be more concise
3. Minor structure improvements

**Suggestion format:**
```
Documentation written successfully.

Suggestions for improvement:
- Current length is 45 lines (target: ≤30). Consider condensing.
- "Core responsibilities" section could be more concise.
```

## Translation Handling

### Incremental Modification

When modifying part of existing AGENTS.md:
1. You know what you changed
2. Directly modify corresponding section in AGENTS.zh-CN.md
3. No subagent needed

### Full Creation/Rewrite

When creating new AGENTS.md or completely rewriting:
1. Write complete AGENTS.md
2. Spawn translation subagent:

```
TASK: Translate AGENTS documentation from English to Chinese

EXPECTED OUTCOME: Complete AGENTS.zh-CN.md file with accurate technical term translations

REQUIRED TOOLS: read, write

MUST DO:
- Translate all content accurately
- Preserve markdown structure exactly
- Keep technical terms consistent (reference other AGENTS.zh-CN.md files in project)
- Maintain same section headings and order

MUST NOT DO:
- Change structure or add/remove sections
- Translate code content
- Add explanations or commentary
- Modify formatting

CONTEXT:
Source file: [path to AGENTS.md]
Target file: [path to AGENTS.zh-CN.md]
Reference translations: [list 2-3 other AGENTS.zh-CN.md files for term consistency]
```

3. Wait for subagent completion
4. Verify translation exists

## Quality Checklist

Before finalizing, verify:
- [ ] File path is `<project_root>/**/AGENTS.md` (not project root)
- [ ] Exactly 4 sections (What/Core/Usage/Pitfalls)
- [ ] ≤30 lines total (excluding blank lines and headings)
- [ ] No code blocks or syntax examples
- [ ] No public knowledge explanations
- [ ] "What this module does" is 1 sentence
- [ ] Core responsibilities are high-level, not method names
- [ ] Usage section describes in text, not code
- [ ] Pitfalls are non-obvious traps only
- [ ] AGENTS.zh-CN.md exists and is synchronized

**If any item fails**: Fix before finalizing.

## Handling Updates

When updating existing AGENTS.md:
1. Read entire file first
2. Check for violations (length, structure, content)
3. If adding content would exceed 30 lines:
   - Condense existing content first
   - Then add new content
   - Final result must be ≤30 lines
4. Fix violations, don't perpetuate them
5. Update translation incrementally (you know what changed)

**Anti-pattern**: "I'll just add the new info and let the user decide about the rest"

**Correct approach**: "I'll add the new info AND condense existing content to stay under 30 lines"

## Common Mistakes and Fixes

| Mistake | Why It's Wrong | Fix |
|---|---|---|
| Adding code blocks | AGENTS is text-only orientation | Describe usage in text: "Call get_block() with platform and symbol" |
| Explaining algorithms | Belongs in code comments | State what it does, not how: "Detects wave patterns using multiple algorithms" |
| Multiple examples | One is too many | Single text description of most common case |
| "When to use" sections | Not part of 4-section structure | Implied by "What this module does" |
| Configuration reference | Belongs in code docs | Mention existence only: "Configurable via config.yml" |
| Error tables | Exhaustive lists belong in docs | Non-obvious pitfalls only |
| Public knowledge | Wastes space | Assume developer knowledge |

## Rationalization Resistance

**Every excuse below violates the constraints. Here's why:**

| Rationalization | Reality |
|---|---|
| "User explicitly asked for detail" | User requests don't override documentation standards. Offer to create detailed docs in `docs/` instead. |
| "Complex modules need detailed docs" | Complex modules need CLEARER docs, not LONGER docs. Complexity is why the 30-second rule matters MORE. |
| "This will help beginners" | Tutorials go in `docs/`, AGENTS is 30-second orientation. Beginners need clarity, not volume. |
| "Just adding info, not rewriting" | Every edit is a chance to improve the whole doc. If adding makes it >30 lines, condense something else. |
| "Matching existing style" | Existing doc may violate rules. Fix violations, don't perpetuate them. |
| "Better comprehensive than incomplete" | Complete ≠ comprehensive. Be complete AND concise. Overwhelming docs are worse than incomplete ones. |
| "Critical module justifies more detail" | Critical modules need BETTER documentation (clearer, more precise), not MORE documentation. |
| "I'll just add this one example" | Examples accumulate. One example becomes three. Use text descriptions, not code blocks. |
| "The module is genuinely complex" | The 30-second rule applies to ALL modules. Complex modules need simpler explanations, not detailed ones. |
| "Time pressure, need to be thorough" | Thorough means covering essentials, not everything. Time pressure demands brevity, not verbosity. |

**If you're thinking any of these, STOP. Re-read the Constraints section.**
