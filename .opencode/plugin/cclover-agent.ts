import { Plugin, tool } from "@opencode-ai/plugin";
import { pathToFileURL } from "node:url";
import { resolve, isAbsolute } from "node:path";
import { existsSync } from "node:fs";

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
    },
  };
};

// Default export for better compatibility
export default CcloverAgentPlugin;
