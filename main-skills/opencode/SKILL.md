---
name: opencode
description: Use for OpenCode questions in general, including basic CLI/TUI usage, configuration, plugins, SDK, and APIs. Answers basic usage directly and routes deeper topics to specialized skills.
---

# OpenCode Entry Point

## Overview

Entry point for OpenCode questions.

This skill handles **basic day-to-day usage directly** with concise guidance, and **routes deeper questions** to specialized skills for configuration, SDK, and plugin development.

**Core principle**: Keep basic usage answers short and practical. Prefer pointing users to `opencode --help` and the official docs for command details, then load specialized skills only when the question goes beyond everyday usage.

## Official Docs

- Docs home: `https://open-code.ai/docs/en/`
- CLI docs: `https://open-code.ai/docs/en/cli`
- Config docs: `https://open-code.ai/docs/en/config`
- Providers docs: `https://open-code.ai/docs/en/providers`

When users need command details, flags, or subcommands, prefer:

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

### Important commands to know exist

- `opencode serve`
- `opencode web`
- `opencode attach`
- `opencode session list`
- `opencode stats`
- `opencode mcp list`

For anything beyond these basics, prefer `opencode --help` first, then route to the specialized skills below.

## When to Use

Use this skill when the user's question involves any of the following:

- OpenCode basic usage or getting started
- CLI or TUI usage
- Providers or model selection at a basic level
- `opencode.json` configuration
- `@opencode-ai/plugin` plugin development
- `@opencode-ai/sdk` or programmatic control
- OpenCode APIs or interfaces
- Any combination of the above

## Routing Logic

**Step 1: Identify whether basic usage is enough**

Basic usage questions can be answered directly from this skill:

- "How do I use OpenCode?"
- "What are the basic commands?"
- "How do I start it?"
- "What's the difference between `opencode` and `opencode run`?"
- "How do I log in or choose a model?"
- "Where do I see all commands?"

If the user only needs a quick orientation, answer directly and keep it concise.

**Step 2: If the question goes deeper, identify the technical domains involved**

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

- `opencode.json` or `opencode.jsonc`
- Provider or model configuration
- MCP servers, LSP servers
- Permissions, commands, agents
- Advanced config behavior or precedence

**Step 3: Check whether the request is exploratory**

Exploratory requests need brainstorming first:

- "I want to create/build/add..." without clear specifications
- "Help me design..."
- "How should I implement..."
- Vague requests involving architecture or design choices

When exploratory, load `brainstorming` together with all relevant technical skills in one message.

## Routing Table

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

**Key principle**: Do not load specialized skills for simple getting-started questions. Do load all relevant specialized skills together for deeper technical questions.

## Examples

### Example 1: Basic usage only

- Question: "What are the basic OpenCode commands?"
- Action: Answer directly from this skill, keep it short, point to `opencode --help`

### Example 2: Basic usage + config

- Question: "How do I set the default model in OpenCode?"
- Action: Briefly mention config file location, then load `opencode-configuration`

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
| Turning this skill into a full manual | Duplicates official docs and `--help` | Keep basics minimal and link out |
| Loading one specialized skill when multiple domains are involved | Misses cross-domain context | Load all relevant technical skills together |
| Loading brainstorming for simple getting-started questions | Adds unnecessary overhead | Use brainstorming only for actual design uncertainty |
| Explaining config details from memory | Risks incorrect or incomplete guidance | Route deeper config questions to `opencode-configuration` |

## Red Flags - Check Yourself

If you're thinking:

- "I'll answer every OpenCode question from this one skill" → Route deeper topics
- "I'll paste a huge CLI reference here" → Point to `opencode --help` instead
- "This basic question probably needs SDK/config/plugin docs" → Check if direct answer is enough first
- "I'll load brainstorming because the user said 'how do I use'" → That's usually basic usage, not design
- "I'll only load one specialized skill" → Check for multi-domain overlap

**All of these mean: Stop and decide whether the user needs a concise orientation or a specialized reference.**
