# Cclover Skills - Development Guide

## What This Project Does

Personal AI Agent skill collection developed with TDD methodology, applicable to any AI assistant (OpenCode, Claude Code, etc.). Each skill targets specific scenarios to help agents complete tasks more effectively.

## Tech Stack

- **Skill Format**: Markdown (SKILL.md)
- **Development Method**: TDD (Test-Driven Development)
- **Writing Tool**: writing-skills skill

## Project Structure

```
cclover-skills/
├── main-skills/         # User-facing skills (linked to system)
│   ├── skill-name/
│   │   ├── SKILL.md    # Skill main file (required)
│   │   └── *.*         # Supporting files (optional)
│   └── ...
├── skills/              # Internal skills (for nested loading)
│   ├── helper-skill/
│   │   └── SKILL.md
│   └── ...
├── agents/              # Agent definitions (prompt files)
├── .opencode/           # OpenCode plugin system
│   └── plugin/          # OpenCode plugins
│       ├── cclover-agent.ts   # Sub-agent delegation tools
│       ├── cclover-agents.ts  # Agent definitions & configuration
│       └── cclover-skills.ts  # Dynamic skill loading tool
├── AGENTS.md           # This file
└── README.md           # Project description
```

**Directory Structure**:
- **main-skills/**: User-facing skills installed to AI assistant systems
- **skills/**: Internal skills used by main-skills for nested loading (not directly exposed to users)
- **agents/**: Agent definition files (prompts)
- **.opencode/**: OpenCode plugin system extending agent capabilities

## Nested Skill System

This project uses a nested skill system where main-skills can load and compose functionality from internal skills.

**How it works**:
- Skills in `main-skills/` can use the `skill` tool (provided by MCP service) to load skills from `skills/` directory
- This enables modular skill design without exposing internal implementation details to end users
- The `cclover-skill` tool accepts a skill name and loads the corresponding SKILL.md from `skills/{skill-name}/SKILL.md`

## OpenCode Plugin System

This project includes an OpenCode plugin system that extends agent capabilities.

### Plugins Overview

**cclover-agent.ts** — Sub-agent Delegation Tools
- Provides tools for creating and managing delegated agent sessions
- `cclover_agent`: Create new session and delegate task to specified agent type
- `cclover_agent_result`: Check progress or retrieve results from delegated sessions
- `cclover_agent_stop`: Stop a running delegated session

**cclover-agents.ts** — Agent Definitions & Configuration
- Registers custom agent definitions with OpenCode
- Loads agent prompts from `agents/` directory
- Configures agent-specific settings (temperature, permissions, color)
- Sets default agent for the project

**cclover-skills.ts** — Dynamic Skill Loading
- Provides `cclover_skill` tool for loading skills not in system prompt
- Searches skills from OpenCode config directory (`~/.config/opencode/cclover/skills/`)
- Supports nested skill categories
- Intercepts `skill` tool calls to redirect to hidden cclover skills

### Agent Types

Agents are defined in `agents/` directory. Each agent has:
- A prompt file defining its role and behavior
- Configured permissions (edit, bash, read, webfetch, websearch)
- Optional settings (temperature, color)

Available agent types vary by project configuration. Common agents include coding assistants, research specialists, and task executors.

## Development Rules

### Writing Skills

**Must use writing-skills skill to write**, unless the user explicitly indicates to write directly without loading the skill.

### Updating README Documentation

**When adding or modifying any skill, all language versions of README must be synchronized.**

Required updates:
- Update skill list in README.md (add new skill or update description)
- Keep skill descriptions consistent across all README language versions
- Ensure installation instructions remain accurate

This ensures users can discover and understand all available skills regardless of their language preference.
### TDD Testing Workflow

TDD testing is mandatory when writing skills. **Key steps**:

1. Use writing-skills to write the skill
2. When having a subagent test the new skill:
   - **Directly tell the subagent the complete path of the just-written skill**
   - **Have the subagent read the entire skill file**
   - This step is very important to ensure the subagent can correctly load and understand the skill

Example:
```
Please read the full text of /path/to/cclover-skills/skills/new-skill/SKILL.md and treat it as a skill.
```

### Skill Design Principles

- **Universality**: Skills should be applicable to all AI assistants, not dependent on specific environments or tools
- **Independence**: Skills can be used independently
- **Composability**: Skills can have interdependencies

### Prompt Writing Guidelines for Skills

Skills are prompts. A well-written skill is a well-written prompt. Follow these principles when writing SKILL.md files:

#### Structure

Every skill should follow this order:
1. **Role/Context** — Tell the agent who it is and what scenario it's in
2. **Task** — What to do, stated as concrete actions
3. **Constraints** — What NOT to do, boundaries, edge cases
4. **Output Format** — Expected deliverables, structure, style
5. **Examples** — Input→Output pairs when behavior is hard to describe in words

#### Core Principles

- **Specific over abstract**: "Check if the function has error handling and suggest try-catch with custom error types" beats "improve the code"
- **Positive over negative**: "Only discuss functionality" works better than "Don't mention pricing" — negation draws attention to the forbidden concept
- **Show over tell**: One good example > three paragraphs of explanation. Agents pattern-match; exploit that
- **Atomic instructions**: One instruction per bullet. Compound sentences ("do X and also Y while considering Z") get partially executed
- **Constraint boundaries**: Explicitly state what's in-scope and out-of-scope. Unbounded instructions lead to scope creep
- **Ordered by priority**: Put the most critical instructions first. Attention degrades over length

#### Common Pitfalls

- **Contradictory instructions**: "Be concise" + "Explain every step in detail" — the agent will oscillate. Pick one, or specify when each applies
- **Implicit assumptions**: If the skill depends on a file structure, tool availability, or naming convention, state it explicitly
- **Over-specification**: Packing too many requirements dilutes each one. If a skill exceeds ~200 lines, split it or prioritize ruthlessly
- **Missing edge cases**: Only testing the happy path. Stress-test with adversarial inputs during TDD
- **Vague success criteria**: "Make it better" is not verifiable. "All functions have JSDoc with @param and @returns" is
cclover-skills/
├── my-skill/
│   └── SKILL.md
```

✅ Correct: Placing skills in skills/ directory
```
cclover-skills/
├── skills/
│   └── my-skill/
│       └── SKILL.md
```

### Not Providing Skill Path During Testing

❌ Wrong: Letting subagent find the skill themselves
```
Please test the newly written my-skill skill
```

✅ Correct: Provide complete path and require full read
```
Please test the just-written skill. Skill path: /path/to/cclover-skills/skills/my-skill/SKILL.md
Please read the entire skill file, then test according to the skill requirements.
```
