---
title: "Agent Loop：什么驱动 Agent 持续运行？"
module: "module-2"
moduleTitle: "模块二：Agent 工程"
duration: "20 分钟"
description: "理解 Agent 的核心运行机制——Loop 循环架构，掌握观测→推理→行动→终止的四阶段模型，通过沙盒和代码实验感受参数对行为的影响。"
tags: ["Agent Loop", "终止条件", "Context 增长", "入门"]
expert:
  name: "Agent 架构师 Kira"
  model: "gpt-4o"
  intro: "你好！我是 Kira，专注于 Agent 系统设计。关于 Agent Loop、终止条件、context 增长等问题，随时问我 👋"
  systemPrompt: |
    你是一位专注于 AI Agent 架构设计的技术顾问，名叫 Kira。
    你的核心能力：帮助学生理解 Agent Loop 的运行机制，解释 Observe-Think-Act-Terminate 模式。
    回复风格：技术严谨但通俗易懂，善于用类比说明。
    回复要求：
    - 用中文回复，每次回复在 200 字以内
    - 优先用具体数字和例子解释
    - 如果学生对某个概念模糊，先给一句话定义，再展开
---

本课结束时，你能做到：

> ✓ 理解 Loop 的四个组成部分（观测 / 推理 / 行动 / 终止）
> ✓ 知道 context 为什么线性增长
> ✓ 能设计合理的终止条件
> ✓ 通过沙盒实验感受参数对行为的影响

---

## 1 · 概念：Agent 和传统程序有什么本质区别？

```widget:before-after
{
  "title": "三种执行模式对比",
  "subtitle": "Agent 把「判断」交给了 LLM，获得灵活性，代价是失去对执行路径的直接控制。",
  "tabs": [
    {
      "label": "人类决策",
      "prompt": "看到红灯\n  → 判断：该停车\n  → 踩刹车\n  → 观察：灯变绿了\n  → 判断：可以走了\n  → 踩油门\n\n循环直到到达目的地",
      "analysis": "人类通过感知-判断-行动的持续循环来完成任务。每一步都有自主判断，能应对意外情况。",
      "type": "neutral"
    },
    {
      "label": "传统程序",
      "prompt": "输入参数\n  → 固定逻辑分支\n  → 计算结果\n  → 输出\n\n一次执行，结果确定",
      "analysis": "传统程序是线性的：给定输入，输出确定。无法处理模糊指令，不会自主决策，没有循环反馈。",
      "type": "bad"
    },
    {
      "label": "AI Agent",
      "prompt": "观测环境（工具结果、用户消息）\n  → LLM 推理决策\n  → 执行行动（调用工具）\n  → 新的观测结果\n  → LLM 再次推理\n  → ...\n  → 满足终止条件 → 返回结果",
      "analysis": "Agent 把判断交给 LLM，获得了处理复杂、模糊任务的能力。代价：执行路径不可预测，需要终止条件防止失控。",
      "type": "good"
    }
  ]
}
```

**核心观点**：Agent 和传统程序的本质区别在于 **Loop**——Agent 不是执行一次就结束，而是持续循环：观测→推理→行动→再观测，直到满足终止条件。

这让 Agent 能处理复杂、多步骤的任务（比如"帮我调研竞品并写一份报告"），但也意味着你不能精确预测它会执行多少步、消耗多少 token。

---

## 2 · 图解：Agent Loop 的四个阶段

```widget:diagram
{
  "title": "Agent Loop 核心循环",
  "caption": "每一轮：环境观测 → Context 积累 → LLM 推理 → 行动执行。终止条件是唯一的出口。",
  "svg": "<svg viewBox='0 0 720 340' xmlns='http://www.w3.org/2000/svg'><defs><marker id='al' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M2 1L8 5L2 9' fill='none' stroke='context-stroke' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></marker></defs><g class='c-blue'><rect x='30' y='70' rx='12' width='140' height='75' stroke-width='0.5'/><text class='th' x='100' y='100' text-anchor='middle'>Observe</text><text class='ts' x='100' y='118' text-anchor='middle'>获取观测结果</text></g><g class='c-blue'><rect x='210' y='70' rx='12' width='140' height='75' stroke-width='0.5'/><text class='th' x='280' y='100' text-anchor='middle'>Context</text><text class='ts' x='280' y='118' text-anchor='middle'>累积到上下文</text></g><g class='c-purple'><rect x='390' y='70' rx='12' width='140' height='75' stroke-width='0.5'/><text class='th' x='460' y='100' text-anchor='middle'>Think</text><text class='ts' x='460' y='118' text-anchor='middle'>LLM 推理决策</text></g><g class='c-teal'><rect x='570' y='70' rx='12' width='120' height='75' stroke-width='0.5'/><text class='th' x='630' y='100' text-anchor='middle'>Act</text><text class='ts' x='630' y='118' text-anchor='middle'>执行行动</text></g><line x1='170' y1='107' x2='208' y2='107' stroke='var(--s)' stroke-width='1.5' marker-end='url(#al)'/><line x1='350' y1='107' x2='388' y2='107' stroke='var(--s)' stroke-width='1.5' marker-end='url(#al)'/><line x1='530' y1='107' x2='568' y2='107' stroke='var(--s)' stroke-width='1.5' marker-end='url(#al)'/><path d='M630 147 C630 230 100 230 100 147' fill='none' stroke='var(--s)' stroke-width='1.5' stroke-dasharray='6 4' marker-end='url(#al)'/><text class='ts' x='365' y='222' text-anchor='middle' style='font-style:italic'>循环</text><g class='c-gray'><rect x='280' y='265' rx='8' width='180' height='45' stroke-width='0.5'/><text class='th' x='370' y='285' text-anchor='middle'>终止条件</text><text class='ts' x='370' y='302' text-anchor='middle'>stop signal / max_turns</text></g><line x1='460' y1='145' x2='460' y2='240' stroke='var(--t)' stroke-width='1' stroke-dasharray='4 3'/><line x1='460' y1='240' x2='462' y2='265' stroke='var(--t)' stroke-width='1' marker-end='url(#al)'/><text class='ts' x='490' y='258' style='fill:var(--t)'>退出?</text></svg>"
}
```

**Context 每轮增长**：每一轮 loop，context 都在积累——system prompt 固定存在，加上每轮的观测结果和 LLM 回复。公式：

> **第 N 轮 Context = system_tokens + N × (obs_per_turn + asst_per_turn)**

这就是为什么终止条件至关重要——没有终止条件，context 会无限增长直到触顶。

:::callout{variant="amber" title="终止条件三道保障"}
1. **LLM 主动终止**：LLM 输出 stop signal，判断任务完成
2. **max_turns 硬限制**：达到最大轮次强制停止（安全网）
3. **外部中断**：超时、用户取消、异常退出

三者缺一不可。只靠 LLM 判断，可能死循环；只靠 max_turns，效率低下。
:::

---

## 3 · 沙盒：感受 Context 增长与终止条件

调整下面的参数，观察 context 如何随轮次增长，以及终止条件如何影响行为：

```widget:sandbox
{
  "title": "Agent Loop 参数沙盒",
  "hint": "拖动滑块和开关，观察指标实时变化",
  "params": [
    { "id": "maxTurns", "label": "max_turns（最大轮次）", "min": 1, "max": 30, "default": 8, "step": 1 },
    { "id": "stopAt", "label": "任务自然完成轮次", "min": 1, "max": 20, "default": 3, "step": 1, "hint": "假设 Agent 在第几轮完成任务（若有 stop signal）" },
    { "id": "sysTok", "label": "system_tokens", "min": 100, "max": 2000, "default": 400, "step": 50, "fmt": "auto" },
    { "id": "obsTok", "label": "obs_per_turn（每轮观测 tokens）", "min": 50, "max": 1000, "default": 280, "step": 10, "fmt": "auto" },
    { "id": "asstTok", "label": "asst_per_turn（每轮回复 tokens）", "min": 50, "max": 600, "default": 160, "step": 10, "fmt": "auto" }
  ],
  "checkboxes": [
    { "id": "hasStop", "label": "启用 stop signal 检测", "default": true, "hint": "关闭后 Agent 不会在任务完成时主动终止" },
    { "id": "simError", "label": "模拟第 5 轮工具错误（+500 tokens 错误信息）", "default": false }
  ],
  "metrics": [
    {
      "label": "实际运行轮次",
      "expr": "hasStop ? (stopAt < maxTurns ? stopAt : maxTurns) : maxTurns",
      "fmt": "auto"
    },
    {
      "label": "末轮 Context",
      "expr": "sysTok + (hasStop ? (stopAt < maxTurns ? stopAt : maxTurns) : maxTurns) * (obsTok + asstTok) + simError * (5 <= (hasStop ? (stopAt < maxTurns ? stopAt : maxTurns) : maxTurns) ? 500 : 0)",
      "fmt": "k",
      "warnAbove": 80000,
      "dangerAbove": 115000
    },
    {
      "label": "占 128k 窗口",
      "expr": "(sysTok + (hasStop ? (stopAt < maxTurns ? stopAt : maxTurns) : maxTurns) * (obsTok + asstTok) + simError * (5 <= (hasStop ? (stopAt < maxTurns ? stopAt : maxTurns) : maxTurns) ? 500 : 0)) / 128000 * 100",
      "fmt": "%",
      "warnAbove": 60,
      "dangerAbove": 90
    },
    {
      "label": "冗余轮次",
      "expr": "hasStop ? 0 : (maxTurns > stopAt ? maxTurns - stopAt : 0)",
      "fmt": "auto",
      "warnAbove": 1,
      "dangerAbove": 5
    }
  ],
  "growth": {
    "title": "每轮 Context 大小（含冗余轮次）",
    "steps": "hasStop ? (stopAt < maxTurns ? stopAt : maxTurns) : maxTurns",
    "labelExpr": "i",
    "valueExpr": "sysTok + i * (obsTok + asstTok) + simError * (i >= 5 ? 500 : 0)",
    "maxExpr": "128000",
    "fmt": "k"
  }
}
```

### 试试这些实验

1. **关闭 stop signal** — 观察「实际运行轮次」从 3 跳到 8，「冗余轮次」变成 5。任务第 3 轮就完成了，但 Agent 继续空转到 max_turns
2. **关闭 stop signal + 把 max_turns 拉到 20** — 冗余轮次变成 17，末轮 context 和费用飙升。这就是为什么两道保障缺一不可
3. **把 stopAt 拉大（比如 10）再关闭 stop signal** — 复杂任务本身需要更多轮次，冗余减少，但 context 增长更多
4. **勾选"模拟工具错误"** — 当轮次 ≥5 时，context 多出 500 tokens（错误信息也会进入 context）

---

## 4 · 实验室：用代码跑一个真实的 Agent Loop

下面的代码在真实沙盒中运行，`callLLM` 会调用真实的 LLM 模型。修改参数，观察 Agent 的行为、token 消耗和 context 变化：

```widget:code-playground
{
  "title": "Agent Loop 实验室",
  "hint": "修改参数，点击 Run 观察多轮 LLM 调用与 token 增长",
  "mode": "sandbox",
  "files": [
    {
      "path": "agent.js",
      "active": true,
      "code": "import { getConfig } from './config.js';\nimport { trackContext } from './context.js';\n\nconst config = getConfig();\nconsole.log('🚀 Agent Loop 启动');\nconsole.log('最大轮次:', config.maxTurns);\nconsole.log('终止检测:', config.checkStop ? '开启' : '关闭');\nconsole.log('');\n\n// 每轮给 LLM 不同的子任务，模拟多步骤分析\nconst steps = [\n  '第一步：列出需要对比的 3 个维度（不超过 20 字/维度）',\n  '第二步：针对维度 1，对比两个城市并打分（1-10）',\n  '第三步：针对维度 2 和 3，对比两个城市并打分',\n  '第四步：汇总所有维度得分，给出最终结论。格式：[DONE] 推荐城市：...',\n  '补充分析：还有哪些维度值得考虑？格式：[DONE] 补充完毕',\n];\n\nconst messages = [\n  { role: 'system', content: config.systemPrompt },\n  { role: 'user', content: config.task }\n];\n\ntrackContext('初始', messages);\n\nfor (let turn = 0; turn < config.maxTurns; turn++) {\n  console.log(`\\n━━━ Turn ${turn + 1}/${config.maxTurns} ━━━`);\n\n  // Think: LLM 推理\n  const response = await callLLM(messages);\n  messages.push({ role: 'assistant', content: response.content });\n  console.log('Agent:', response.content);\n  trackContext(`Turn ${turn + 1}`, messages);\n\n  // 终止判断：检测 [DONE] 标记\n  if (config.checkStop && response.content.includes('[DONE]')) {\n    console.log('\\n✓ 检测到 [DONE]，Agent 主动停止');\n    break;\n  }\n\n  if (turn === config.maxTurns - 1) {\n    console.log('\\n⚠ 达到 max_turns 限制，强制停止');\n    break;\n  }\n\n  // 给出下一步指令，推动循环继续\n  const nextStep = steps[turn + 1] || '继续分析。完成后输出 [DONE]。';\n  messages.push({ role: 'user', content: nextStep });\n  console.log('指令:', nextStep);\n}",
      "slots": [
        {
          "id": "maxTurns",
          "default": "5",
          "tooltip": "试试 1（只做第一步就停）、3（中途停止）、5（完整流程）、8（观察冗余）"
        },
        {
          "id": "checkStop",
          "default": "true",
          "tooltip": "改成 false：Agent 完成任务后还会继续循环直到 max_turns"
        },
        {
          "id": "task",
          "default": "'帮我对比深圳和杭州哪个更适合程序员居住。分步骤分析。'",
          "tooltip": "换一个多步骤任务试试"
        }
      ]
    },
    {
      "path": "config.js",
      "code": "export function getConfig() {\n  return {\n    systemPrompt: {{systemPrompt}},\n    maxTurns: {{maxTurns}},\n    checkStop: {{checkStop}},\n    task: {{task}},\n  };\n}",
      "slots": [
        {
          "id": "systemPrompt",
          "default": "'你是一个城市分析师。每次只完成用户要求的一个步骤，简洁回答（50字以内）。任务全部完成时在结尾加上 [DONE]。'",
          "tooltip": "注意：prompt 里约束了每步只做一件事，不要一次做完"
        },
        {
          "id": "maxTurns",
          "default": "5",
          "tooltip": "最大轮次"
        },
        {
          "id": "checkStop",
          "default": "true",
          "tooltip": "终止信号检测"
        },
        {
          "id": "task",
          "default": "'帮我对比深圳和杭州哪个更适合程序员居住。分步骤分析。'",
          "tooltip": "任务"
        }
      ]
    },
    {
      "path": "context.js",
      "code": "// Context 追踪模块\n// 每轮打印 messages 数量和预估 token 量\n// 用于观察 context 随 loop 线性增长\n\nexport function trackContext(label, messages) {\n  const full = messages.map(m => m.content).join('');\n  const info = countTokens(full);\n  const bar = '█'.repeat(Math.min(Math.round(info.tokens / 50), 30));\n  console.log(`📋 [${label}] ${messages.length} msgs | ~${info.tokens} tok ${bar}`);\n}"
    }
  ],
  "outputHeight": 360
}
```

### 关键实验

| 改什么 | 预期效果 | 学到什么 |
|--------|---------|---------|
| `maxTurns = 1` | 只做第一步（列维度），任务未完成 | max_turns 太小会截断多步骤任务 |
| `maxTurns = 3` | 做到第三步（打分），还没汇总 | 观察哪轮停下、context 增长了多少 |
| `checkStop = false` | 第 4 轮已 [DONE] 但继续空转到 max_turns | 冗余轮次的 token 浪费 |
| 换一个简单任务 | 第 1 轮就 [DONE] | 简单任务不需要多轮 loop |
| 观察 📋 打印 | 每轮 token 数递增，bar 越来越长 | Context 线性增长的直观感受 |

---

## 5 · 练习：检验你的理解

```widget:quiz
{
  "title": "Agent Loop 理解测验",
  "questions": [
    {
      "id": "q1",
      "text": "一个 Agent 已成功完成任务，但代码中 check_stop = false，max_turns = 20。此时 Agent 会怎么做？",
      "type": "single",
      "options": [
        { "text": "立即停止——任务完成是隐式终止条件", "correct": false },
        { "text": "继续执行，直到 max_turns = 20 被触发或外部中断", "correct": true },
        { "text": "LLM 会自动识别任务完成并发出停止信号", "correct": false }
      ],
      "explanation": "Agent loop 只响应显式终止条件。「任务完成」对 loop 是透明的——除非 check_stop = true 且 LLM 输出了终止信号，否则会一直循环到 max_turns。"
    },
    {
      "id": "q2",
      "text": "某 Agent：max_turns = 5，system_tokens = 800，obs_per_turn = 400，asst_per_turn = 200。第 5 轮 context 大小是多少？",
      "type": "single",
      "options": [
        { "text": "max_turns × (obs+asst) = 3,000 tokens", "correct": false },
        { "text": "system + max_turns × (obs+asst) = 800 + 5×600 = 3,800 tokens", "correct": true },
        { "text": "只算最后一轮：obs + asst = 600 tokens", "correct": false }
      ],
      "explanation": "Context 是累积的——system prompt 每轮固定存在，历史对话随轮次线性叠加。公式：system + turns × (obs + asst)。"
    },
    {
      "id": "q3",
      "text": "生产环境中，下列哪种终止条件设计最稳健？",
      "type": "single",
      "options": [
        { "text": "只设 max_turns，足够安全", "correct": false },
        { "text": "只设 stop signal 检测，任务完成就退出", "correct": false },
        { "text": "同时设 stop signal + max_turns，两者都能触发停止", "correct": true }
      ],
      "explanation": "Stop signal 是主动终止（效率优先），max_turns 是被动安全网（防止失控）。两者结合才是生产级配置——单独任何一个都有漏洞。"
    }
  ]
}
```

---

## 本课小结

- Agent = LLM + 工具 + **Loop**，核心驱动力是循环
- 每轮循环四阶段：**Observe**（观测）→ **Context**（累积）→ **Think**（推理）→ **Act**（执行）
- Context **线性增长**：第 N 轮 = system + N × (obs + asst)
- **终止条件**三道保障缺一不可：LLM stop signal + max_turns + 外部中断
- `max_turns` 是安全网，不能替代 stop signal

```widget:checklist
{
  "title": "第 1 课完成清单",
  "id": "module-2-lesson-01",
  "items": [
    "我理解 Agent 和传统程序的本质区别是 Loop",
    "我能说出 Loop 的四个阶段",
    "我能用公式计算第 N 轮的 context 大小",
    "我知道终止条件的三道保障",
    "我做了沙盒实验，感受了参数变化的效果",
    "我做了代码实验，观察了真实的 token 消耗",
    "我完成了 3 道测验题"
  ]
}
```

---

**下一课** → [第 2 课 · Context 管理与压缩](/lesson/module-2/02-context-compression)
