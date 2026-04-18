#!/usr/bin/env bun
/**
 * Test script for cclover_agent plugin
 * 
 * This script tests the basic functionality of the cclover_agent plugin
 * by importing it and checking its structure.
 */

import CcloverAgentPlugin from "./plugin/cclover-agent.ts";
import { strict as assert } from "node:assert";

async function testPlugin() {
  console.log("Testing cclover_agent plugin...\n");

  // Mock context
  let createCalls = 0;
  let promptCalls = 0;

  const mockContext = {
    client: {
      project: {
        list: async () => ({ data: [{ id: "proj_1", worktree: "/test/directory" }] }),
        current: async () => ({ data: { id: "proj_current" } }),
      },
      session: {
        create: async () => {
          createCalls++;
          return { data: { id: "ses_created_123" } };
        },
        prompt: async ({ path }: any) => {
          promptCalls++;
          return {
            data: {
              id: path.id,
              parts: [{ type: "text", text: "mock response" }],
            },
          };
        },
      },
    } as any,
    project: {} as any,
    directory: "/test/directory",
    worktree: "/test/worktree",
    serverUrl: new URL("http://localhost:4096"),
    $: {} as any,
  };

  try {
    // Call plugin function
    const hooks = await CcloverAgentPlugin(mockContext);

    console.log("✓ Plugin loaded successfully");

    // Check if tools are registered
    if (hooks.tool && hooks.tool.cclover_agent && hooks.tool.cclover_agent_result) {
      console.log("✓ cclover_agent tool is registered");
      console.log("✓ cclover_agent_result tool is registered");

      const tool = hooks.tool.cclover_agent;
      const resultTool = hooks.tool.cclover_agent_result;

      // Check tool properties
      if (tool.description) {
        console.log("✓ Tool has description:", tool.description);
      }

      if (tool.args) {
        console.log("✓ Tool has args defined");
        console.log("  - prompt:", tool.args.prompt ? "✓" : "✗");
        console.log("  - agent:", tool.args.agent ? "✓" : "✗");
        console.log("  - run_in_background:", tool.args.run_in_background ? "✓" : "✗");
        console.log("  - existing_session_id:", tool.args.existing_session_id ? "✓" : "✗");
        console.log("  - project_path:", tool.args.project_path ? "✓" : "✗");
        console.log("  - reference_docs:", tool.args.reference_docs ? "✓" : "✗");
      }

      if (tool.execute) {
        console.log("✓ Tool has execute function");
      }

      const invalidSessionResultRaw = await tool.execute(
        {
          prompt: "test",
          agent: "build",
          run_in_background: true,
          existing_session_id: "test-session-label",
        },
        mockContext as any,
      );

      const invalidSessionResult = JSON.parse(invalidSessionResultRaw);
      assert.equal(invalidSessionResult.session_id, "test-session-label");
      assert.match(invalidSessionResult.error, /existing OpenCode session ID/);
      assert.equal(createCalls, 0);
      assert.equal(promptCalls, 0);
      console.log("✓ Invalid existing_session_id is rejected early");

      const validExistingSessionRaw = await tool.execute(
        {
          prompt: "test",
          agent: "build",
          run_in_background: false,
          existing_session_id: "ses_existing_123",
        },
        mockContext as any,
      );

      const validExistingSessionResult = JSON.parse(validExistingSessionRaw);
      assert.equal(validExistingSessionResult.session_id, "ses_existing_123");
      assert.equal(validExistingSessionResult.response, "mock response");
      assert.equal(createCalls, 0);
      assert.equal(promptCalls, 1);
      console.log("✓ Valid existing_session_id continues existing session");

      const newSessionRaw = await tool.execute(
        {
          prompt: "test",
          agent: "build",
          run_in_background: true,
        },
        mockContext as any,
      );

      const newSessionResult = JSON.parse(newSessionRaw);
      assert.equal(newSessionResult.session_id, "ses_created_123");
      assert.equal(createCalls, 1);
      assert.equal(promptCalls, 2);
      console.log("✓ Omitting existing_session_id creates a new session");

      if (resultTool.args) {
        console.log("✓ Result tool has args defined");
        console.log("  - session_ids:", resultTool.args.session_ids ? "✓" : "✗");
        console.log("  - wait:", resultTool.args.wait ? "✓" : "✗");
      }

      if (resultTool.execute) {
        console.log("✓ Result tool has execute function");
      }

      console.log("\n✅ All basic checks passed!");
    } else {
      console.error("✗ Expected plugin tools not found");
      process.exit(1);
    }
  } catch (error) {
    console.error("✗ Plugin test failed:", error);
    process.exit(1);
  }
}

testPlugin();
