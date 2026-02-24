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
├── skills/              # All skills must be placed in this directory
│   ├── skill-name/
│   │   ├── SKILL.md    # Skill main file (required)
│   │   └── *.*         # Supporting files (optional)
│   └── ...
├── AGENTS.md           # This file
└── README.md           # Project description
```

**Important Rule**: All skills must be placed in the `skills/` directory, not in the project root.

## Development Rules

### Writing Skills

**Must use writing-skills skill to write**, unless the user explicitly indicates to write directly without loading the skill.

### TDD Testing Workflow

TDD testing is mandatory when writing skills. **Key steps**:

1. Use writing-skills to write the skill
2. When having a subagent test the new skill:
   - **Directly tell the subagent the complete path of the just-written skill**
   - **Have the subagent read the entire skill file**
   - This step is very important to ensure the subagent can correctly load and understand the skill

Example:
```
请全文阅读 /path/to/cclover-skills/skills/new-skill/SKILL.md，把它当成技能
```

### Skill Design Principles

- **Universality**: Skills should be applicable to all AI assistants, not dependent on specific environments or tools
- **Independence**: Skills can be used independently
- **Composability**: Skills can have interdependencies
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
