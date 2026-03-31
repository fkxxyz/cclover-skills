#!/usr/bin/env bun
/**
 * Test script for cclover_agent plugin
 * 
 * This script tests the basic functionality of the cclover_agent plugin
 * by importing it and checking its structure.
 */

import CcloverAgentPlugin from "./plugin/cclover-agent.ts";

async function testPlugin() {
  console.log("Testing cclover_agent plugin...\n");

  // Mock context
  const mockContext = {
    client: {} as any,
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
        console.log("  - project_path:", tool.args.project_path ? "✓" : "✗");
        console.log("  - reference_docs:", tool.args.reference_docs ? "✓" : "✗");
      }

      if (tool.execute) {
        console.log("✓ Tool has execute function");
      }

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
