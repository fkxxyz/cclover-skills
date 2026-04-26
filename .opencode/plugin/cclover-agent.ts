import { Plugin, tool } from "@opencode-ai/plugin";
import { pathToFileURL } from "node:url";
import { resolve, isAbsolute } from "node:path";
import { existsSync } from "node:fs";

const POLL_INTERVAL_MS = 1000;

// Common OpenCode agents (for UX/help text only).
// NOTE: the exact available agent list depends on the user's OpenCode server config.
const COMMON_AVAILABLE_AGENTS = [
  "clover8",
  "agent-creator",
  "build",
  "clover6",
  "explore",
  "general",
  "plan",
  "researcher",
  "search-report",
  "soul-whisper",
] as const;

function formatAvailableAgentsForDescription() {
  return COMMON_AVAILABLE_AGENTS.map((a) => `- ${a}`).join("\n");
}

function extractHelpfulErrorMessage(error: unknown): string {
  const anyErr = error as any;
  const candidates = [
    anyErr?.data?.message,
    anyErr?.data?.error?.message,
    anyErr?.error?.data?.message,
    anyErr?.error?.message,
    anyErr?.message,
  ].filter(Boolean);

  if (candidates.length > 0) return String(candidates[0]);
  return error instanceof Error ? error.message : String(error);
}

type AgentResultStatus = "running" | "completed" | "error" | "not_found";
type WaitMode = "none" | "any" | "all";

type MessageLike = {
  info: any;
  parts: Array<{ type: string; [key: string]: any }>;
};

type AgentResultPayload = {
  session_id: string;
  status: AgentResultStatus;
  content: string | null;
  partial_content: string | null;
  error: string | null;
  duration_ms: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractTextContent(parts: Array<{ type: string; [key: string]: any }>) {
  return parts
    .filter((part: any) => part.type === "text")
    .map((part: any) => part.text)
    .join("\n") || null;
}

function isValidExistingSessionID(sessionID: string) {
  return sessionID.startsWith("ses");
}

function getLastAssistantMessage(messages: MessageLike[]) {
  const assistantMessages = messages
    .filter((message) => message.info?.role === "assistant")
    .sort((a, b) => (a.info?.time?.created ?? 0) - (b.info?.time?.created ?? 0));

  return assistantMessages[assistantMessages.length - 1];
}

function getLastAssistantMessageWithText(messages: MessageLike[]) {
  return messages
    .filter((message) => message.info?.role === "assistant")
    .sort((a, b) => (b.info?.time?.created ?? 0) - (a.info?.time?.created ?? 0))
    .find((message) => Boolean(extractTextContent(message.parts)));
}

function buildResultPayload(sessionID: string, session: any, lastAssistantMessage: any): AgentResultPayload {
  const partialContent = lastAssistantMessage ? extractTextContent(lastAssistantMessage.parts) : null;
  const hasCompleted = Boolean(lastAssistantMessage?.info?.time?.completed);
  const hasError = Boolean(lastAssistantMessage?.info?.error);

  let status: AgentResultStatus = "running";
  if (hasError) status = "error";
  else if (hasCompleted) status = "completed";

  const endTime = hasCompleted
    ? lastAssistantMessage.info.time.completed
    : Date.now();

  return {
    session_id: sessionID,
    status,
    content: status === "completed" ? partialContent : null,
    partial_content: partialContent,
    error: hasError
      ? (lastAssistantMessage.info.error?.data?.message
        ?? lastAssistantMessage.info.error?.message
        ?? "Assistant message failed")
      : null,
    duration_ms: Math.max(0, endTime - (session.time?.created ?? endTime)),
  };
}

async function fetchSessionResult(ctx: any, sessionID: string): Promise<AgentResultPayload> {
  try {
    const session = await ctx.client.session.get({
      path: { id: sessionID },
    });

    const messages = await ctx.client.session.messages({
      path: { id: sessionID },
    });

    const messageList = Array.isArray(messages.data)
      ? (messages.data as MessageLike[])
      : [];

    const lastAssistantMessage = getLastAssistantMessage(messageList);
    const lastAssistantMessageWithText = getLastAssistantMessageWithText(messageList);
    const result = buildResultPayload(sessionID, session.data, lastAssistantMessage);

    if (!result.partial_content && lastAssistantMessageWithText) {
      result.partial_content = extractTextContent(lastAssistantMessageWithText.parts);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNotFound = /not found/i.test(errorMessage);

    return {
      session_id: sessionID,
      status: isNotFound ? "not_found" : "error",
      content: null,
      partial_content: null,
      error: errorMessage,
      duration_ms: 0,
    };
  }
}

function shouldReturnResults(results: AgentResultPayload[], waitMode: WaitMode) {
  if (waitMode === "none") {
    return true;
  }

  const terminalStatuses: AgentResultStatus[] = ["completed", "error", "not_found"];
  const hasAnyTerminal = results.some((result) => terminalStatuses.includes(result.status));
  const allTerminal = results.every((result) => terminalStatuses.includes(result.status));

  if (waitMode === "any") {
    return hasAnyTerminal;
  }

  return allTerminal;
}

/**
 * Cclover Agent Plugin
 * 
 * Provides cclover_agent tool to create new sessions and delegate tasks to specified agents.
 */
export const CcloverAgentPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      cclover_agent: tool({
        description: `Use whenever work can be cleanly separated into an independent task for another agent, even if it is small or simple. Prefer spawning sub-agents aggressively when work can be split into multiple independent tasks that can run in parallel. Pass relevant context through reference_docs whenever possible so the task prompt stays short, focused, and easy to follow. Common examples include researching separate questions, modifying different files, reviewing multiple areas of code, exploring different directions within the same codebase, and comparing alternative implementations in parallel.

Available agents (common defaults; exact list depends on your OpenCode server config):
${formatAvailableAgentsForDescription()}

Important: the "agent" argument here is a sub-agent name (e.g. "explore"), NOT a skill name (e.g. "agent-browser").`,
        args: {
          prompt: tool.schema.string().describe("Task description to send to the new session"),
          agent: tool.schema.string().describe(
            `Sub-agent name to run this task (NOT a skill name). Common agents: ${COMMON_AVAILABLE_AGENTS.join(", ")}`,
          ),
          run_in_background: tool.schema.boolean().describe("Execution mode: true for async, false for sync"),
          existing_session_id: tool.schema.string().optional().describe("Existing OpenCode delegated session ID to continue (must be a real session ID previously returned by cclover_agent, e.g. ses_...)"),
          project_path: tool.schema.string().optional().describe("Project path for the new session (defaults to caller's project path)"),
          reference_docs: tool.schema.array(tool.schema.string()).optional().describe("Array of file paths to attach as reference documents"),
        },
        async execute(args, context) {
          let sessionID = args.existing_session_id;

          try {
            const projectPath = args.project_path || context.directory;

            if (sessionID && !isValidExistingSessionID(sessionID)) {
              return JSON.stringify({
                session_id: sessionID,
                error: "existing_session_id must be an existing OpenCode session ID returned by a previous cclover_agent call (expected format like ses_...), not a caller-defined label",
              });
            }

            if (!sessionID) {
              const projects = await ctx.client.project.list();
              const projectList = (projects.data ?? []) as Array<{ id: string; worktree?: string }>;
              let projectID: string | undefined;

              for (const project of projectList) {
                if (project.worktree === projectPath) {
                  projectID = project.id;
                  break;
                }
              }

              if (!projectID) {
                const currentProject = await ctx.client.project.current();
                projectID = (currentProject.data as { id: string } | undefined)?.id;
              }

              const session = await ctx.client.session.create({
                body: {
                  projectID,
                  title: `Task: ${args.prompt.slice(0, 50)}${args.prompt.length > 50 ? '...' : ''}`,
                } as any,
              });

              sessionID = (session.data as { id: string } | undefined)?.id;
              if (!sessionID) {
                throw new Error("Session creation returned no session ID");
              }
            }

            const parts: Array<{ type: string; [key: string]: any }> = [];

            if (args.reference_docs && args.reference_docs.length > 0) {
              for (const docPath of args.reference_docs) {
                const absolutePath = isAbsolute(docPath)
                  ? docPath
                  : resolve(projectPath, docPath);

                if (!existsSync(absolutePath)) {
                  return JSON.stringify({
                    error: `Reference document not found: ${docPath}`,
                    session_id: sessionID,
                  });
                }

                const fileUrl = pathToFileURL(absolutePath).href;

                parts.push({
                  type: "file",
                  mime: "text/plain",
                  url: fileUrl,
                });
              }
            }

            parts.push({
              type: "text",
              text: args.prompt,
            });

            if (args.run_in_background) {
              // Always await so errors (e.g., agent not found) are caught and returned.
              // Otherwise, a rejected promise may surface as a confusing JSON parse error.
              await ctx.client.session.prompt({
                path: { id: sessionID },
                body: {
                  agent: args.agent,
                  parts,
                } as any,
              });

              return JSON.stringify({
                session_id: sessionID,
              });
            } else {
              const response = await ctx.client.session.prompt({
                path: { id: sessionID },
                body: {
                  agent: args.agent,
                  parts,
                } as any,
              });

              const responseParts = ((response.data as { parts?: Array<{ type: string; [key: string]: any }> } | undefined)?.parts ?? []);

              const textContent = responseParts
                .filter((part: any) => part.type === "text")
                .map((part: any) => part.text)
                .join("\n");

              return JSON.stringify({
                session_id: sessionID,
                response: textContent || "No text response received",
              });
            }
          } catch (error) {
            // Intentionally avoid surfacing low-level transport / parsing errors directly.
            // In some environments, SDK errors can be misleading (e.g. JSON parse EOF),
            // so we return an "unknown" error with likely causes.
            return JSON.stringify({
              session_id: sessionID,
              error: "Unknown error while creating session or sending prompt",
              possible_causes: [
                "Invalid tool arguments (e.g., agent name not recognized)",
                "Invalid session identifier (existing_session_id must refer to a real session)",
                "Backend failed to process the request (transient internal error)",
              ],
              available_agents: COMMON_AVAILABLE_AGENTS,
            });
          }
        },
      }),
      cclover_agent_result: tool({
        description: "Use after handing work off to one or more sub-agents when you want to check progress, inspect the latest visible result, or wait for either the first finished answer or all finished answers, instead of re-running the same tasks.",
        args: {
          session_ids: tool.schema.array(tool.schema.string()).describe("Delegated agent session IDs"),
          wait: tool.schema.enum(["none", "any", "all"]).describe("Return immediately, wait until any session finishes, or wait until all sessions finish"),
        },
        async execute(args) {
          while (true) {
            const results = await Promise.all(
              args.session_ids.map((sessionID: string) => fetchSessionResult(ctx, sessionID)),
            );

            if (shouldReturnResults(results, args.wait as WaitMode)) {
              return JSON.stringify(results);
            }

            await sleep(POLL_INTERVAL_MS);
          }
        },
      }),
      cclover_agent_stop: tool({
        description: "Use when you need to stop a delegated sub-agent session that is still running or should not continue. This is for halting an existing session, not for checking results.",
        args: {
          session_id: tool.schema.string().describe("Delegated agent session ID to stop"),
        },
        async execute(args) {
          try {
            await ctx.client.session.abort({
              path: { id: args.session_id },
            });

            return JSON.stringify({
              session_id: args.session_id,
              status: "stopped",
              error: null,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return JSON.stringify({
              session_id: args.session_id,
              status: "error",
              error: errorMessage,
            });
          }
        },
      }),
    },
  };
};

// Default export for better compatibility
export default CcloverAgentPlugin;
