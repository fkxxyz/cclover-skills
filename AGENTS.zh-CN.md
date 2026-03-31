# Cclover Skills - 开发指南

## 项目功能

使用 TDD 方法论开发的个人 AI Agent 技能集合，适用于任何 AI 助手（OpenCode、Claude Code 等）。每个技能针对特定场景，帮助 Agent 更有效地完成任务。

## 技术栈

- **技能格式**: Markdown (SKILL.md)
- **开发方法**: TDD（测试驱动开发）
- **编写工具**: writing-skills 技能

## 项目结构

```
cclover-skills/
├── main-skills/         # 面向用户的技能（链接到系统）
│   ├── skill-name/
│   │   ├── SKILL.md    # 技能主文件（必需）
│   │   └── *.*         # 支持文件（可选）
│   └── ...
├── skills/              # 内部技能（用于嵌套加载）
│   ├── helper-skill/
│   │   └── SKILL.md
│   └── ...
├── agents/              # Agent 定义（提示词文件）
├── .opencode/           # OpenCode 插件系统
│   └── plugin/          # OpenCode 插件
│       ├── cclover-agent.ts   # 子代理委派工具
│       ├── cclover-agents.ts  # Agent 定义与配置
│       └── cclover-skills.ts  # 动态技能加载工具
├── AGENTS.md           # 本文件
└── README.md           # 项目说明
```

**目录结构说明**：
- **main-skills/**: 安装到 AI 助手系统的面向用户技能
- **skills/**: main-skills 用于嵌套加载的内部技能（不直接暴露给用户）
- **agents/**: Agent 定义文件（提示词）
- **.opencode/**: 扩展 Agent 能力的 OpenCode 插件系统

## 嵌套技能系统

本项目使用嵌套技能系统，main-skills 可以加载和组合内部技能的功能。

**工作原理**：
- `main-skills/` 中的技能可以使用 `skill` 工具（由 MCP 服务提供）从 `skills/` 目录加载技能
- 这使得模块化技能设计成为可能，而不会向最终用户暴露内部实现细节
- `cclover-skill` 工具接受技能名称并从 `skills/{skill-name}/SKILL.md` 加载相应的 SKILL.md

## OpenCode 插件系统

本项目包含一个扩展 Agent 能力的 OpenCode 插件系统。

### 插件概览

**cclover-agent.ts** — 子代理委派工具
- 提供创建和管理委派 Agent 会话的工具
- `cclover_agent`: 创建新会话并将任务委派给指定 Agent 类型
- `cclover_agent_result`: 检查进度或检索委派会话的结果
- `cclover_agent_stop`: 停止运行中的委派会话

**cclover-agents.ts** — Agent 定义与配置
- 向 OpenCode 注册自定义 Agent 定义
- 从 `agents/` 目录加载 Agent 提示词
- 配置 Agent 特定设置（temperature、permissions、color）
- 设置项目的默认 Agent

**cclover-skills.ts** — 动态技能加载
- 提供 `cclover_skill` 工具用于加载不在系统提示中的技能
- 从 OpenCode 配置目录搜索技能（`~/.config/opencode/cclover/skills/`）
- 支持嵌套技能分类
- 拦截 `skill` 工具调用并重定向到隐藏的 cclover 技能

### Agent 类型

Agent 在 `agents/` 目录中定义。每个 Agent 包含：
- 定义其角色和行为的提示词文件
- 配置的权限（edit、bash、read、webfetch、websearch）
- 可选设置（temperature、color）

可用的 Agent 类型因项目配置而异。常见的 Agent 包括代码助手、研究专家和执行助手。

## 开发规则

### 编写技能

**必须使用 writing-skills 技能来编写**，除非用户明确表示直接编写而不加载技能。

### 更新 README 文档

**添加或修改任何技能时，必须同步所有语言版本的 README。**

必需的更新：
- 更新 README.md 中的技能列表（添加新技能或更新描述）
- 保持所有 README 语言版本中的技能描述一致
- 确保安装说明保持准确

这确保用户无论使用哪种语言都能发现和理解所有可用技能。
### TDD 测试工作流

编写技能时 TDD 测试是强制性的。**关键步骤**：

1. 使用 writing-skills 编写技能
2. 让子代理测试新技能时：
   - **直接告诉子代理刚编写的技能的完整路径**
   - **让子代理读取整个技能文件**
   - 这一步非常重要，以确保子代理能够正确加载和理解技能

示例：
```
请阅读 /path/to/cclover-skills/skills/new-skill/SKILL.md 的完整内容并将其视为技能。
```

### 技能设计原则

- **通用性**: 技能应适用于所有 AI 助手，不依赖于特定环境或工具
- **独立性**: 技能可以独立使用
- **可组合性**: 技能可以有相互依赖关系

### 技能的提示词编写指南

技能就是提示词。一个写得好的技能就是一个写得好的提示词。编写 SKILL.md 文件时遵循以下原则：

#### 结构

每个技能应遵循以下顺序：
1. **角色/上下文** — 告诉 Agent 它是谁以及处于什么场景
2. **任务** — 要做什么，以具体行动陈述
3. **约束** — 不要做什么，边界，边缘情况
4. **输出格式** — 预期的交付物、结构、风格
5. **示例** — 当行为难以用文字描述时的输入→输出对

#### 核心原则

- **具体优于抽象**: "检查函数是否有错误处理并建议使用自定义错误类型的 try-catch" 优于 "改进代码"
- **正面优于负面**: "仅讨论功能" 比 "不要提及定价" 效果更好 — 否定会引起对禁止概念的注意
- **展示优于讲述**: 一个好例子 > 三段解释。Agent 进行模式匹配；利用这一点
- **原子指令**: 每个要点一条指令。复合句（"做 X 并且做 Y 同时考虑 Z"）会被部分执行
- **约束边界**: 明确说明什么在范围内，什么在范围外。无界指令会导致范围蔓延
- **按优先级排序**: 将最关键的指令放在前面。注意力随长度递减

#### 常见陷阱

- **矛盾指令**: "保持简洁" + "详细解释每一步" — Agent 会摇摆不定。选择一个，或指定何时应用每个
- **隐含假设**: 如果技能依赖于文件结构、工具可用性或命名约定，请明确说明
- **过度规范**: 打包太多要求会稀释每一个。如果技能超过约 200 行，请拆分或无情地优先排序
- **缺少边缘情况**: 只测试正常路径。在 TDD 期间使用对抗性输入进行压力测试
- **模糊的成功标准**: "让它更好" 是不可验证的。"所有函数都有带 @param 和 @returns 的 JSDoc" 是可验证的
cclover-skills/
├── my-skill/
│   └── SKILL.md
```

✅ 正确：将技能放在 skills/ 目录中
```
cclover-skills/
├── skills/
│   └── my-skill/
│       └── SKILL.md
```

### 测试时不提供技能路径

❌ 错误：让子代理自己找技能
```
请测试新编写的 my-skill 技能
```

✅ 正确：提供完整路径并要求完整阅读
```
请测试刚编写的技能。技能路径：/path/to/cclover-skills/skills/my-skill/SKILL.md
请阅读整个技能文件，然后根据技能要求进行测试。
```
