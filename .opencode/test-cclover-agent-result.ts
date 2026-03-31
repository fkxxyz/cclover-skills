#!/usr/bin/env bun
/**
 * TDD test for cclover_agent_result tool.
 */

import { strict as assert } from "node:assert";
import CcloverAgentPlugin from "./plugin/cclover-agent.ts";

async function main() {
  const sessionCreatedAt = 1_000;
  const now = 5_000;

  const sessions: Record<string, any> = {
    ses_running: {
      session: {
        id: "ses_running",
        title: "Running session",
        version: "test",
        projectID: "proj_1",
        directory: "/test/directory",
        time: {
          created: sessionCreatedAt,
          updated: now,
        },
      },
      messages: [
        {
          info: {
            id: "msg_user_running",
            sessionID: "ses_running",
            role: "user",
            time: { created: 1_500 },
            agent: "build",
            model: { providerID: "test", modelID: "test" },
          },
          parts: [{ type: "text", text: "hello" }],
        },
        {
          info: {
            id: "msg_assistant_running",
            sessionID: "ses_running",
            role: "assistant",
            time: { created: 2_000 },
            parentID: "msg_user_running",
            modelID: "test-model",
            providerID: "test-provider",
            mode: "build",
            path: { cwd: "/test/directory", root: "/test" },
            cost: 0,
            tokens: {
              input: 0,
              output: 0,
              reasoning: 0,
              cache: { read: 0, write: 0 },
            },
          },
          parts: [
            { type: "text", text: "partial result" },
            { type: "reasoning", text: "hidden" },
          ],
        },
      ],
    },
    ses_completed: {
      session: {
        id: "ses_completed",
        title: "Completed session",
        version: "test",
        projectID: "proj_1",
        directory: "/test/directory",
        time: {
          created: sessionCreatedAt,
          updated: now,
        },
      },
      messages: [
        {
          info: {
            id: "msg_assistant_completed",
            sessionID: "ses_completed",
            role: "assistant",
            time: { created: 2_000, completed: 3_000 },
            parentID: "msg_user_completed",
            modelID: "test-model",
            providerID: "test-provider",
            mode: "build",
            path: { cwd: "/test/directory", root: "/test" },
            cost: 0,
            tokens: {
              input: 0,
              output: 0,
              reasoning: 0,
              cache: { read: 0, write: 0 },
            },
          },
          parts: [{ type: "text", text: "final answer" }],
        },
      ],
    },
    ses_fallback: {
      session: {
        id: "ses_fallback",
        title: "Fallback session",
        version: "test",
        projectID: "proj_1",
        directory: "/test/directory",
        time: {
          created: sessionCreatedAt,
          updated: now,
        },
      },
      messages: [
        {
          info: {
            id: "msg_assistant_completed_fallback",
            sessionID: "ses_fallback",
            role: "assistant",
            time: { created: 2_000, completed: 3_000 },
            parentID: "msg_user_1",
            modelID: "test-model",
            providerID: "test-provider",
            mode: "build",
            path: { cwd: "/test/directory", root: "/test" },
            cost: 0,
            tokens: {
              input: 0,
              output: 0,
              reasoning: 0,
              cache: { read: 0, write: 0 },
            },
          },
          parts: [{ type: "text", text: "earlier assistant text" }],
        },
        {
          info: {
            id: "msg_assistant_running_empty",
            sessionID: "ses_fallback",
            role: "assistant",
            time: { created: 4_000 },
            parentID: "msg_user_2",
            modelID: "test-model",
            providerID: "test-provider",
            mode: "build",
            path: { cwd: "/test/directory", root: "/test" },
            cost: 0,
            tokens: {
              input: 0,
              output: 0,
              reasoning: 0,
              cache: { read: 0, write: 0 },
            },
          },
          parts: [{ type: "tool", tool: "bash", state: { status: "running", input: {}, time: { start: 4_100 } } }],
        },
      ],
    },
  };

  const mockContext = {
    client: {
      session: {
        get: async ({ path }: any) => ({
          data: sessions[path.id].session,
        }),
        messages: async ({ path }: any) => ({
          data: sessions[path.id].messages,
        }),
      },
    } as any,
    project: {} as any,
    directory: "/test/directory",
    worktree: "/test/worktree",
    serverUrl: new URL("http://localhost:4096"),
    $: {} as any,
  };

  const hooks = await CcloverAgentPlugin(mockContext as any);

  assert.ok(hooks.tool?.cclover_agent_result, "cclover_agent_result should be registered");

  const originalNow = Date.now;
  Date.now = () => now;

  try {
    const rawNone = await hooks.tool.cclover_agent_result.execute(
      {
        session_ids: ["ses_running", "ses_completed"],
        wait: "none",
      },
      mockContext as any,
    );

    const resultNone = JSON.parse(rawNone);

    assert.ok(Array.isArray(resultNone));
    assert.equal(resultNone.length, 2);
    assert.deepEqual(
      resultNone.map((item: any) => item.session_id),
      ["ses_running", "ses_completed"],
    );

    const runningResult = resultNone.find((item: any) => item.session_id === "ses_running");
    assert.equal(runningResult.status, "running");
    assert.equal(runningResult.content, null);
    assert.equal(runningResult.partial_content, "partial result");
    assert.equal(runningResult.error, null);
    assert.equal(runningResult.duration_ms, now - sessionCreatedAt);

    const completedResult = resultNone.find((item: any) => item.session_id === "ses_completed");
    assert.equal(completedResult.status, "completed");
    assert.equal(completedResult.content, "final answer");
    assert.equal(completedResult.partial_content, "final answer");
    assert.equal(completedResult.error, null);
    assert.equal(completedResult.duration_ms, 3_000 - sessionCreatedAt);

    const rawAny = await hooks.tool.cclover_agent_result.execute(
      {
        session_ids: ["ses_running", "ses_completed"],
        wait: "any",
      },
      mockContext as any,
    );

    const resultAny = JSON.parse(rawAny);
    assert.ok(Array.isArray(resultAny));
    assert.equal(resultAny.length, 2);

    const anyCompleted = resultAny.find((item: any) => item.session_id === "ses_completed");
    assert.equal(anyCompleted.status, "completed");
    assert.equal(anyCompleted.content, "final answer");

    const rawFallback = await hooks.tool.cclover_agent_result.execute(
      {
        session_ids: ["ses_fallback"],
        wait: "none",
      },
      mockContext as any,
    );

    const fallbackResults = JSON.parse(rawFallback);
    assert.ok(Array.isArray(fallbackResults));
    assert.equal(fallbackResults.length, 1);
    assert.equal(fallbackResults[0].session_id, "ses_fallback");
    assert.equal(fallbackResults[0].status, "running");
    assert.equal(fallbackResults[0].content, null);
    assert.equal(fallbackResults[0].partial_content, "earlier assistant text");
    assert.equal(fallbackResults[0].error, null);
  } finally {
    Date.now = originalNow;
  }

  console.log("✓ cclover_agent_result multi-session behavior test passed");
}

main().catch((error) => {
  console.error("✗ cclover_agent_result test failed:", error);
  process.exit(1);
});
