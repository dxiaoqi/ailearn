---
title: "Memory 系统：三层记忆各管什么？"
module: "module-2"
moduleTitle: "模块二：Agent 工程"
duration: "30 分钟"
description: "理解 Agent 的三层记忆架构——Short-term（context window）、Long-term（跨会话持久化）、External（向量检索），掌握每层的边界、读写时机和典型误用。"
tags: ["Memory", "短期记忆", "长期记忆", "向量检索", "初级"]
expert:
  name: "Memory 架构师 Nora"
  model: "gpt-4o"
  intro: "你好！我是 Nora，专注于 Agent 记忆架构。三层记忆怎么分工、什么时候读写、跨会话怎么设计，随时问我 👋"
  systemPrompt: |
    你是一位专注于 Agent Memory 架构的技术顾问，名叫 Nora。
    你的核心能力：帮助学生理解三层记忆的边界和协同，识别常见的记忆误用场景。
    回复风格：用生活类比说明抽象概念，善于举「错误做法 vs 正确做法」的对比。
    回复要求：
    - 用中文回复，每次回复在 200 字以内
    - 当学生问某种信息"存哪层"时，先问"它的生命周期多长"来引导思考
    - 优先用具体场景说明，而非抽象定义
---

本课结束时，你能做到：

> ✓ 说清三层记忆的边界：存什么、存多久、怎么读写
> ✓ 判断某条信息应该存在哪一层
> ✓ 识别常见的 Memory 误用（该持久化的没持久化、该检索的全塞进 context）
> ✓ 理解会话结束时的写入决策

**前置**：第 1 课 · Agent Loop + 第 2 课 · Context 管理

---

## 1 · 概念：Agent 的记忆 ≠ Context Window

上一课我们学了 context 的压缩策略。但压缩只是「短期记忆」的优化——当用户关闭浏览器重新打开，context 清空，Agent 什么都不记得了。

这就像一个人只有工作记忆、没有长期记忆：

```widget:before-after
{
  "title": "三层记忆的日常类比",
  "subtitle": "Agent 的三层记忆对应人类不同的记忆系统",
  "tabs": [
    {
      "label": "Short-term 短期",
      "prompt": "「你刚才说的话」\n\n相当于人类的工作记忆：\n- 你正在读的这段文字\n- 刚刚提到的数字\n- 当前对话的上下文\n\n特征：容量有限，用完即忘\n\nAgent 中 = Context Window\n生命周期 = 当前会话",
      "analysis": "存储：当前对话历史、工具调用中间结果、本轮推理状态。\n容量：受模型 context window 限制（128k tokens）。\n清除时机：会话结束自动清空。\n实现：就是 messages 数组。",
      "type": "neutral"
    },
    {
      "label": "Long-term 长期",
      "prompt": "「你上次来说你是素食」\n\n相当于人类的长期记忆：\n- 你朋友的生日\n- 上周会议的结论\n- 用户说过的偏好\n\n特征：跨会话持久，需要主动存取\n\nAgent 中 = 数据库/KV 存储\n生命周期 = 跨会话永久",
      "analysis": "存储：用户偏好、历史任务摘要、对话风格设置。\n容量：几乎无限（数据库）。\n读取时机：会话开始时注入 system prompt。\n写入时机：会话结束前，Agent 判断哪些信息值得持久化。\n实现：数据库（Redis / Postgres / 专用 Memory 服务）。",
      "type": "good"
    },
    {
      "label": "External 外部",
      "prompt": "「查一下公司产品文档」\n\n相当于人类查书/Google：\n- 公司知识库\n- 产品文档\n- 法律条文\n\n特征：海量，按需检索片段\n\nAgent 中 = 向量数据库检索\n生命周期 = 独立于会话",
      "analysis": "存储：公司文档、知识库、FAQ、法律文本——Agent 训练数据里没有的信息。\n容量：几百 GB 到 TB 级。\n读取方式：Embedding → 向量检索 → top-k 片段注入 context（RAG）。\n写入：离线索引流程，不在对话中写入。\n实现：Pinecone / Weaviate / Chroma 等向量数据库。",
      "type": "good"
    }
  ]
}
```

**核心观点**：三层记忆不是可选功能，而是**不同时间跨度的信息管理架构**。混用会导致两种典型错误：

1. **该持久化的没持久化** — 用户偏好只存 Short-term，下次会话就忘了
2. **不该全量注入的全塞进 context** — 把整个知识库塞进 system prompt，context 爆炸

---

## 2 · 图解：三层记忆架构

```widget:diagram
{
  "title": "Agent 三层记忆架构",
  "caption": "三层从上到下：Short-term（当前会话）→ Long-term（跨会话）→ External（知识库）。中间的 Agent 负责在三层之间搬运数据。",
  "svg": "<svg viewBox='0 0 680 400' xmlns='http://www.w3.org/2000/svg'><defs><marker id='am' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M2 1L8 5L2 9' fill='none' stroke='context-stroke' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></marker></defs><g class='c-blue'><rect x='20' y='15' rx='12' width='400' height='90' stroke-width='0.5'/><text class='th' x='40' y='42'>Short-term Memory</text><text class='ts' x='40' y='62'>= Context Window（对话历史 + 工具结果）</text><text class='ts' x='40' y='80'>生命周期：当前会话 · 容量：128k tokens</text></g><text class='ts' x='440' y='42' style='fill:var(--color-text-tertiary)'>会话结束</text><text class='ts' x='440' y='58' style='fill:var(--color-text-tertiary)'>自动清空 ↺</text><g class='c-purple'><rect x='140' y='140' rx='12' width='160' height='70' stroke-width='0.5'/><text class='th' x='220' y='172' text-anchor='middle'>Agent（LLM）</text><text class='ts' x='220' y='192' text-anchor='middle'>推理 · 决策 · 调度</text></g><line x1='180' y1='105' x2='180' y2='138' stroke='var(--s)' stroke-width='1.5' marker-end='url(#am)'/><text class='ts' x='130' y='125' style='font-size:10px'>读 context</text><line x1='260' y1='138' x2='260' y2='105' stroke='var(--s)' stroke-width='1.5' marker-end='url(#am)'/><text class='ts' x='268' y='125' style='font-size:10px'>写回 context</text><g class='c-amber'><rect x='20' y='250' rx='12' width='290' height='90' stroke-width='0.5'/><text class='th' x='40' y='278'>Long-term Memory</text><text class='ts' x='40' y='298'>用户偏好 · 历史任务摘要 · 对话风格</text><text class='ts' x='40' y='316'>数据库 / KV 存储 · 跨会话永久</text></g><line x1='180' y1='210' x2='120' y2='248' stroke='var(--color-text-success)' stroke-width='1.5' marker-end='url(#am)'/><text class='ts' x='108' y='232' style='fill:var(--color-text-success);font-size:10px'>① 会话开始：读取偏好</text><line x1='240' y1='248' x2='240' y2='210' stroke='var(--color-accent)' stroke-width='1.5' stroke-dasharray='5 3' marker-end='url(#am)'/><text class='ts' x='248' y='238' style='fill:var(--color-accent);font-size:10px'>④ 会话结束：写入新偏好</text><g class='c-coral'><rect x='370' y='250' rx='12' width='290' height='90' stroke-width='0.5'/><text class='th' x='390' y='278'>External Memory</text><text class='ts' x='390' y='298'>知识库 · 产品文档 · FAQ</text><text class='ts' x='390' y='316'>向量数据库 · Embedding → top-k 检索</text></g><line x1='280' y1='210' x2='430' y2='248' stroke='var(--color-text-info)' stroke-width='1.5' marker-end='url(#am)'/><text class='ts' x='360' y='220' style='fill:var(--color-text-info);font-size:10px'>② 对话中：按需检索</text><path d='M500 250 C500 200 400 160 350 105' fill='none' stroke='var(--color-text-info)' stroke-width='1.5' stroke-dasharray='5 3' marker-end='url(#am)'/><text class='ts' x='460' y='190' style='fill:var(--color-text-info);font-size:10px'>③ 片段注入 context</text><g transform='translate(20,365)'><g class='c-green'><rect x='0' y='0' width='10' height='10' rx='2' stroke-width='0.5'/></g><text class='ts' x='14' y='9'>读取</text><g class='c-amber'><rect x='55' y='0' width='10' height='10' rx='2' stroke-width='0.5'/></g><text class='ts' x='69' y='9'>写入</text><g class='c-blue'><rect x='108' y='0' width='10' height='10' rx='2' stroke-width='0.5'/></g><text class='ts' x='122' y='9'>检索 / 注入</text><text class='ts' x='220' y='9' style='fill:var(--color-text-tertiary)'>数字 ①②③④ = 时间顺序</text></g></svg>"
}
```

### 三层协同的关键时机

| 时机 | 发生什么 | 涉及哪层 |
|------|---------|---------|
| **会话开始** | 从 Long-term 读取用户偏好，注入 system prompt | Long → Short |
| **对话进行中** | 工具返回结果写入 context；按需从 External 检索知识片段 | External → Short |
| **需要外部知识** | 问题 embed → 向量检索 → top-k 片段注入 context | External → Short |
| **会话结束前** | LLM 判断哪些新信息值得持久化，写入 Long-term | Short → Long |

:::callout{variant="amber" title="关键认知"}
Long-term 的读取和写入都需要**显式设计**，不会自动发生。如果你不在会话开始时主动读取 Long-term，Agent 就不知道用户上次说了什么。如果你不在会话结束时主动写入，新的偏好下次就丢了。
:::

---

## 3 · 沙盒：信息存储决策

每条信息应该存在哪一层？拖动参数，观察不同存储决策的影响：

```widget:sandbox
{
  "title": "Memory 层级决策",
  "hint": "调整参数，观察三层的容量和成本变化",
  "params": [
    { "id": "shortMsgs", "label": "Short-term 消息数", "min": 1, "max": 50, "default": 12, "step": 1, "hint": "当前会话的对话轮次" },
    { "id": "tokPerMsg", "label": "每条消息 tokens", "min": 50, "max": 500, "default": 200, "step": 10, "fmt": "auto" },
    { "id": "longEntries", "label": "Long-term 条目数", "min": 0, "max": 20, "default": 3, "step": 1, "hint": "注入 context 的用户偏好/历史摘要数量" },
    { "id": "longTokPer", "label": "每条 Long-term tokens", "min": 50, "max": 500, "default": 150, "step": 10, "fmt": "auto" },
    { "id": "ragChunks", "label": "External 检索 chunks", "min": 0, "max": 10, "default": 3, "step": 1, "hint": "从向量数据库检索的文档片段数" },
    { "id": "chunkTok", "label": "每 chunk tokens", "min": 100, "max": 1500, "default": 512, "step": 50, "fmt": "auto" }
  ],
  "metrics": [
    {
      "label": "Short-term 占用",
      "expr": "shortMsgs * tokPerMsg",
      "fmt": "k"
    },
    {
      "label": "Long-term 注入",
      "expr": "longEntries * longTokPer",
      "fmt": "auto"
    },
    {
      "label": "External 注入",
      "expr": "ragChunks * chunkTok",
      "fmt": "k"
    },
    {
      "label": "总 Context 消耗",
      "expr": "shortMsgs * tokPerMsg + longEntries * longTokPer + ragChunks * chunkTok",
      "fmt": "k",
      "warnAbove": 80000,
      "dangerAbove": 115000
    }
  ],
  "growth": {
    "title": "三层在 Context 中的占比（逐轮累积）",
    "steps": "shortMsgs",
    "labelExpr": "i",
    "valueExpr": "i * tokPerMsg + longEntries * longTokPer + ragChunks * chunkTok",
    "maxExpr": "128000",
    "fmt": "k"
  }
}
```

### 实验引导

1. **ragChunks = 0, longEntries = 0** → 只有 Short-term，和第 1 课一样的线性增长
2. **ragChunks = 5, chunkTok = 1000** → External 检索一下子注入 5k tokens，观察总量跳变
3. **longEntries = 10, longTokPer = 400** → Long-term 注入太多，context 被偏好信息占满
4. **思考**：ragChunks 增加 vs chunkTok 增加，哪个对 context 影响更大？

---

## 4 · 实验室：用代码体验三层记忆的读写

在沙盒中模拟一个完整的 Agent 会话生命周期——从读取 Long-term 偏好、到对话中检索 External 知识、到会话结束时决定持久化：

```widget:code-playground
{
  "title": "Memory 系统实验室",
  "hint": "观察三层记忆在完整会话中的读写时机",
  "mode": "sandbox",
  "files": [
    {
      "path": "agent.js",
      "active": true,
      "code": "import { longTermDB, externalKB } from './memory.js';\n\n// ═══ 阶段 1：会话开始 → 读取 Long-term ═══\nconsole.log('━━━ 会话开始 ━━━');\nconst userPrefs = longTermDB.read({{userId}});\nconsole.log('📥 从 Long-term 读取偏好:', userPrefs);\n\nconst systemPrompt = `你是旅行助手。用户偏好：${JSON.stringify(userPrefs)}`;\nconst messages = [\n  { role: 'system', content: systemPrompt },\n  { role: 'user', content: {{userMessage}} }\n];\nconsole.log('Context 初始化完成');\nconst initTokens = countTokens(messages.map(m => m.content).join('')).tokens;\nconsole.log('📋 初始 context:', initTokens, 'tokens');\n\n// ═══ 阶段 2：对话中 → 检索 External ═══\nconsole.log('\\n━━━ 对话中：检索外部知识 ━━━');\nconst query = messages[1].content;\nconst chunks = externalKB.search(query, {{topK}});\nconsole.log(`📥 从 External 检索到 ${chunks.length} 个片段`);\nfor (const c of chunks) {\n  console.log(`  - [${c.source}] ${c.text.slice(0, 40)}...`);\n}\nmessages.push({ role: 'system', content: '参考资料：\\n' + chunks.map(c => c.text).join('\\n') });\n\nconst afterRAG = countTokens(messages.map(m => m.content).join('')).tokens;\nconsole.log('📋 检索后 context:', afterRAG, 'tokens (+' + (afterRAG - initTokens) + ')');\n\n// ═══ 阶段 3：LLM 推理 ═══\nconsole.log('\\n━━━ LLM 推理 ━━━');\nconst response = await callLLM(messages);\nmessages.push({ role: 'assistant', content: response.content });\nconsole.log('Agent:', response.content);\n\n// ═══ 阶段 4：会话结束 → 写入 Long-term ═══\nconsole.log('\\n━━━ 会话结束：持久化决策 ━━━');\nconst persistDecision = await callLLM([\n  { role: 'system', content: '分析以下对话，提取值得长期记住的用户偏好（如饮食偏好、预算、风格偏好等）。输出 JSON 格式：{\"prefs\": [{\"key\": \"...\", \"value\": \"...\"}]}。如果没有新偏好，输出 {\"prefs\": []}。只输出 JSON。' },\n  { role: 'user', content: messages.map(m => m.role + ': ' + m.content).join('\\n') }\n]);\nconsole.log('🧠 LLM 持久化判断:', persistDecision.content);\n\ntry {\n  const parsed = JSON.parse(persistDecision.content);\n  if (parsed.prefs && parsed.prefs.length > 0) {\n    longTermDB.write({{userId}}, parsed.prefs);\n    console.log('📤 写入 Long-term:', parsed.prefs.length, '条新偏好');\n  } else {\n    console.log('📤 无新偏好需要持久化');\n  }\n} catch {\n  console.log('⚠ 解析持久化决策失败，跳过写入');\n}\n\nconst finalTokens = countTokens(messages.map(m => m.content).join('')).tokens;\nconsole.log('\\n📋 最终 context:', finalTokens, 'tokens');",
      "slots": [
        {
          "id": "userId",
          "default": "'user_001'",
          "tooltip": "用户 ID，用于读写 Long-term 偏好"
        },
        {
          "id": "userMessage",
          "default": "'我想找一个适合带小孩的海边度假地，预算 8000 以内，最好有素食餐厅。'",
          "tooltip": "用户消息。包含新偏好（带小孩、预算、素食），观察 Agent 是否会持久化"
        },
        {
          "id": "topK",
          "default": "3",
          "tooltip": "从外部知识库检索的片段数。增大会注入更多 context"
        }
      ]
    },
    {
      "path": "memory.js",
      "code": "// ── 模拟 Long-term Memory（数据库）──────────\nconst _longTermStore = {\n  'user_001': { diet: '素食', style: '简洁回答', budget: '中等' },\n  'user_002': { diet: '无限制', style: '详细解释', budget: '高' },\n};\n\nexport const longTermDB = {\n  read(userId) {\n    return _longTermStore[userId] || {};\n  },\n  write(userId, prefs) {\n    if (!_longTermStore[userId]) _longTermStore[userId] = {};\n    for (const p of prefs) {\n      _longTermStore[userId][p.key] = p.value;\n      console.log(`  💾 持久化: ${p.key} = ${p.value}`);\n    }\n  },\n};\n\n// ── 模拟 External Memory（向量数据库）────────\nconst _knowledgeBase = [\n  { source: '三亚旅游指南', text: '三亚亚龙湾是中国最好的海滩之一，适合家庭出游。海棠湾区域有多家五星酒店，部分提供素食菜单。淡季价格约 3000-6000 元/周。' },\n  { source: '厦门攻略', text: '厦门鼓浪屿适合亲子游，有丰富的素食餐厅选择。环岛路骑行适合各年龄段。预算约 4000-7000 元/周。' },\n  { source: '北戴河指南', text: '北戴河是北方热门海滨度假地，消费较低。沙滩适合儿童，但素食餐厅较少。预算约 2000-4000 元/周。' },\n  { source: '青岛手册', text: '青岛栈桥和金沙滩是亲子海滩首选。啤酒街和海鲜市场是特色，素食选择有限。预算约 3000-5000 元/周。' },\n  { source: '普吉岛攻略', text: '普吉岛是东南亚热门海岛，素食餐厅丰富。适合亲子但需注意安全。含机票预算约 6000-10000 元/人。' },\n];\n\nexport const externalKB = {\n  search(query, topK) {\n    // 模拟向量检索：按关键词相关性排序\n    const scored = _knowledgeBase.map(doc => {\n      let score = 0;\n      if (query.includes('海') && doc.text.includes('海')) score += 2;\n      if (query.includes('小孩') && doc.text.includes('亲子')) score += 3;\n      if (query.includes('素食') && doc.text.includes('素食')) score += 3;\n      if (query.includes('预算') && doc.text.includes('预算')) score += 1;\n      return { ...doc, score };\n    });\n    scored.sort((a, b) => b.score - a.score);\n    return scored.slice(0, topK);\n  },\n};"
    }
  ],
  "outputHeight": 400
}
```

### 关键观察

| 阶段 | 观察什么 |
|------|---------|
| 会话开始 | Long-term 读出了 `user_001` 的旧偏好（素食、简洁、中等预算），注入了 system prompt |
| 外部检索 | 按 topK 检索了相关旅游攻略，context 跳增（+多少 tokens？） |
| LLM 推理 | Agent 的回答是否同时用了旧偏好（素食）和新信息（带小孩、8000 预算）？ |
| 会话结束 | LLM 是否识别出新偏好（带小孩、预算 8000）并决定持久化？ |

**试试改变**：
- `topK = 1` vs `topK = 5` — 检索更多片段，context 更大，回答更全面 vs token 更贵
- 换一个不包含新偏好的 `userMessage` — 持久化决策应该输出空数组
- `userId = 'user_003'`（不存在的用户）— Long-term 读取返回空，Agent 没有先验知识

---

## 5 · 练习：检验你的理解

```widget:quiz
{
  "title": "Memory 系统测验",
  "questions": [
    {
      "id": "q1",
      "text": "用户上周告诉 Agent「我喜欢简洁的回答」。这周新开会话，Agent 怎么知道这个偏好？",
      "type": "single",
      "options": [
        { "text": "Short-term memory——上次的 context 还在", "correct": false },
        { "text": "Long-term memory——会话开始时从数据库读取注入", "correct": true },
        { "text": "External memory——从知识库检索", "correct": false }
      ],
      "explanation": "Short-term（context window）会在会话结束时清空。跨会话的用户偏好必须存在 Long-term memory（数据库）中，并在新会话开始时主动读取注入 system prompt。External memory 是文档知识库，不存储用户个人偏好。"
    },
    {
      "id": "q2",
      "text": "Agent 需要回答关于 500 页公司内部文档的问题。应该用哪层 Memory？",
      "type": "single",
      "options": [
        { "text": "Short-term——把文档全部塞进 context", "correct": false },
        { "text": "Long-term——把文档存进用户偏好数据库", "correct": false },
        { "text": "External memory——向量数据库按需检索 top-k 片段", "correct": true }
      ],
      "explanation": "500 页文档远超 context 窗口容量（128k tokens ≈ 约 80 页）。正确做法是把文档切分 → embedding → 存入向量数据库，查询时检索最相关的 top-k 片段注入 context。这就是 RAG（第 7 课会详细讲）。"
    },
    {
      "id": "q3",
      "text": "Agent 在执行 10 步工具调用链时，中间步骤的结果应该存在哪里？",
      "type": "single",
      "options": [
        { "text": "Short-term memory（context window 内）", "correct": true },
        { "text": "Long-term memory（写入数据库持久化）", "correct": false },
        { "text": "External memory（存入向量数据库）", "correct": false }
      ],
      "explanation": "工具调用的中间结果是临时的、只在当前任务链中有用。存在 Short-term（context window）内即可，无需持久化。当任务完成后这些中间结果自然随 context 清除——除非最终结论需要长期记住，才写入 Long-term。"
    }
  ]
}
```

---

## 本课小结

- Agent 的记忆分三层：**Short-term**（context window）、**Long-term**（数据库）、**External**（向量检索）
- 三层的边界由**信息的生命周期**决定：当前会话 / 跨会话 / 独立于会话
- **Long-term 的读写需要显式设计**——会话开始时读取，结束时由 LLM 决定写入
- **External 检索按需注入**——不要把整个知识库塞进 context
- 常见误用：该持久化的放在 Short-term（下次忘了）、该检索的全量注入（context 爆了）

```widget:checklist
{
  "title": "第 3 课完成清单",
  "id": "module-2-lesson-03",
  "items": [
    "我能说清三层记忆各存什么、存多久",
    "我能判断某条信息应该存在哪一层",
    "我理解 Long-term 读写需要显式设计",
    "我理解 External 检索 vs 全量注入的区别",
    "我做了沙盒实验，观察了三层对 context 的影响",
    "我做了代码实验，体验了完整会话生命周期的读写",
    "我完成了 3 道测验题"
  ]
}
```

---

[← 上一课](/lesson/module-2/02-context-compression) · [下一课 →](/lesson/module-2/04-tool-use)
