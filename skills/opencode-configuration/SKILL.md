---
name: opencode-configuration
description: Use when configuring OpenCode (opencode.json), setting up providers, agents, MCP servers, LSP servers, permissions, or any opencode.json configuration questions
---

# OpenCode Configuration Reference

## Overview

Complete reference for OpenCode configuration file (opencode.json). Covers all configuration options including models, providers, agents, permissions, commands, MCP servers, LSP servers, formatters, and advanced settings.

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

## Environment Variable Overrides

OpenCode supports several environment variables that override configuration file settings. These are useful for CI/CD pipelines and automation:

| Variable | Description |
| --- | --- |
| `OPENCODE_CONFIG` | Path to a custom configuration file |
| `OPENCODE_CONFIG_CONTENT` | Inline JSON configuration content (highest non-managed priority) |
| `OPENCODE_CONFIG_DIR` | Additional directory to scan for agents, commands, plugins, and config |
| `OPENCODE_PERMISSION` | JSON string to override permission settings |
| `OPENCODE_DISABLE_PROJECT_CONFIG` | Disable loading project-level configuration |
| `OPENCODE_DISABLE_AUTOCOMPACT` | Disable automatic context compaction |
| `OPENCODE_DISABLE_PRUNE` | Disable pruning of old tool outputs |

```bash
# Example: Override permissions in CI
OPENCODE_PERMISSION='{"bash":"allow","edit":"allow"}' opencode

# Example: Disable project config for isolated testing
OPENCODE_DISABLE_PROJECT_CONFIG=1 opencode
```

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
      "*": "ask"
    },
    "webfetch": "allow"
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

- **Official Documentation**: https://opencode.ai/docs/config/
- **JSON Schema**: https://opencode.ai/config.json
- **GitHub Repository**: https://github.com/anomalyco/opencode
- **Discord Community**: https://opencode.ai/discord
