---
name: opencode-sdk
description: Use when programmatically controlling OpenCode server, writing code with @opencode-ai/sdk, building plugins/tools that interact with OpenCode, or need SDK API/type reference
---

# OpenCode SDK Reference

## Overview

Complete reference for OpenCode SDK (@opencode-ai/sdk) - a type-safe JavaScript/TypeScript client library for programmatically controlling OpenCode server. Also covers direct HTTP API access with authentication for non-JavaScript environments.

## When to Use

- Writing code that uses `@opencode-ai/sdk` (JavaScript/TypeScript)
- Questions about OpenCode SDK API methods, types, or usage
- Need to understand Session, Message, Event, or other SDK types
- Building plugins or tools that interact with OpenCode server
- Need examples of SDK usage patterns
- Looking for type definition file locations
- Need to call OpenCode HTTP API directly (curl, Python, Go, etc.)
- Questions about authentication or HTTP endpoints

## Quick Reference

| Task | SDK Method | HTTP Endpoint | Example |
|------|------------|---------------|---------|
| Health check | `client.global.health()` | `GET /global/health` | `curl -u user:pass http://localhost:4096/global/health` |
| Create session | `client.session.create()` | `POST /session` | `await client.session.create({ body: { title: "My Session" } })` |
| Send prompt | `client.session.prompt()` | `POST /session/{id}/message` | `await client.session.prompt({ path: { id }, body: { parts: [...] } })` |
| List sessions | `client.session.list()` | `GET /session` | `await client.session.list()` |
| Subscribe events | `client.event.subscribe()` | `GET /global/event` (SSE) | `const events = await client.event.subscribe()` |
| Get current project | `client.project.current()` | `GET /project/current` | `await client.project.current()` |
| Read file | `client.file.read()` | `GET /file?path=...` | `await client.file.read({ query: { path: "src/index.ts" } })` |
| Search files | `client.find.files()` | `GET /find/file?query=...` | `await client.find.files({ query: { query: "*.ts" } })` |
| Show toast | `client.tui.showToast()` | `POST /tui/show-toast` | `await client.tui.showToast({ body: { message: "Done" } })` |

**Type Definition Locations:**
- Main path: `~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/`
- Core files: `types.gen.d.ts` (data types), `sdk.gen.d.ts` (API methods)

---

## HTTP API Direct Access

The SDK is a wrapper around OpenCode's HTTP REST API. You can call these endpoints directly with curl or any HTTP client.

### Authentication

OpenCode server uses **HTTP Basic Authentication**.

**Credentials via environment variables:**
```bash
# Set in systemd service or shell
export OPENCODE_SERVER_USERNAME="your-username"
export OPENCODE_SERVER_PASSWORD="your-password"
```

**Using curl:**
```bash
# With -u flag
curl -u username:password http://localhost:4096/global/health

# With Authorization header
curl -H "Authorization: Basic $(echo -n 'username:password' | base64)" \
  http://localhost:4096/global/health
```

**Response when unauthorized:**
```
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic realm="Secure Area"
```

### Complete HTTP API Reference

All endpoints use base URL: `http://localhost:4096` (default port)

#### Global APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/global/health` | Health check (returns `{healthy: true, version: "1.2.15"}`) |
| GET | `/global/config` | Get global configuration |
| PATCH | `/global/config` | Update global configuration |
| GET | `/global/event` | Subscribe to global events (SSE stream) |
| POST | `/global/dispose` | Dispose all instances |

#### Session APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/session` | List all sessions |
| POST | `/session` | Create new session |
| GET | `/session/status` | Get status of all sessions |
| GET | `/session/{sessionID}` | Get session details |
| PATCH | `/session/{sessionID}` | Update session (title, etc.) |
| DELETE | `/session/{sessionID}` | Delete session |
| GET | `/session/{sessionID}/children` | Get child sessions (forks) |
| GET | `/session/{sessionID}/todo` | Get session TODO list |
| POST | `/session/{sessionID}/init` | Initialize AGENTS.md |
| POST | `/session/{sessionID}/fork` | Fork session at message point |
| POST | `/session/{sessionID}/abort` | Abort running session |
| POST | `/session/{sessionID}/share` | Create share link |
| DELETE | `/session/{sessionID}/share` | Remove share link |
| GET | `/session/{sessionID}/diff` | Get file changes from message |
| POST | `/session/{sessionID}/summarize` | Generate session summary |
| GET | `/session/{sessionID}/message` | Get all messages |
| POST | `/session/{sessionID}/message` | Send prompt (streaming) |
| GET | `/session/{sessionID}/message/{messageID}` | Get specific message |
| DELETE | `/session/{sessionID}/message/{messageID}` | Delete message |
| POST | `/session/{sessionID}/prompt_async` | Send prompt async |
| POST | `/session/{sessionID}/command` | Execute command |
| POST | `/session/{sessionID}/shell` | Execute shell command |
| POST | `/session/{sessionID}/revert` | Revert to message |
| POST | `/session/{sessionID}/unrevert` | Undo revert |
| PATCH | `/session/{sessionID}/message/{messageID}/part/{partID}` | Update message part |
| DELETE | `/session/{sessionID}/message/{messageID}/part/{partID}` | Delete message part |
| GET | `/session/{sessionID}/permissions/{permissionID}` | Get permission request |

#### Project APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/project` | List all projects |
| GET | `/project/current` | Get current project |
| PATCH | `/project/{projectID}` | Update project properties |

#### File & Find APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/file` | Read file content |
| GET | `/file/content` | Get file content (alternative) |
| GET | `/file/status` | Get git status of files |
| GET | `/find` | Search file content (grep) |
| GET | `/find/file` | Find files by name pattern |
| GET | `/find/symbol` | Find code symbols |

#### Config APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/config` | Get configuration |
| PATCH | `/config` | Update configuration |
| GET | `/config/providers` | Get AI provider list |

#### Auth APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/auth/{providerID}` | Set API key for provider |
| DELETE | `/auth/{providerID}` | Remove auth credentials |

#### Provider APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/provider` | List all AI providers |
| GET | `/provider/auth` | Get auth methods for providers |
| GET | `/provider/{providerID}/oauth/authorize` | Start OAuth flow |
| GET | `/provider/{providerID}/oauth/callback` | OAuth callback |

#### Permission & Question APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/permission` | List pending permissions |
| POST | `/permission/{requestID}/reply` | Reply to permission request |
| GET | `/question` | List pending questions |
| POST | `/question/{requestID}/reply` | Reply to question |
| POST | `/question/{requestID}/reject` | Reject question |

#### TUI (Terminal UI) APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tui/append-prompt` | Append text to prompt input |
| POST | `/tui/submit-prompt` | Submit prompt |
| POST | `/tui/clear-prompt` | Clear prompt input |
| POST | `/tui/show-toast` | Show toast notification |
| POST | `/tui/open-help` | Open help dialog |
| POST | `/tui/open-sessions` | Open sessions dialog |
| POST | `/tui/open-themes` | Open themes dialog |
| POST | `/tui/open-models` | Open models dialog |
| POST | `/tui/execute-command` | Execute command |
| POST | `/tui/publish` | Publish to TUI |
| POST | `/tui/select-session` | Select session |
| GET | `/tui/control/next` | Get next TUI request |
| POST | `/tui/control/response` | Send TUI response |

#### PTY (Pseudo-Terminal) APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pty` | List all PTY sessions |
| POST | `/pty` | Create new PTY session |
| GET | `/pty/{ptyID}` | Get PTY details |
| PATCH | `/pty/{ptyID}` | Update PTY properties |
| DELETE | `/pty/{ptyID}` | Remove PTY session |
| GET | `/pty/{ptyID}/connect` | Connect to PTY (WebSocket) |

#### MCP (Model Context Protocol) APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/mcp` | Get MCP server status |
| POST | `/mcp` | Add MCP server |
| GET | `/mcp/{name}/connect` | Connect to MCP server |
| POST | `/mcp/{name}/disconnect` | Disconnect from MCP server |
| POST | `/mcp/{name}/auth` | Set MCP auth |
| DELETE | `/mcp/{name}/auth` | Remove MCP auth |
| GET | `/mcp/{name}/auth/callback` | MCP OAuth callback |
| POST | `/mcp/{name}/auth/authenticate` | Authenticate MCP |

#### Experimental APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/experimental/tool/ids` | Get all tool IDs |
| GET | `/experimental/tool` | Get tool list with schemas |
| GET | `/experimental/worktree` | List worktrees |
| POST | `/experimental/worktree` | Create worktree |
| DELETE | `/experimental/worktree` | Remove worktree |
| POST | `/experimental/worktree/reset` | Reset worktree |
| GET | `/experimental/session` | List sessions (experimental) |
| GET | `/experimental/resource` | List MCP resources |

#### Other APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/path` | Get current working directory info |
| GET | `/vcs` | Get VCS (git) information |
| GET | `/command` | List available commands |
| POST | `/log` | Send log message |
| GET | `/agent` | List available agents |
| GET | `/skill` | List available skills |
| GET | `/lsp` | Get LSP server status |
| GET | `/formatter` | Get formatter status |
| GET | `/event` | Subscribe to events (SSE) |
| POST | `/instance/dispose` | Dispose current instance |

### HTTP API Examples

**Health check:**
```bash
curl -u username:password http://localhost:4096/global/health
# {"healthy":true,"version":"1.2.15"}
```

**List sessions:**
```bash
curl -u username:password http://localhost:4096/session
```

**Create session:**
```bash
curl -u username:password -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"My Session"}' \
  http://localhost:4096/session
```

**Get current project:**
```bash
curl -u username:password http://localhost:4096/project/current
```

**Search files:**
```bash
curl -u username:password "http://localhost:4096/find/file?query=*.ts"
```

**Subscribe to events (SSE):**
```bash
curl -u username:password -N http://localhost:4096/global/event
# Streams server-sent events
```
---

## Installation

```bash
npm install @opencode-ai/sdk
```

## ⚠️ CRITICAL: Use V2 Client

**The SDK has two versions with different APIs:**

❌ **V1 (Default Export)** - Limited API, missing many methods:
```typescript
import { createOpencodeClient } from "@opencode-ai/sdk"
// client.global.health() does NOT exist in v1!
// Only has: client.global.event()
```

✅ **V2 (Recommended)** - Complete API with all methods:
```typescript
import { createOpencodeClient } from "@opencode-ai/sdk/v2/client"
// Has full API: health(), dispose(), config, etc.
```

**Why this matters:**
- The default export (`@opencode-ai/sdk`) points to v1, which is incomplete
- OpenCode's own codebase uses v2
- Type definitions show v2 methods, but v1 runtime doesn't have them
- This causes confusing "method is not a function" errors

**Always use v2 for new code:**
```typescript
// ✅ Correct
import { createOpencodeClient } from "@opencode-ai/sdk/v2/client"

// ❌ Wrong - will have missing methods
import { createOpencodeClient } from "@opencode-ai/sdk"
```

## Quick Start

### Three Usage Modes

**1. Full Mode (Server + Client)**

```typescript
import { createOpencode } from "@opencode-ai/sdk"

const { client, server } = await createOpencode({
  hostname: "127.0.0.1",
  port: 4096,
})

// Use the client
const session = await client.session.create()

// Close the server
server.close()
```

**2. Client-Only Mode (Connect to Existing Server)**

```typescript
import { createOpencodeClient } from "@opencode-ai/sdk/v2/client"

const client = createOpencodeClient({
  baseUrl: "http://localhost:4096",
})
```

**3. Server-Only Mode**

```typescript
import { createOpencodeServer } from "@opencode-ai/sdk"

const server = await createOpencodeServer({
  hostname: "127.0.0.1",
  port: 4096,
})

console.log(`Server running at ${server.url}`)
```

---

## Type Definition File Location Guide

All SDK type definitions are auto-generated from the OpenAPI specification. After installation, type files are located at:

### File Locations

**Most Common Path** (use this first):
```
~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/
```

**Project Local Path** (if installed in a project):
```
./node_modules/@opencode-ai/sdk/dist/v2/gen/
```

### Core Files

#### 1. types.gen.d.ts (~4000 lines)
**Contains all data type definitions**

Main types:
- `Session` - Session object
- `Message` - Message type (UserMessage | AssistantMessage)
- `Part` - Message components (TextPart | FilePart | ToolPart | ReasoningPart, etc.)
- `Event` - Event types (51+ events)
- `Project` - Project object
- `Config` - Configuration object

#### 2. sdk.gen.d.ts (~1100 lines)
**Contains all API method signatures**

Main API modules:
- `OpencodeClient` - Main client class
  - `session` - Session management
  - `project` - Project management
  - `config` - Configuration management
  - `file` - File operations
  - `find` - Search functionality
  - `event` - Event subscription
  - `tui` - Terminal UI control
  - `auth` - Authentication management

#### 3. client.gen.d.ts (~12 lines)
**Client configuration types**

### How to Find Type Definitions

**Finding data types (Session, Message, Event, etc.):**

```bash
# 1. Search for type name
grep -n "^export type Session " ~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts

# 2. Read definition by line number (assuming found at line N, read 30 lines)
sed -n 'N,N+30p' ~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts

# Or use grep to view with context
grep -A 30 "^export type Session = {" ~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts
```

**Finding API method signatures:**

```bash
# Find specific method (e.g., session.prompt)
grep -A 10 "public prompt" ~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/sdk.gen.d.ts
```

**List all event types:**

```bash
grep "^export type Event" ~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts
```

### Naming Conventions

- **Data types**: `Session`, `Message`, `Part`, `Project`
- **Event types**: `Event<Module><Action>` (e.g., `EventSessionCreated`, `EventMessageUpdated`)
- **API responses**: `<Module><Method>Responses` (e.g., `SessionPromptResponses`)
- **API errors**: `<Module><Method>Errors` (e.g., `SessionPromptErrors`)

---

## Session Management

Sessions are the core concept in OpenCode, representing a conversation interaction.

### Session Type Structure

```typescript
// Find complete definition:
// grep -A 30 "^export type Session = {" ~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts

type Session = {
  id: string                    // Session ID
  slug: string                  // URL-friendly identifier
  projectID: string             // Project ID
  directory: string             // Working directory
  parentID?: string             // Parent session ID (when forked)
  
  summary?: {                   // Session summary
    additions: number           // Lines added
    deletions: number           // Lines deleted
    files: number               // Files modified
    diffs?: Array<FileDiff>     // File diffs
  }
  
  share?: {                     // Share information
    url: string                 // Share URL
  }
  
  title: string                 // Session title
  version: string               // OpenCode version
  
  time: {
    created: number             // Creation timestamp
    updated: number             // Update timestamp
    compacting?: number         // Compaction timestamp
    archived?: number           // Archive timestamp
  }
  
  permission?: PermissionRuleset  // Permission rules
  
  revert?: {                    // Revert information
    messageID: string
    partID?: string
    snapshot?: string
    diff?: string
  }
}
```

### Message Type Structure

```typescript
// Union type of UserMessage and AssistantMessage
type Message = UserMessage | AssistantMessage

// User message
type UserMessage = {
  id: string
  sessionID: string
  role: "user"
  time: { created: number }
  format?: OutputFormat         // Structured output format
  agent: string                 // Agent used
  model: {                      // Model used
    providerID: string
    modelID: string
  }
  system?: string               // System prompt
  tools?: { [key: string]: boolean }  // Available tools
}

// AI assistant message
type AssistantMessage = {
  id: string
  sessionID: string
  role: "assistant"
  time: {
    created: number
    completed?: number          // Completion time
  }
  error?: ProviderAuthError | UnknownError | ...  // Error information
  parentID: string              // Parent message ID
  modelID: string
  providerID: string
  mode: string                  // Mode (e.g., "extended-thinking")
  agent: string
  path: {
    cwd: string                 // Current working directory
    root: string                // Project root directory
  }
  summary?: boolean             // Is summary
  cost: number                  // Cost
  tokens: {                     // Token usage
    total?: number
    input: number
    output: number
    reasoning: number
    cache: { read: number; write: number }
  }
  structured?: unknown          // Structured output result
  finish?: string               // Finish reason
}
```

### Part Types (Message Components)

Messages are composed of multiple Parts, each representing different types of content:

```typescript
type Part = 
  | TextPart          // Text content
  | FilePart          // File reference
  | ToolPart          // Tool invocation
  | ReasoningPart     // Reasoning process
  | SubtaskPart       // Subtask
  | StepStartPart     // Step start
  | StepFinishPart    // Step finish
  | SnapshotPart      // Snapshot
  | PatchPart         // Patch
  | AgentPart         // Agent information
  | RetryPart         // Retry information
  | CompactionPart    // Compaction information

// Find all Part type definitions:
// grep "^export type.*Part = {" ~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts
```

### Common Session Methods

#### Create Session

```typescript
const session = await client.session.create({
  body: {
    title: "My Session",
    projectID: "project-id",  // Optional
  }
})

console.log(session.data.id)
```

#### Send Prompt

```typescript
const result = await client.session.prompt({
  path: { id: session.data.id },
  body: {
    model: {
      providerID: "anthropic",
      modelID: "claude-3-5-sonnet-20241022"
    },
    parts: [
      { type: "text", text: "Hello, how are you?" }
    ]
  }
})

// Returns AssistantMessage
console.log(result.data.info.role)  // "assistant"
```

#### Send Prompt with File

```typescript
import { pathToFileURL } from "node:url"

await client.session.prompt({
  path: { id: sessionId },
  body: {
    parts: [
      {
        type: "file",
        mime: "text/plain",
        url: pathToFileURL("./src/index.ts").href,
      },
      {
        type: "text",
        text: "Review this code and suggest improvements"
      }
    ]
  }
})
```

#### Structured Output

Use JSON Schema to get structured JSON responses:

```typescript
const result = await client.session.prompt({
  path: { id: sessionId },
  body: {
    parts: [
      { type: "text", text: "Research Anthropic and provide company info" }
    ],
    format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          company: { type: "string", description: "Company name" },
          founded: { type: "number", description: "Year founded" },
          products: {
            type: "array",
            items: { type: "string" },
            description: "Main products"
          }
        },
        required: ["company", "founded"]
      },
      retryCount: 2  // Retry count on validation failure
    }
  }
})

// Access structured output
console.log(result.data.info.structured)
// { company: "Anthropic", founded: 2021, products: ["Claude", "Claude API"] }
```

#### List Sessions

```typescript
const sessions = await client.session.list()

for (const session of sessions.data) {
  console.log(session.title, session.id)
}
```

#### Get Session Details

```typescript
const session = await client.session.get({
  path: { id: "session-id" }
})
```

#### Get Session Messages

```typescript
const messages = await client.session.messages({
  path: { id: sessionId }
})

for (const msg of messages.data) {
  console.log(msg.info.role, msg.parts.length)
}
```

#### Delete Session

```typescript
await client.session.delete({
  path: { id: sessionId }
})
```

#### Abort Running Session

```typescript
await client.session.abort({
  path: { id: sessionId }
})
```

#### Share Session

```typescript
const shared = await client.session.share({
  path: { id: sessionId }
})

console.log(shared.data.share?.url)  // Share URL
```

#### Unshare Session

```typescript
await client.session.unshare({
  path: { id: sessionId }
})
```

#### Inject Context Only (No AI Response)

Useful for plugin scenarios where you only want to add context without triggering an AI response:

```typescript
await client.session.prompt({
  path: { id: sessionId },
  body: {
    noReply: true,
    parts: [
      { type: "text", text: "Additional context information" }
    ]
  }
})
```

### Find More Session Methods

```bash
# View all methods in Session class
grep "class Session" -A 300 ~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/sdk.gen.d.ts | grep "public "
```

---

## Project Management

Projects represent a workspace (worktree), typically corresponding to a Git repository.

### Project Type Structure

```typescript
// Find complete definition:
// grep -A 20 "^export type Project = {" ~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts

type Project = {
  id: string                    // Project ID
  worktree: string              // Worktree path
  vcs?: "git"                   // Version control system
  name?: string                 // Project name
  
  icon?: {                      // Project icon
    url?: string
    override?: string
    color?: string
  }
  
  commands?: {
    start?: string              // Startup script
  }
  
  time: {
    created: number             // Creation time
    updated: number             // Update time
    initialized?: number        // Initialization time
  }
  
  sandboxes: Array<string>      // Sandbox list
}
```

### Common Project Methods

#### List All Projects

```typescript
const projects = await client.project.list()

for (const project of projects.data) {
  console.log(project.name, project.worktree)
}
```

#### Get Current Project

```typescript
const currentProject = await client.project.current()

console.log(currentProject.data.id)
console.log(currentProject.data.worktree)
```

#### Update Project

```typescript
await client.project.update({
  path: { id: projectId },
  body: {
    name: "New Project Name",
    icon: {
      color: "#FF5733"
    }
  }
})
```

### Find More Project Methods

```bash
# View all methods in Project class
grep "class Project" -A 100 ~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/sdk.gen.d.ts | grep "public "
```

---

## Event Subscription

OpenCode provides real-time event streams via Server-Sent Events (SSE) for monitoring system state changes.

### Event Type Structure

```typescript
// Find complete definition:
// grep -A 5 "^export type GlobalEvent = {" ~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts

type GlobalEvent = {
  directory: string             // Event source directory
  payload: Event                // Event payload
}

// Event is a union type of 51+ event types
type Event = 
  | EventSessionCreated
  | EventSessionUpdated
  | EventSessionDeleted
  | EventMessageUpdated
  | EventMessageRemoved
  | EventPermissionAsked
  | EventPermissionReplied
  | EventFileEdited
  | EventTodoUpdated
  | ... // More event types
```

### Event Categories

**Session-related events:**
- `EventSessionCreated` - Session created
- `EventSessionUpdated` - Session updated
- `EventSessionDeleted` - Session deleted
- `EventSessionStatus` - Session status changed
- `EventSessionIdle` - Session idle
- `EventSessionCompacted` - Session compacted
- `EventSessionDiff` - Session diff
- `EventSessionError` - Session error

**Message-related events:**
- `EventMessageUpdated` - Message updated
- `EventMessageRemoved` - Message removed
- `EventMessagePartUpdated` - Message part updated
- `EventMessagePartDelta` - Message part delta update
- `EventMessagePartRemoved` - Message part removed

**Permission-related events:**
- `EventPermissionAsked` - Permission requested
- `EventPermissionReplied` - Permission replied

**Question-related events:**
- `EventQuestionAsked` - Question asked
- `EventQuestionReplied` - Question replied
- `EventQuestionRejected` - Question rejected

**File-related events:**
- `EventFileEdited` - File edited
- `EventFileWatcherUpdated` - File watcher updated

**Project-related events:**
- `EventProjectUpdated` - Project updated

**System-related events:**
- `EventServerConnected` - Server connected
- `EventServerInstanceDisposed` - Server instance disposed
- `EventInstallationUpdated` - Installation updated
- `EventInstallationUpdateAvailable` - Update available

**Other events:**
- `EventTodoUpdated` - TODO updated
- `EventCommandExecuted` - Command executed
- `EventTuiPromptAppend` - TUI prompt append
- `EventTuiToastShow` - TUI toast show
- `EventLspClientDiagnostics` - LSP diagnostics
- `EventVcsBranchUpdated` - VCS branch updated
- `EventPtyCreated/Updated/Exited/Deleted` - PTY-related events

### Subscribe to Events

```typescript
// Subscribe to global event stream
const events = await client.event.subscribe()

for await (const event of events.stream) {
  console.log("Event type:", event.payload.type)
  console.log("Directory:", event.directory)
  console.log("Properties:", event.payload.properties)
}
```

### Handle Specific Events

```typescript
const events = await client.event.subscribe()

for await (const event of events.stream) {
  const { type, properties } = event.payload
  
  switch (type) {
    case "session.created":
      console.log("New session:", properties.info.id)
      break
      
    case "message.updated":
      console.log("Message updated:", properties.info.id)
      break
      
    case "permission.asked":
      console.log("Permission requested:", properties.permission)
      // Can call client.session.permission.reply() to respond
      break
      
    case "file.edited":
      console.log("File edited:", properties.path)
      break
      
    case "session.error":
      console.error("Session error:", properties.error)
      break
  }
}
```

### List All Event Types

```bash
# View all event type definitions
grep "^export type Event" ~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts
```

### View Specific Event Structure

```bash
# For example, view EventSessionCreated definition
grep -A 10 "^export type EventSessionCreated = {" ~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts
```

---

## Other API Modules

The SDK also provides the following modules. For detailed method signatures, please refer to the type files:

### File Operations (File & Find)

```typescript
// Search file content
const textResults = await client.find.text({
  query: { pattern: "function.*opencode" }
})

// Find files by name
const files = await client.find.files({
  query: { query: "*.ts", type: "file" }
})

// Find symbols
const symbols = await client.find.symbols({
  query: { query: "Session" }
})

// Read file
const content = await client.file.read({
  query: { path: "src/index.ts" }
})

// Get file status
const status = await client.file.status()
```

### Configuration Management (Config)

```typescript
// Get configuration
const config = await client.config.get()

// Get provider list
const { providers, default: defaults } = await client.config.providers()
```

### Terminal UI Control (TUI)

```typescript
// Append text to prompt
await client.tui.appendPrompt({
  body: { text: "Add this to prompt" }
})

// Submit prompt
await client.tui.submitPrompt()

// Clear prompt
await client.tui.clearPrompt()

// Show toast notification
await client.tui.showToast({
  body: { message: "Task completed", variant: "success" }
})

// Open dialogs
await client.tui.openHelp()
await client.tui.openSessions()
await client.tui.openThemes()
await client.tui.openModels()
```

### Authentication Management (Auth)

```typescript
// Set API key
await client.auth.set({
  path: { id: "anthropic" },
  body: { type: "api", key: "your-api-key" }
})
```

### Health Check (Global)

```typescript
// Check server health
const health = await client.global.health()
console.log(health.data.version)
console.log(health.data.healthy)
```

---

## Complete Examples

### Batch Process Files

```typescript
import { createOpencodeClient } from "@opencode-ai/sdk"
import { pathToFileURL } from "node:url"
import { glob } from "glob"

const client = createOpencodeClient()

// Find all TypeScript files
const files = await glob("src/**/*.ts")

// Create session and generate tests for each file
await Promise.all(
  files.map(async (file) => {
    const session = await client.session.create({
      body: { title: `Tests for ${file}` }
    })
    
    await client.session.prompt({
      path: { id: session.data.id },
      body: {
        parts: [
          {
            type: "file",
            mime: "text/plain",
            url: pathToFileURL(file).href,
          },
          {
            type: "text",
            text: "Write comprehensive unit tests for this file"
          }
        ]
      }
    })
    
    console.log(`Generated tests for ${file}`)
  })
)
```

### Monitor Session Status

```typescript
import { createOpencodeClient } from "@opencode-ai/sdk"

const client = createOpencodeClient()

// Create session
const session = await client.session.create()

// Subscribe to events
const events = await client.event.subscribe()

// Send prompt
client.session.prompt({
  path: { id: session.data.id },
  body: {
    parts: [{ type: "text", text: "Write a hello world program" }]
  }
})

// Monitor response
for await (const event of events.stream) {
  if (event.payload.type === "message.updated") {
    const msg = event.payload.properties.info
    if (msg.sessionID === session.data.id && msg.role === "assistant") {
      console.log("AI is responding...")
      if (msg.time.completed) {
        console.log("Response completed!")
        console.log("Tokens used:", msg.tokens.total)
        break
      }
    }
  }
}
```

---

## Type Imports

All types can be imported from the main package:

```typescript
import type {
  Session,
  Message,
  UserMessage,
  AssistantMessage,
  Part,
  TextPart,
  FilePart,
  ToolPart,
  Event,
  GlobalEvent,
  Project,
  Config,
} from "@opencode-ai/sdk"
```

---

## Error Handling

SDK methods may throw errors. It's recommended to use try-catch for error handling:

```typescript
try {
  const session = await client.session.get({
    path: { id: "invalid-id" }
  })
} catch (error) {
  console.error("Failed to get session:", (error as Error).message)
}
```

---

## Further Exploration

- **View all type definitions**: `~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts`
- **View all API methods**: `~/.config/opencode/node_modules/@opencode-ai/sdk/dist/v2/gen/sdk.gen.d.ts`
- **Use grep to search**: `grep -r "export type YourType" ~/.config/opencode/node_modules/@opencode-ai/sdk/`

The SDK provides complete TypeScript type support. You can discover more features and usage by viewing the type files.
