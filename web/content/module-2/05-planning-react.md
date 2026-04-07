---
title: "Planning & ReAct：怎么让 Agent 先想再做？"
module: "module-2"
moduleTitle: "模块二：Agent 工程"
duration: "35 分钟"
description: "理解 ReAct（Reasoning + Acting）框架，掌握 Thought 步骤如何提升 Agent 的推理准确率和可解释性，学会用 Planning 将复杂任务分解为子任务。"
tags: ["ReAct", "Planning", "思维链", "任务分解", "中级"]
expert:
  name: "推理架构师 Yuki"
  model: "gpt-4o"
  intro: "你好！我是 Yuki，专注于 Agent 推理与规划系统。ReAct 思维链、任务分解、什么时候该用/不该用 Thought，随时问我 👋"
  systemPrompt: |
    你是一位专注于 Agent 推理和规划的技术顾问，名叫 Yuki。
    你的核心能力：帮助学生理解 ReAct 框架和 Planning 策略，对比有/无 Thought 的行为差异。
    回复风格：善于用「有 Thought 时 → 结果A」vs「无 Thought 时 → 结果B」的对比来说明。
    回复要求：
    - 用中文回复，每次回复在 250 字以内
    - 用具体的 Thought 文本示例说明推理过程
    - 当学生问"是否需要 ReAct"时，引导从任务步骤数和错误代价两个维度判断
---

本课结束时，你能做到：

> ✓ 说清 ReAct 和普通 Agent Loop 的区别
> ✓ 理解 Thought 步骤如何减少错误
> ✓ 知道 Planning（任务分解）和 ReAct（步骤推理）的关系
> ✓ 判断什么任务需要 ReAct，什么任务不需要

**前置**：第 1 课 · Agent Loop + 第 2 课 · Context 管理

---

## 1 · 概念：直接行动 vs 先想再做

回忆第 1 课的 Agent Loop：Observe → Think → Act。但在基础 loop 中，"Think" 只是 LLM 内部的隐式推理——你看不到它在想什么，它直接输出行动。

**ReAct = Reasoning + Acting**，核心改进是让 LLM **显式写出推理过程**：

```widget:before-after
{
  "title": "无 Thought vs 有 Thought：同一个任务的对比",
  "subtitle": "任务：帮我查北京天气，如果超过 30°C 就推荐室内活动",
  "tabs": [
    {
      "label": "无 Thought（直接行动）",
      "prompt": "Observation: 用户问天气和活动推荐\n\nAction: search(\"北京室内活动推荐\")\n\n→ 直接搜了室内活动\n→ 还不知道温度是否超过 30°C\n→ 可能搜了一堆没用的信息\n→ 浪费 token + 结果不准确",
      "analysis": "问题：Agent 跳过了「先查天气 → 判断温度 → 再决定搜什么」的逻辑链。直接行动导致：\n1. 调用了错误的工具（应该先查天气）\n2. 浪费了一次工具调用\n3. 如果温度只有 20°C，室内活动推荐完全多余",
      "type": "bad"
    },
    {
      "label": "有 Thought（ReAct）",
      "prompt": "Observation: 用户问天气和活动推荐\n\nThought: 用户的需求有条件依赖——\n  先查天气获取温度，再根据温度判断。\n  如果 >30°C → 搜室内活动\n  如果 ≤30°C → 搜户外活动\n  所以第一步应该查天气，不是搜活动。\n\nAction: weather(\"北京\")\n\n→ 正确的第一步\n→ 推理过程清晰可追溯",
      "analysis": "改进：Agent 先写出推理过程，识别了条件依赖关系，选择了正确的第一步工具。\n收益：\n1. 避免了错误的工具调用\n2. 推理过程可见（可调试、可审计）\n3. 后续步骤基于真实数据决策",
      "type": "good"
    }
  ]
}
```

### Thought 不是答案，是推理过程

Thought 步骤的输出不会被执行，它是 LLM 的"草稿纸"——写出当前状态分析、可用选项评估、下一步计划。然后 Action 才是真正执行的动作。

### Planning 与 ReAct 的关系

| | Planning | ReAct |
|---|---------|------|
| **层级** | 任务层 | 执行层 |
| **做什么** | 把大任务拆成子任务列表 | 每步行动前先推理 |
| **输出** | `["查天气", "判断温度", "搜活动", "生成推荐"]` | `Thought: 当前需要... → Action: weather()` |
| **关系** | Planning 生成计划 → ReAct 逐步执行 | 两者通常结合使用 |

---

## 2 · 图解：普通 Loop vs ReAct Loop

```widget:diagram
{
  "title": "普通 Loop vs ReAct Loop",
  "caption": "左：Observe → Act 两步循环，决策不透明。右：Observe → Thought → Act 三步循环，推理过程显式可见。",
  "svg": "<svg viewBox='0 0 620 300' xmlns='http://www.w3.org/2000/svg'><defs><marker id='ar' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M2 1L8 5L2 9' fill='none' stroke='context-stroke' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></marker></defs><text class='th' x='120' y='18' text-anchor='middle'>普通 Loop</text><text class='th' x='460' y='18' text-anchor='middle'>ReAct Loop</text><line x1='280' y1='6' x2='280' y2='290' stroke='var(--b)' stroke-width='0.5' stroke-dasharray='4 3'/><g class='c-blue'><rect x='50' y='32' rx='8' width='140' height='34' stroke-width='0.5'/><text class='th' x='120' y='54' text-anchor='middle'>Observe</text></g><line x1='120' y1='66' x2='120' y2='82' stroke='var(--s)' stroke-width='1.5' marker-end='url(#ar)'/><g class='c-teal'><rect x='50' y='84' rx='8' width='140' height='34' stroke-width='0.5'/><text class='th' x='120' y='106' text-anchor='middle'>Act</text></g><text class='ts' x='200' y='104' style='fill:var(--color-text-danger);font-size:11px'>← 黑盒决策</text><line x1='120' y1='118' x2='120' y2='134' stroke='var(--s)' stroke-width='1.5' marker-end='url(#ar)'/><g class='c-blue'><rect x='50' y='136' rx='8' width='140' height='34' stroke-width='0.5'/><text class='th' x='120' y='158' text-anchor='middle'>Observe</text></g><line x1='120' y1='170' x2='120' y2='186' stroke='var(--s)' stroke-width='1.5' marker-end='url(#ar)'/><g class='c-teal'><rect x='50' y='188' rx='8' width='140' height='34' stroke-width='0.5'/><text class='th' x='120' y='210' text-anchor='middle'>Act（终止）</text></g><g class='c-blue'><rect x='330' y='32' rx='8' width='260' height='34' stroke-width='0.5'/><text class='th' x='460' y='54' text-anchor='middle'>Observe</text></g><line x1='460' y1='66' x2='460' y2='82' stroke='var(--s)' stroke-width='1.5' marker-end='url(#ar)'/><g class='c-purple'><rect x='330' y='84' rx='8' width='260' height='42' stroke-width='0.5'/><text class='th' x='460' y='102' text-anchor='middle'>💭 Thought</text><text class='ts' x='460' y='118' text-anchor='middle'>当前状态 → 目标 → 工具选择</text></g><line x1='460' y1='126' x2='460' y2='142' stroke='var(--s)' stroke-width='1.5' marker-end='url(#ar)'/><g class='c-teal'><rect x='330' y='144' rx='8' width='260' height='34' stroke-width='0.5'/><text class='th' x='460' y='166' text-anchor='middle'>⚡ Act</text></g><line x1='460' y1='178' x2='460' y2='194' stroke='var(--s)' stroke-width='1.5' marker-end='url(#ar)'/><g class='c-blue'><rect x='330' y='196' rx='8' width='260' height='34' stroke-width='0.5'/><text class='th' x='460' y='218' text-anchor='middle'>Observe</text></g><line x1='460' y1='230' x2='460' y2='246' stroke='var(--s)' stroke-width='1.5' marker-end='url(#ar)'/><g class='c-purple'><rect x='330' y='248' rx='8' width='260' height='34' stroke-width='0.5'/><text class='th' x='460' y='270' text-anchor='middle'>💭 Thought → ⚡ Act（终止）</text></g><text class='ts' x='460' y='296' text-anchor='middle' style='fill:var(--color-text-success)'>推理可见 · 可调试 · 可审计 ✓</text></svg>"
}
```

### Thought 的典型格式

一个好的 Thought 通常包含四个部分：

1. **当前状态**："已知北京今天 34°C"
2. **目标评估**："用户要求 >30°C 时推荐室内活动"
3. **工具选择**："应该调用 search 搜索室内活动"
4. **风险预判**："搜索结果可能包含户外活动，需要过滤"

:::callout{variant="blue" title="Thought 的代价"}
Thought 不是免费的——每次写出推理过程都会消耗额外的 token（通常 50-200 tokens/步）。对于简单任务（查天气、算 2+2），Thought 是浪费。对于复杂多步任务，Thought 节省的重试成本远大于额外 token。
:::

---

## 3 · 沙盒：真实的 Planning → ReAct Loop

输入一个任务，观察 LLM 如何**先生成计划**，再**逐步用 Thought→Act 执行**每个子任务：

```widget:code-playground
{
  "title": "Planning + ReAct 沙盒",
  "hint": "修改任务和参数，观察 LLM 的规划与逐步推理过程",
  "mode": "sandbox",
  "files": [
    {
      "path": "react-loop.js",
      "active": true,
      "code": "// ═══ Planning + ReAct 完整流程 ═══\n// 阶段 1：LLM 生成计划\n// 阶段 2：逐步执行 Thought → Act 循环\n\nconst task = {{task}};\nconst maxSteps = {{maxSteps}};\nconst enableThought = {{enableThought}};\n\nconsole.log('📝 任务:', task);\nconsole.log('模式:', enableThought ? 'ReAct（先想再做）' : '普通（直接行动）');\nconsole.log('');\n\n// ── 阶段 1：Planning ──────────────────\nconsole.log('━━━ 阶段 1：生成计划 ━━━');\nconst planResult = await callLLM([\n  { role: 'system', content: '你是一个任务规划器。将用户任务拆解为 3-5 个具体步骤。每步一行，格式：\"步骤N：具体内容\"。只输出步骤列表，不要其他内容。' },\n  { role: 'user', content: task },\n]);\nconst planText = planResult.content;\nconsole.log(planText);\n\n// 解析步骤\nconst steps = planText.split('\\n').filter(l => l.trim().match(/^步骤/));\nconsole.log(`\\n共 ${steps.length} 个步骤，开始执行（最多 ${maxSteps} 步）`);\n\n// ── 阶段 2：ReAct Loop ───────────────\nconst messages = [\n  { role: 'system', content: '你是一个执行者。逐步完成计划中的每个步骤。每次只完成一个步骤，简洁回答（60字以内）。所有步骤完成后输出 [DONE]。' },\n  { role: 'user', content: '任务：' + task + '\\n\\n计划：\\n' + planText },\n];\n\nlet totalThoughtTokens = 0;\nlet totalActionTokens = 0;\n\nfor (let i = 0; i < Math.min(steps.length, maxSteps); i++) {\n  console.log(`\\n━━━ 阶段 2 · Step ${i + 1}/${steps.length} ━━━`);\n  console.log('📋', steps[i]);\n\n  if (enableThought) {\n    // Thought：先推理\n    messages.push({ role: 'user', content: `在执行「${steps[i]}」之前，写出你的 Thought：\\n1. 当前已有什么信息？\\n2. 这一步具体要做什么？\\n3. 有什么注意事项？\\n用 40 字以内回答。只输出 Thought。` });\n    const thought = await callLLM(messages);\n    messages.push({ role: 'assistant', content: thought.content });\n    console.log('💭 Thought:', thought.content);\n    totalThoughtTokens += thought.usage ? (thought.usage.inputTokens + thought.usage.outputTokens) : 0;\n  }\n\n  // Act：执行\n  messages.push({ role: 'user', content: `现在执行：${steps[i]}。简洁回答。` });\n  const action = await callLLM(messages);\n  messages.push({ role: 'assistant', content: action.content });\n  console.log('⚡ Act:', action.content);\n  totalActionTokens += action.usage ? (action.usage.inputTokens + action.usage.outputTokens) : 0;\n\n  if (action.content.includes('[DONE]')) {\n    console.log('\\n✓ 所有步骤完成');\n    break;\n  }\n}\n\n// ── 统计 ─────────────────────────────\nconsole.log('\\n━━━ Token 统计 ━━━');\nif (enableThought) {\n  console.log('💭 Thought 消耗:', totalThoughtTokens, 'tokens');\n}\nconsole.log('⚡ Action 消耗:', totalActionTokens, 'tokens');\nconsole.log('📊 总消耗:', totalThoughtTokens + totalActionTokens, 'tokens');\nif (enableThought) {\n  const ratio = totalActionTokens > 0 ? Math.round(totalThoughtTokens / (totalThoughtTokens + totalActionTokens) * 100) : 0;\n  console.log('📊 Thought 占比:', ratio + '%');\n}",
      "slots": [
        {
          "id": "task",
          "default": "'帮我规划一次从上海到成都的 3 天旅行，要考虑交通、住宿和景点。'",
          "tooltip": "换一个任务试试，比如简单的（'1+1等于几'）或复杂的（'写一份竞品分析报告'）"
        },
        {
          "id": "maxSteps",
          "default": "5",
          "tooltip": "最大执行步数"
        },
        {
          "id": "enableThought",
          "default": "true",
          "tooltip": "改成 false 对比：没有 Thought 时 token 少了多少？推理质量有变化吗？"
        }
      ]
    }
  ],
  "outputHeight": 400
}
```

### 实验引导

1. **先 `enableThought = true` 运行**，观察每步的 💭 Thought → ⚡ Act 循环，以及最终的 Token 统计
2. **改成 `enableThought = false` 再运行同一个任务** → 对比：Action 的质量有变化吗？总 token 少了多少？
3. **换一个简单任务**（如 `'告诉我今天星期几'`）→ Planning 只生成 1 步，Thought 完全多余
4. **换一个复杂任务**（如 `'对比 React、Vue、Svelte 三个前端框架的优缺点并给出选型建议'`）→ 更多步骤，Thought 的价值更明显

---

## 4 · 实验室：用代码对比 ReAct 与普通 Loop

在真实沙盒中运行，对比同一个多步任务在有/无 Thought 下的 LLM 输出差异：

```widget:code-playground
{
  "title": "ReAct 实验室",
  "hint": "切换 enableThought，观察 LLM 推理过程的变化",
  "mode": "sandbox",
  "files": [
    {
      "path": "agent.js",
      "active": true,
      "code": "import { getConfig } from './config.js';\n\nconst config = getConfig();\n\nconsole.log('🧠 ReAct 实验');\nconsole.log('Thought 模式:', config.enableThought ? '开启' : '关闭');\nconsole.log('任务:', config.task);\nconsole.log('');\n\nconst steps = [\n  '第一步：分析任务需要哪些信息，列出要查询的内容',\n  '第二步：根据第一步的分析，执行第一个查询并记录结果',\n  '第三步：综合所有信息，给出最终建议。完成后输出 [DONE]',\n];\n\nconst messages = [\n  { role: 'system', content: config.systemPrompt },\n  { role: 'user', content: config.task },\n];\n\nfor (let i = 0; i < config.maxSteps && i < steps.length; i++) {\n  console.log(`\\n━━━ Step ${i + 1} ━━━`);\n\n  if (config.enableThought) {\n    // ReAct: 先要求 Thought，再要求 Action\n    const thoughtPrompt = `在执行之前，先写出你的推理过程（Thought）：\\n1. 当前已知什么？\\n2. 还缺什么信息？\\n3. 下一步该做什么，为什么？\\n\\n只输出 Thought，不要执行动作。用 50 字以内。`;\n    messages.push({ role: 'user', content: thoughtPrompt });\n    const thought = await callLLM(messages);\n    messages.push({ role: 'assistant', content: thought.content });\n    console.log('💭 Thought:', thought.content);\n  }\n\n  // Action\n  messages.push({ role: 'user', content: steps[i] });\n  const action = await callLLM(messages);\n  messages.push({ role: 'assistant', content: action.content });\n  console.log('⚡ Action:', action.content);\n\n  if (action.content.includes('[DONE]')) {\n    console.log('\\n✓ 任务完成');\n    break;\n  }\n}\n\nconst totalCtx = messages.map(m => m.content).join('');\nconst tokens = countTokens(totalCtx);\nconsole.log('\\n📋 总 context:', tokens.tokens, 'tokens,', messages.length, 'messages');",
      "slots": [
        {
          "id": "enableThought",
          "default": "true",
          "tooltip": "改成 false 对比：没有 Thought 时 LLM 的输出质量和 token 消耗有什么变化？"
        },
        {
          "id": "maxSteps",
          "default": "3",
          "tooltip": "最大步骤数"
        },
        {
          "id": "task",
          "default": "'帮我分析「在家办公」vs「去办公室」哪个更适合程序员，从效率、健康、社交三个维度对比。'",
          "tooltip": "换一个需要多步分析的任务试试"
        }
      ]
    },
    {
      "path": "config.js",
      "code": "export function getConfig() {\n  return {\n    enableThought: {{enableThought}},\n    maxSteps: {{maxSteps}},\n    task: {{task}},\n    systemPrompt: {{systemPrompt}},\n  };\n}",
      "slots": [
        {
          "id": "enableThought",
          "default": "true",
          "tooltip": "Thought 开关"
        },
        {
          "id": "maxSteps",
          "default": "3",
          "tooltip": "步骤数"
        },
        {
          "id": "task",
          "default": "'帮我分析「在家办公」vs「去办公室」哪个更适合程序员，从效率、健康、社交三个维度对比。'",
          "tooltip": "任务"
        },
        {
          "id": "systemPrompt",
          "default": "'你是一个分析师。每一步只完成用户要求的一个步骤，简洁回答（80字以内）。最后一步给出结论并标记 [DONE]。'",
          "tooltip": "System prompt"
        }
      ]
    }
  ],
  "outputHeight": 380
}
```

### 关键对比

| 对比 | 观察什么 |
|------|---------|
| `enableThought = true` | 每步先输出 💭 Thought（分析状态 + 规划），再输出 ⚡ Action |
| `enableThought = false` | 直接输出 Action，没有推理过程。回答质量是否下降？ |
| 对比两次运行的 token 总量 | Thought 增加了多少 token？推理质量的提升是否值得？ |
| 换一个简单任务（如"1+1等于几"） | Thought 对简单任务是浪费——额外 token 没有带来质量提升 |

---

## 5 · 练习：检验你的理解

```widget:quiz
{
  "title": "Planning & ReAct 测验",
  "questions": [
    {
      "id": "q1",
      "text": "ReAct 框架中，Thought 步骤的主要作用是什么？",
      "type": "single",
      "options": [
        { "text": "压缩 context 以节省 token", "correct": false },
        { "text": "让 LLM 显式推理当前状态并规划下一步，提升可解释性和准确性", "correct": true },
        { "text": "直接生成最终答案，跳过工具调用", "correct": false }
      ],
      "explanation": "Thought 是 LLM 的「草稿纸」——显式写出推理过程，包括当前状态分析、工具选择依据、下一步计划。它不压缩 context（反而增加），也不生成最终答案（那是 Action 的职责）。核心价值是让决策过程可见、可调试。"
    },
    {
      "id": "q2",
      "text": "下列哪个任务最适合使用 ReAct？",
      "type": "single",
      "options": [
        { "text": "查询当前时间", "correct": false },
        { "text": "翻译一段文字", "correct": false },
        { "text": "分析 3 家竞品的优劣势并生成策略建议", "correct": true },
        { "text": "计算 2 + 2", "correct": false }
      ],
      "explanation": "竞品分析需要多步骤（收集信息 → 对比分析 → 生成策略），每步的决策依赖前一步的结果，且错误代价高（错误分析导致错误策略）。ReAct 的 Thought 步骤能确保每步决策的推理链清晰。简单查询类任务（时间、翻译、计算）不需要额外推理。"
    },
    {
      "id": "q3",
      "text": "Planning 和 ReAct 的区别是什么？",
      "type": "single",
      "options": [
        { "text": "Planning 是 ReAct 的简化版", "correct": false },
        { "text": "Planning 是任务层的分解，ReAct 是执行层的思维链，两者通常结合使用", "correct": true },
        { "text": "Planning 只能串行，ReAct 只能并行", "correct": false }
      ],
      "explanation": "Planning 负责宏观：把「写竞品分析报告」拆成「1.收集数据 2.对比分析 3.生成建议」。ReAct 负责微观：执行每个子任务时先 Thought（分析当前状态）再 Act（调用工具）。Planning 生成计划列表 → ReAct 逐步执行每个子任务。"
    }
  ]
}
```

---

## 本课小结

- **ReAct = Reasoning + Acting**，在 Action 前加入显式的 Thought 推理步骤
- Thought 是 LLM 的**草稿纸**——写出状态分析、工具选择依据、下一步计划
- **收益**：减少错误工具调用、提升可解释性、支持调试和审计
- **代价**：每步额外 50-200 tokens 的 Thought 消耗
- **Planning** 是任务层分解，**ReAct** 是执行层推理，两者结合使用
- **判断标准**：任务步骤 ≥ 3 且错误代价高 → 用 ReAct；单步简单任务 → 不用

```widget:checklist
{
  "title": "第 5 课完成清单",
  "id": "module-2-lesson-05",
  "items": [
    "我理解 ReAct 和普通 Loop 的区别（多了 Thought 步骤）",
    "我能说出 Thought 的四个组成部分（状态/目标/工具选择/风险）",
    "我理解 Thought 的代价（额外 token 消耗）",
    "我知道 Planning 和 ReAct 的层级关系",
    "我做了沙盒实验，对比了有无 ReAct 的成本收益",
    "我做了代码实验，观察了真实的 Thought 输出",
    "我完成了 3 道测验题"
  ]
}
```

---

[← 上一课](/lesson/module-2/04-tool-use) · [下一课 →](/lesson/module-2/06-multi-agent)
