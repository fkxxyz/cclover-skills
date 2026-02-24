# Cclover Skills

个人 Agent 技能集合，用于 OpenCode 和其他 AI 助手。

## 简介

这个仓库包含我开发的 AI Agent 技能，遵循 TDD 方法论开发，经过严格测试验证。每个技能都针对特定场景，帮助 Agent 更好地完成任务。

## 技能开发方法论

所有技能都用 [superpowers/writing-skills](https://github.com/obra/superpowers/blob/main/skills/writing-skills/SKILL.md) 编写，遵循 **TDD (Test-Driven Development)** 方法论开发：

### RED 阶段 - 写失败的测试

1. 设计压力场景（3+ 种压力组合）
2. 在**没有技能**的情况下运行场景
3. 记录 Agent 的基线行为（逐字记录）
4. 识别失败模式和合理化借口

### GREEN 阶段 - 写最小技能

1. 编写技能，针对 RED 阶段发现的具体失败
2. 不添加假设性的内容
3. 用技能重新运行相同场景
4. Agent 应该通过所有测试

### REFACTOR 阶段 - 关闭漏洞

1. 设计新的压力场景寻找漏洞
2. Agent 找到新的合理化借口？添加明确的反驳
3. 重新测试直到防弹
4. 构建合理化借口对照表

### 为什么用 TDD？

- **没有测试 = 没有验证**：不知道技能是否真的有效
- **先写技能 = 猜测问题**：可能解决不存在的问题
- **测试驱动 = 解决真实问题**：针对实际失败模式设计

## 技能结构

每个技能包含：

```
skill-name/
  SKILL.md              # 技能主文件（必需）
  supporting-file.*     # 支持文件（可选，仅在需要时）
```

### SKILL.md 结构

```markdown
---
name: skill-name
description: Use when [触发条件和症状]
---

# Skill Name

## Overview
核心原则（1-2句话）

## When to Use
触发条件和反例

## Process Flow
流程图（仅在决策非显而易见时）

## The Process
详细步骤

## Key Principles
关键原则

## Common Mistakes
常见错误对照表

## Red Flags
自我检查清单

## Anti-Patterns
反模式示例（来自实际测试）
```

## 贡献指南

这是我的个人技能仓库，暂不接受外部贡献。如果你想创建自己的技能：

1. Fork 这个仓库作为模板
2. 遵循 TDD 方法论开发个技能都经过充分测试

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎通过 GitHub Issues 联系。
