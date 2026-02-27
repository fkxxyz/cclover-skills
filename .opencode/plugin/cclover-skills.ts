import { Plugin, tool } from "@opencode-ai/plugin";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Cclover Skill Enhancement Plugin
 * 
 * Provides cclover_skill tool to load skills from ~/.config/opencode/cclover/skills
 */
export const CcloverSkillEnhancementPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      cclover_skill: tool({
        description: "When a skill needs to load another skill not in system prompt, just use this tool!",
        args: {
          name: tool.schema.string().describe("Skill name (without .md extension)"),
          user_message: tool.schema.string().optional().describe("Optional user message"),
        },
        async execute(args, context) {
          // Validate input
          if (!args.name || args.name.trim() === "") {
            throw new Error("Skill name cannot be empty");
          }

          // Get cross-platform config directory
          const configDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
          const skillDir = path.join(configDir, "opencode", "cclover", "skills", args.name);
          const skillPath = path.join(skillDir, "SKILL.md");
          
          if (fs.existsSync(skillPath)) {
            const skillContent = fs.readFileSync(skillPath, "utf-8");
            
            // Format output with Base directory information (matching skill tool format)
            return `## Skill: ${args.name}

**Base directory**: ${skillDir}

Base directory for this skill: ${skillDir}/
File references (@path) in this skill are relative to this directory.

${skillContent}`;
          }
          
          // Skill not found
          throw new Error(`Skill "${args.name}" not found in ${path.join(configDir, "opencode", "cclover", "skills")}`);
        },
      }),
    },
    "tool.execute.before": async (input, output) => {
      // Intercept skill tool calls for cclover hidden skills
      if (input.tool === "skill" && output.args?.name) {
        const configDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
        const skillPath = path.join(configDir, "opencode", "cclover", "skills", output.args.name, "SKILL.md");
        
        // If the skill exists in cclover hidden skills, redirect to fallback
        if (fs.existsSync(skillPath)) {
          output.args.name = "cclover/cclover-skill-fallback";
        }
      }
    },


    "tool.definition": async (input, output) => {
      if (input.toolID === "skill") {
        output.description = "Load a skill by name. Available skills are listed in the system prompt. If the skill you need is not in the system prompt, use 'cclover_skill' tool instead.";
      }
    },
  };
};

// Default export for better compatibility
export default CcloverSkillEnhancementPlugin;
