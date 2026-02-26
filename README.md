# Cclover Skills

English | [简体中文](README.zh-CN.md)

Personal AI Agent skill collection for OpenCode, Claude Code, Cursor, and other AI assistants that support skill systems.

## Introduction

This repository contains AI Agent skills developed and rigorously tested using TDD methodology. Each skill targets specific scenarios to help agents complete tasks more effectively and professionally. All skills are written using [superpowers/writing-skills](https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md).

## Installation

**Note**: Installation varies slightly by platform.

### OpenCode

1. Clone this repository to any local directory:
```bash
git clone https://github.com/cclover/cclover-skills.git
cd cclover-skills
```

2. Create symbolic links to OpenCode skills directory:
```bash
# User-level skills directory
ln -s "$(pwd)/skills"/* ~/.config/opencode/skills/

# Or project-level skills directory (run in project root)
ln -s "$(pwd)/skills"/* ./.opencode/skills/
```

3. Restart OpenCode or reload configuration

### Claude Code

1. Clone this repository to any local directory:
```bash
git clone https://github.com/cclover/cclover-skills.git
cd cclover-skills
```

2. Create symbolic links to Claude Code skills directory:
```bash
# macOS/Linux
ln -s "$(pwd)/skills"/* ~/.claude/skills/

# Windows (run PowerShell as Administrator)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills" -Target "$PWD\skills"
```

3. Restart Claude Code

### Cursor

1. Clone this repository to any local directory:
```bash
git clone https://github.com/cclover/cclover-skills.git
cd cclover-skills
```

2. Create symbolic links to Cursor skills directory:
```bash
# macOS/Linux
ln -s "$(pwd)/skills"/* ~/.cursor/skills/

# Windows (run PowerShell as Administrator)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.cursor\skills" -Target "$PWD\skills"
```

3. Restart Cursor

### Other AI Assistants

If your AI assistant supports skill systems, you can typically install by:

1. Clone this repository to any local directory
2. Consult your AI assistant's documentation to find the skills directory location
3. Create symbolic links: `ln -s /path/to/cclover-skills/skills/* /path/to/your-ai-assistant/skills/`

### Verify Installation

After installation, ask the agent in a new session: "What skills do you have available?" or try triggering a skill (e.g., "Help me design this feature" should trigger the brainstorming skill).

## Skills List

- **brainstorming** - Help users clarify vague ideas and requirements through iterative exploration and targeted questioning
- **brainstorming-complete** - Decide next action after brainstorming ends, avoiding unauthorized execution
- **opencode-configuration** - Complete reference for OpenCode configuration (opencode.json)
- **opencode-plugin-development** - Quick reference guide for OpenCode plugin development
- **writing-agents-module-level** - Write module-level AGENTS.md documentation (30-second quick orientation guide)
- **writing-agents-user-level** - Write user-level AGENTS.md documentation (system environment and personalized configuration)
- **writing-agents-project-root** - Write project-root AGENTS.md documentation (complete development guide)

## Development Methodology

All skills follow **TDD (Test-Driven Development)** methodology:

- **RED Phase**: Design stress scenarios, record agent's failure behavior without skills
- **GREEN Phase**: Write minimal skills to solve these failures, re-run scenarios with skills to verify passing
- **REFACTOR Phase**: Design new stress scenarios to find loopholes, close rationalization gaps

**Why TDD?**
- No tests = No verification
- Write skills first = Guessing problems
- Test-driven = Solving real problems


## License

MIT License

## Contact

For questions or suggestions, please contact via [GitHub Issues](https://github.com/cclover/cclover-skills/issues).
