---
name: opencode
description: Use when working with OpenCode plugins, SDK, configuration, or APIs.
---

# OpenCode Navigation

## Overview

Entry point for all OpenCode-related work. Routes to specialized skills based on the specific domain: plugin development, SDK usage, or configuration.

**Core principle**: Analyze the question to identify which OpenCode domains are involved, then load the corresponding skills.

## When to Use

Use this skill when the user's question involves:
- OpenCode plugins or plugin development
- @opencode-ai/sdk or programmatic control
- opencode.json configuration
- OpenCode APIs or interfaces
- Any combination of the above

## Routing Logic

**Step 1: Analyze the question**

Identify which domains are mentioned or implied:

**Plugin Development indicators:**
- Mentions `@opencode-ai/plugin`
- Creating/debugging plugins
- Custom tools, hooks, agents
- Plugin lifecycle or registration
- `.opencode/plugin/` directory

**SDK indicators:**
- Mentions `@opencode-ai/sdk`
- Programmatic control of OpenCode
- Session/message/event APIs
- Client-server communication
- SDK types or methods

**Configuration indicators:**
- Mentions `opencode.json` or `opencode.jsonc`
- Provider/model configuration
- MCP servers, LSP servers
- Permissions, commands
- Agent configuration

**Step 2: Load appropriate skills**

Based on identified domains, load the corresponding skills:

| Domains Identified | Skills to Load |
|-------------------|----------------|
| Plugin only | `opencode-plugin-development` |
| SDK only | `opencode-sdk` |
| Configuration only | `opencode-configuration` |
| Plugin + Configuration | `opencode-plugin-development`, `opencode-configuration` |
| SDK + Configuration | `opencode-sdk`, `opencode-configuration` |
| Plugin + SDK | `opencode-plugin-development`, `opencode-sdk` |

**Step 3: Proceed with loaded skills**

After loading the appropriate skills, use them to answer the user's question with specific, accurate information.

## Examples

**Example 1: Plugin only**
- Question: "How do I create a custom tool in my OpenCode plugin?"
- Analysis: Plugin development only
- Action: Load `opencode-plugin-development`

**Example 2: SDK only**
- Question: "How do I use @opencode-ai/sdk to create a session?"
- Analysis: SDK usage only
- Action: Load `opencode-sdk`

**Example 3: Configuration only**
- Question: "How do I configure MCP servers in opencode.json?"
- Analysis: Configuration only
- Action: Load `opencode-configuration`

**Example 4: Plugin + Configuration**
- Question: "I wrote a plugin with a custom tool. How do I configure its permissions in opencode.json?"
- Analysis: Both plugin development and configuration
- Action: Load `opencode-plugin-development`, `opencode-configuration`

**Example 5: SDK + Configuration**
- Question: "My @opencode-ai/sdk connection fails because the provider config in opencode.json is wrong"
- Analysis: Both SDK and configuration
- Action: Load `opencode-sdk`, `opencode-configuration`

## Common Mistakes

| Mistake | Why It's Wrong | How to Avoid |
|---------|----------------|--------------|
| Loading all skills by default | Wastes context, slower | Analyze first, load only what's needed |
| Missing a domain | Incomplete answer | Check for all three domains systematically |
| Guessing without analysis | May load wrong skills | Always analyze the question first |
| Not loading multiple skills | Missing cross-domain knowledge | Load all relevant domains |

## Red Flags - Check Yourself

If you're thinking:
- "I'll just load one skill" → Did you check for multiple domains?
- "This seems like configuration" → Did you check for plugin/SDK mentions?
- "I'll answer without loading skills" → You're missing specialized knowledge
- "I'll load all three just in case" → Analyze first, don't waste context

**All of these mean: Stop and analyze the question systematically.**
