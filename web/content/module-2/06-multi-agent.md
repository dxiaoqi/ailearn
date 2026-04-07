---
title: "Multi-Agent 协作：一个 Agent 不够用时怎么办？"
module: "module-2"
moduleTitle: "模块二：Agent 工程"
duration: "40 分钟"
description: "理解多 Agent 系统的必要性，掌握 Orchestrator / Subagent 的角色分工、通信模式和故障处理策略，通过代码实验体验真实的多 Agent 并行协作。"
tags: ["Multi-Agent", "Orchestrator", "并行", "故障隔离", "中级"]
expert:
  name: "协作架构师 Hana"
  model: "gpt-4o"
  intro: "你好！我是 Hana，专注于多 Agent 系统设计。Orchestrator 模式、通信协议、故障降级，随时问我 👋"
  systemPrompt: |
    你是一位专注于 Multi-Agent 系统的技术顾问，名叫 Hana。
    你的核心能力：帮助学生理解多 Agent 协作的设计模式，Orchestrator 与 Subagent 的边界划分。
    回复风格：善于用「单 Agent 做法 → 瓶颈 → Multi-Agent 解法」的递进结构说明。
    回复要求：
    - 用中文回复，每次回复在 250 字以内
    - 用具体的角色分工表格帮助理解
    - 当学生问"什么时候用 Multi-Agent"时，从 context 容量和任务并行性两个维度引导
---

本课结束时，你能做到：

> ✓ 判断什么任务需要 Multi-Agent（vs 单 Agent 就够了）
> ✓ 说清 Orchestrator / Subagent / Specialist 的角色边界
> ✓ 理解并行 vs 串行子任务的性能差异
> ✓ 设计故障处理策略（重试 / 降级 / 部分结果）

**前置**：第 1-4 课

---

## 1 · 概念：为什么需要多个 Agent？

单个 Agent 有四个瓶颈：

| 瓶颈 | 说明 | 例子 |
|------|------|------|
| **Context 上限** | 128k tokens 装不下所有信息 | 同时分析 10 份竞品文档 |
| **能力边界** | 一个 system prompt 难以覆盖所有技能 | 既要写代码又要做设计又要写文案 |
| **速度瓶颈** | 串行执行 5 个独立任务太慢 | 同时搜索 5 个数据源 |
| **故障传播** | 一个工具失败可能卡死整个流程 | 搜索 API 超时导致所有后续步骤停滞 |

**Multi-Agent 的解法**：把一个"全能 Agent"拆成一个协调者 + 多个专家。

```widget:before-after
{
  "title": "单 Agent vs Multi-Agent",
  "subtitle": "任务：分析 3 家竞品的官网、定价和用户评价，生成对比报告",
  "tabs": [
    {
      "label": "单 Agent 方式",
      "prompt": "一个 Agent 串行执行：\n\n1. 搜索竞品 A 官网 → 等 2s\n2. 搜索竞品 A 定价 → 等 2s\n3. 搜索竞品 A 评价 → 等 2s\n4. 搜索竞品 B 官网 → 等 2s\n... 重复 9 次 ...\n\n总耗时：~18 秒\n总 context：所有结果塞在一起\n风险：第 7 步超时 → 全流程卡住",
      "analysis": "问题：9 次搜索串行执行（18 秒）。所有信息塞进一个 context（可能超限）。任何一步失败会影响全局。\n\n这还只是 3 家竞品——如果是 10 家，耗时 60 秒、context 必然爆。",
      "type": "bad"
    },
    {
      "label": "Multi-Agent 方式",
      "prompt": "Orchestrator 分派 3 个 Subagent：\n\n  Subagent A → 竞品 A（官网+定价+评价）\n  Subagent B → 竞品 B（官网+定价+评价）\n  Subagent C → 竞品 C（官网+定价+评价）\n\n三者并行执行：~6 秒\n各自独立 context，互不干扰\nSubagent B 超时？→ A 和 C 结果照常返回\n\nOrchestrator 聚合 3 份结果 → 生成报告",
      "analysis": "改进：并行执行（6 秒 vs 18 秒）。每个 Subagent 独立 context（不会超限）。故障隔离（B 失败不影响 A 和 C）。\n\nOrchestrator 只负责分派和聚合，不做具体搜索——角色清晰。",
      "type": "good"
    }
  ]
}
```

### 三种角色

| 角色 | 职责 | 不做什么 |
|------|------|---------|
| **Orchestrator** | 接收任务 → 分解 → 分派 → 聚合结果 → 返回 | 不直接调用工具、不执行具体分析 |
| **Subagent** | 接收子任务 → 独立执行 → 返回结果 | 不了解全局计划、不与其他 Subagent 通信 |
| **Specialist** | 特定领域（代码/搜索/写作/翻译） | 只处理本领域的请求 |

---

## 2 · 图解：Multi-Agent 协作流程

```widget:diagram
{
  "title": "Orchestrator 协作模式",
  "caption": "Orchestrator 分派子任务，Subagent 并行执行，结果聚合后生成最终输出。",
  "svg": "<svg viewBox='0 0 640 340' xmlns='http://www.w3.org/2000/svg'><defs><marker id='a6' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M2 1L8 5L2 9' fill='none' stroke='context-stroke' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></marker></defs><g class='c-gray'><rect x='240' y='10' rx='8' width='160' height='34' stroke-width='0.5'/><text class='th' x='320' y='32' text-anchor='middle'>用户请求</text></g><line x1='320' y1='44' x2='320' y2='64' stroke='var(--s)' stroke-width='1.5' marker-end='url(#a6)'/><g class='c-purple'><rect x='200' y='66' rx='10' width='240' height='44' stroke-width='0.5'/><text class='th' x='320' y='86' text-anchor='middle'>Orchestrator</text><text class='ts' x='320' y='102' text-anchor='middle'>分解任务 · 分派 · 聚合</text></g><line x1='240' y1='110' x2='100' y2='148' stroke='var(--s)' stroke-width='1.5' marker-end='url(#a6)'/><line x1='320' y1='110' x2='320' y2='148' stroke='var(--s)' stroke-width='1.5' marker-end='url(#a6)'/><line x1='400' y1='110' x2='540' y2='148' stroke='var(--s)' stroke-width='1.5' marker-end='url(#a6)'/><text class='ts' x='320' y='138' text-anchor='middle' style='fill:var(--color-text-tertiary)'>并行分派</text><g class='c-teal'><rect x='30' y='150' rx='10' width='140' height='70' stroke-width='0.5'/><text class='th' x='100' y='176' text-anchor='middle'>Subagent A</text><text class='ts' x='100' y='194' text-anchor='middle'>竞品 A 分析</text><text class='ts' x='100' y='210' text-anchor='middle' style='fill:var(--color-text-tertiary)'>独立 context</text></g><g class='c-teal'><rect x='250' y='150' rx='10' width='140' height='70' stroke-width='0.5'/><text class='th' x='320' y='176' text-anchor='middle'>Subagent B</text><text class='ts' x='320' y='194' text-anchor='middle'>竞品 B 分析</text><text class='ts' x='320' y='210' text-anchor='middle' style='fill:var(--color-text-tertiary)'>独立 context</text></g><g class='c-teal'><rect x='470' y='150' rx='10' width='140' height='70' stroke-width='0.5'/><text class='th' x='540' y='176' text-anchor='middle'>Subagent C</text><text class='ts' x='540' y='194' text-anchor='middle'>竞品 C 分析</text><text class='ts' x='540' y='210' text-anchor='middle' style='fill:var(--color-text-tertiary)'>独立 context</text></g><line x1='100' y1='220' x2='240' y2='260' stroke='var(--color-text-success)' stroke-width='1.5' marker-end='url(#a6)'/><line x1='320' y1='220' x2='320' y2='260' stroke='var(--color-text-success)' stroke-width='1.5' marker-end='url(#a6)'/><line x1='540' y1='220' x2='400' y2='260' stroke='var(--color-text-success)' stroke-width='1.5' marker-end='url(#a6)'/><text class='ts' x='320' y='250' text-anchor='middle' style='fill:var(--color-text-success)'>结果返回</text><g class='c-purple'><rect x='200' y='262' rx='10' width='240' height='34' stroke-width='0.5'/><text class='th' x='320' y='284' text-anchor='middle'>聚合 · 生成报告</text></g><line x1='320' y1='296' x2='320' y2='316' stroke='var(--s)' stroke-width='1.5' marker-end='url(#a6)'/><g class='c-gray'><rect x='240' y='318' rx='8' width='160' height='28' stroke-width='0.5'/><text class='ts' x='320' y='336' text-anchor='middle'>最终输出给用户</text></g></svg>"
}
```

### 通信协议

| 方向 | 内容 |
|------|------|
| Orchestrator → Subagent | 子任务描述 + 可用工具 + 输出格式要求 |
| Subagent → Orchestrator | 执行结果 + 状态（success / error） |

:::callout{variant="amber" title="故障处理三种策略"}
1. **重试**：Subagent 失败 → Orchestrator 重新分派同一任务
2. **降级**：Subagent 超时 → 用已有的部分结果生成不完整但有用的回答
3. **替换**：Specialist A 失败 → 切换到 Specialist B（备用）

生产环境中通常结合使用：先重试 1 次 → 仍失败则降级。
:::

---

## 3 · 沙盒：Multi-Agent 性能对比

```widget:sandbox
{
  "title": "单 Agent vs Multi-Agent 性能对比",
  "hint": "调整 Agent 数量和任务参数，对比耗时和 context 消耗",
  "params": [
    { "id": "subTasks", "label": "子任务数量", "min": 1, "max": 8, "default": 3, "step": 1, "hint": "需要并行处理的独立任务数" },
    { "id": "taskDelay", "label": "每个子任务耗时 (ms)", "min": 500, "max": 5000, "default": 2000, "step": 500, "fmt": "auto" },
    { "id": "taskTokens", "label": "每个子任务 context (tokens)", "min": 500, "max": 5000, "default": 2000, "step": 500, "fmt": "auto" },
    { "id": "orchOverhead", "label": "Orchestrator 开销 (tokens)", "min": 200, "max": 2000, "default": 500, "step": 100, "fmt": "auto", "hint": "分解+聚合消耗的额外 token" }
  ],
  "checkboxes": [
    { "id": "useMulti", "label": "启用 Multi-Agent（并行）", "default": false, "hint": "开启后子任务并行执行" }
  ],
  "metrics": [
    {
      "label": "总耗时 (ms)",
      "expr": "useMulti ? taskDelay + 500 : subTasks * taskDelay",
      "fmt": "auto",
      "warnAbove": 10000,
      "dangerAbove": 20000
    },
    {
      "label": "加速比",
      "expr": "useMulti ? subTasks : 1",
      "fmt": "auto"
    },
    {
      "label": "单 Agent context",
      "expr": "subTasks * taskTokens",
      "fmt": "k",
      "warnAbove": 80000,
      "dangerAbove": 120000
    },
    {
      "label": "Multi-Agent 最大单体",
      "expr": "useMulti ? taskTokens + orchOverhead : subTasks * taskTokens",
      "fmt": "k"
    }
  ],
  "growth": {
    "title": "逐任务累计耗时（串行基线）",
    "steps": "subTasks",
    "labelExpr": "i",
    "valueExpr": "useMulti ? taskDelay : i * taskDelay",
    "maxExpr": "subTasks * taskDelay * 1.2",
    "fmt": "auto"
  }
}
```

### 实验引导

1. **useMulti 关闭，subTasks = 5** → 串行耗时 10 秒，context 累积 10k
2. **打开 useMulti** → 耗时降到 2.5 秒（加速 5x），每个 Subagent 只需 2k context
3. **subTasks = 8，taskTokens = 5000** → 单 Agent context = 40k（一个 context 就占 31%），Multi-Agent 每个只 5k
4. **subTasks = 1** → 只有一个任务时 Multi-Agent 反而多了 Orchestrator 开销——不值得

---

## 4 · 实验室：用代码实现 Orchestrator 协作

在沙盒中实现一个真实的 Orchestrator → Subagent 并行协作流程：

```widget:code-playground
{
  "title": "Multi-Agent 实验室",
  "hint": "观察 Orchestrator 如何分派任务，Subagent 如何并行执行",
  "mode": "sandbox",
  "files": [
    {
      "path": "orchestrator.js",
      "active": true,
      "code": "// ═══ Multi-Agent 协作 ═══\n// Orchestrator 分解 → Subagent 并行执行 → 聚合\n\nconst task = {{task}};\nconst mode = {{mode}};\nconst agentCount = {{agentCount}};\n\nconsole.log('🎯 任务:', task);\nconsole.log('模式:', mode);\nconsole.log('');\n\n// ── 阶段 1：Planning ─────────────────\nconsole.log('━━━ Orchestrator: 分解任务 ━━━');\nconst planResult = await callLLM([\n  { role: 'system', content: `你是一个任务分解器。将用户任务拆成恰好 ${agentCount} 个独立子任务，每个子任务可以被不同的专家独立完成。每行一个，格式：\"子任务N：内容\"。只输出列表。` },\n  { role: 'user', content: task },\n]);\nconsole.log(planResult.content);\n\nconst subTasks = planResult.content.split('\\n').filter(l => l.trim().length > 0);\nconsole.log(`\\n分解为 ${subTasks.length} 个子任务`);\n\n// ── 阶段 2：执行 ─────────────────────\nconsole.log(`\\n━━━ 执行模式: ${mode} ━━━`);\n\nasync function runSubagent(id, subTask) {\n  console.log(`\\n🤖 Subagent ${id} 开始: ${subTask}`);\n  const result = await callLLM([\n    { role: 'system', content: `你是专家 ${id}。只完成分配给你的子任务，用 60 字以内简洁回答。不要做其他子任务。` },\n    { role: 'user', content: subTask },\n  ]);\n  console.log(`✓ Subagent ${id} 完成: ${result.content}`);\n  return { id, task: subTask, result: result.content };\n}\n\nlet results;\nconst startTime = Date.now();\n\nif (mode === 'parallel') {\n  // 并行：所有 Subagent 同时启动\n  results = await Promise.all(\n    subTasks.map((t, i) => runSubagent(String.fromCharCode(65 + i), t))\n  );\n} else {\n  // 串行：依次执行\n  results = [];\n  for (let i = 0; i < subTasks.length; i++) {\n    results.push(await runSubagent(String.fromCharCode(65 + i), subTasks[i]));\n  }\n}\n\nconst elapsed = Date.now() - startTime;\n\n// ── 阶段 3：聚合 ─────────────────────\nconsole.log('\\n━━━ Orchestrator: 聚合结果 ━━━');\nconst summary = results.map(r => `${r.id}: ${r.result}`).join('\\n');\nconst finalResult = await callLLM([\n  { role: 'system', content: '你是报告聚合者。根据多个专家的分析结果，生成一段 100 字以内的综合结论。' },\n  { role: 'user', content: '各专家结果：\\n' + summary },\n]);\nconsole.log('📊 综合结论:', finalResult.content);\nconsole.log('\\n⏱ 执行耗时:', elapsed, 'ms');",
      "slots": [
        {
          "id": "task",
          "default": "'对比 iPhone、三星 Galaxy、华为 Mate 三款旗舰手机，从拍照、续航、价格三个维度分析。'",
          "tooltip": "换一个需要多人协作的任务"
        },
        {
          "id": "mode",
          "default": "'parallel'",
          "tooltip": "'parallel' = 并行（快），'sequential' = 串行（慢）。对比耗时差异。"
        },
        {
          "id": "agentCount",
          "default": "3",
          "tooltip": "Subagent 数量。任务会被拆成这么多个子任务。"
        }
      ]
    }
  ],
  "outputHeight": 420
}
```

### 关键实验

| 试什么 | 观察什么 |
|--------|---------|
| `mode = 'parallel'` | 所有 Subagent 几乎同时完成，观察总耗时 |
| `mode = 'sequential'` | 逐个执行，耗时约为并行的 N 倍 |
| `agentCount = 1` | 退化为单 Agent，没有分解和聚合的价值 |
| `agentCount = 5` | 更多 Subagent，观察 Orchestrator 分解是否合理 |
| 换一个不可并行的任务 | 如"写一首诗"——Multi-Agent 帮不上忙 |

---

## 5 · 练习：检验你的理解

```widget:quiz
{
  "title": "Multi-Agent 测验",
  "questions": [
    {
      "id": "q1",
      "text": "Orchestrator Agent 的核心职责是什么？",
      "type": "single",
      "options": [
        { "text": "直接执行所有工具调用", "correct": false },
        { "text": "分解任务、分配给 Subagent、聚合结果", "correct": true },
        { "text": "存储所有 Subagent 的 context", "correct": false }
      ],
      "explanation": "Orchestrator 是协调者，不是执行者。它的三个职责：① 把复杂任务拆成子任务 ② 分派给合适的 Subagent ③ 收集结果并聚合。它自身不调用搜索、不写代码——那是 Subagent 的事。"
    },
    {
      "id": "q2",
      "text": "下列哪种场景最适合 Multi-Agent？",
      "type": "single",
      "options": [
        { "text": "回答「2+2 等于几？」", "correct": false },
        { "text": "写一首短诗", "correct": false },
        { "text": "同时分析 5 份竞品的官网、定价和评论", "correct": true },
        { "text": "翻译一段文字", "correct": false }
      ],
      "explanation": "5 份竞品分析满足 Multi-Agent 的两个条件：① 子任务独立（各竞品分析互不依赖）② 单 context 难以容纳所有信息（5 × 3 = 15 次搜索结果）。简单任务、不可拆分任务、或单 context 够用的任务不需要 Multi-Agent。"
    },
    {
      "id": "q3",
      "text": "Subagent 应该知道整体任务的完整上下文吗？",
      "type": "single",
      "options": [
        { "text": "应该——信息越多决策越好", "correct": false },
        { "text": "不需要——只接收完成子任务所需的最小信息", "correct": true },
        { "text": "取决于 Orchestrator 的心情", "correct": false }
      ],
      "explanation": "每个 Subagent 只接收最小必要信息。原因：① 减少每个 Subagent 的 context 消耗（这正是 Multi-Agent 的核心优势）② 安全隔离（Subagent A 不需要知道 Subagent B 的数据）③ 全局上下文是 Orchestrator 的职责，不应下放。"
    }
  ]
}
```

---

## 本课小结

- **Multi-Agent 解决四个瓶颈**：context 上限、能力边界、速度、故障传播
- **三种角色**：Orchestrator（协调）/ Subagent（执行）/ Specialist（专家）
- Orchestrator **只分派不执行**，Subagent **只执行不了解全局**
- **并行执行**是 Multi-Agent 的核心性能优势——加速比 ≈ Subagent 数量
- **故障隔离**：一个 Subagent 失败不影响其他，Orchestrator 可以降级处理
- **不是所有任务都需要 Multi-Agent**：单步任务、不可并行任务，用单 Agent 更高效

```widget:checklist
{
  "title": "第 6 课完成清单",
  "id": "module-2-lesson-06",
  "items": [
    "我能判断什么任务需要 Multi-Agent",
    "我能说清三种角色的职责边界",
    "我理解并行 vs 串行的性能差异",
    "我知道故障处理的三种策略（重试/降级/替换）",
    "我做了沙盒实验，对比了单 Agent 和 Multi-Agent 的耗时",
    "我做了代码实验，观察了真实的 Orchestrator 协作流程",
    "我完成了 3 道测验题"
  ]
}
```

---

[← 上一课](/lesson/module-2/05-planning-react) · [下一课 →](/lesson/module-2/07-rag)
