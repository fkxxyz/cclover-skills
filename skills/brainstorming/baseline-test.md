# Brainstorming Skill - Baseline Test (RED Phase)

## Test Date
2026-02-25

## Problem Identified
Current brainstorming skill relies on agent's memory to track uncertainties, leading to systematic omissions when user mentions multiple aspects.

## Test Scenario: OpenWrt Router Information Skill

### User's Initial Request
"我想编写一个技能，提供我的 OpenWrt 路由器相关信息给 AI"

### User's Explicit Requirements (from multiple-choice question)
User selected THREE aspects to document:
1. ✅ 连接信息 (Connection info)
2. ❌ 部署规则 (Deployment rules) 
3. ❌ 网络配置 (Network configuration)

### Agent Behavior WITHOUT TODO List

**Questions asked:**
1. ✅ 使用场景 (Use cases)
2. ✅ 连接信息 - SSH 别名 (Connection - SSH alias)
3. ✅ 服务列表记录方式 (How to record services)
4. ✅ 脚本数据来源 (Script data source)
5. ✅ 脚本状态 (Script status)
6. ✅ SSH 别名和脚本路径 (SSH alias and script path)
7. ✅ 脚本输出格式 (Script output format)
8. ✅ 服务信息字段 (Service info fields)
9. ✅ 脚本文件名 (Script filename)
10. ✅ 服务管理方式 (Service management)
11. ✅ 服务信息来源 (Service info source)

**What was covered:**
- Connection info: ✅ Fully covered (SSH alias, script path)
- Deployment rules: ❌ NEVER ASKED
- Network configuration: ❌ NEVER ASKED

**Agent's conclusion:**
"现在不确定性已经解决" (Now uncertainties are resolved)

**User's reaction:**
"哦不！你还没询问我部署规则，为什么你会认为头脑风暴结束了。"

### Root Cause Analysis

**Why agent failed:**
1. **No explicit tracking**: Agent relied on memory, not a checklist
2. **Focus shift**: Got absorbed in script implementation details
3. **No coverage review**: Never checked back against user's original requirements
4. **Subjective completion**: "Feeling done" instead of objective checklist

**What agent thought:**
- "I've asked 11 questions, that's thorough"
- "Script dlear, we're done"
- "No more uncertainties about implementation"

**What agent missed:**
- User explicitly selected "部署规则" but it was never explored
- User explicitly selected "网络配置" but it was never explored
- 2 out of 3 requirements were completely ignored

### Expected Behavior WITH TODO List

**Initial TODO list (should be created immediately):**
```
- [ ] 了解使用场景
- [ ] 了解连接信息
- [ ] 了解部署规则
- [ ] 了解网络配置
```

**After exploring connection info:**
```
- [x] 了解使用场景
- [x] 了解连接信息
- [ ] 了解部署规则  ← NEXT
- [ ] 了解网络配置
```

**Agent should ask about deployment rules:**
"关于部署规则，你打算记录哪些内容？"

**Only after ALL TODOs completed:**
"我已经了解了：连接信息、部署规则、网络配置。还有其他遗漏的方面吗？"

## Test Verdict

**FAILED**: Agent omitted 2 out of 3 explicitly stated requirements.

**Severity**: CRITICAL - This is not a minor oversight, it's a systematic failure to track multiple requirements.

## Lesson Learned

**Memory-based tracking is unreliable.** Even with 11 questions asked, agent still missed 67% of user's requirements because there was no explicit checklist to verify against.

**Solution**: Implement TODO list mechanism to track all uncertainties explicitly.
