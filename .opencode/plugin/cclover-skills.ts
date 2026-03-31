import { Plugin, tool } from "@opencode-ai/plugin";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

/**
 * Get OpenCode configuration directory
 * Respects OPENCODE_CONFIG_DIR environment variable
 */
function getOpencodeConfigDir(): string {
  if (process.env.OPENCODE_CONFIG_DIR) {
    return process.env.OPENCODE_CONFIG_DIR;
  }
  const configDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
  return path.join(configDir, "opencode");
}

function listLoadableSkillNames(baseSkillDir: string): string[] {
  if (!fs.existsSync(baseSkillDir)) {
    return [];
  }

  const skillNames = new Set<string>();
  const isTraversableDirectory = (targetPath: string): boolean => {
    try {
      return fs.statSync(targetPath).isDirectory();
    } catch {
      return false;
    }
  };

  const hasSkillFile = (targetPath: string): boolean => {
    try {
      return fs.existsSync(path.join(targetPath, "SKILL.md"));
    } catch {
      return false;
    }
  };

  for (const dirent of fs.readdirSync(baseSkillDir, { withFileTypes: true })) {
    const firstLevelPath = path.join(baseSkillDir, dirent.name);
    if (!isTraversableDirectory(firstLevelPath)) continue;

    if (hasSkillFile(firstLevelPath)) {
      skillNames.add(dirent.name);
      continue;
    }

    for (const nestedDirent of fs.readdirSync(firstLevelPath, { withFileTypes: true })) {
      const secondLevelPath = path.join(firstLevelPath, nestedDirent.name);
      if (!isTraversableDirectory(secondLevelPath)) continue;
      if (hasSkillFile(secondLevelPath)) {
        skillNames.add(nestedDirent.name);
      }
    }
  }

  return [...skillNames].sort();
}

function buildCcloverSkillDescription(baseSkillDir: string): string {
  const skillNames = listLoadableSkillNames(baseSkillDir);
  const skillList = skillNames.length
    ? skillNames.map((name) => `- ${name}`).join("\n")
    : "- (none currently available)";

  return `Load skills that are NOT in the <available_items> list in system prompt.

Currently loadable skills:
${skillList}

WHEN TO USE:
- The skill you need is not listed in <available_items>
- You need to dynamically load a custom/new skill

WHEN NOT TO USE:
- If the skill appears in <available_items> → use 'skill' tool instead
- If the skill has a "cclover/" prefix in the list → still use 'skill' tool

This tool is for dynamic/runtime skill loading only.`;
}

/**
 * Cclover Skill Enhancement Plugin
 * 
 * Provides cclover_skill tool to load skills from OpenCode config directory
 */
export const CcloverSkillEnhancementPlugin: Plugin = async (_ctx) => {
  const opencodeConfigDir = getOpencodeConfigDir();
  const baseSkillDir = path.join(opencodeConfigDir, "cclover", "skills");

  return {
    tool: {
      cclover_skill: tool({
        description: buildCcloverSkillDescription(baseSkillDir),
        args: {
          name: tool.schema.string().describe("Skill name (without .md extension). Do NOT use this for skills in <available_items> - use 'skill' tool instead."),
          user_message: tool.schema.string().optional().describe("Optional user message"),
        },
        async execute(args, _context) {
          // Validate input
          if (!args.name || args.name.trim() === "") {
            throw new Error("Skill name cannot be empty");
          }

          // Get OpenCode config directory (respects OPENCODE_CONFIG_DIR)
          // Try direct path first: skills/{name}/SKILL.md
          let skillDir = path.join(baseSkillDir, args.name);
          let skillPath = path.join(skillDir, "SKILL.md");
          
          if (!fs.existsSync(skillPath)) {
            // Try nested path: skills/*/{name}/SKILL.md
            // Use statSync instead of dirent.isDirectory() to follow symlinks
            const categories = fs.readdirSync(baseSkillDir, { withFileTypes: true })
              .filter(dirent => {
                // dirent.isDirectory() returns false for symlinks, use statSync to follow them
                try {
                  return fs.statSync(path.join(baseSkillDir, dirent.name)).isDirectory();
                } catch {
                  return false;
                }
              })
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
        const opencodeConfigDir = getOpencodeConfigDir();
        const baseSkillDir = path.join(opencodeConfigDir, "cclover", "skills");
        
        // Check direct path first
        let skillPath = path.join(baseSkillDir, output.args.name, "SKILL.md");
        let found = fs.existsSync(skillPath);
        
        // Check nested paths if not found
        if (!found) {
          // Use statSync instead of dirent.isDirectory() to follow symlinks
          const categories = fs.readdirSync(baseSkillDir, { withFileTypes: true })
            .filter(dirent => {
              // dirent.isDirectory() returns false for symlinks, use statSync to follow them
              try {
                return fs.statSync(path.join(baseSkillDir, dirent.name)).isDirectory();
              } catch {
                return false;
              }
            })
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
        output.description = `Load a skill by name from the available_skills list in the system prompt.

CRITICAL DECISION PROCESS:
1. First, check the <available_items> section in system prompt
2. Find the exact skill name (including any prefix like "cclover/")
3. Use that EXACT name with this tool

Example:
- If you see "cclover/opencode" in the list → use skill(name="cclover/opencode")
- If you see "brainstorming" in the list → use skill(name="brainstorming")

ONLY use 'cclover_skill' tool if the skill you need is NOT listed in <available_items>.`;
      }
    },
  };
};

// Default export for better compatibility
export default CcloverSkillEnhancementPlugin;
