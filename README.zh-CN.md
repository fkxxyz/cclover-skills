# Cclover Skills

[English](README.md) | 简体中文

个人 AI Agent 技能集合，适用于 OpenCode、Claude Code、Cursor 等支持技能系统的 AI 助手。

## 简介

这个仓库包含经过 TDD 方法论开发和严格测试验证的 AI Agent 技能。每个技能针对特定场景，帮助 Agent 更规范、更高效地完成任务。所有技能使用 [superpowers/writing-skills](https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md) 编写。
## 架构
本仓库使用嵌套技能系统,包含两个目录:
- **main-skills/** - 面向用户的技能,安装到你的 AI 助手中
- **skills/** - 额外技能，供 main-skills 通过 cclover-skill 嵌套加载的技能

## 安装

**注意**：不同平台的安装方式略有差异。

### OpenCode

1. Clone 本仓库到本地任意位置：
```bash
git clone https://github.com/cclover/cclover-skills.git
cd cclover-skills
```

2. 创建符号链接到 OpenCode 技能目录：
```bash
# 用户级技能目录
ln -s "$(pwd)/main-skills" ~/.config/opencode/skills/cclover

# 额外技能安装（嵌套技能系统）
mkdir -p ~/.config/opencode/cclover/skills
ln -s "$(pwd)/skills" ~/.config/opencode/cclover/skills/cclover

# 插件安装
mkdir -p ~/.config/opencode/plugins
ln -sf "$(pwd)/.opencode/plugin"/* ~/.config/opencode/plugins/
```

3. 重启 OpenCode 或重新加载配置

### Claude Code

1. Clone 本仓库到本地任意位置：
```bash
git clone https://github.com/cclover/cclover-skills.git
cd cclover-skills
```

2. 创建符号链接到 Claude Code 技能目录：
```bash
# macOS/Linux
ln -s "$(pwd)/main-skills" ~/.claude/skills/cclover

# Windows (以管理员身份运行 PowerShell)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills\cclover" -Target "$PWD\main-skills"
```

3. 重启 Claude Code

### Cursor

1. Clone 本仓库到本地任意位置：
```bash
git clone https://github.com/cclover/cclover-skills.git
cd cclover-skills
```

2. 创建符号链接到 Cursor 技能目录：
```bash
# macOS/Linux
ln -s "$(pwd)/main-skills" ~/.cursor/skills/cclover

# Windows (以管理员身份运行 PowerShell)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.cursor\skills\cclover" -Target "$PWD\main-skills"
```

3. 重启 Cursor

### 其他 AI 助手

如果你使用的 AI 助手支持技能系统，通常可以通过以下方式安装：

1. Clone 本仓库到本地任意位置
2. 查阅你的 AI 助手文档，找到技能目录位置
3. 创建符号链接:`ln -s /path/to/cclover-skills/main-skills /path/to/your-ai-assistant/skills/cclover`

### 验证安装

安装完成后，在新会话中询问 Agent："你有哪些可用的技能？"或尝试触发某个技能（例如："帮我设计这个功能"应该触发 brainstorming 技能）。

## 技能列表

- **brainstorming** - 通过迭代探索和针对性提问帮助用户澄清模糊想法和需求
- **brainstorming-complete** - 头脑风暴结束后决定下一步行动，避免擅自执行
- **opencode** - OpenCode 问题与助手在当前环境中的自我认知/自我管理问题的统一入口，覆盖运行时状态、工具、权限、配置、行为，以及配置、SDK、插件和 API 的路由
- **writing-agents-module-level** - 编写模块级 AGENTS.md 文档（30秒快速导向指南）
- **writing-agents-user-level** - 编写用户级 AGENTS.md 文档（系统环境和个性化配置）
- **writing-agents-project-root** - 编写项目根级 AGENTS.md 文档（完整开发指南）

## 技能开发方法论

所有技能遵循 **TDD (Test-Driven Development)** 方法论开发：

- **RED 阶段**：设计压力场景，记录 Agent 在没有技能时的失败行为
- **GREEN 阶段**：编写最小技能来解决这些失败，用技能重新运行场景验证通过
- **REFACTOR 阶段**：设计新压力场景寻找漏洞，关闭合理化借口的空间

**为什么用 TDD？**
- 没有测试 = 没有验证
- 先写技能 = 猜测问题
- 测试驱动 = 解决真实问题


## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎通过 [GitHub Issues](https://github.com/cclover/cclover-skills/issues) 联系。
