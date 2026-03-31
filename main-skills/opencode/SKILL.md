---
name: opencode
description: Use for any OpenCode question, and for any question about the assistant itself in the current environment. If the user is asking about OpenCode or about the assistant’s own model, capabilities, limits, tools, permissions, configuration, or behavior, this skill applies.
---

# OpenCode Entry Point

## Overview

Entry point for OpenCode questions.

This skill handles **basic day-to-day usage directly** with concise guidance, **treats self-management requests as action candidates first**, and **routes deeper questions** to specialized skills for configuration, SDK, and plugin development.

**Core principle**: Keep basic usage answers short and practical. For requests about the assistant’s own current runtime, configuration, or behavior, prefer autonomous inspection and modification over instructional answers. For CLI commands, flags, and subcommands, prefer `opencode --help` first, then the official docs. For configuration, SDK, plugins, and other non-CLI behavior, load specialized skills first when needed. If the skills are insufficient, consult official docs and web search; read source code only as a last resort.

## Official Docs

- Docs home: `https://opencode.ai/docs/`
- CLI docs: `https://opencode.ai/docs/cli/`
- Config docs: `https://opencode.ai/docs/config/`
- Providers docs: `https://opencode.ai/docs/providers/`
- Source repository: `https://github.com/anomalyco/opencode`

When users need CLI command details, flags, or subcommands, prefer:

```bash
opencode --help
opencode run --help
opencode session --help
opencode mcp --help
```

## Basic Usage Quick Start

Use this section only for the most common everyday questions.

### Start OpenCode

```bash
opencode
```

Starts the TUI for normal interactive use.

### Run one prompt without opening the TUI

```bash
opencode run "Explain closures in JavaScript"
```

Useful for scripting, automation, or quick one-shot prompts.

### Log in to a provider

```bash
opencode auth login
```

Or use `/connect` inside the TUI.

### List available models

```bash
opencode models
```

### Common config locations

- Global: `~/.config/opencode/opencode.json`
- Project: `./opencode.json`

### Where OpenCode loads things from

OpenCode does not only read `opencode.json`.

- Global config and customizations: `~/.config/opencode/`
- Project-local customizations: `./.opencode/`
- User-local customizations: `~/.opencode/`
- Custom config directory: `OPENCODE_CONFIG_DIR`
- Custom config file: `OPENCODE_CONFIG`
- Inline config override: `OPENCODE_CONFIG_CONTENT`
- Remote org defaults: `.well-known/opencode`
- Stored provider auth: `~/.local/share/opencode/auth.json`

Common auto-discovered subdirectories include:

- `agents/`
- `commands/`
- `modes/`
- `plugins/`
- `skills/`
- `tools/`
- `themes/`

Also note:

- secrets and per-environment values often come from env vars or `{env:VAR}`
- server auth is often env-driven (`OPENCODE_SERVER_PASSWORD`, `OPENCODE_SERVER_USERNAME`)
- provider config and provider auth are related but separate

### Important commands to know exist

- `opencode serve`
- `opencode web`
- `opencode attach`
- `opencode session list`
- `opencode stats`
- `opencode mcp list`

For anything beyond these basics, use `opencode --help` first only for CLI-entry questions. Otherwise, route to the specialized skills below first; if they are insufficient, consult official docs, then web search, and read source code last.

## When to Use

Use this skill when the user's question involves any of the following:

- OpenCode basic usage or getting started
- CLI or TUI usage
- Providers or model selection at a basic level
- `opencode.json` configuration
- `@opencode-ai/plugin` plugin development
- `@opencode-ai/sdk` or programmatic control
- OpenCode APIs or interfaces
- The assistant’s own current model, provider, permissions, tools, skills, agents, modes, configuration, or runtime behavior
- Any combination of the above

## Routing Logic

**Step 1: Determine whether this is a general OpenCode question or a self-management request**

If the user is asking about the assistant’s own current runtime, model, provider, permissions, tools, skills, agents, modes, configuration, or behavior, treat it as a self-management request. Prefer inspecting the live environment and making necessary non-destructive changes directly, rather than defaulting to instructional answers.

**Step 2: Identify whether basic usage is enough**

Basic usage questions can be answered directly from this skill:

- "How do I use OpenCode?"
- "What are the basic commands?"
- "How do I start it?"
- "What's the difference between `opencode` and `opencode run`?"
- "How do I log in or choose a model?"
- "Where do I see all commands?"

If the user only needs a quick orientation, answer directly and keep it concise.

**Step 3: If the question goes deeper, identify the technical domains involved**

### Plugin Development

Load `opencode-plugin-development` when the question involves:

- `@opencode-ai/plugin`
- Creating or debugging plugins
- Custom tools, hooks, agents
- Plugin lifecycle or registration
- `.opencode/plugin/` or `.opencode/plugins/`

### SDK

Load `opencode-sdk` when the question involves:

- `@opencode-ai/sdk`
- Programmatic control of OpenCode
- Session, message, event, or HTTP API usage
- Client-server communication
- SDK types or methods

### Configuration

Load `opencode-configuration` when the question involves:

- any OpenCode configuration surface, not just `opencode.json`
- config files such as `opencode.json` or `opencode.jsonc`
- environment variables, runtime toggles, or feature flags
- config loading, discovery, precedence, or override behavior
- provider/model setup, credentials, or variable substitution
- agents, commands, permissions, MCP, LSP, plugins, skills, or server settings

Treat env vars, startup overrides, auto-discovered directories, and behavior toggles as configuration even when they are not expressed as `opencode.json` fields.

**Step 4: Check whether the request is exploratory**

Exploratory requests need brainstorming first:

- "I want to create/build/add..." without clear specifications
- "Help me design..."
- "How should I implement..."
- Vague requests involving architecture or design choices

When exploratory, load `brainstorming` together with all relevant technical skills in one message.

## Routing Table

Apply the table below to choose the initial routing path. If specialized skills are insufficient, consult official docs next, then web search, and read source code last.

| Request Type | Technical Domains | Action |
|--------------|-------------------|--------|
| Specific | Basic usage only | Answer directly from this skill |
| Specific | Configuration only | Load `opencode-configuration` |
| Specific | SDK only | Load `opencode-sdk` |
| Specific | Plugin only | Load `opencode-plugin-development` |
| Specific | Basic + Config | Answer basics briefly, then load `opencode-configuration` if needed |
| Specific | Basic + SDK | Answer basics briefly, then load `opencode-sdk` if needed |
| Specific | Basic + Plugin | Answer basics briefly, then load `opencode-plugin-development` if needed |
| Specific | Plugin + Config | Load `opencode-plugin-development`, `opencode-configuration` |
| Specific | SDK + Config | Load `opencode-sdk`, `opencode-configuration` |
| Specific | Plugin + SDK | Load `opencode-plugin-development`, `opencode-sdk` |
| Specific | All three | Load `opencode-plugin-development`, `opencode-sdk`, `opencode-configuration` |
| Exploratory | Basic usage only | Answer directly; do not load brainstorming unless design decisions are involved |
| Exploratory | Configuration only | Load `brainstorming`, `opencode-configuration` |
| Exploratory | SDK only | Load `brainstorming`, `opencode-sdk` |
| Exploratory | Plugin only | Load `brainstorming`, `opencode-plugin-development` |
| Exploratory | Plugin + Config | Load `brainstorming`, `opencode-plugin-development`, `opencode-configuration` |
| Exploratory | SDK + Config | Load `brainstorming`, `opencode-sdk`, `opencode-configuration` |
| Exploratory | Plugin + SDK | Load `brainstorming`, `opencode-plugin-development`, `opencode-sdk` |
| Exploratory | All three | Load `brainstorming`, `opencode-plugin-development`, `opencode-sdk`, `opencode-configuration` |

**Key principle**: Do not load specialized skills for simple getting-started questions. For deeper technical questions, load all relevant specialized skills together first, then consult official docs, web search, and source code as needed.

## Examples

### Example 1: Basic usage only

- Question: "What are the basic OpenCode commands?"
- Action: Answer directly from this skill, keep it short, point to `opencode --help`

### Example 2: Basic usage + config

- Question: "How do I set the default model in OpenCode?"
- Action: Briefly mention config file location, then load `opencode-configuration`

### Example 2b: Env/config surface

- Question: "How do I use `OPENCODE_CONFIG_CONTENT`?"
- Action: Load `opencode-configuration`

### Example 2c: Runtime toggle

- Question: "How do I disable LSP auto-download?"
- Action: Load `opencode-configuration`

### Example 2d: Discovery/config source

- Question: "Where does OpenCode load skills or plugins from?"
- Action: Load `opencode-configuration`

### Example 3: SDK only

- Question: "How do I use @opencode-ai/sdk to create a session?"
- Action: Load `opencode-sdk`

### Example 4: Plugin only

- Question: "How do I create a custom tool in my OpenCode plugin?"
- Action: Load `opencode-plugin-development`

### Example 5: Exploratory plugin request

- Question: "I want to create an OpenCode plugin for task management"
- Action: Load `brainstorming` and `opencode-plugin-development` together

## Common Mistakes

| Mistake | Why It's Wrong | How to Avoid |
|---------|----------------|--------------|
| Treating every OpenCode question as advanced | Basic questions do not need heavy routing | Answer basic usage directly first |
| Treating self-management requests as documentation questions | Loses agency and pushes work back to the user | First decide whether the request is about the assistant’s own current runtime |
| Turning this skill into a full manual | Duplicates official docs and `--help` | Keep basics minimal and link out |
| Loading one specialized skill when multiple domains are involved | Misses cross-domain context | Load all relevant technical skills together |
| Loading brainstorming for simple getting-started questions | Adds unnecessary overhead | Use brainstorming only for actual design uncertainty |
| Explaining config details from memory | Risks incorrect or incomplete guidance | Inspect live state when possible, then route deeper config questions if needed |
| Giving instructions for changes the assistant could make directly | Reduces usefulness when direct action is possible | Inspect live state first, then act when the change is non-destructive |
| Routing too early to specialized skills | Specialized knowledge should improve correctness, not replace action | Keep agency after routing and return to direct execution |

## Red Flags - Check Yourself

If you're thinking:

- "I'll answer every OpenCode question from this one skill" → Route deeper topics
- "I'll explain how to change it" → Check whether the user actually wants me to change my own config directly
- "I'll paste a huge CLI reference here" → Point to `opencode --help` instead for CLI details
- "This is probably just a config question" → First decide whether it is about my own current runtime
- "This basic question probably needs SDK/config/plugin docs" → Check if direct answer is enough first
- "I'll load brainstorming because the user said 'how do I use'" → That's usually basic usage, not design
- "I'll only load one specialized skill" → Check for multi-domain overlap
- "I should route this away immediately" → Routing should improve correctness, not replace action

**All of these mean: Stop and decide whether the user needs a concise orientation, direct self-management action, or a specialized reference.**
