---
name: opencode-plugin-development
description: Use when creating, maintaining, reading, or debugging OpenCode plugins. Triggers on any work involving @opencode-ai/plugin, plugin hooks, custom tools, custom agents, config hook, or opencode.json plugin configuration.
---

# OpenCode Plugin Development

## Role & Context

You are developing an OpenCode plugin using `@opencode-ai/plugin`. Plugins run inside the OpenCode process and extend its capabilities by adding custom tools, registering agents, hooking lifecycle events, injecting commands/MCPs, and modifying behavior.

**Core principle**: A plugin is an async function that receives context and returns hooks.

## When to Use

- Creating a new OpenCode plugin
- Adding custom tools, hooks, agents, commands, or MCPs to OpenCode
- Debugging plugin loading or hook execution issues
- Choosing between `@opencode-ai/plugin` (in-process) vs `@opencode-ai/sdk` (external)

**When NOT to use:**
- Building standalone CLI tools (use `@opencode-ai/sdk`)
- Writing MCP servers (different protocol)
- Modifying OpenCode core source code

## Quick Start

Minimal working plugin:

```typescript
import { Plugin, tool } from "@opencode-ai/plugin";

export const MyPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      hello: tool({
        description: "Say hello",
        args: {
          name: tool.schema.string().describe("Name to greet"),
        },
        async execute(args, context) {
          return `Hello, ${args.name}!`;
        },
      }),
    },
  };
};
```

Place in `.opencode/plugin/my-plugin.ts` — OpenCode auto-discovers it.

## Task

When building a plugin, follow this order:

1. Decide: plugin (in-process extension) vs SDK (external automation)
2. Create plugin file in `.opencode/plugin/` with `Plugin` export
3. Define tools and/or hooks as needed
4. Test by restarting OpenCode and verifying the plugin loads

## Constraints

**Do NOT:**
- Use `@opencode-ai/sdk` for plugins (SDK is for external HTTP clients, not in-process plugins)
- Write MCP servers (different protocol entirely)
- Modify OpenCode core source code
- Use `process.cwd()` for file paths (use `context.directory` or `context.worktree`)
- Return non-string from tool `execute` (must always return `string`)
- Place plugins outside `.opencode/plugin/` or `.opencode/plugins/` for auto-discovery
- Mutate `input` in hooks (modify `output` only; `input` is read-only) — exception: `config` hook, where you mutate `input` directly
- Forget `async` on Plugin function

## Common Mistakes

| Mistake | Correct |
| ------- | ------- |
| Forgetting `async` on Plugin function | `export const P: Plugin = async (ctx) => { ... }` |
| Returning non-string from tool execute | `execute` must always return `string` |
| Using `process.cwd()` for file paths | Use `context.directory` or `context.worktree` |
| Confusing Plugin with SDK | Plugin runs inside OpenCode; SDK is external HTTP client |
| Not handling errors in execute | Throw or return error string; unhandled errors crash the tool call |
| Mutating `input` in hooks | Modify `output` only; `input` is read-only (exception: `config` hook) |

## Output Format

When creating a plugin, produce:

1. **Plugin file** (`.ts` or `.js`) with:
   - Default or named export of `Plugin` function
   - Async function signature: `async (ctx) => { ... }`
   - Return object with tools and/or hooks

2. **Tool definitions** with:
   - Clear `description` (shown to AI)
   - Typed `args` using `tool.schema` (Zod)
   - `execute` function returning `string`

3. **Hook implementations** (optional) modifying `output` parameter

## Plugin vs SDK Decision

```dot
digraph plugin_decision {
    "Need to extend OpenCode?" [shape=diamond];
    "Runs inside OpenCode process?" [shape=diamond];
    "Use @opencode-ai/plugin" [shape=box];
    "Use @opencode-ai/sdk" [shape=box];

    "Need to extend OpenCode?" -> "Runs inside OpenCode process?" [label="yes"];
    "Runs inside OpenCode process?" -> "Use @opencode-ai/plugin" [label="yes"];
    "Runs inside OpenCode process?" -> "Use @opencode-ai/sdk" [label="no"];
    "Need to extend OpenCode?" -> "Use @opencode-ai/sdk" [label="no"];
}
```
| Aspect | `@opencode-ai/plugin` | `@opencode-ai/sdk` |
| ------ | --------------------- | ------------------ |
| Runs | Inside OpenCode process | External process |
| Communication | Direct function calls | HTTP/SSE/WebSocket |
| Can add tools | Yes (AI can call them) | No |
| Can hook events | Yes (lifecycle hooks) | No |
| Can register agents | Yes (via `config` hook) | No |
| Can register commands/MCPs | Yes (via `config` hook) | No |
| Can modify behavior | Yes (params, headers, env) | No |
| Use case | Extend OpenCode | Automate OpenCode |

## Plugin Structure

```typescript
import { Plugin, tool } from "@opencode-ai/plugin";

export const MyPlugin: Plugin = async (ctx) => {
  // ctx: PluginInput
  return {
    // Hooks object
  };
};
```

## PluginInput (ctx)

```typescript
type PluginInput = {
  client: OpencodeClient; // SDK client (internal, no network)
  project: Project; // Current project info
  directory: string; // Project directory
  worktree: string; // Git worktree root
  serverUrl: URL; // Server URL
  $: BunShell; // Bun shell for running commands
};
```

## Defining Tools

Tools are functions the AI agent can call during a session.

```typescript
import { tool } from "@opencode-ai/plugin";

tool({
  description: "What this tool does (shown to AI)",
  args: {
    name: tool.schema.string().describe("Parameter description"),
    count: tool.schema.number().optional().describe("Optional param"),
    tags: tool.schema.array(tool.schema.string()).describe("Array param"),
    mode: tool.schema.enum(["fast", "slow"]).default("fast"),
  },
  async execute(args, context) {
    // args: validated parameters (Zod-inferred types)
    // context: ToolContext (see below)
    // Must return a string
    return `Result: ${args.name}`;
  },
});
```

### ToolContext

```typescript
type ToolContext = {
  sessionID: string;
  messageID: string;
  agent: string;
  directory: string; // Prefer over process.cwd()
  worktree: string; // For stable relative paths
  abort: AbortSignal; // Cancellation signal
  metadata(input: {
    // Set tool metadata
    title?: string;
    metadata?: Record<string, any>;
  }): void;
  ask(input: {
    // Request permission
    permission: string;
    patterns: string[];
    always: string[];
    metadata: Record<string, any>;
  }): Promise<void>;
};
```

## Available Hooks

### Chat Hooks

```typescript
// Called when a new message is received
"chat.message"?: (
  input: { sessionID: string; agent?: string; model?: { providerID: string; modelID: string }; messageID?: string; variant?: string },
  output: { message: UserMessage; parts: Part[] },
) => Promise<void>

// Modify LLM parameters (temperature, topP, topK)
"chat.params"?: (
  input: { sessionID: string; agent: string; model: Model; provider: ProviderContext; message: UserMessage },
  output: { temperature: number; topP: number; topK: number; options: Record<string, any> },
) => Promise<void>

// Modify request headers sent to LLM provider
"chat.headers"?: (
  input: { sessionID: string; agent: string; model: Model; provider: ProviderContext; message: UserMessage },
  output: { headers: Record<string, string> },
) => Promise<void>
```

### Tool Hooks

```typescript
// Modify tool arguments before execution
"tool.execute.before"?: (
  input: { tool: string; sessionID: string; callID: string },
  output: { args: any },
) => Promise<void>

// Process tool results after execution
"tool.execute.after"?: (
  input: { tool: string; sessionID: string; callID: string; args: any },
  output: { title: string; output: string; metadata: any },
) => Promise<void>

// Modify tool definitions (description and parameters) sent to LLM
"tool.definition"?: (
  input: { toolID: string },
  output: { description: string; parameters: any },
) => Promise<void>
```

### Other Hooks

```typescript
// Global event listener
event?: (input: { event: Event }) => Promise<void>

// Config hook — called during initialization with the full OpenCode config object.
// Use this to register agents, commands, MCPs, and modify any config fields.
config?: (input: Config) => Promise<void>

// Permission request interceptor
"permission.ask"?: (
  input: Permission,
  output: { status: "ask" | "deny" | "allow" },
) => Promise<void>

// Command execution interceptor
"command.execute.before"?: (
  input: { command: string; sessionID: string; arguments: string },
  output: { parts: Part[] },
) => Promise<void>

// Shell environment variable injection
"shell.env"?: (
  input: { cwd: string; sessionID?: string; callID?: string },
  output: { env: Record<string, string> },
) => Promise<void>
```

### Experimental Hooks

```typescript
// Transform messages before sending to LLM
"experimental.chat.messages.transform"?: (
  input: {},
  output: { messages: { info: Message; parts: Part[] }[] },
) => Promise<void>

// Transform system prompt
"experimental.chat.system.transform"?: (
  input: { sessionID?: string; model: Model },
  output: { system: string[] },
) => Promise<void>

// Customize session compaction prompt
"experimental.session.compacting"?: (
  input: { sessionID: string },
  output: { context: string[]; prompt?: string },
) => Promise<void>

// Post-process completed text
"experimental.text.complete"?: (
  input: { sessionID: string; messageID: string; partID: string },
  output: { text: string },
) => Promise<void>
```

## Config Hook — Registering Agents, Commands & MCPs

The `config` hook is the most powerful hook in the plugin system. It receives the full OpenCode `Config` object during initialization, allowing you to inject agents, commands, MCPs, and modify any configuration field.

The `Config` type is imported from `@opencode-ai/sdk`.

### Registering Custom Agents

Agents are AI personas with their own system prompt, model, and behavior. Register them via `config.agent`:

```typescript
import { Plugin } from "@opencode-ai/plugin";

export const MyPlugin: Plugin = async (ctx) => {
  return {
    config: async (config) => {
      const agents = (config.agent ?? {}) as Record<string, any>;
      agents["my-agent"] = {
        model: "anthropic/claude-sonnet-4-20250514",
        temperature: 0.1,
        prompt: "You are a database expert. Help with SQL optimization, schema design, and migrations.",
        mode: "subagent",  // "primary" | "subagent" | "all"
        description: "Database architecture and optimization specialist",
      };
      config.agent = agents;
    },
  };
};
```

#### AgentConfig Fields

| Field | Type | Description |
| ----- | ---- | ----------- |
| `model` | `string?` | Model in `provider/model` format (e.g. `"anthropic/claude-sonnet-4-20250514"`) |
| `prompt` | `string?` | System prompt (instructions for the agent) |
| `temperature` | `number?` | LLM temperature |
| `mode` | `"primary" \| "subagent" \| "all"?` | `primary`: shown in UI model selector; `subagent`: used by other agents via delegation; `all`: both |
| `description` | `string?` | When to use this agent (shown in UI) |
| `variant` | `string?` | Default model variant |
| `hidden` | `boolean?` | Hide from @ autocomplete (subagent only) |
| `steps` | `number?` | Max agentic iterations before forcing text-only response |
| `color` | `string?` | Hex color or theme color (`"primary"`, `"warning"`, etc.) |
| `permission` | `PermissionConfig?` | Tool permission overrides |

### Registering Custom Commands

Commands are slash-commands users can invoke in the chat. Register them via `config.command`:

```typescript
config: async (config) => {
  const commands = (config.command ?? {}) as Record<string, any>;
  commands["review"] = {
    template: "Review the code in $ARGUMENTS for security issues and best practices.",
    description: "Code review for security and best practices",
    agent: "my-agent",  // optional: run with a specific agent
  };
  config.command = commands;
},
```

### Registering Custom MCPs

MCP (Model Context Protocol) servers provide additional tools to agents. Register them via `config.mcp`:

```typescript
config: async (config) => {
  const mcps = (config.mcp ?? {}) as Record<string, any>;
  mcps["my-mcp"] = {
    // Local stdio MCP
    command: "npx",
    args: ["-y", "my-mcp-server"],
    env: { API_KEY: process.env.MY_API_KEY ?? "" },
  };
  mcps["remote-mcp"] = {
    // Remote HTTP MCP
    url: "https://mcp.example.com/sse",
  };
  config.mcp = mcps;
},
```

### Modifying Other Config Fields

The `config` hook can modify any field in the `Config` object:

```typescript
config: async (config) => {
  // Set default agent
  config.default_agent = "my-agent";

  // Set default model
  config.model = "anthropic/claude-sonnet-4-20250514";
  
  // Disable specific providers
  config.disabled_providers = ["openai"];
},
```

### Full Plugin Example with Config Hook

```typescript
import { Plugin, tool } from "@opencode-ai/plugin";

export const MyPlugin: Plugin = async (ctx) => {
  return {
    // Register tools (AI can call these)
    tool: {
      greet: tool({
        description: "Greet someone",
        args: { name: tool.schema.string().describe("Name") },
        async execute(args) { return `Hello, ${args.name}!`; },
      }),
    },

    // Register agents, commands, MCPs via config hook
    config: async (config) => {
      const agents = (config.agent ?? {}) as Record<string, any>;
      agents["specialist"] = {
        model: "anthropic/claude-sonnet-4-20250514",
        prompt: "You are a specialist agent.",
        mode: "subagent",
        description: "Specialist for domain-specific tasks",
      };
      config.agent = agents;

      const commands = (config.command ?? {}) as Record<string, any>;
      commands["analyze"] = {
        template: "Analyze $ARGUMENTS in detail.",
        description: "Deep analysis",
      };
      config.command = commands;
    },

    // Lifecycle hooks
    event: async ({ event }) => {
      if (event.type === "session.created") {
        console.log("New session:", event.properties.sessionID);
      }
    },
  };
};
```

## Registration Methods

### Method 1: Local Plugin (`.opencode/` directory)

Place plugin files in `.opencode/plugin/` or `.opencode/plugins/`:

```
project/
└── .opencode/
    └── plugin/
        └── my-plugin.ts    # Auto-discovered
```

OpenCode scans `{plugin,plugins}/*.{ts,js}` in `.opencode/` directories. The plugin file must export a `Plugin` function (named or default export).

OpenCode auto-generates `package.json` with `@opencode-ai/plugin` dependency and runs `bun install` in the `.opencode/` directory.

### Method 2: npm Package

```json
// opencode.json or opencode.jsonc
{
  "plugin": ["my-opencode-plugin@1.0.0", "@scope/opencode-plugin@latest"]
}
```

OpenCode resolves the package via `bun install` and imports it. The package must export a `Plugin` function.

### Method 3: File URL

```json
{
  "plugin": ["file:///absolute/path/to/plugin.ts"]
}
```

## Config Precedence for Plugins

Plugin arrays from multiple config sources are concatenated (not replaced):

1. Remote `.well-known/opencode` (org defaults)
2. Global config (`~/.config/opencode/opencode.json`)
3. Custom config (`OPENCODE_CONFIG`)
4. Project config (`opencode.json`)
5. `.opencode/` directories (auto-discovered local plugins)
6. Inline config (`OPENCODE_CONFIG_CONTENT`)

## Complete Working Example

```typescript
import { Plugin, tool } from "@opencode-ai/plugin";

export const MyPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      search_docs: tool({
        description: "Search project documentation",
        args: {
          query: tool.schema.string().describe("Search query"),
          limit: tool.schema.number().optional().describe("Max results"),
        },
        async execute(args, context) {
          const result =
            await ctx.$`grep -r ${args.query} ${context.directory}/docs --include="*.md" -l`
              .quiet()
              .nothrow()
              .text();
          const files = result.trim().split("\n").filter(Boolean);
          if (!files.length) return "No documentation found.";
          const limited = files.slice(0, args.limit ?? 10);
          return `Found ${files.length} files:\n${limited.join("\n")}`;
        },
      }),
    },

    "chat.params": async (_input, output) => {
      output.temperature = 0.5;
    },

    "shell.env": async (_input, output) => {
      output.env.PROJECT_ROOT = ctx.directory;
    },

    "permission.ask": async (input, output) => {
      if (input.permission === "read") {
        output.status = "allow";
      }
    },
  };
};
```

