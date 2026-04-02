import type { Plugin } from "@opencode-ai/plugin";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

type AgentDefinition = {
  source: string;
  description: string;
  mode: "primary" | "subagent" | "all";
  temperature?: number;
  color?: string;
  permission?: Record<string, unknown>;
};

function getPluginRealFilePath(): string {
  return fs.realpathSync(fileURLToPath(import.meta.url));
}

function getRepoRoot(): string {
  const pluginFile = getPluginRealFilePath();
  return path.resolve(path.dirname(pluginFile), "..", "..");
}

function readPrompt(repoRoot: string, relativePath: string): string {
  const promptPath = path.join(repoRoot, relativePath);

  if (!fs.existsSync(promptPath)) {
    throw new Error(`Agent prompt file not found: ${promptPath}`);
  }

  return fs.readFileSync(promptPath, "utf8");
}

const AGENTS: Record<string, AgentDefinition> = {
  "clover8": {
    source: "agents/clover8.md",
    description: "八叶草 - 友好的AI助手，擅长代码开发和问题解答",
    mode: "primary",
    temperature: 0.7,
    color: "#4CAF50",
  },
  "clover6": {
    source: "agents/clover6.md",
    description: "六叶草 - 只读模式的AI助手，擅长代码分析和问题解答",
    mode: "primary",
    temperature: 0.7,
    color: "#2196F3",
    permission: {
      edit: "deny",
      bash: "allow",
    },
  },
  "researcher": {
    source: "agents/researcher.md",
    description: "Researcher - Deep web research agent focusing on underlying logic and source verification",
    mode: "primary",
    color: "#9C27B0",
    permission: {
      edit: "allow",
      bash: "allow",
      read: "allow",
      webfetch: "allow",
      websearch: "allow",
    },
  },
  "soul-whisper": {
    source: "agents/soul-whisper.md",
    description: "Long-term person-centered psychological support companion with strict S/A/B/C safety layers",
    mode: "primary",
    temperature: 0.7,
    color: "#7E57C2",
    permission: {
      edit: "deny",
      bash: "deny",
      read: "deny",
      webfetch: "deny",
      websearch: "deny",
    },
  },
  "task-executor": {
    source: "agents/task-executor.md",
    description: "Delegation-first complex task orchestrator with recursive planning, research, validation, and replanning",
    mode: "primary",
    color: "#FF5722",
    permission: {
      edit: "allow",
      bash: "allow",
      read: "allow",
      webfetch: "allow",
      websearch: "allow",
    },
  },
  "agent-creator": {
    source: "agents/agent-creator.md",
    description: "Agent Creator - Specialized assistant for creating new OpenCode agents",
    mode: "primary",
    color: "#FF9800",
    permission: {
      edit: "allow",
    },
  },
  "plan-reviewer": {
    source: "agents/plan-reviewer.md",
    description: "Architecture-minded critic reviewing task-executor plans to minimize system entropy",
    mode: "subagent",
    color: "#E91E63",
    permission: {
      edit: "deny",
      bash: "deny",
      read: "allow",
      webfetch: "deny",
      websearch: "deny",
    },
  },
};

export const CcloverAgentsPlugin: Plugin = async (_ctx) => {
  const repoRoot = getRepoRoot();

  return {
    config: async (config) => {
      if (!config.default_agent) {
        config.default_agent = "clover8";
      }
      const configuredAgents = (config.agent ?? {}) as Record<string, Record<string, unknown>>;

      for (const [agentName, definition] of Object.entries(AGENTS)) {
        configuredAgents[agentName] = {
          ...definition,
          prompt: readPrompt(repoRoot, definition.source),
        };
        delete configuredAgents[agentName].source;
      }

      config.agent = configuredAgents;
    },
  };
};

export default CcloverAgentsPlugin;
