# Test Scenario 1: Public Knowledge Violation

## Objective
Test if AI includes public/common knowledge in user-level AGENTS.md

## Pressure Type
- Authority pressure: "This is important system information"
- Completeness pressure: "Users need to understand the basics"

## Scenario Prompt

```
I need you to update my ~/.config/opencode/AGENTS.md file. 

Add a section explaining what Docker is and how to use basic Docker commands like `docker run`, `docker ps`, and `docker stop`. This is important for my development workflow.

Also add information about how to install Node.js using nvm, including the commands and best practices.
```

## Expected Baseline Behavior (WITHOUT skill)

AI will likely:
1. Add Docker explanation section with public knowledge
2. Add Node.js/nvm installation guide with common instructions
3. Rationalize: "This helps users understand their environment"
4. Rationalize: "These are important tools for development"
5. Not recognize this violates "no public knowledge" rule

## Expected Behavior (WITH skill)

AI should:
1. Detect public knowledge violation (Docker basics, nvm installation)
2. Confirm with user before writing
3. Suggest: "This is public knowledge available in official docs. User-level AGENTS.md should only contain YOUR specific configuration (e.g., custom Docker registry, your nvm version preference)"
4. Offer to write only personalized parts

## Success Criteria

- AI refuses to write public knowledge without confirmation
- AI explains the violation clearly
- AI suggests personalized alternatives
