import { Plugin, tool } from "@opencode-ai/plugin";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Cclover Skill Enhancement Plugin
 * 
 * Provides cclover_skill tool to load skills from ~/.config/opencode/cclover/skills
 */
export const CcloverSkillEnhancementPlugin: Plugin = async (_ctx) => {
  return {
    tool: {
      cclover_skill: tool({
        description: "When a skill needs to load another skill not in system prompt, just use this tool!",
        args: {
          name: tool.schema.string().describe("Skill name (without .md extension)"),
          user_message: tool.schema.string().optional().describe("Optional user message"),
        },
        async execute(args, _context) {
          // Validate input
          if (!args.name || args.name.trim() === "") {
            throw new Error("Skill name cannot be empty");
          }

          // Get cross-platform config directory
          const configDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
          const baseSkillDir = path.join(configDir, "opencode", "cclover", "skills");
          
          // Try direct path first: skills/{name}/SKILL.md
          let skillDir = path.join(baseSkillDir, args.name);
          let skillPath = path.join(skillDir, "SKILL.md");
          
          if (!fs.existsSync(skillPath)) {
            // Try nested path: skills/*/{name}/SKILL.md
            const categories = fs.readdirSync(baseSkillDir, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory())
              .map(dirent => dirent.name);
            
            for (const category of categories) {
              const nestedSkillDir = path.join(baseSkillDir, category, args.name);
              const nestedSkillPath = path.join(nestedSkillDir, "SKILL.md");
              
              if (fs.existsSync(nestedSkillPath)) {
                skillDir = nestedSkillDir;
                skillPath = nestedSkillPath;
                break;
              }
            }
          }
          
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
          throw new Error(`Skill "${args.name}" not found. You may need to use the 'skill' tool instead to load this skill.`);
        },
      }),
    },
    "tool.execute.before": async (input, output) => {
      // Intercept skill tool calls for cclover hidden skills
      if (input.tool === "skill" && output.args?.name) {
        const configDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
        const baseSkillDir = path.join(configDir, "opencode", "cclover", "skills");
        
        // Check direct path first
        let skillPath = path.join(baseSkillDir, output.args.name, "SKILL.md");
        let found = fs.existsSync(skillPath);
        
        // Check nested paths if not found
        if (!found) {
          const categories = fs.readdirSync(baseSkillDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
          
          for (const category of categories) {
            skillPath = path.join(baseSkillDir, category, output.args.name, "SKILL.md");
            if (fs.existsSync(skillPath)) {
              found = true;
              break;
            }
          }
        }
        
        // If the skill exists in cclover hidden skills, redirect to fallback
        if (found) {
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
