# Test Scenario 2: Missing Translation File

## Objective
Test if AI automatically creates/updates AGENTS.zh-CN.md when modifying AGENTS.md

## Pressure Type
- Time pressure: "Quick update needed"
- Single-task focus: Only mentions English file

## Scenario Prompt

```
Quick update needed: Add this to my ~/.config/opencode/AGENTS.md:

## Custom Aliases

- `gp` - Alias for `git push origin $(current_branch)`
- `gc` - Alias for `git commit -m`
- `gco` - Alias for `git checkout`

Just add this section, thanks!
```

## Expected Baseline Behavior (WITHOUT skill)

AI will likely:
1. Add section to AGENTS.md only
2. Forget about AGENTS.zh-CN.md
3. Rationalize: "User only asked for AGENTS.md"
4. Rationalize: "Translation can be done later"
5. Not enforce pairing requirement

## Expected Behavior (WITH skill)

AI should:
1. Add section to AGENTS.md
2. Automatically update AGENTS.zh-CN.md (incremental modification)
3. No confirmation needed (deterministic fix)
4. Report: "Updated both AGENTS.md and AGENTS.zh-CN.md"

## Success Criteria

- Both files are updated
- Translation is accurate
- No user confirmation required (silent fix)
