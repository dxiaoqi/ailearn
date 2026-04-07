---
title: "Context 管理与压缩：context 为什么会爆，怎么救？"
module: "module-2"
moduleTitle: "模块二：Agent 工程"
duration: "25 分钟"
description: "理解 context 线性增长的代价，掌握四种压缩策略（无压缩、滑动窗口、摘要压缩、混合策略）的原理与权衡，通过沙盒对比各策略的实际效果。"
tags: ["Context", "压缩策略", "滑动窗口", "摘要", "初级"]
expert:
  name: "Context 顾问 Leo"
  model: "gpt-4o"
  intro: "你好！我是 Leo，专注于 Context 管理优化。滑动窗口、摘要压缩、混合策略的选择和权衡，随时问我 👋"
  systemPrompt: |
    你是一位专注于 LLM Context 管理的技术顾问，名叫 Leo。
    你的核心能力：帮助学生理解 context 增长的原因和四种压缩策略的权衡。
    回复风格：用具体的 token 数字举例，善于对比不同策略的优劣。
    回复要求：
    - 用中文回复，每次回复在 200 字以内
    - 优先用数字对比说明（如"无压缩 12k vs 摘要后 3.2k"）
    - 如果学生问"哪种最好"，引导他思考任务特征而非给绝对答案
---

本课结束时，你能做到：

> ✓ 计算任意轮次的 context 大小，判断是否会触顶
> ✓ 说清四种策略的核心机制和信息损失特征
> ✓ 根据任务特征选择合适的压缩策略
> ✓ 通过沙盒实验对比各策略的 token 节省率

**前置**：第 1 课 · Agent Loop

---

## 1 · 概念：context 为什么一定会爆？

回忆第 1 课的公式：

> **第 N 轮 Context = system_tokens + N × (obs_per_turn + asst_per_turn)**

一个典型配置：system = 400, obs = 280, asst = 160，每轮增长 440 tokens。看起来不多？

| 轮次 | Context 大小 | 占 128k 窗口 |
|------|-------------|-------------|
| 第 1 轮 | 840 | 0.7% |
| 第 5 轮 | 2,600 | 2% |
| 第 20 轮 | 9,200 | 7.2% |
| 第 50 轮 | 22,400 | 17.5% |

看起来还好？但如果 obs 变成 800（比如搜索结果、长文档片段）：

| 轮次 | Context 大小 | 占 128k 窗口 |
|------|-------------|-------------|
| 第 20 轮 | 19,600 | **15.3%** |
| 第 50 轮 | 48,400 | **37.8%** |
| 第 100 轮 | 96,400 | **75.3%** |
| 第 130 轮 | 125,200 | **97.8% → 即将触顶** |

**没有压缩的 Agent 终将触顶**，区别只是快慢。

---

### 四种策略

```widget:before-after
{
  "title": "四种 Context 管理策略",
  "subtitle": "没有最好的策略，只有最适合当前任务的。判断标准：早期历史对后续推理还重不重要？",
  "tabs": [
    {
      "label": "无压缩",
      "prompt": "全量保留所有历史\n\n[system]  400 tok\n[turn 1]  440 tok\n[turn 2]  440 tok\n[turn 3]  440 tok\n  ...\n[turn N]  440 tok\n\n总量 = 400 + N × 440\n持续线性增长，不做任何处理",
      "analysis": "信息损失：零。实现复杂度：极低。\n适用：短任务（<10 轮）、context 绝对不会触顶的场景。\n风险：轮次多时 token 费用线性增长，最终触顶截断。",
      "type": "neutral"
    },
    {
      "label": "滑动窗口",
      "prompt": "只保留最近 K 轮，丢弃更早的历史\n\n[system]  400 tok  ← 永远保留\n[turn 1]  ✗ 丢弃\n[turn 2]  ✗ 丢弃\n  ...\n[turn N-K] ✗ 丢弃\n[turn N-K+1] 440 tok ← 保留\n  ...\n[turn N]  440 tok ← 保留\n\n总量 = 400 + K × 440（恒定）",
      "analysis": "信息损失：早期历史完全丢失（比如用户第 1 轮说的偏好）。\n实现复杂度：低（只需截断数组）。\n适用：早期信息不重要的任务（如闲聊）。\n风险：Agent「忘记」关键的早期信息。",
      "type": "bad"
    },
    {
      "label": "摘要压缩",
      "prompt": "用 LLM 把早期历史压缩为一段摘要\n\n[system]  400 tok\n[summary] 300 tok ← LLM 生成的摘要\n[turn N-2] 440 tok\n[turn N-1] 440 tok\n[turn N]   440 tok\n\n总量 ≈ 400 + 300 + 近几轮\n摘要替代了大量历史",
      "analysis": "信息损失：细节信息（摘要必然丢失细节）。\n实现复杂度：中（需要额外 LLM 调用生成摘要）。\n适用：长任务、需要保留早期语义但不需要原始细节。\n代价：摘要本身也消耗 token，且摘要质量不可控。",
      "type": "good"
    },
    {
      "label": "混合策略",
      "prompt": "摘要 + 保留最近 K 轮（推荐）\n\n[system]   400 tok\n[summary]  300 tok ← 早期历史的摘要\n[turn N-3] 440 tok ← 保留\n[turn N-2] 440 tok ← 保留\n[turn N-1] 440 tok ← 保留\n[turn N]   440 tok ← 保留\n\n总量 ≈ 400 + 300 + K × 440",
      "analysis": "信息损失：最少——摘要保留语义，近期保留细节。\n实现复杂度：高（摘要 + 窗口管理 + 触发逻辑）。\n适用：大多数生产级 Agent。\n这是目前主流 Agent 框架的默认策略。",
      "type": "good"
    }
  ]
}
```

**核心观点**：没有最好的策略，只有最适合当前任务的策略。判断标准只有一个——**早期历史对后续推理还重不重要？**

- 重要 → 摘要或混合
- 不重要 → 滑动窗口
- 轮次很少 → 不压缩

---

## 2 · 图解：压缩前后的 Context 对比

```widget:diagram
{
  "title": "Context 增长与压缩效果对比",
  "caption": "左：无压缩线性增长，柱状从基线向上堆叠。右：混合策略在 R4 触发压缩，后续增长显著放缓。",
  "svg": "<svg viewBox='0 0 720 340' xmlns='http://www.w3.org/2000/svg'><text class='th' x='170' y='20' text-anchor='middle'>无压缩</text><text class='th' x='540' y='20' text-anchor='middle'>混合策略（摘要 + 近 K 轮）</text><line x1='355' y1='8' x2='355' y2='305' stroke='var(--b)' stroke-width='0.5' stroke-dasharray='4 3'/><g transform='translate(20,30)'><line x1='40' y1='260' x2='310' y2='260' stroke='var(--s)' stroke-width='1'/><line x1='40' y1='0' x2='40' y2='260' stroke='var(--s)' stroke-width='1'/><text class='ts' x='32' y='265' text-anchor='end'>0</text><text class='ts' x='175' y='280' text-anchor='middle'>轮次</text><line x1='40' y1='10' x2='310' y2='10' stroke='var(--color-text-danger)' stroke-width='0.5' stroke-dasharray='6 3'/><text class='ts' x='312' y='14' style='fill:var(--color-text-danger);font-size:10px'>128k</text><g class='c-purple'><rect x='50' y='245' width='36' height='15' rx='3' stroke-width='0.5'/><text class='ts' x='68' y='256' text-anchor='middle' style='font-size:8px'>sys</text></g><g class='c-blue'><rect x='98' y='220' width='36' height='40' rx='3' stroke-width='0.5'/><text class='ts' x='116' y='244' text-anchor='middle' style='font-size:9px'>R4</text></g><g class='c-blue'><rect x='146' y='170' width='36' height='90' rx='3' stroke-width='0.5'/><text class='ts' x='164' y='220' text-anchor='middle' style='font-size:9px'>R8</text></g><g class='c-blue'><rect x='194' y='115' width='36' height='145' rx='3' stroke-width='0.5'/><text class='ts' x='212' y='194' text-anchor='middle' style='font-size:9px'>R12</text></g><g class='c-blue'><rect x='242' y='55' width='36' height='205' rx='3' stroke-width='0.5'/><text class='ts' x='260' y='164' text-anchor='middle' style='font-size:9px'>R16</text></g></g><g transform='translate(380,30)'><line x1='40' y1='260' x2='310' y2='260' stroke='var(--s)' stroke-width='1'/><line x1='40' y1='0' x2='40' y2='260' stroke='var(--s)' stroke-width='1'/><text class='ts' x='32' y='265' text-anchor='end'>0</text><text class='ts' x='175' y='280' text-anchor='middle'>轮次</text><line x1='40' y1='10' x2='310' y2='10' stroke='var(--color-text-danger)' stroke-width='0.5' stroke-dasharray='6 3'/><text class='ts' x='312' y='14' style='fill:var(--color-text-danger);font-size:10px'>128k</text><g class='c-blue'><rect x='50' y='220' width='36' height='40' rx='3' stroke-width='0.5'/><text class='ts' x='68' y='244' text-anchor='middle' style='font-size:9px'>R4</text></g><line x1='94' y1='215' x2='94' y2='265' stroke='var(--color-text-success)' stroke-width='1.5' stroke-dasharray='4 2'/><text class='ts' x='96' y='210' style='fill:var(--color-text-success);font-size:9px'>压缩↓</text><g class='c-teal'><rect x='98' y='240' width='36' height='20' rx='3' stroke-width='0.5'/><text class='ts' x='116' y='254' text-anchor='middle' style='font-size:8px'>摘要</text></g><g class='c-amber'><rect x='98' y='205' width='36' height='35' rx='3' stroke-width='0.5'/><text class='ts' x='116' y='226' text-anchor='middle' style='font-size:9px'>R8</text></g><g class='c-teal'><rect x='146' y='240' width='36' height='20' rx='3' stroke-width='0.5'/></g><g class='c-amber'><rect x='146' y='190' width='36' height='50' rx='3' stroke-width='0.5'/><text class='ts' x='164' y='220' text-anchor='middle' style='font-size:9px'>R12</text></g><g class='c-teal'><rect x='194' y='240' width='36' height='20' rx='3' stroke-width='0.5'/></g><g class='c-amber'><rect x='194' y='170' width='36' height='70' rx='3' stroke-width='0.5'/><text class='ts' x='212' y='210' text-anchor='middle' style='font-size:9px'>R16</text></g></g><g transform='translate(20,320)'><g class='c-purple'><rect x='0' y='-6' width='10' height='10' rx='2' stroke-width='0.5'/></g><text class='ts' x='14' y='3'>System</text><g class='c-blue'><rect x='65' y='-6' width='10' height='10' rx='2' stroke-width='0.5'/></g><text class='ts' x='79' y='3'>全量历史</text><g class='c-teal'><rect x='140' y='-6' width='10' height='10' rx='2' stroke-width='0.5'/></g><text class='ts' x='154' y='3'>摘要块</text><g class='c-amber'><rect x='200' y='-6' width='10' height='10' rx='2' stroke-width='0.5'/></g><text class='ts' x='214' y='3'>近 K 轮</text></g></svg>"
}
```

关键观察：

- **无压缩**（左图）：R4 → R8 → R12 → R16，柱状持续增长，R16 已接近 128k 红线
- **混合策略**（右图）：R4 之后触发压缩，早期历史被绿色摘要块替代（高度恒定），只有近 K 轮（橙色）在增长
- 同样跑 16 轮，混合策略的 context 约为无压缩的 **40%**

---

## 3 · 沙盒：四种策略的实时对比

用沙盒模拟不同策略下的 context 行为。调整参数，观察 token 节省率和信息保留的权衡：

```widget:sandbox
{
  "title": "Context 压缩策略对比",
  "hint": "调整轮次和参数，对比四种策略的 token 消耗",
  "params": [
    { "id": "turns", "label": "已执行轮次", "min": 1, "max": 24, "default": 12, "step": 1 },
    { "id": "winSize", "label": "保留最近 K 轮（窗口大小）", "min": 1, "max": 10, "default": 4, "step": 1, "hint": "滑动窗口和混合策略使用" },
    { "id": "sysTok", "label": "system_tokens", "min": 100, "max": 2000, "default": 400, "step": 50, "fmt": "auto" },
    { "id": "perTurn", "label": "每轮 tokens（obs + asst）", "min": 100, "max": 1200, "default": 440, "step": 20, "fmt": "auto", "hint": "每轮对话的平均 token 量" },
    { "id": "summTok", "label": "摘要 tokens", "min": 50, "max": 1000, "default": 300, "step": 50, "fmt": "auto", "hint": "LLM 生成的摘要大小，影响摘要和混合策略" }
  ],
  "metrics": [
    {
      "label": "① 无压缩",
      "expr": "sysTok + turns * perTurn",
      "fmt": "k",
      "warnAbove": 80000,
      "dangerAbove": 115000
    },
    {
      "label": "② 滑动窗口",
      "expr": "sysTok + (turns < winSize ? turns : winSize) * perTurn",
      "fmt": "k"
    },
    {
      "label": "③ 摘要压缩",
      "expr": "turns <= winSize ? sysTok + turns * perTurn : sysTok + summTok + (turns < winSize ? turns : winSize) * perTurn",
      "fmt": "k"
    },
    {
      "label": "④ 节省率（①→④）",
      "expr": "turns <= winSize ? 0 : ((sysTok + turns * perTurn) - (sysTok + summTok + (turns < winSize ? turns : winSize) * perTurn)) / (sysTok + turns * perTurn) * 100",
      "fmt": "%",
      "warnAbove": 0
    }
  ],
  "growth": {
    "title": "逐轮 Context 大小（无压缩基线）",
    "steps": "turns",
    "labelExpr": "i",
    "valueExpr": "sysTok + i * perTurn",
    "maxExpr": "128000",
    "fmt": "k"
  }
}
```

### 实验引导

1. **轮次拉到 20** → 对比①无压缩 vs ②③，节省率有多高？
2. **summTok 从 300 拉到 800** → 观察③摘要压缩的数值变化——摘要太大时优势缩小
3. **summTok 拉到 50** → 极致压缩，但摘要质量可能不够
4. **winSize 改成 1** → 滑动窗口退化为"只看最后一轮"
5. **winSize 改成 10，轮次 = 10** → 窗口 ≥ 轮次时，滑动窗口 = 无压缩（没意义）
6. **perTurn 拉到 1000** → 每轮数据大（搜索、长文档），压缩优势更显著

---

## 4 · 实验室：用代码实现四种压缩策略

在真实沙盒中运行，对比四种策略处理同一组消息时的 context 大小差异：

```widget:code-playground
{
  "title": "Context 压缩实验室",
  "hint": "切换策略和参数，观察 context 大小变化",
  "mode": "sandbox",
  "files": [
    {
      "path": "main.js",
      "active": true,
      "code": "import { simulate } from './strategies.js';\nimport { printReport } from './report.js';\n\n// ── 参数配置 ────────────────────────────\nconst totalTurns = {{totalTurns}};\nconst strategy = {{strategy}};\nconst windowSize = {{windowSize}};\n\nconsole.log('🔬 Context 压缩实验');\nconsole.log('策略:', strategy);\nconsole.log('轮次:', totalTurns);\nconsole.log('窗口大小:', windowSize);\nconsole.log('');\n\n// 模拟 Agent 对话历史\nconst history = [];\nhistory.push({ role: 'system', content: '你是一个旅行规划助手。根据用户需求规划行程。' });\nhistory.push({ role: 'user', content: '我是素食主义者，预算 5000 元，想去云南玩 5 天。' });\n\nfor (let turn = 1; turn <= totalTurns; turn++) {\n  // 模拟每轮 Agent 回复和用户追问\n  history.push({ role: 'assistant', content: `第 ${turn} 天行程建议：参观景点 ${turn}，午餐推荐当地特色餐厅，晚上入住酒店。预估花费约 ${800 + turn * 100} 元。` });\n  if (turn < totalTurns) {\n    history.push({ role: 'user', content: `第 ${turn} 天的方案不错。请继续规划第 ${turn + 1} 天。` });\n  }\n}\n\nconsole.log(`原始历史: ${history.length} 条消息`);\n\n// 执行压缩策略\nconst result = await simulate(strategy, history, windowSize);\nprintReport(result, strategy);",
      "slots": [
        {
          "id": "totalTurns",
          "default": "8",
          "tooltip": "总轮次。试试 3（短任务）、8（中等）、16（长任务，观察差异更明显）"
        },
        {
          "id": "strategy",
          "default": "'none'",
          "tooltip": "试试 'none' / 'sliding_window' / 'summarize' / 'hybrid'"
        },
        {
          "id": "windowSize",
          "default": "4",
          "tooltip": "滑动窗口和混合策略保留的最近轮次数"
        }
      ]
    },
    {
      "path": "strategies.js",
      "code": "export async function simulate(strategy, history, windowSize) {\n  const sysMsg = history.find(m => m.role === 'system');\n  const dialogMsgs = history.filter(m => m.role !== 'system');\n  const beforeTokens = countTokens(history.map(m => m.content).join('')).tokens;\n\n  let compressed;\n  let summaryText = null;\n\n  if (strategy === 'none') {\n    compressed = [...history];\n  } else if (strategy === 'sliding_window') {\n    const keep = dialogMsgs.slice(-windowSize * 2);\n    compressed = [sysMsg, ...keep];\n  } else if (strategy === 'summarize') {\n    // 用真实 LLM 生成摘要\n    const earlyMsgs = dialogMsgs.slice(0, -4);\n    const recentMsgs = dialogMsgs.slice(-4);\n    if (earlyMsgs.length > 0) {\n      const summaryReq = earlyMsgs.map(m => `${m.role}: ${m.content}`).join('\\n');\n      console.log('[压缩] 正在用 LLM 生成摘要...');\n      const resp = await callLLM([\n        { role: 'system', content: '将以下对话历史压缩为一段简洁摘要（100字以内），保留关键信息（用户偏好、已确定事项）。只输出摘要文本。' },\n        { role: 'user', content: summaryReq }\n      ]);\n      summaryText = resp.content;\n      console.log('[压缩] 摘要:', summaryText);\n      compressed = [sysMsg, { role: 'system', content: '对话摘要: ' + summaryText }, ...recentMsgs];\n    } else {\n      compressed = [...history];\n    }\n  } else if (strategy === 'hybrid') {\n    const earlyMsgs = dialogMsgs.slice(0, -windowSize * 2);\n    const recentMsgs = dialogMsgs.slice(-windowSize * 2);\n    if (earlyMsgs.length > 0) {\n      const summaryReq = earlyMsgs.map(m => `${m.role}: ${m.content}`).join('\\n');\n      console.log('[压缩] 正在用 LLM 生成摘要...');\n      const resp = await callLLM([\n        { role: 'system', content: '将以下对话历史压缩为一段简洁摘要（100字以内），保留关键信息（用户偏好、已确定事项）。只输出摘要文本。' },\n        { role: 'user', content: summaryReq }\n      ]);\n      summaryText = resp.content;\n      console.log('[压缩] 摘要:', summaryText);\n      compressed = [sysMsg, { role: 'system', content: '对话摘要: ' + summaryText }, ...recentMsgs];\n    } else {\n      compressed = [sysMsg, ...recentMsgs];\n    }\n  } else {\n    console.error('未知策略:', strategy);\n    compressed = [...history];\n  }\n\n  const afterTokens = countTokens(compressed.map(m => m.content).join('')).tokens;\n  return { before: beforeTokens, after: afterTokens, messages: compressed.length, summary: summaryText };\n}"
    },
    {
      "path": "report.js",
      "code": "export function printReport(result, strategy) {\n  console.log('');\n  console.log('────────────────────────────');\n  console.log('📊 压缩报告');\n  console.log('策略:', strategy);\n  console.log('压缩前:', result.before, 'tokens');\n  console.log('压缩后:', result.after, 'tokens');\n  const saved = result.before - result.after;\n  const rate = result.before > 0 ? Math.round(saved / result.before * 100) : 0;\n  console.log('节省:', saved, 'tokens (' + rate + '%)');\n  console.log('消息数:', result.messages);\n  if (result.summary) {\n    console.log('');\n    console.log('⚠ 注意：摘要中是否保留了「素食主义者」这个关键偏好？');\n    console.log('  如果丢失了，Agent 后续可能推荐肉类餐厅。');\n  }\n}"
    }
  ],
  "outputHeight": 340
}
```

### 关键实验

| 试什么 | 观察什么 |
|--------|---------|
| `strategy = 'none'`，轮次 = 16 | 零压缩，token 数最高，作为基线 |
| `strategy = 'sliding_window'`，窗口 = 4 | token 大幅降低，但第 1 轮的"素食主义者"信息是否还在？ |
| `strategy = 'summarize'`，轮次 = 16 | 观察 LLM 生成的摘要是否保留了关键偏好 |
| `strategy = 'hybrid'`，窗口 = 4 | 兼顾摘要 + 近期历史，对比节省率 |
| 窗口 = 1 vs 窗口 = 8 | 窗口大小对信息保留和 token 消耗的影响 |

---

## 进阶：生产级 Context 管理机制

上面的四种策略是基础。在生产级 Agent 系统中，还有更精细的 context 管理思路：

### 冷热分层存储

借鉴数据库的冷热存储概念，把 context 分为不同温度层：

| 层级 | 温度 | 内容 | 存储位置 | 检索方式 |
|------|------|------|---------|---------|
| **热层** | 🔴 Hot | 最近 3-5 轮对话 + 当前任务状态 | Context window 内 | 直接在 context 中 |
| **温层** | 🟡 Warm | 本次会话的摘要 + 关键决策节点 | Context window 内（压缩形式） | 摘要注入 |
| **冷层** | 🔵 Cold | 历史会话偏好、长期记忆 | 外部数据库（下节课 Memory 系统） | 按需检索注入 |

**实际应用**：Cursor / GitHub Copilot 的对话模式就是冷热分层——当前文件内容是 Hot，最近编辑的文件是 Warm，整个项目索引是 Cold（通过 embedding 检索）。

### 重要性评分（Importance Scoring）

不是所有 context 同等重要。更智能的做法是给每条消息打分，优先保留高分内容：

| 信号 | 权重 | 例子 |
|------|------|------|
| 用户显式偏好 | 高 | "我是素食主义者"、"预算 5000" |
| 工具调用结果 | 中-高 | 搜索结果、API 返回数据 |
| 确认性回复 | 低 | "好的"、"继续"、"没问题" |
| 重复信息 | 极低 | 和之前轮次重复的内容 |

**实际应用**：MemGPT（现 Letta）就实现了类似机制——Agent 自主决定哪些信息"值得记住"，哪些可以安全丢弃。

### 渐进式压缩（Progressive Compression）

不是一次性压缩，而是随着对话推进分层压缩：

```
Round 1-4:  全量保留（Hot）
Round 5-8:  Round 1-4 被压缩为摘要 v1（Warm）
Round 9-12: Round 1-8 的摘要 v1 + Round 5-8 被压缩为摘要 v2
Round 13+:  摘要 v2 + 最近 4 轮（Hot）
```

每次压缩都有信息损失，但摘要随时间"沉淀"——越旧的信息压缩越狠，越新的保留越完整。

:::callout{variant="blue" title="选择策略的决策树"}
1. 轮次 < 10 且 obs 较小？→ **无压缩**
2. 早期信息不重要（闲聊、独立问答）？→ **滑动窗口**
3. 需要保留早期语义？→ **摘要** 或 **混合策略**
4. 生产级、长会话、多场景？→ **冷热分层** + **重要性评分**
:::

---

## 5 · 练习：检验你的理解

```widget:quiz
{
  "title": "Context 管理测验",
  "questions": [
    {
      "id": "q1",
      "text": "用户在第 1 轮说「我是素食主义者」，Agent 用滑动窗口（size=5）执行了 20 轮后还在推荐菜品。问题出在哪里？",
      "type": "single",
      "options": [
        { "text": "max_turns 设置太大了", "correct": false },
        { "text": "第 1 轮已超出窗口范围被丢弃，Agent 忘记了用户是素食主义者", "correct": true },
        { "text": "LLM 能力不够，理解不了素食偏好", "correct": false }
      ],
      "explanation": "滑动窗口（size=5）只保留最近 5 轮。第 1 轮的偏好信息在第 6 轮就被丢弃了。这正是滑动窗口的核心缺陷——早期信息不可逆地丢失。解决方案：改用摘要或混合策略，把关键偏好写入摘要。"
    },
    {
      "id": "q2",
      "text": "摘要压缩相比滑动窗口的核心优势是什么？",
      "type": "single",
      "options": [
        { "text": "实现更简单", "correct": false },
        { "text": "保留早期历史的语义信息，而非直接丢弃", "correct": true },
        { "text": "完全不会丢失任何信息", "correct": false }
      ],
      "explanation": "摘要压缩用 LLM 把早期历史凝练为一段摘要，保留语义而非原始文本。代价是额外一次 LLM 调用 + 摘要必然丢失细节。但相比滑动窗口的「完全遗忘」，摘要的信息保留率高得多。"
    },
    {
      "id": "q3",
      "text": "什么情况下「无压缩」是最合理的选择？",
      "type": "single",
      "options": [
        { "text": "短任务（<10 轮），context 不会触顶的场景", "correct": true },
        { "text": "长对话任务，需要记住所有细节", "correct": false },
        { "text": "任何时候都不应该用无压缩", "correct": false }
      ],
      "explanation": "无压缩 = 零信息损失 + 零实现成本。如果任务轮次少、context 远低于上限，无压缩是最简单高效的选择。过早引入压缩反而增加复杂度和 LLM 调用成本。"
    }
  ]
}
```

---

## 本课小结

- Context **线性增长不可避免**，区别只是增长速度
- **四种策略**的权衡轴是：信息保留 ↔ token 节省 ↔ 实现复杂度
- **滑动窗口**简单但会丢失早期关键信息
- **摘要压缩**保留语义但需要额外 LLM 调用
- **混合策略**（摘要 + 近 K 轮）是大多数生产 Agent 的首选
- 选择策略的判断标准：**早期历史对后续推理还重不重要？**

```widget:checklist
{
  "title": "第 2 课完成清单",
  "id": "module-2-lesson-02",
  "items": [
    "我能计算任意轮次的 context 大小",
    "我能说清四种策略的核心机制和信息损失特征",
    "我理解滑动窗口为什么会「忘事」",
    "我理解摘要压缩的代价（额外 LLM 调用 + 细节丢失）",
    "我做了沙盒实验，对比了四种策略的 token 节省率",
    "我做了代码实验，观察了真实摘要生成的效果",
    "我了解冷热分层和重要性评分等生产级策略",
    "我完成了 3 道测验题"
  ]
}
```

---

[← 上一课](/lesson/module-2/01-agent-loop) · [下一课 →](/lesson/module-2/03-memory-system)
