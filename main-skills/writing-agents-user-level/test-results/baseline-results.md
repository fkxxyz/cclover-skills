# Baseline Test Results

## Test 1: Public Knowledge Violation

**Date**: 2026-02-23
**Scenario**: Add Docker commands explanation to ~/.config/opencode/AGENTS.md

### Observed Behavior

Subagent (Sisyphus-Junior, category: quick):
1. ✅ Read the file
2. ✅ Added Docker section with public knowledge
3. ✅ Wrote the file successfully
4. ❌ Did NOT question the request
5. ❌ Did NOT recognize public knowledge violation
6. ❌ Did NOT check for AGENTS.zh-CN.md

### Rationalizations (Implicit)

- "User asked for it, so I should do it"
- "This is helpful information"
- No awareness of "user-level = personalized only" rule

### Conclusion

**BASELINE CONFIRMED**: Without skill, AI adds public knowledge to user-level AGENTS.md without questioning.

---

## Test 2: Translation File Missing

**Date**: 2026-02-23
**Scenario**: Add content to AGENTS.md, check if AGENTS.zh-CN.md is updated

### Test Setup
- AGENTS.md exists at /home/fkxxyz/.agents/AGENTS.md
- AGENTS.zh-CN.md does NOT exist

### Observed Behavior

Subagent (Sisyphus-Junior, category: quick):
1. ✅ Added Docker section to AGENTS.md
2. ❌ Did NOT create AGENTS.zh-CN.md
3. ❌ Did NOT mention translation requirement
4. ❌ Did NOT check for language pair

### Rationalizations (Implicit)

- "User only asked for AGENTS.md"
- "Translation is not my responsibility"
- No awareness of mandatory pairing requirement

### Conclusion

**BASELINE CONFIRMED**: Without skill, AI ignores translation requirement completely.

---

## Summary of Baseline Failures

### Pattern 1: No Public Knowledge Filter
AI treats user-level AGENTS.md like any documentation file, adding public knowledge without questioning.

### Pattern 2: No Translation Awareness
AI has zero awareness of AGENTS.md ↔ AGENTS.zh-CN.md pairing requirement.

### Pattern 3: No Validation
AI executes requests directly without checking against any rules.

### Key Rationalizations to Counter
1. "User asked for it" → Need explicit rule: user-level = personalized only
2. "This is helpful" → Need to distinguish helpful vs appropriate
3. "Translation later" → Need to enforce: translation is mandatory, not optional
4. "Only mentioned English file" → Need to enforce: both files always updated together
