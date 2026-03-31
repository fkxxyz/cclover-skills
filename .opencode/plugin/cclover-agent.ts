import { Plugin, tool } from "@opencode-ai/plugin";
import { pathToFileURL } from "node:url";
import { resolve, isAbsolute } from "node:path";
import { existsSync } from "node:fs";

const POLL_INTERVAL_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractTextContent(parts: Array<{ type: string; [key: string]: any }>) {
  return parts
    .filter((part: any) => part.type === "text")
    .map((part: any) => part.text)
    .join("\n") || null;
}

function getLastAssistantMessage(messages: Array<{ info: any; parts: Array<{ type: string; [key: string]: any }> }>) {
  return messages
    .filter((message) => message.info?.role === "assistant")
    .sort((a, b) => (a.info?.time?.created ?? 0) - (b.info?.time?.created ?? 0))
    .at(-1);
}

function getLastAssistantMessageWithText(messages: Array<{ info: any; parts: Array<{ type: string; [key: string]: any }> }>) {
  return messages
    .filter((message) => message.info?.role === "assistant")
    .sort((a, b) => (b.info?.time?.created ?? 0) - (a.info?.time?.created ?? 0))
    .find((message) => Boolean(extractTextContent(message.parts)));
}

function buildResultPayload(sessionID: string, session: any, lastAssistantMessage: any) {
  const partialContent = lastAssistantMessage ? extractTextContent(lastAssistantMessage.parts) : null;
  const hasCompleted = Boolean(lastAssistantMessage?.info?.time?.completed);
  const hasError = Boolean(lastAssistantMessage?.info?.error);

  let status: "running" | "completed" | "error" = "running";
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

/**
 * Cclover Agent Plugin
 * 
 * Provides cclover_agent tool to create new sessions and delegate tasks to specified agents.
 */
export const CcloverAgentPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      cclover_agent: tool({
        description: "Create a new OpenCode session and delegate a task to a specified agent. Supports both synchronous and asynchronous execution modes.",
        args: {
          prompt: tool.schema.string().describe("Task description to send to the new session"),
          agent: tool.schema.string().describe("Agent type (e.g., 'build', 'explore', 'librarian', 'oracle')"),
          run_in_background: tool.schema.boolean().describe("Execution mode: true for async, false for sync"),
          project_path: tool.schema.string().optional().describe("Project path for the new session (defaults to caller's project path)"),
          reference_docs: tool.schema.array(tool.schema.string()).optional().describe("Array of file paths to attach as reference documents"),
        },
        async execute(args, context) {
          try {
            // 1. Determine project path
            const projectPath = args.project_path || context.directory;

            // 2. Find or use current project
            const projects = await ctx.client.project.list();
            let projectID: string | undefined;

            // Try to find matching project by worktree path
            for (const project of projects.data) {
              if (project.worktree === projectPath) {
                projectID = project.id;
                break;
              }
            }

            // If no matching project found, use current project
            if (!projectID) {
              const currentProject = await ctx.client.project.current();
              projectID = currentProject.data.id;
            }

            // 3. Create new session
            const session = await ctx.client.session.create({
              body: {
                projectID,
                title: `Task: ${args.prompt.slice(0, 50)}${args.prompt.length > 50 ? '...' : ''}`,
              },
            });

            const sessionID = session.data.id;

            // 4. Prepare message parts
            const parts: Array<{ type: string; [key: string]: any }> = [];

            // Add reference documents as FileParts
            if (args.reference_docs && args.reference_docs.length > 0) {
              for (const docPath of args.reference_docs) {
                // Resolve relative paths based on projectPath
                const absolutePath = isAbsolute(docPath)
                  ? docPath
                  : resolve(projectPath, docPath);

                // Check if file exists
                if (!existsSync(absolutePath)) {
                  return JSON.stringify({
                    error: `Reference document not found: ${docPath}`,
                    session_id: sessionID,
                  });
                }

                // Convert to file:// URL
                const fileUrl = pathToFileURL(absolutePath).href;

                parts.push({
                  type: "file",
                  mime: "text/plain",
                  url: fileUrl,
                });
              }
            }

            // Add prompt as TextPart (must be last)
            parts.push({
              type: "text",
              text: args.prompt,
            });

            // 5. Send prompt to session
            if (args.run_in_background) {
              // Async mode: send prompt and return immediately
              ctx.client.session.prompt({
                path: { id: sessionID },
                body: {
                  agent: args.agent,
                  parts,
                },
              });

              return JSON.stringify({
                session_id: sessionID,
              });
            } else {
              // Sync mode: wait for response
              const response = await ctx.client.session.prompt({
                path: { id: sessionID },
                body: {
                  agent: args.agent,
                  parts,
                },
              });

              // Extract text content from response
              const assistantMessage = response.data.info;
              const responseParts = response.data.parts;

              // Collect all text parts
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
            // Error handling
            const errorMessage = error instanceof Error ? error.message : String(error);
            return JSON.stringify({
              error: `Failed to create session or send prompt: ${errorMessage}`,
            });
          }
        },
      }),
      cclover_agent_result: tool({
        description: "Get the current or final result of a delegated agent session.",
        args: {
          session_id: tool.schema.string().describe("Delegated agent session ID"),
          wait: tool.schema.boolean().describe("Wait for completion or return current result immediately"),
        },
        async execute(args) {
          try {
            while (true) {
              const session = await ctx.client.session.get({
                path: { id: args.session_id },
              });

              const messages = await ctx.client.session.messages({
                path: { id: args.session_id },
              });

              const lastAssistantMessage = getLastAssistantMessage(messages.data as any);
              const lastAssistantMessageWithText = getLastAssistantMessageWithText(messages.data as any);
              const result = buildResultPayload(args.session_id, session.data, lastAssistantMessage);

              if (!result.partial_content && lastAssistantMessageWithText) {
                result.partial_content = extractTextContent(lastAssistantMessageWithText.parts);
              }

              if (!args.wait || result.status === "completed" || result.status === "error") {
                return JSON.stringify(result);
              }

              await sleep(POLL_INTERVAL_MS);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isNotFound = /not found/i.test(errorMessage);

            return JSON.stringify({
              session_id: args.session_id,
              status: isNotFound ? "not_found" : "error",
              content: null,
              partial_content: null,
              error: errorMessage,
              duration_ms: 0,
            });
          }
        },
      }),
    },
  };
};

// Default export for better compatibility
export default CcloverAgentPlugin;
