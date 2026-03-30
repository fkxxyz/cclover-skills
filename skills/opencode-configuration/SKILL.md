---
name: opencode-configuration
description: Use when configuring OpenCode (opencode.json), setting up providers, agents, MCP servers, LSP servers, permissions, or any opencode.json configuration questions
---

# OpenCode Configuration Reference

## Overview

Complete reference for OpenCode configuration surfaces, not just `opencode.json`. Covers configuration files, environment variables, variable substitution (`{env:...}` and `{file:...}`), provider credentials, precedence order, and all major OpenCode settings including models, providers, agents, permissions, commands, MCP servers, LSP servers, formatters, server settings, and advanced behavior toggles.

Use this document with the following mental model:

- **Config files** define persistent user/project behavior
- **Environment variables** control startup-time overrides, runtime behavior toggles, CI automation, server auth, and some advanced features
- **`{env:VAR}` / `{file:path}` substitution** lets config files reference secrets or external file contents without hardcoding them
- **Provider credential env vars** are also configuration, but they scale across many providers and are best handled by pattern + examples rather than exhaustive repetition

## Configuration Surfaces

OpenCode configuration comes from four different mechanisms. Users often only look for `opencode.json` settings first, but some important behavior is configured elsewhere.

| Surface                      | Best for                                               | Typical examples                                                                       |
| ---------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Config files                 | Persistent user/project configuration                  | `model`, `provider`, `agent`, `permission`, `mcp`, `lsp`, `formatter`                  |
| Environment variables        | Runtime overrides, CI, startup behavior, feature flags | `OPENCODE_CONFIG`, `OPENCODE_SERVER_PASSWORD`, `OPENCODE_DISABLE_LSP_DOWNLOAD`         |
| Variable substitution        | Keeping secrets and deploy-specific values out of JSON | `{env:ANTHROPIC_API_KEY}`, `{file:~/.secrets/openai-key}`                              |
| Provider credential env vars | Authenticating LLM providers                           | `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `AWS_PROFILE`, `GOOGLE_APPLICATION_CREDENTIALS` |

Quick rule of thumb:

- If the value should live with the project or user setup, prefer **config files**
- If the value is secret, environment-specific, or only needed at startup, prefer **env vars** or `{env:...}`
- If you need to change behavior in CI, automation, or a one-off shell session, prefer **env vars**
- If you cannot find a behavior in the JSON schema, check whether it is controlled by an **environment variable**

## Choosing the Right Configuration Mechanism

Use these rules when deciding how to express a configuration answer.

### Prefer config files when

- the setting should persist across runs
- the setting is structural and belongs to OpenCode's configuration model
- the setting should be committed with a project or shared as part of team setup
- examples include `model`, `provider`, `agent`, `permission`, `command`, `mcp`, `lsp`, `formatter`, and `server`

### Prefer environment variables when

- the setting only matters for one shell session, CI run, container launch, or automation wrapper
- the setting changes how OpenCode loads config at startup
- the setting is a runtime behavior toggle rather than a schema field
- the setting is sensitive and should not be persisted in a config file

### Prefer `{env:VAR}` inside config when

- the config structure belongs in JSON, but the concrete value should come from the environment
- the value is secret or deployment-specific
- you want reproducible config structure without hardcoding credentials

### Recommended answering rules

- When both config files and env vars could solve the problem, recommend **config files for persistent behavior** and **env vars for ephemeral behavior**.
- When discussing providers, show the **JSON structure first**, then move secrets into `{env:...}`.
- When a user asks where a feature is configured, mention **both schema fields and env-only overrides** if both exist.
- If a setting is missing from `opencode.json`, do **not** assume it is unsupported; check whether it is env-driven.
- Treat provider credential env vars as configuration inputs, but distinguish them from `OPENCODE_*` runtime flags.

## Common Misinterpretations

These are common incorrect conclusions that agents may make when reading OpenCode config docs.

### Misinterpretation: “If it is not in `opencode.json`, it is not configurable.”

Incorrect. Some meaningful OpenCode behavior is env-only or env-first. Examples include:

- `OPENCODE_SERVER_PASSWORD`
- `OPENCODE_SERVER_USERNAME`
- `OPENCODE_DISABLE_LSP_DOWNLOAD`
- `OPENCODE_MODELS_PATH`
- `OPENCODE_CONFIG_CONTENT`

### Misinterpretation: “All environment variables play the same role.”

Incorrect. There are at least three different roles:

- config-loading env vars
- runtime behavior env vars
- provider credential env vars

These should not be mixed together when explaining configuration.

### Misinterpretation: “Provider credentials should be written directly into JSON.”

Usually incorrect. The preferred pattern is:

1. express the provider structure in config
2. keep credentials in env vars
3. inject them with `{env:...}`

### Misinterpretation: “Server auth should be in the `server` object.”

Incorrect. The `server` object configures network behavior. HTTP basic auth is controlled by `OPENCODE_SERVER_PASSWORD` and `OPENCODE_SERVER_USERNAME`.

### Misinterpretation: “All LSP behavior lives under the `lsp` object.”

Incorrect. LSP server definitions live under `lsp`, but runtime installation/download behavior is controlled by env vars such as `OPENCODE_DISABLE_LSP_DOWNLOAD`.

## Configuration File Locations

OpenCode loads configurations in the following order (later overrides earlier):

1. **Remote Configuration** - `.well-known/opencode` (organization defaults)
2. **Global Configuration** - `~/.config/opencode/opencode.json{,c}` (user global config, also reads legacy `config.json`)
3. **Custom Path** - Path specified by `OPENCODE_CONFIG` environment variable
4. **Project Configuration** - `opencode.json` or `opencode.jsonc` in project root (searched upward)
5. **`.opencode` Directory** - Auto-discovered agents, commands, plugins, and config from multiple `.opencode` locations:
   - Project `.opencode/` directories (searched upward from project root)
   - `~/.opencode/` (user home directory)
   - Path specified by `OPENCODE_CONFIG_DIR` environment variable (if set)
6. **Inline Configuration** - `OPENCODE_CONFIG_CONTENT` environment variable
7. **Managed Configuration** - Enterprise admin-controlled, highest priority:
   - macOS: `/Library/Application Support/opencode/opencode.json{,c}`
   - Windows: `C:\ProgramData\opencode\opencode.json{,c}`
   - Linux: `/etc/opencode/opencode.json{,c}`

### Configuration File Format

Supports JSON and JSONC (JSON with Comments) formats:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  // This is a comment
  "theme": "opencode",
  "model": "anthropic/claude-sonnet-4-5",
}
```

## Basic Configuration

### `$schema`

- **Type**: `string`
- **Description**: JSON Schema reference for editor auto-completion and validation
- **Example**: `"https://opencode.ai/config.json"`

### `theme`

- **Type**: `string`
- **Description**: UI theme name
- **Example**: `"opencode"`, `"dracula"`, `"nord"`
- **Documentation**: https://opencode.ai/docs/themes/

### `username`

- **Type**: `string`
- **Description**: Custom username display (replaces system username)
- **Example**: `"Alice"`

### `logLevel`

- **Type**: `"DEBUG" | "INFO" | "WARN" | "ERROR"`
- **Default**: `"INFO"`
- **Description**: Logging level

### `autoupdate`

- **Type**: `boolean | "notify"`
- **Default**: `true`
- **Description**: Auto-update behavior
  - `true` - Automatically download and install updates
  - `false` - Disable auto-updates
  - `"notify"` - Only notify about new versions

### `share`

- **Type**: `"manual" | "auto" | "disabled"`
- **Default**: `"manual"`
- **Description**: Session sharing behavior
  - `"manual"` - Share manually via `/share` command
  - `"auto"` - Automatically share new sessions
  - `"disabled"` - Completely disable sharing

### `snapshot`

- **Type**: `boolean`
- **Description**: Enable Git snapshot backup mechanism

> **Note**: Configuration values support `{env:VAR_NAME}` and `{file:path}` variable substitution. See [Variable Substitution](#variable-substitution) for details.

## Models & Providers

### `model`

- **Type**: `string`
- **Format**: `provider/model`
- **Description**: Default primary model to use
- **Example**:
  ```jsonc
  {
    "model": "anthropic/claude-sonnet-4-5",
  }
  ```

### `small_model`

- **Type**: `string`
- **Format**: `provider/model`
- **Description**: Small model for lightweight tasks (e.g., generating titles)
- **Example**:
  ```jsonc
  {
    "small_model": "anthropic/claude-haiku-4-5",
  }
  ```

### `provider`

- **Type**: `object`
- **Description**: Provider configuration, each provider supports the following options

> **See also**: [Environment Variables](#environment-variables) for model-source env vars like `OPENCODE_MODELS_URL`, `OPENCODE_MODELS_PATH`, `OPENCODE_DISABLE_MODELS_FETCH`, `OPENCODE_ENABLE_EXPERIMENTAL_MODELS`, and provider credential env vars like `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, and `AWS_*`.

#### Common Provider Options

```jsonc
{
  "provider": {
    "anthropic": {
      "name": "Anthropic", // Display name
      "npm": "@ai-sdk/anthropic", // npm package name
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}", // API key
        "baseURL": "https://api.anthropic.com/v1", // Custom endpoint
        "timeout": 300000, // Request timeout (ms), default 300000 (5 min). Set to false to disable entirely.
        "setCacheKey": true, // Enable prompt caching
        "enterpriseUrl": "https://github.example.com", // GitHub Enterprise URL (for copilot provider)
      },
      "models": {
        "claude-sonnet-4-5": {
          "name": "Claude Sonnet 4.5",
          "limit": {
            "context": 200000, // Context window
            "output": 8192, // Maximum output
          },
          "variants": {
            // Variant-specific configuration
            "extended": {
              "disabled": false, // Disable this variant
            },
          },
        },
      },
      "whitelist": ["claude-*"], // Allowed model list (glob patterns)
      "blacklist": ["claude-2"], // Blocked model list (glob patterns)
    },
  },
}
```

#### Amazon Bedrock Special Options

```jsonc
{
  "provider": {
    "amazon-bedrock": {
      "options": {
        "region": "us-east-1",
        "profile": "my-aws-profile",
        "endpoint": "https://bedrock-runtime.us-east-1.vpce-xxxxx.amazonaws.com",
      },
    },
  },
}
```

### `disabled_providers`

- **Type**: `string[]`
- **Description**: List of disabled providers (higher priority than `enabled_providers`)
- **Example**:
  ```jsonc
  {
    "disabled_providers": ["openai", "gemini"],
  }
  ```

### `enabled_providers`

- **Type**: `string[]`
- **Description**: Whitelist of enabled providers (only these providers are available)
- **Example**:
  ```jsonc
  {
    "enabled_providers": ["anthropic", "openai"],
  }
  ```

## Agent Configuration

### `default_agent`

- **Type**: `string`
- **Default**: `"build"`
- **Description**: Default primary agent to use (must be a primary agent)
- **Example**: `"build"`, `"plan"`

### `agent`

- **Type**: `object`
- **Description**: Agent configuration, each agent supports the following options

#### Agent Configuration Options

```jsonc
{
  "agent": {
    "code-reviewer": {
      "description": "Code review expert",
      "mode": "subagent", // "primary" | "subagent" | "all"
      "model": "anthropic/claude-sonnet-4-5",
      "variant": "extended", // Default model variant
      "prompt": "You are a code review expert...",
      "temperature": 0.3, // 0.0-1.0
      "top_p": 0.9, // 0.0-1.0
      "steps": 10, // Maximum agentic iteration steps
      "color": "#FF5733", // Hex color or theme color
      "hidden": false, // Hide from @ autocomplete (subagent only)
      "disable": false, // Disable this agent
      "options": {}, // Custom key-value pairs passed to the agent
      "permission": {
        // Agent-specific permissions
        "edit": "deny",
        "bash": "ask",
      },
    },
  },
}
```

#### Built-in Agents

- `build` - Primary agent, full-access for development work
- `plan` - Primary agent, read-only for analysis and code exploration
- `general` - Subagent for complex searches and multistep tasks
- `explore` - Subagent for code exploration
- `title` - Primary agent (hidden, internal) for title generation
- `summary` - Primary agent (hidden, internal) for summarization
- `compaction` - Primary agent (hidden, internal) for context compaction

#### Agent Mode Explanation

- `"primary"` - Primary agent, shown in UI model selector
- `"subagent"` - Subagent, called by other agents via delegation
- `"all"` - Both primary and subagent

#### Color Options

- Hex: `"#FF5733"`
- Theme colors: `"primary"`, `"secondary"`, `"accent"`, `"success"`, `"warning"`, `"error"`, `"info"`

## Permission Control

### `permission`

- **Type**: `object`
- **Description**: Tool permission configuration

#### Permission Values

- `"allow"` - Allow execution
- `"ask"` - Require user confirmation
- `"deny"` - Deny execution

#### Configurable Permissions

```jsonc
{
  "permission": {
    // File operations
    "read": "allow", // Read files
    "edit": "ask", // Edit/write files
    "glob": "allow", // File search
    "grep": "allow", // Content search
    "list": "allow", // List directories

    // Execution operations
    "bash": "ask", // Execute shell commands
    "task": "allow", // Call subagents

    // External access
    "external_directory": "ask", // Access external directories
    "webfetch": "allow", // Access web pages
    "websearch": "allow", // Search engines
    "codesearch": "allow", // Code search

    // Other tools
    "todowrite": "allow", // Write TODOs
    "todoread": "allow", // Read TODOs
    "question": "allow", // Ask user
    "skill": "allow", // Call skills
    "lsp": "allow", // LSP operations
    "doom_loop": "allow", // Doom loop detection

    // Wildcard support
    "mymcp_*": "ask", // MCP server tools
  },
}
```

#### Pattern-Based Permissions

Permissions that support `PermissionRule` (read, edit, glob, grep, list, bash, task, external_directory, lsp, skill) can use pattern-based rules:

```jsonc
{
  "permission": {
    "read": {
      "*.env": "deny", // Deny reading .env files
      "secrets/*": "deny", // Deny reading secrets directory
      "*": "allow", // Allow other files
    },
    "bash": {
      "rm -rf*": "deny", // Deny dangerous commands
      "*": "ask", // Other commands require confirmation
    },
  },
}
```

Note: `todowrite`, `todoread`, `question`, `webfetch`, `websearch`, `codesearch`, and `doom_loop` only accept simple permission values (`"allow"` | `"ask"` | `"deny"`), not pattern-based rules.

## Command Configuration

### `command`

- **Type**: `object`
- **Description**: Custom slash commands

```jsonc
{
  "command": {
    "test": {
      "template": "Run full test suite and show coverage report",
      "description": "Run tests",
      "agent": "build", // Optional: specify agent
      "model": "anthropic/claude-haiku-4-5", // Optional: specify model
      "subtask": false, // Run as subtask
    },
    "component": {
      "template": "Create React component named $ARGUMENTS",
      "description": "Create component",
    },
  },
}
```

#### Template Variables

- `$ARGUMENTS` - Command arguments

## Keybind Configuration

### `keybinds`

- **Type**: `object`
- **Description**: Custom keybind configuration. Use `"none"` to disable a keybind.

#### Common Keybinds

```jsonc
{
  "keybinds": {
    // Leader key
    "leader": "ctrl+x", // Default: ctrl+x

    // App control
    "app_exit": "ctrl+c,ctrl+d,<leader>q",

    // Session management
    "session_new": "<leader>n",
    "session_list": "<leader>l",
    "session_timeline": "<leader>g",
    "session_rename": "ctrl+r",
    "session_delete": "ctrl+d",
    "session_share": "none",
    "session_unshare": "none",
    "session_compact": "<leader>c",
    "session_interrupt": "escape",
    "session_export": "<leader>x",
    "session_fork": "none",
    "session_child_cycle": "<leader>right",
    "session_child_cycle_reverse": "<leader>left",
    "session_parent": "<leader>up",

    // Stash management
    "stash_delete": "ctrl+d",

    // Model and agent
    "model_list": "<leader>m",
    "model_cycle_recent": "f2",
    "model_cycle_recent_reverse": "shift+f2",
    "model_cycle_favorite": "none",
    "model_cycle_favorite_reverse": "none",
    "model_provider_list": "ctrl+a",
    "model_favorite_toggle": "ctrl+f",
    "agent_list": "<leader>a",
    "agent_cycle": "tab",
    "agent_cycle_reverse": "shift+tab",
    "variant_cycle": "ctrl+t",
    "command_list": "ctrl+p",

    // Input control
    "input_submit": "return",
    "input_newline": "shift+return,ctrl+return,alt+return,ctrl+j",
    "input_clear": "ctrl+c",
    "input_paste": "ctrl+v",

    // Message navigation
    "messages_page_up": "pageup,ctrl+alt+b",
    "messages_page_down": "pagedown,ctrl+alt+f",
    "messages_line_up": "ctrl+alt+y",
    "messages_line_down": "ctrl+alt+e",
    "messages_half_page_up": "ctrl+alt+u",
    "messages_half_page_down": "ctrl+alt+d",
    "messages_first": "ctrl+g,home",
    "messages_last": "ctrl+alt+g,end",
    "messages_next": "none",
    "messages_previous": "none",
    "messages_last_user": "none",
    "messages_copy": "<leader>y",
    "messages_undo": "<leader>u",
    "messages_redo": "<leader>r",
    "messages_toggle_conceal": "<leader>h",

    // History navigation
    "history_previous": "up",
    "history_next": "down",

    // UI control
    "sidebar_toggle": "<leader>b",
    "scrollbar_toggle": "none",
    "username_toggle": "none",
    "theme_list": "<leader>t",
    "editor_open": "<leader>e",
    "status_view": "<leader>s",
    "tool_details": "none",
    "tips_toggle": "<leader>h",
    "display_thinking": "none",
    "terminal_suspend": "ctrl+z",
    "terminal_title_toggle": "none",
  },
}
```

#### Complete Keybind List

The above covers the most commonly customized keybinds. OpenCode also supports extensive input editing keybinds (cursor movement, selection, word operations, etc.) with Emacs-style defaults. See official documentation for the full list:
https://opencode.ai/docs/keybinds/

## TUI Configuration

### `tui`

- **Type**: `object`
- **Description**: Terminal UI specific settings

```jsonc
{
  "tui": {
    "scroll_speed": 3, // Scroll speed multiplier (minimum: 0.001)
    "scroll_acceleration": {
      "enabled": true, // macOS-style inertial scrolling
    },
    "diff_style": "auto", // "auto" | "stacked"
  },
}
```

#### Option Descriptions

- `scroll_speed` - Mouse wheel speed multiplier (effective when `scroll_acceleration.enabled` is `false`)
- `scroll_acceleration.enabled` - Enable inertial scrolling (higher priority than `scroll_speed`)
- `diff_style` - Diff rendering style
  - `"auto"` - Adaptive based on terminal width
  - `"stacked"` - Always show single column

## Server Configuration

### `server`

- **Type**: `object`
- **Description**: Server configuration for `opencode serve` and `opencode web` commands

> **Important**: The `server` object controls network behavior like port, hostname, mDNS, and CORS. HTTP basic auth is **not** configured here; it is controlled by environment variables `OPENCODE_SERVER_PASSWORD` and `OPENCODE_SERVER_USERNAME`. See [Environment Variables](#environment-variables).

```jsonc
{
  "server": {
    "port": 4096, // Listen port
    "hostname": "0.0.0.0", // Listen address
    "mdns": true, // Enable mDNS service discovery
    "mdnsDomain": "myproject.local", // Custom mDNS domain (default: opencode.local)
    "cors": [
      // CORS allowed origins
      "http://localhost:5173",
      "https://app.example.com",
    ],
  },
}
```

## Plugins & Skills

### `plugin`

- **Type**: `string[]`
- **Description**: List of plugins to load

```jsonc
{
  "plugin": [
    "opencode-helicone-session", // npm package
    "@my-org/custom-plugin", // Scoped package
    "opencode-skills@1.2.3", // Specific version
    "file:///absolute/path/to/plugin.ts", // Local file
  ],
}
```

#### Plugin Discovery

OpenCode automatically scans for plugins in:

- `.opencode/plugin/*.{ts,js}`
- `.opencode/plugins/*.{ts,js}`
- `~/.config/opencode/plugin/*.{ts,js}`
- `~/.config/opencode/plugins/*.{ts,js}`
- `~/.opencode/plugin/*.{ts,js}`
- `~/.opencode/plugins/*.{ts,js}`

### `skills`

- **Type**: `object`
- **Description**: Skills configuration

```jsonc
{
  "skills": {
    "paths": [
      // Additional skill directories
      "/path/to/skills",
      "~/my-skills",
    ],
    "urls": [
      // Remote skill URLs
      "https://example.com/.well-known/skills/",
    ],
  },
}
```

## MCP Servers

### `mcp`

- **Type**: `object`
- **Description**: Model Context Protocol server configuration. Each MCP server must specify a `type` field.

#### Local stdio MCP

```jsonc
{
  "mcp": {
    "my-mcp": {
      "type": "local",
      "command": ["npx", "-y", "my-mcp-server"], // Command and args as a single array
      "environment": {
        // Environment variables (note: "environment", not "env")
        "API_KEY": "{env:MY_API_KEY}",
      },
      "enabled": true, // Enable/disable (default: true)
      "timeout": 5000, // Request timeout in ms (default: 5000)
    },
  },
}
```

#### Remote HTTP MCP

```jsonc
{
  "mcp": {
    "remote-mcp": {
      "type": "remote",
      "url": "https://mcp.example.com/sse",
      "headers": {
        // Custom request headers
        "Authorization": "Bearer {env:MCP_TOKEN}",
      },
      "oauth": {
        // OAuth authentication (optional)
        "clientId": "my-client-id",
        "clientSecret": "{env:OAUTH_SECRET}",
        "scope": "read write",
      },
      // Set "oauth": false to disable OAuth auto-detection
      "enabled": true,
      "timeout": 5000,
    },
  },
}
```

#### MCP Server Options

**Local (`type: "local"`)**:

- `type` - Must be `"local"`
- `command` - Command and arguments as a string array (e.g., `["npx", "-y", "server"]`)
- `environment` - Environment variables
- `enabled` - Whether enabled (default: `true`)
- `timeout` - Request timeout in milliseconds (default: 5000)

**Remote (`type: "remote"`)**:

- `type` - Must be `"remote"`
- `url` - Remote MCP endpoint URL
- `headers` - Custom HTTP headers
- `oauth` - OAuth config object, or `false` to disable OAuth auto-detection
- `enabled` - Whether enabled (default: `true`)
- `timeout` - Request timeout in milliseconds (default: 5000)

#### Disable an existing MCP

```jsonc
{
  "mcp": {
    "existing-mcp": {
      "enabled": false,
    },
  },
}
```

## LSP Servers

### `lsp`

- **Type**: `object | false`
- **Description**: Language Server Protocol configuration. Set to `false` to disable all LSP servers.

> **See also**: [Environment Variables](#environment-variables) for runtime LSP behavior flags like `OPENCODE_DISABLE_LSP_DOWNLOAD`, `OPENCODE_EXPERIMENTAL_LSP_TOOL`, and `OPENCODE_EXPERIMENTAL_LSP_TY`.

```jsonc
{
  "lsp": {
    // Disable a built-in LSP server
    "typescript": {
      "disabled": true,
    },
    // Add a custom LSP server
    "my-lsp": {
      "command": ["my-language-server", "--stdio"],
      "extensions": [".myext", ".myx"], // Required for custom servers
      "disabled": false,
      "env": {
        "MY_VAR": "value",
      },
      "initialization": {
        // LSP initialization options
        "settings": {
          "diagnostics": true,
        },
      },
    },
  },
}
```

#### LSP Server Options

- `command` - Command and arguments as a string array
- `extensions` - File extensions this server handles (required for custom servers)
- `disabled` - Disable this server
- `env` - Environment variables
- `initialization` - LSP initialization options passed to the server

> **Note**: MCP servers use `environment` for env vars, while LSP servers use `env`. Formatters also use `environment`. Be careful not to mix them up.

Set `lsp` to `false` to disable all LSP functionality:

```jsonc
{
  "lsp": false,
}
```

## Formatters

### `formatter`

- **Type**: `object | false`
- **Description**: Code formatter configuration. Set to `false` to disable all formatters.

```jsonc
{
  "formatter": {
    "prettier": {
      "disabled": true, // Disable built-in Prettier
    },
    "custom-prettier": {
      "command": ["npx", "prettier", "--write", "$FILE"],
      "environment": {
        "NODE_ENV": "development",
      },
      "extensions": [".js", ".ts", ".jsx", ".tsx"],
    },
  },
}
```

#### Formatter Options

- `disabled` - Disable this formatter
- `command` - Execution command (`$FILE` will be replaced with file path)
- `environment` - Environment variables
- `extensions` - Supported file extensions

## Advanced Configuration

### `instructions`

- **Type**: `string[]`
- **Description**: Global instruction file paths or glob patterns

```jsonc
{
  "instructions": [
    "CONTRIBUTING.md",
    "docs/guidelines.md",
    ".cursor/rules/*.md",
  ],
}
```

### `watcher`

- **Type**: `object`
- **Description**: File watcher configuration

> **See also**: [Environment Variables](#environment-variables) for watcher-related runtime toggles like `OPENCODE_EXPERIMENTAL_FILEWATCHER` and `OPENCODE_EXPERIMENTAL_DISABLE_FILEWATCHER`.

```jsonc
{
  "watcher": {
    "ignore": ["node_modules/**", "dist/**", ".git/**"],
  },
}
```

### `compaction`

- **Type**: `object`
- **Description**: Context compaction configuration

```jsonc
{
  "compaction": {
    "auto": true, // Auto compaction (default: true)
    "prune": true, // Delete old tool outputs (default: true)
    "reserved": 10000, // Reserved token buffer
  },
}
```

### `enterprise`

- **Type**: `object`
- **Description**: Enterprise configuration

```jsonc
{
  "enterprise": {
    "url": "https://enterprise.example.com",
  },
}
```

## Experimental Features

### `experimental`

- **Type**: `object`
- **Description**: Experimental feature configuration (may change or be removed at any time)

```jsonc
{
  "experimental": {
    "batch_tool": true, // Enable batch operations
    "openTelemetry": true, // Enable OpenTelemetry spans for AI SDK calls
    "disable_paste_summary": false, // Disable paste auto-summary
    "continue_loop_on_deny": true, // Continue thinking when tool denied
    "primary_tools": ["bash"], // Tools only available to primary agents
    "mcp_timeout": 30000, // Global MCP timeout (milliseconds)
  },
}
```

## Variable Substitution

Configuration files support variable substitution:

Use variable substitution when a value logically belongs in config, but should not be hardcoded there.

- Use **direct environment variables** when you want to change OpenCode runtime behavior itself at startup, such as server auth, config loading, LSP download behavior, model-source selection, or feature flags.
- Use **`{env:VAR}` inside config files** when the setting belongs in JSON structure, but the value is secret or deployment-specific.
- Use **`{file:path}`** when a large value or secret should come from a file rather than an env var.

### Environment Variables

```jsonc
{
  "model": "{env:OPENCODE_MODEL}",
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}",
      },
    },
  },
}
```

### File Contents

```jsonc
{
  "instructions": ["./custom-instructions.md"],
  "provider": {
    "openai": {
      "options": {
        "apiKey": "{file:~/.secrets/openai-key}",
      },
    },
  },
}
```

## Environment Variables

Environment variables are part of OpenCode configuration, not just an implementation detail. They matter in three major situations:

1. **Startup-time overrides** — choose a different config file, config directory, or inline config without editing JSON files
2. **Runtime behavior toggles** — enable/disable features like LSP auto-download, sharing, file watching, or basic auth
3. **Secrets and automation** — inject provider credentials and environment-specific values in CI, containers, remote execution, or ephemeral sessions

If you searched this document for a setting and could not find it in the JSON schema sections, check here before assuming OpenCode does not support it.

Not all environment variables play the same role. Use this distinction when answering configuration questions:

| Role                         | Meaning                                              | Examples                                                                                    |
| ---------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Config-loading env vars      | Change how OpenCode discovers or injects config      | `OPENCODE_CONFIG`, `OPENCODE_TUI_CONFIG`, `OPENCODE_CONFIG_DIR`, `OPENCODE_CONFIG_CONTENT`  |
| Runtime behavior env vars    | Change how OpenCode behaves at runtime               | `OPENCODE_SERVER_PASSWORD`, `OPENCODE_DISABLE_LSP_DOWNLOAD`, `OPENCODE_DISABLE_AUTOCOMPACT` |
| Provider credential env vars | Supply values used by provider config/authentication | `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `AWS_PROFILE`, `GOOGLE_APPLICATION_CREDENTIALS`      |

### When to use env vars vs config files

Prefer **config files** when:

- the setting should be persistent
- the setting should be checked into a repo
- the setting is structural, like agents, permissions, commands, LSP config, MCP config, or formatter config

Prefer **environment variables** when:

- the value is secret
- the setting only matters for one run, CI job, or shell session
- the behavior is a startup/runtime toggle rather than a schema field
- the setting controls how OpenCode loads configuration itself

Prefer **`{env:VAR}` inside config** when:

- the config shape belongs in JSON, but the actual value should come from the environment
- for example, provider API keys, bearer tokens, file paths, or deploy-specific URLs

### Config-loading and runtime override variables

These variables change **where OpenCode loads configuration from** or inject high-priority config at startup.

#### `OPENCODE_CONFIG`

- **Type**: `string`
- **Role**: `config-loading`
- **Purpose**: Path to an additional custom config file
- **When to use**: Use this when you want to launch OpenCode with a different `opencode.json` without changing the current project or global config
- **Effect**: Loaded after global config and before project config

```bash
OPENCODE_CONFIG=/path/to/custom-opencode.json opencode
```

#### `OPENCODE_TUI_CONFIG`

- **Type**: `string`
- **Role**: `config-loading`
- **Purpose**: Path to a custom TUI config file
- **When to use**: Use this when you want to switch TUI-specific settings such as theme, keybinds, scroll behavior, or diff display without touching the default `tui.json`
- **Related config**: `tui`

```bash
OPENCODE_TUI_CONFIG=/path/to/tui.json opencode
```

#### `OPENCODE_CONFIG_DIR`

- **Type**: `string`
- **Role**: `config-loading`
- **Purpose**: Additional config directory for config-adjacent resources
- **When to use**: Use this when you want a portable OpenCode config bundle that includes agents, commands, plugins, and other config-related files outside the project tree
- **Effect**: OpenCode scans this directory similarly to `.opencode/`; it affects more than just JSON config
- **Related config**: config discovery, `.opencode/`, plugins, skills, instructions

```bash
OPENCODE_CONFIG_DIR=/path/to/opencode-config-kit opencode
```

#### `OPENCODE_CONFIG_CONTENT`

- **Type**: `string`
- **Role**: `config-loading`
- **Purpose**: Inline JSON configuration content
- **When to use**: Best for CI, wrappers, embedded launchers, or automation where writing a temporary config file is inconvenient
- **Effect**: High-priority non-managed config layer loaded late in config resolution

```bash
OPENCODE_CONFIG_CONTENT='{"model":"anthropic/claude-sonnet-4-5","share":"disabled"}' opencode
```

#### `OPENCODE_PERMISSION`

- **Type**: `string`
- **Role**: `config-loading`
- **Purpose**: Inline JSON permission override
- **When to use**: Useful in CI, automation, tests, or isolated runs where you want to force a specific permission profile without editing config files
- **Related config**: `permission`

```bash
OPENCODE_PERMISSION='{"bash":"allow","edit":"deny"}' opencode
```

#### `OPENCODE_DISABLE_PROJECT_CONFIG`

- **Type**: `boolean`
- **Role**: `config-loading`
- **Purpose**: Disable project-level config loading
- **When to use**: Useful when debugging config issues, isolating behavior in CI, or intentionally ignoring a repository's `opencode.json`, `.opencode/`, and related project-level config assets
- **Effect**: Project config discovery is skipped; this can also affect project-level instruction discovery behavior

```bash
OPENCODE_DISABLE_PROJECT_CONFIG=1 opencode
```

### Server and sharing variables

These variables control sharing and server auth behavior that users often expect to find in JSON config, but which are currently env-driven.

#### `OPENCODE_SERVER_PASSWORD`

- **Type**: `string`
- **Role**: `runtime-behavior`
- **Purpose**: Enable HTTP basic auth for `opencode serve` and `opencode web`
- **When to use**: Use this whenever the server is reachable by anything other than yourself on localhost
- **Effect**: If unset, the server runs without auth and only emits a warning
- **Related config**: `server` (network only; auth itself is env-controlled)

```bash
OPENCODE_SERVER_PASSWORD=secret opencode serve
```

#### `OPENCODE_SERVER_USERNAME`

- **Type**: `string`
- **Default**: `opencode`
- **Role**: `runtime-behavior`
- **Purpose**: Override the basic auth username used with `OPENCODE_SERVER_PASSWORD`
- **Related config**: `server`

```bash
OPENCODE_SERVER_USERNAME=admin OPENCODE_SERVER_PASSWORD=secret opencode web
```

#### `OPENCODE_AUTO_SHARE`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Automatically share new sessions
- **When to use**: Useful in collaborative environments where every root session should immediately become shareable
- **Relationship to JSON config**: Similar in spirit to `"share": "auto"`, but controlled at runtime
- **Related config**: `share`

#### `OPENCODE_DISABLE_SHARE`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Disable sharing functionality entirely
- **When to use**: Useful in restricted environments, internal-only deployments, or privacy-sensitive automation
- **Related config**: `share`

### Model discovery and provider-selection variables

These variables control how OpenCode discovers model metadata and whether certain model categories are available.

#### `OPENCODE_MODELS_URL`

- **Type**: `string`
- **Role**: `runtime-behavior`
- **Purpose**: Override the remote URL used to fetch model metadata
- **When to use**: Use this if you proxy or mirror the model metadata source
- **Related config**: `provider`, model catalog discovery

#### `OPENCODE_MODELS_PATH`

- **Type**: `string`
- **Role**: `runtime-behavior`
- **Purpose**: Load model metadata from a local file instead of relying on the default fetch/cache flow
- **When to use**: Useful for offline environments, reproducible testing, local snapshots, or custom provider/model catalogs
- **Related config**: `provider`, model catalog discovery

#### `OPENCODE_DISABLE_MODELS_FETCH`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Disable remote model metadata fetches
- **When to use**: Useful for offline use, deterministic automation, or preventing network access during startup
- **Related config**: `provider`, model catalog discovery

#### `OPENCODE_ENABLE_EXPERIMENTAL_MODELS`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Make experimental/alpha models available
- **When to use**: Only when you intentionally want unstable or preview model entries to appear
- **Related config**: `provider`, model selection

### Tooling, shell, LSP, and behavior toggles

These variables affect behavior that is not usually represented as stable JSON schema fields.

#### `OPENCODE_DISABLE_LSP_DOWNLOAD`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Disable automatic download/installation of built-in LSP servers
- **When to use**: Recommended in CI, offline environments, enterprise-restricted machines, or anywhere you do not want OpenCode implicitly installing language tooling
- **Related config**: `lsp`

#### `OPENCODE_ENABLE_EXA`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Enable Exa-backed web search / code search tools even when they would not otherwise be exposed by provider defaults
- **When to use**: Advanced workflows that explicitly want those tools available

#### `OPENCODE_GIT_BASH_PATH`

- **Type**: `string`
- **Role**: `runtime-behavior`
- **Purpose**: Path to Git Bash on Windows
- **When to use**: Use this when shell detection fails on Windows or when you need OpenCode to use a specific Git Bash installation

#### `OPENCODE_DISABLE_AUTOCOMPACT`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Disable automatic context compaction
- **When to use**: Useful when debugging prompt/context behavior or when you do not want OpenCode to compact automatically
- **Related config**: `compaction.auto`

#### `OPENCODE_DISABLE_PRUNE`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Disable pruning of old tool outputs and related context cleanup
- **When to use**: Useful when trying to preserve more session history at the cost of more context/storage usage
- **Related config**: `compaction.prune`

#### `OPENCODE_DISABLE_TERMINAL_TITLE`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Disable automatic terminal title updates
- **When to use**: Useful when your terminal title is managed externally or the updates are distracting

#### `OPENCODE_DISABLE_FILETIME_CHECK`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Disable file time checking optimizations
- **When to use**: Useful when diagnosing file-change detection issues or working on unusual filesystems

#### `OPENCODE_DISABLE_DEFAULT_PLUGINS`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Disable loading of default plugins
- **When to use**: Helpful for debugging, isolation, testing, or minimal environments
- **Related config**: `plugin`

#### `OPENCODE_DISABLE_CLAUDE_CODE`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Disable Claude Code compatibility loading entirely
- **Effect**: Prevents prompt/skills loading from `.claude` integration paths

#### `OPENCODE_DISABLE_CLAUDE_CODE_PROMPT`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Disable reading `~/.claude/CLAUDE.md`

#### `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS`

- **Type**: `boolean`
- **Role**: `runtime-behavior`
- **Purpose**: Disable loading `.claude/skills`

#### `OPENCODE_CLIENT`

- **Type**: `string`
- **Default**: `cli`
- **Role**: `runtime-behavior`
- **Purpose**: Identify the active client type
- **Notes**: This is usually not something end users set manually, but it matters for tool exposure and client-specific behavior in embedded/integration scenarios

### Experimental and advanced variables

These variables are mainly for advanced debugging, feature-gating, or unstable functionality. Most users do not need them day to day, but they still matter because they can explain behavior that is otherwise invisible from `opencode.json`.

#### Core experimental feature flags

| Variable                                        | Purpose                                                |
| ----------------------------------------------- | ------------------------------------------------------ |
| `OPENCODE_EXPERIMENTAL`                         | Enable a broad set of experimental features            |
| `OPENCODE_EXPERIMENTAL_ICON_DISCOVERY`          | Enable project icon discovery                          |
| `OPENCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT`  | Disable copy-on-select behavior in the TUI             |
| `OPENCODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS` | Override the default bash tool timeout                 |
| `OPENCODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX`        | Override default output token limit                    |
| `OPENCODE_EXPERIMENTAL_FILEWATCHER`             | Enable directory-wide file watcher behavior            |
| `OPENCODE_EXPERIMENTAL_DISABLE_FILEWATCHER`     | Disable file watcher behavior entirely                 |
| `OPENCODE_EXPERIMENTAL_OXFMT`                   | Enable the `oxfmt` formatter                           |
| `OPENCODE_EXPERIMENTAL_LSP_TOOL`                | Expose the experimental LSP tool                       |
| `OPENCODE_EXPERIMENTAL_LSP_TY`                  | Enable TY-based LSP behavior for relevant Python flows |
| `OPENCODE_EXPERIMENTAL_MARKDOWN`                | Control experimental markdown behavior                 |
| `OPENCODE_EXPERIMENTAL_PLAN_MODE`               | Enable plan mode behavior                              |
| `OPENCODE_EXPERIMENTAL_WORKSPACES`              | Enable experimental workspaces-related behavior        |
| `OPENCODE_EXPERIMENTAL_EXA`                     | Enable experimental Exa behavior                       |

#### Advanced operational flags

| Variable                        | Purpose                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `OPENCODE_ENABLE_QUESTION_TOOL` | Force-enable the `question` tool in contexts where it may otherwise be omitted |
| `OPENCODE_DB`                   | Override the SQLite database file location                                     |
| `OPENCODE_DISABLE_CHANNEL_DB`   | Disable per-channel database separation                                        |
| `OPENCODE_SKIP_MIGRATIONS`      | Skip database migrations (advanced/debugging only)                             |
| `OPENCODE_STRICT_CONFIG_DEPS`   | Treat config dependency installation failures as hard errors                   |
| `OPENCODE_FAKE_VCS`             | Fake the VCS provider, mainly for testing/debugging                            |
| `OPENCODE_ALWAYS_NOTIFY_UPDATE` | Always notify about updates when supported                                     |

### Provider credential environment variables

Provider credentials are also configuration, but they do not belong in a giant inlined list here because OpenCode supports many providers and the list changes over time.

These variables should be treated as **value suppliers** for provider config, not as general-purpose `OPENCODE_*` runtime flags.

Use this pattern:

1. Configure the provider structurally in `opencode.json`
2. Put secrets in env vars
3. Reference them with `{env:VAR}` where appropriate

Common examples:

- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `GEMINI_API_KEY`
- `AWS_PROFILE`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_BEARER_TOKEN_BEDROCK`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `GOOGLE_CLOUD_PROJECT`
- `GITLAB_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_KEY`

Recommended pattern:

```jsonc
{
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}",
      },
    },
    "amazon-bedrock": {
      "options": {
        "profile": "{env:AWS_PROFILE}",
        "region": "{env:AWS_REGION}",
      },
    },
  },
}
```

For provider-specific authentication details, use official provider documentation together with these OpenCode docs:

- General provider reference: https://opencode.ai/docs/providers/
- Config variable substitution: https://opencode.ai/docs/config/#env-vars
- Bedrock-specific examples: https://opencode.ai/docs/providers/#amazon-bedrock

### Common env-var examples

```bash
# Launch with an alternative config file
OPENCODE_CONFIG=/path/to/custom-opencode.json opencode

# Inject inline config in CI
OPENCODE_CONFIG_CONTENT='{"model":"anthropic/claude-sonnet-4-5","share":"disabled"}' opencode run "Summarize the repo"

# Override permissions temporarily
OPENCODE_PERMISSION='{"bash":"allow","edit":"deny"}' opencode

# Disable project config for isolated runs
OPENCODE_DISABLE_PROJECT_CONFIG=1 opencode

# Protect the HTTP server
OPENCODE_SERVER_PASSWORD=secret OPENCODE_SERVER_USERNAME=admin opencode serve

# Disable LSP auto-install behavior
OPENCODE_DISABLE_LSP_DOWNLOAD=1 opencode
```

## Scope of this Reference

This document is meant to be configuration-oriented and source-backed.

- It documents core OpenCode config schema directly.
- It also documents important environment variables that materially affect OpenCode behavior.
- It does **not** attempt to statically enumerate every provider credential env var for every provider forever.
- Provider credential env vars are documented by pattern and common examples.
- Internal test/runtime-only env vars may exist in source, but only user-relevant behavior-affecting ones should be treated as primary configuration surface.

## Complete Configuration Example

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  // Basic settings
  "theme": "opencode",
  "username": "Alice",
  "autoupdate": true,
  "share": "manual",

  // Model configuration
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",
  "default_agent": "build",

  // Provider configuration
  "provider": {
    "anthropic": {
      "options": {
        "timeout": 600000,
        "setCacheKey": true,
      },
    },
  },

  // Agent configuration
  "agent": {
    "code-reviewer": {
      "description": "Code review expert",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-5",
      "prompt": "You are a code review expert focused on security, performance, and maintainability.",
      "permission": {
        "edit": "deny",
        "bash": "deny",
      },
    },
  },

  // Permission configuration (supports pattern-based rules)
  "permission": {
    "edit": "ask",
    "bash": {
      "rm -rf*": "deny",
      "*": "ask",
    },
    "webfetch": "allow",
  },

  // Command configuration
  "command": {
    "test": {
      "template": "Run full test suite and show coverage report",
      "description": "Run tests",
      "agent": "build",
    },
  },

  // TUI configuration
  "tui": {
    "scroll_speed": 3,
    "scroll_acceleration": {
      "enabled": true,
    },
    "diff_style": "auto",
  },

  // Server configuration
  "server": {
    "port": 4096,
    "hostname": "0.0.0.0",
    "mdns": true,
  },

  // Plugins and skills
  "plugin": ["opencode-helicone-session"],
  "skills": {
    "paths": ["~/my-skills"],
  },

  // MCP servers
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/allowed",
      ],
    },
  },

  // LSP servers
  "lsp": {
    "my-lsp": {
      "command": ["my-language-server", "--stdio"],
      "extensions": [".myext"],
    },
  },

  // Advanced configuration
  "instructions": ["CONTRIBUTING.md"],
  "watcher": {
    "ignore": ["node_modules/**", "dist/**"],
  },
  "compaction": {
    "auto": true,
    "prune": true,
    "reserved": 10000,
  },
}
```

## Reference Resources

Official docs are useful, but not exhaustive for environment variables and advanced operational flags. When behavior appears missing from config docs, prefer the schema plus the environment-variable guidance in this document.

- **Official Documentation**: https://opencode.ai/docs/config/
- **JSON Schema**: https://opencode.ai/config.json
- **GitHub Repository**: https://github.com/anomalyco/opencode
- **Discord Community**: https://opencode.ai/discord
