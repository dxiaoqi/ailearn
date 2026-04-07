---
title: "Tool Use：Agent 怎么触达真实世界？"
module: "module-2"
moduleTitle: "模块二：Agent 工程"
duration: "25 分钟"
description: "理解 Tool 是 Agent 与外界交互的唯一通道，掌握 tool_call 的完整生命周期（Schema → 调用 → 执行 → 结果封装），以及串行/并行、超时重试等工程实践。"
tags: ["Tool Use", "Function Calling", "工具调用", "初级"]
expert:
  name: "工具架构师 Riku"
  model: "gpt-4o"
  intro: "你好！我是 Riku，专注于 Agent 工具系统设计。Schema 怎么写、超时怎么处理、串行还是并行，随时问我 👋"
  systemPrompt: |
    你是一位专注于 Agent Tool Use 的技术顾问，名叫 Riku。
    你的核心能力：帮助学生理解 tool_call 生命周期、Schema 设计、错误处理和并行调用策略。
    回复风格：用代码片段 + 时序描述结合说明，善于对比串行 vs 并行的性能差异。
    回复要求：
    - 用中文回复，每次回复在 200 字以内
    - 优先用 JSON 示例说明 Schema 和 tool_call 格式
    - 错误处理场景给出具体的 tool_result 返回格式
---

本课结束时，你能做到：

> ✓ 说清 tool_call 的完整生命周期（Schema → 调用 → 执行 → 封装）
> ✓ 理解 LLM 只生成 JSON，不执行代码
> ✓ 知道串行 vs 并行调用的适用场景
> ✓ 设计健壮的超时、重试和降级策略

**前置**：第 1 课 · Agent Loop

---

## 1 · 概念：LLM 自己什么都做不了

LLM 没有手脚——它不能搜索网页、不能调 API、不能读写文件。**Tool 是 Agent 触达真实世界的唯一方式**。

但 LLM 也不直接执行工具。实际的工作方式是：

> LLM 生成一段 JSON 描述"我想调用什么工具、传什么参数" → 执行层真正执行 → 结果返回给 LLM

这就是 **Function Calling / Tool Use** 的核心机制。

### Tool 的三层架构

```widget:before-after
{
  "title": "Tool 的三层架构",
  "subtitle": "LLM 只负责「说」（生成 tool_call），执行层负责「做」（真正调用），结果层负责「报告」（封装返回）。",
  "tabs": [
    {
      "label": "① Schema 声明",
      "prompt": "告诉 LLM 有什么工具可用\n\n{\n  \"name\": \"search\",\n  \"description\": \"搜索互联网获取最新信息\",\n  \"parameters\": {\n    \"type\": \"object\",\n    \"properties\": {\n      \"query\": {\n        \"type\": \"string\",\n        \"description\": \"搜索关键词\"\n      }\n    },\n    \"required\": [\"query\"]\n  }\n}",
      "analysis": "Schema 是 LLM 理解工具的唯一依据。description 写得好不好，直接决定 LLM 能否正确判断何时调用、传什么参数。\n\n差的 description：\"search tool\"\n好的 description：\"搜索互联网获取实时信息，适用于需要最新数据的场景\"",
      "type": "neutral"
    },
    {
      "label": "② LLM 生成 tool_call",
      "prompt": "LLM 的输出（不是代码，是 JSON）\n\n{\n  \"tool_calls\": [\n    {\n      \"name\": \"search\",\n      \"arguments\": {\n        \"query\": \"2024年诺贝尔物理学奖\"\n      }\n    }\n  ]\n}\n\n关键：这只是一个请求\nLLM 不知道结果是什么\n需要执行层真正去搜索",
      "analysis": "LLM 输出的 tool_call 是一个 JSON 对象，不是可执行代码。它表达的是意图：「我想用 search 工具搜索这个关键词」。\n\n执行层收到后才真正发起网络请求。LLM 此刻并不知道搜索结果——它需要等待 tool_result 返回。",
      "type": "good"
    },
    {
      "label": "③ tool_result 封装",
      "prompt": "执行层返回的结果（成功或失败）\n\n成功：\n{\n  \"name\": \"search\",\n  \"result\": \"2024年诺贝尔物理学奖...\"\n}\n\n失败：\n{\n  \"name\": \"search\",\n  \"error\": \"请求超时 (5000ms)\"\n}\n\n关键：错误也是有价值的观测值\nLLM 看到错误后会决策下一步",
      "analysis": "无论成功或失败，都以标准格式返回给 LLM。错误信息本身就是有价值的观测值——LLM 看到超时错误后可能决定：重试、换一个关键词、或者告诉用户「暂时无法搜索」。\n\n绝对不能吞掉错误。如果执行层崩溃但不返回 tool_result，Agent loop 会卡死。",
      "type": "good"
    }
  ]
}
```

### 串行 vs 并行

| | 串行调用 | 并行调用 |
|---|---------|---------|
| **执行方式** | A 完成 → B 开始 → C 开始 | A、B、C 同时发起 |
| **总时长** | tA + tB + tC | max(tA, tB, tC) |
| **适用场景** | B 依赖 A 的结果 | 三个独立搜索 |
| **例子** | 先搜索 → 用结果计算 | 同时搜 Google、Bing、百度 |

---

## 2 · 图解：tool_call 的完整生命周期

```widget:diagram
{
  "title": "Tool Call 生命周期（含错误处理）",
  "caption": "左列 LLM → 中列 Executor → 右列 API。成功走绿色路径返回，失败走红色路径返回。",
  "svg": "<svg viewBox='0 0 560 400' xmlns='http://www.w3.org/2000/svg'><defs><marker id='at' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M2 1L8 5L2 9' fill='none' stroke='context-stroke' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></marker></defs><line x1='90' y1='40' x2='90' y2='390' stroke='var(--b)' stroke-width='0.5'/><line x1='280' y1='40' x2='280' y2='390' stroke='var(--b)' stroke-width='0.5'/><line x1='460' y1='40' x2='460' y2='390' stroke='var(--b)' stroke-width='0.5'/><g class='c-purple'><rect x='40' y='12' rx='8' width='100' height='26' stroke-width='0.5'/><text class='ts' x='90' y='29' text-anchor='middle'>LLM</text></g><g class='c-teal'><rect x='220' y='12' rx='8' width='120' height='26' stroke-width='0.5'/><text class='ts' x='280' y='29' text-anchor='middle'>Executor</text></g><g class='c-blue'><rect x='410' y='12' rx='8' width='100' height='26' stroke-width='0.5'/><text class='ts' x='460' y='29' text-anchor='middle'>外部 API</text></g><text class='ts' x='20' y='60' style='fill:var(--color-text-tertiary);font-size:10px'>❶</text><line x1='92' y1='58' x2='278' y2='58' stroke='var(--s)' stroke-width='1.5' marker-end='url(#at)'/><text class='ts' x='185' y='52' text-anchor='middle'>tool_call JSON</text><text class='ts' x='20' y='88' style='fill:var(--color-text-tertiary);font-size:10px'>❷</text><line x1='282' y1='86' x2='458' y2='86' stroke='var(--s)' stroke-width='1.5' marker-end='url(#at)'/><text class='ts' x='370' y='80' text-anchor='middle'>HTTP 请求</text><g class='c-gray'><rect x='432' y='98' rx='6' width='56' height='36' stroke-width='0.5'/><text class='ts' x='460' y='120' text-anchor='middle'>处理中</text></g><text class='ts' x='20' y='150' style='fill:var(--color-text-tertiary);font-size:10px'>❸</text><line x1='458' y1='148' x2='282' y2='148' stroke='var(--s)' stroke-width='1.5' marker-end='url(#at)'/><text class='ts' x='370' y='142' text-anchor='middle'>响应</text><g class='c-teal'><rect x='235' y='158' rx='6' width='90' height='26' stroke-width='0.5'/><text class='ts' x='280' y='175' text-anchor='middle'>封装结果</text></g><text class='ts' x='20' y='200' style='fill:var(--color-text-tertiary);font-size:10px'>❹a</text><line x1='278' y1='198' x2='92' y2='198' stroke='var(--color-text-success)' stroke-width='1.5' marker-end='url(#at)'/><text class='ts' x='185' y='192' text-anchor='middle' style='fill:var(--color-text-success)'>tool_result ✓</text><g class='c-purple'><rect x='45' y='210' rx='6' width='90' height='26' stroke-width='0.5'/><text class='ts' x='90' y='227' text-anchor='middle'>继续推理</text></g><rect x='0' y='252' width='560' height='1' fill='var(--b)' rx='0.5'/><text class='ts' x='20' y='272' style='fill:var(--color-text-danger);font-size:10px'>错误路径</text><line x1='460' y1='134' x2='460' y2='284' stroke='var(--color-text-danger)' stroke-width='1' stroke-dasharray='4 3'/><text class='ts' x='20' y='300' style='fill:var(--color-text-tertiary);font-size:10px'>❸'</text><g class='c-red'><rect x='400' y='286' rx='6' width='120' height='26' stroke-width='0.5'/><text class='ts' x='460' y='303' text-anchor='middle'>超时 / 异常</text></g><line x1='398' y1='299' x2='332' y2='299' stroke='var(--color-text-danger)' stroke-width='1.5' marker-end='url(#at)'/><text class='ts' x='20' y='340' style='fill:var(--color-text-tertiary);font-size:10px'>❹b</text><g class='c-amber'><rect x='235' y='320' rx='6' width='90' height='26' stroke-width='0.5'/><text class='ts' x='280' y='337' text-anchor='middle'>封装 error</text></g><line x1='280' y1='312' x2='280' y2='318' stroke='var(--color-text-danger)' stroke-width='1'/><line x1='278' y1='348' x2='92' y2='348' stroke='var(--color-text-danger)' stroke-width='1.5' marker-end='url(#at)'/><text class='ts' x='185' y='364' text-anchor='middle' style='fill:var(--color-text-danger)'>tool_result (error)</text><g class='c-purple'><rect x='30' y='374' rx='6' width='120' height='26' stroke-width='0.5'/><text class='ts' x='90' y='391' text-anchor='middle'>重试 / 降级 / 告知</text></g></svg>"
}
```

关键要点：

- **LLM 只输出 JSON**（tool_call），不执行任何代码
- **执行层**负责真正调用外部 API，设置超时，捕获异常
- **错误也封装为 tool_result** 返回给 LLM——不能吞掉错误
- LLM 收到错误后**自主决策**：重试、换参数、降级处理或告知用户

---

## 3 · 沙盒：串行 vs 并行与超时权衡

```widget:sandbox
{
  "title": "工具调用性能沙盒",
  "hint": "对比串行/并行的耗时差异，调整超时和重试策略",
  "params": [
    { "id": "toolCount", "label": "工具调用数量", "min": 1, "max": 6, "default": 3, "step": 1 },
    { "id": "avgDelay", "label": "工具平均延迟 (ms)", "min": 100, "max": 5000, "default": 1000, "step": 100, "fmt": "auto" },
    { "id": "timeoutMs", "label": "超时阈值 (ms)", "min": 500, "max": 10000, "default": 5000, "step": 500, "fmt": "auto" },
    { "id": "retryCount", "label": "失败重试次数", "min": 0, "max": 3, "default": 1, "step": 1 },
    { "id": "failRate", "label": "单次失败概率 (%)", "min": 0, "max": 50, "default": 10, "step": 5, "fmt": "%" }
  ],
  "checkboxes": [
    { "id": "parallel", "label": "启用并行调用", "default": false, "hint": "开启后工具同时执行，总时长 = 最慢的那个" }
  ],
  "metrics": [
    {
      "label": "串行总耗时",
      "expr": "toolCount * avgDelay",
      "fmt": "auto"
    },
    {
      "label": "并行总耗时",
      "expr": "avgDelay",
      "fmt": "auto"
    },
    {
      "label": "实际耗时",
      "expr": "parallel ? avgDelay : toolCount * avgDelay",
      "fmt": "auto",
      "warnAbove": 5000,
      "dangerAbove": 10000
    },
    {
      "label": "并行加速比",
      "expr": "toolCount",
      "fmt": "auto"
    }
  ],
  "growth": {
    "title": "逐工具累计耗时（串行 vs 并行基线）",
    "steps": "toolCount",
    "labelExpr": "i",
    "valueExpr": "parallel ? avgDelay : i * avgDelay",
    "maxExpr": "timeoutMs",
    "fmt": "auto"
  }
}
```

### 实验引导

1. **parallel 关闭，toolCount = 4，avgDelay = 1000** → 串行总耗时 4000ms
2. **打开 parallel** → 总耗时瞬间降到 1000ms，加速比 = 4x
3. **avgDelay = 3000，timeout = 5000** → 串行 3 个工具就超时 (9000 > 5000)，并行刚好安全
4. **failRate = 30%，retryCount = 0 vs 2** → 重试能显著提升成功率，但每次重试也消耗时间

---

## 4 · 实验室：用代码实现工具调用

在真实沙盒中实现一个带超时、重试、串行/并行的工具执行框架：

```widget:code-playground
{
  "title": "Tool Use 实验室",
  "hint": "修改策略参数，观察调用行为和性能差异",
  "mode": "sandbox",
  "files": [
    {
      "path": "agent.js",
      "active": true,
      "code": "import { createToolExecutor } from './executor.js';\nimport { tools } from './tools.js';\n\nconst config = {\n  timeout: {{timeout}},\n  retries: {{retries}},\n  parallel: {{parallel}},\n};\n\nconsole.log('🔧 Tool Use 实验');\nconsole.log('超时:', config.timeout + 'ms');\nconsole.log('重试:', config.retries + '次');\nconsole.log('模式:', config.parallel ? '并行' : '串行');\nconsole.log('');\n\nconst executor = createToolExecutor(tools, config);\n\n// 模拟 LLM 生成的 tool_calls\nconst toolCalls = [\n  { name: 'search', arguments: { query: '2024诺贝尔物理学奖' } },\n  { name: 'weather', arguments: { city: '北京' } },\n  { name: 'calculator', arguments: { expression: '365 * 24' } },\n];\n\nconsole.log('LLM 生成了', toolCalls.length, '个 tool_calls');\nconsole.log('');\n\nconst startTime = Date.now();\nconst results = await executor.run(toolCalls);\nconst elapsed = Date.now() - startTime;\n\nconsole.log('');\nconsole.log('────────────────────────────');\nconsole.log('📊 执行报告');\nconsole.log('总耗时:', elapsed + 'ms');\nconsole.log('成功:', results.filter(r => !r.error).length + '/' + results.length);\nfor (const r of results) {\n  if (r.error) {\n    console.log('  ✗', r.name + ':', r.error);\n  } else {\n    console.log('  ✓', r.name + ':', JSON.stringify(r.result).slice(0, 60));\n  }\n}",
      "slots": [
        {
          "id": "timeout",
          "default": "5000",
          "tooltip": "超时阈值 (ms)。试试 500（很多工具会超时）或 10000（宽松）"
        },
        {
          "id": "retries",
          "default": "1",
          "tooltip": "失败重试次数。0 = 不重试，3 = 最多重试 3 次"
        },
        {
          "id": "parallel",
          "default": "true",
          "tooltip": "true = 并行调用（快），false = 串行调用（慢但可控）"
        }
      ]
    },
    {
      "path": "tools.js",
      "code": "// ── 工具定义 ──────────────────────────────\n// 每个工具 = name + description + parameters + execute\n\nexport const tools = {\n  search: {\n    description: '搜索互联网获取最新信息',\n    parameters: { query: 'string' },\n    async execute(args) {\n      // 模拟网络延迟\n      await new Promise(r => setTimeout(r, 800));\n      return { title: '搜索结果', snippet: `关于「${args.query}」的最新信息...` };\n    },\n  },\n\n  weather: {\n    description: '查询城市天气',\n    parameters: { city: 'string' },\n    async execute(args) {\n      await new Promise(r => setTimeout(r, 600));\n      const temp = Math.round(15 + Math.random() * 20);\n      return { city: args.city, temperature: temp + '°C', condition: '晴' };\n    },\n  },\n\n  calculator: {\n    description: '执行数学计算',\n    parameters: { expression: 'string' },\n    async execute(args) {\n      await new Promise(r => setTimeout(r, 100));\n      try {\n        const result = new Function('return ' + args.expression)();\n        return { expression: args.expression, result };\n      } catch (e) {\n        throw new Error('计算错误: ' + e.message);\n      }\n    },\n  },\n};"
    },
    {
      "path": "executor.js",
      "code": "// ── 工具执行框架 ─────────────────────────\n// 支持超时、重试、串行/并行\n\nexport function createToolExecutor(tools, config) {\n  const { timeout, retries, parallel } = config;\n\n  async function executeOne(call) {\n    const tool = tools[call.name];\n    if (!tool) return { name: call.name, error: '未知工具: ' + call.name };\n\n    for (let attempt = 0; attempt <= retries; attempt++) {\n      try {\n        if (attempt > 0) console.log(`  ↻ [${call.name}] 重试第 ${attempt} 次`);\n\n        // 超时竞速\n        const result = await Promise.race([\n          tool.execute(call.arguments),\n          new Promise((_, reject) =>\n            setTimeout(() => reject(new Error('超时 (' + timeout + 'ms)')), timeout)\n          ),\n        ]);\n\n        console.log(`  ✓ [${call.name}] 成功`);\n        return { name: call.name, result };\n      } catch (err) {\n        console.log(`  ✗ [${call.name}] ${err.message}`);\n        if (attempt === retries) {\n          return { name: call.name, error: err.message };\n        }\n      }\n    }\n  }\n\n  return {\n    async run(calls) {\n      if (parallel) {\n        console.log('⚡ 并行执行', calls.length, '个工具');\n        return Promise.all(calls.map(c => executeOne(c)));\n      } else {\n        console.log('📋 串行执行', calls.length, '个工具');\n        const results = [];\n        for (const c of calls) {\n          results.push(await executeOne(c));\n        }\n        return results;\n      }\n    },\n  };\n}"
    }
  ],
  "outputHeight": 340
}
```

### 关键实验

| 试什么 | 观察什么 |
|--------|---------|
| `parallel = true` vs `false` | 对比总耗时：并行约 800ms，串行约 1500ms |
| `timeout = 500` | search (800ms) 和 weather (600ms) 都会超时，只有 calculator 成功 |
| `retries = 0` vs `retries = 2` | 超时后重试能否成功？（本例中模拟延迟固定，所以重试也会超时——这就是为什么超时阈值要合理设置） |
| 在 tools.js 中修改延迟值 | 理解「最慢的工具决定并行耗时」 |

---

## 5 · 练习：检验你的理解

```widget:quiz
{
  "title": "Tool Use 测验",
  "questions": [
    {
      "id": "q1",
      "text": "LLM 生成了 tool_call，但工具执行超时了。Agent 应该怎么做？",
      "type": "single",
      "options": [
        { "text": "忽略这个工具，继续执行下一个", "correct": false },
        { "text": "将超时错误作为 tool_result 返回给 LLM，让其决策重试或降级", "correct": true },
        { "text": "直接终止 Agent 运行", "correct": false }
      ],
      "explanation": "错误本身就是有价值的观测值。将超时错误封装为 tool_result 返回给 LLM，LLM 可以自主决策：重试、换参数、选择备用工具、或告知用户暂时无法完成。绝对不能吞掉错误——否则 LLM 不知道发生了什么。"
    },
    {
      "id": "q2",
      "text": "需要同时搜索 3 个不同数据源，各耗时约 1 秒。串行 vs 并行各需多久？",
      "type": "single",
      "options": [
        { "text": "串行 1 秒，并行 3 秒", "correct": false },
        { "text": "串行 3 秒，并行约 1 秒", "correct": true },
        { "text": "串行和并行耗时相同", "correct": false }
      ],
      "explanation": "串行：A 完成 → B 完成 → C 完成 = 1+1+1 = 3 秒。并行：A、B、C 同时发起，总时长 = 最慢的那个 ≈ 1 秒。独立且无依赖的工具调用应优先并行化。"
    },
    {
      "id": "q3",
      "text": "一个工具 Schema 的 description 写成了 \"a tool\"（极其模糊）。会有什么后果？",
      "type": "single",
      "options": [
        { "text": "没有影响，LLM 会根据参数名自己推断", "correct": false },
        { "text": "LLM 可能错误判断何时调用该工具，或传入错误参数", "correct": true },
        { "text": "工具会执行失败", "correct": false }
      ],
      "explanation": "LLM 通过 Schema 的 description 来理解工具的用途和调用时机。模糊的描述会导致：1) LLM 在不该调用时调用（误触发）；2) 该调用时不调用（漏触发）；3) 传入格式错误的参数。Schema 的质量直接决定工具调用的准确率。"
    }
  ]
}
```

---

## 本课小结

- **Tool 是 Agent 触达真实世界的唯一方式**
- LLM 只生成 **tool_call（JSON）**，执行层负责真正调用
- 完整生命周期：**Schema 声明 → LLM 生成 tool_call → 执行层调用 → tool_result 封装返回**
- **错误也是 tool_result**——不能吞掉错误，LLM 需要看到错误才能决策
- **Schema 质量** = 工具调用准确率，description 是关键
- **串行 vs 并行**：独立工具并行化，有依赖关系的串行

```widget:checklist
{
  "title": "第 4 课完成清单",
  "id": "module-2-lesson-04",
  "items": [
    "我理解 LLM 只生成 JSON，不直接执行工具",
    "我能说清 tool_call 的完整生命周期",
    "我知道错误也要封装为 tool_result 返回",
    "我理解 Schema description 对调用准确率的影响",
    "我能判断什么时候用串行、什么时候用并行",
    "我做了代码实验，体验了超时和重试的行为",
    "我完成了 3 道测验题"
  ]
}
```

---

[← 上一课](/lesson/module-2/03-memory-system) · [下一课 →](/lesson/module-2/05-planning-react)
