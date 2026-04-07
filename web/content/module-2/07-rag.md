---
title: "RAG 检索增强：怎么给 Agent 注入外部知识？"
module: "module-2"
moduleTitle: "模块二：Agent 工程"
duration: "30 分钟"
description: "理解 RAG（Retrieval-Augmented Generation）的完整管道，掌握文档分块、向量检索、top-k 注入的核心机制和超参数权衡。"
tags: ["RAG", "向量检索", "Embedding", "Chunk", "初级"]
expert:
  name: "检索架构师 Mika"
  model: "gpt-4o"
  intro: "你好！我是 Mika，专注于 RAG 系统设计。Chunk 策略、top-k 选择、Embedding 一致性问题，随时问我 👋"
  systemPrompt: |
    你是一位专注于 RAG 检索增强系统的技术顾问，名叫 Mika。
    你的核心能力：帮助学生理解 RAG 管道的每个环节，Chunk size 和 top-k 的权衡，Embedding 模型选择。
    回复风格：善于用「检索质量 vs context 消耗」的权衡轴来分析问题。
    回复要求：
    - 用中文回复，每次回复在 250 字以内
    - 用具体的数字举例（如"500 页文档 ≈ 25 万 tokens，远超 128k 窗口"）
    - 当学生问 Chunk size 选多大时，先问文档类型再给建议
---

本课结束时，你能做到：

> ✓ 说清 RAG 解决的两个核心问题（知识截止 + 私有数据）
> ✓ 画出 RAG 的两阶段管道（离线索引 + 在线检索）
> ✓ 理解 Chunk size 和 top-k 对检索质量的影响
> ✓ 知道 Embedding 模型必须索引和查询一致

**前置**：第 1 课 · Agent Loop + 第 3 课 · Memory 系统

---

## 1 · 概念：LLM 为什么需要外挂知识？

LLM 有两个致命盲区：

| 盲区 | 说明 | 例子 |
|------|------|------|
| **知识截止** | 训练数据有截止日期，不知道之后发生的事 | "2025 年诺贝尔奖得主是谁？" |
| **私有数据** | 从未见过你公司的内部文档 | "我们产品的退货政策是什么？" |

**RAG = Retrieval-Augmented Generation**，核心思路很简单：

> 不把整个知识库塞进 context，而是**按需检索**最相关的片段注入

```widget:before-after
{
  "title": "全量注入 vs RAG 检索",
  "subtitle": "场景：500 页公司产品手册，用户问「退货政策是什么？」",
  "tabs": [
    {
      "label": "全量注入（不可行）",
      "prompt": "把 500 页全塞进 context：\n\n500 页 ≈ 250,000 tokens\n128k 窗口上限 = 128,000 tokens\n\n→ 装不下，直接失败\n\n即使装得下：\n- 大量无关内容（产品规格、营销文案...）\n- LLM 容易被噪声干扰\n- 每次调用消耗 25 万 tokens ≈ 极高成本",
      "analysis": "全量注入在 99% 的场景下不可行：容量超限、噪声干扰、成本爆炸。500 页只是一个中等规模的文档——很多企业知识库有数千页。",
      "type": "bad"
    },
    {
      "label": "RAG 检索（正确做法）",
      "prompt": "按需检索相关片段：\n\n用户问「退货政策」\n  ↓\n问题 Embedding → 查询向量\n  ↓\n向量数据库检索 → top-3 相关片段\n  ↓\n只注入 3 个片段 ≈ 1,500 tokens\n  ↓\nLLM 基于这 3 个片段生成回答\n\ncontext 占用：1.5k / 128k = 1.2%",
      "analysis": "RAG 的核心价值：\n1. 只注入相关片段（1.5k vs 250k tokens）\n2. 减少噪声（只有退货政策相关的内容）\n3. 成本可控（每次只消耗检索到的 token）\n4. 可扩展（文档库从 500 页到 5 万页，检索逻辑不变）",
      "type": "good"
    }
  ]
}
```

### RAG 的两阶段管道

| 阶段 | 时机 | 流程 |
|------|------|------|
| **索引（离线）** | 文档入库时执行一次 | 文档 → 分块 → Embedding → 存入向量数据库 |
| **检索（在线）** | 每次用户提问时执行 | 问题 → Embedding → 向量检索 → top-k 片段 → 注入 context |

---

## 2 · 图解：RAG 完整管道

```widget:diagram
{
  "title": "RAG 两阶段管道",
  "caption": "上：离线索引阶段（文档入库）。下：在线检索阶段（用户查询）。两阶段必须使用相同的 Embedding 模型。",
  "svg": "<svg viewBox='0 0 660 300' xmlns='http://www.w3.org/2000/svg'><defs><marker id='a7' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'><path d='M2 1L8 5L2 9' fill='none' stroke='context-stroke' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></marker></defs><text class='ts' x='20' y='18' style='fill:var(--color-text-tertiary)'>离线 · 索引阶段</text><g class='c-gray'><rect x='20' y='28' rx='8' width='90' height='34' stroke-width='0.5'/><text class='ts' x='65' y='50' text-anchor='middle'>文档</text></g><line x1='112' y1='45' x2='148' y2='45' stroke='var(--s)' stroke-width='1.5' marker-end='url(#a7)'/><g class='c-blue'><rect x='150' y='28' rx='8' width='90' height='34' stroke-width='0.5'/><text class='ts' x='195' y='50' text-anchor='middle'>分块</text></g><line x1='242' y1='45' x2='278' y2='45' stroke='var(--s)' stroke-width='1.5' marker-end='url(#a7)'/><g class='c-purple'><rect x='280' y='28' rx='8' width='120' height='34' stroke-width='0.5'/><text class='ts' x='340' y='50' text-anchor='middle'>Embedding</text></g><line x1='402' y1='45' x2='438' y2='45' stroke='var(--s)' stroke-width='1.5' marker-end='url(#a7)'/><g class='c-teal'><rect x='440' y='28' rx='8' width='130' height='34' stroke-width='0.5'/><text class='ts' x='505' y='50' text-anchor='middle'>向量数据库</text></g><rect x='0' y='82' width='660' height='1' fill='var(--b)' rx='0.5'/><text class='ts' x='20' y='108' style='fill:var(--color-text-tertiary)'>在线 · 检索阶段</text><g class='c-gray'><rect x='20' y='118' rx='8' width='90' height='34' stroke-width='0.5'/><text class='ts' x='65' y='140' text-anchor='middle'>用户提问</text></g><line x1='112' y1='135' x2='148' y2='135' stroke='var(--s)' stroke-width='1.5' marker-end='url(#a7)'/><g class='c-purple'><rect x='150' y='118' rx='8' width='120' height='34' stroke-width='0.5'/><text class='ts' x='210' y='140' text-anchor='middle'>Embedding</text></g><text class='ts' x='210' y='165' text-anchor='middle' style='fill:var(--color-text-danger);font-size:10px'>⚠ 必须同一模型</text><line x1='272' y1='135' x2='308' y2='135' stroke='var(--s)' stroke-width='1.5' marker-end='url(#a7)'/><g class='c-teal'><rect x='310' y='118' rx='8' width='120' height='34' stroke-width='0.5'/><text class='ts' x='370' y='140' text-anchor='middle'>向量检索 top-k</text></g><line x1='432' y1='135' x2='468' y2='135' stroke='var(--s)' stroke-width='1.5' marker-end='url(#a7)'/><g class='c-amber'><rect x='470' y='118' rx='8' width='120' height='34' stroke-width='0.5'/><text class='ts' x='530' y='140' text-anchor='middle'>注入 context</text></g><line x1='530' y1='152' x2='530' y2='178' stroke='var(--s)' stroke-width='1.5' marker-end='url(#a7)'/><g class='c-purple'><rect x='440' y='180' rx='8' width='180' height='34' stroke-width='0.5'/><text class='ts' x='530' y='202' text-anchor='middle'>LLM 生成回答</text></g><line x1='505' y1='64' x2='505' y2='82' stroke='var(--color-text-tertiary)' stroke-width='1' stroke-dasharray='3 2'/><line x1='505' y1='82' x2='505' y2='116' stroke='var(--color-text-tertiary)' stroke-width='1' stroke-dasharray='3 2'/><text class='ts' x='520' y='100' style='fill:var(--color-text-tertiary);font-size:9px'>同一数据库</text><text class='th' x='330' y='250' text-anchor='middle'>最关键的两个超参数</text><g class='c-blue'><rect x='100' y='260' rx='6' width='200' height='30' stroke-width='0.5'/><text class='ts' x='200' y='280' text-anchor='middle'>Chunk size（分块大小）</text></g><g class='c-teal'><rect x='360' y='260' rx='6' width='200' height='30' stroke-width='0.5'/><text class='ts' x='460' y='280' text-anchor='middle'>top-k（检索数量）</text></g></svg>"
}
```

### Chunk Size 的权衡

| Chunk 太大 | Chunk 太小 |
|-----------|-----------|
| 检索相关性差（夹杂无关内容） | 上下文不完整（语义被截断） |
| 噪声多，干扰 LLM | 需要更多 top-k 补偿 |
| 每个 Chunk 占更多 context | 索引数量膨胀 |

**经验值**：512-1024 tokens 是大多数文档的平衡点。技术文档偏大（1024），FAQ 偏小（256-512）。

---

## 3 · 沙盒：Chunk Size 与 top-k 的权衡

```widget:sandbox
{
  "title": "RAG 超参数调优",
  "hint": "调整 Chunk size 和 top-k，观察对 context 消耗和检索质量的影响",
  "params": [
    { "id": "chunkSize", "label": "Chunk size (tokens)", "min": 128, "max": 2048, "default": 512, "step": 128, "fmt": "auto", "hint": "每个文档片段的大小" },
    { "id": "topK", "label": "top-k（检索数量）", "min": 1, "max": 10, "default": 3, "step": 1 },
    { "id": "docPages", "label": "文档总页数", "min": 10, "max": 1000, "default": 200, "step": 10, "fmt": "auto" },
    { "id": "tokPerPage", "label": "每页 tokens", "min": 200, "max": 800, "default": 500, "step": 50, "fmt": "auto" },
    { "id": "queryTok", "label": "查询 + system tokens", "min": 200, "max": 1000, "default": 400, "step": 50, "fmt": "auto" }
  ],
  "metrics": [
    {
      "label": "总 Chunks 数",
      "expr": "docPages * tokPerPage / chunkSize",
      "fmt": "auto"
    },
    {
      "label": "检索注入 tokens",
      "expr": "topK * chunkSize",
      "fmt": "k"
    },
    {
      "label": "总 context 消耗",
      "expr": "queryTok + topK * chunkSize",
      "fmt": "k",
      "warnAbove": 60000,
      "dangerAbove": 110000
    },
    {
      "label": "占 128k 窗口",
      "expr": "(queryTok + topK * chunkSize) / 128000 * 100",
      "fmt": "%",
      "warnAbove": 50,
      "dangerAbove": 85
    }
  ],
  "growth": {
    "title": "top-k 递增时 context 消耗",
    "steps": "topK",
    "labelExpr": "i",
    "valueExpr": "queryTok + i * chunkSize",
    "maxExpr": "128000",
    "fmt": "k"
  }
}
```

### 实验引导

1. **chunkSize = 512, topK = 3** → 注入 1.5k tokens，占 context 仅 1.5%——非常节省
2. **topK 拉到 10** → 注入 5k tokens，context 占比上升。信息更全但噪声也多
3. **chunkSize 拉到 2048, topK = 5** → 注入 10k tokens，context 占比 8%——每个 chunk 太大
4. **docPages = 1000** → Chunk 总数膨胀，但检索注入量不变（只取 top-k）——这就是 RAG 的可扩展性
5. **思考**：chunkSize × topK 是 context 消耗的关键乘积。怎么在这个乘积和检索质量之间取平衡？

---

## 4 · 实验室：用代码实现一个完整的 RAG 流程

在沙盒中模拟 RAG 的完整管道——分块、模拟向量检索、注入 context、LLM 生成回答：

```widget:code-playground
{
  "title": "RAG 实验室",
  "hint": "调整 chunk size 和 top-k，观察检索质量和 LLM 回答的变化",
  "mode": "sandbox",
  "files": [
    {
      "path": "rag.js",
      "active": true,
      "code": "import { knowledgeBase, search } from './knowledge.js';\n\nconst query = {{query}};\nconst topK = {{topK}};\nconst chunkSize = {{chunkSize}};\n\nconsole.log('🔍 RAG 检索实验');\nconsole.log('查询:', query);\nconsole.log('top-k:', topK);\nconsole.log('chunk size:', chunkSize);\nconsole.log('');\n\n// ── 阶段 1：展示知识库 ──────────────\nconsole.log('━━━ 知识库概况 ━━━');\nconst chunks = knowledgeBase(chunkSize);\nconsole.log('文档片段数:', chunks.length);\nconsole.log('总 tokens:', countTokens(chunks.map(c => c.text).join('')).tokens);\nconsole.log('');\n\n// ── 阶段 2：检索 ────────────────────\nconsole.log('━━━ 向量检索 ━━━');\nconst results = search(query, chunks, topK);\nfor (let i = 0; i < results.length; i++) {\n  const r = results[i];\n  console.log(`#${i + 1} [相关度 ${r.score}] ${r.source}`);\n  console.log(`   ${r.text.slice(0, 60)}...`);\n}\n\nconst injectedTokens = countTokens(results.map(r => r.text).join('')).tokens;\nconsole.log(`\\n注入 ${results.length} 个片段，共 ${injectedTokens} tokens`);\n\n// ── 阶段 3：LLM 生成回答 ─────────────\nconsole.log('\\n━━━ LLM 生成回答 ━━━');\nconst context = results.map((r, i) => `[来源${i + 1}: ${r.source}] ${r.text}`).join('\\n\\n');\nconst response = await callLLM([\n  { role: 'system', content: '你是一个产品客服。只根据提供的参考资料回答问题。如果参考资料中没有答案，说「抱歉，我没有找到相关信息」。引用来源编号。回答控制在 100 字以内。' },\n  { role: 'user', content: `参考资料：\\n${context}\\n\\n用户问题：${query}` },\n]);\nconsole.log('💬', response.content);\n\n// ── 统计 ────────────────────────────\nconst totalCtx = countTokens(context + query).tokens;\nconsole.log(`\\n📊 检索片段: ${results.length} | 注入 tokens: ${injectedTokens} | 总 context: ${totalCtx}`);",
      "slots": [
        {
          "id": "query",
          "default": "'你们的退货政策是什么？可以退货多久？'",
          "tooltip": "试试不同的问题：'产品保修多久？' / '怎么联系客服？' / '有没有会员折扣？'"
        },
        {
          "id": "topK",
          "default": "3",
          "tooltip": "检索片段数。1 = 信息可能不够，10 = 噪声可能太多"
        },
        {
          "id": "chunkSize",
          "default": "500",
          "tooltip": "分块大小。200 = 每块很小（可能截断语义），1000 = 每块很大（可能含无关内容）"
        }
      ]
    },
    {
      "path": "knowledge.js",
      "code": "// ── 模拟产品知识库 ──────────────────\nconst RAW_DOCS = [\n  { source: '退货政策', text: '自购买之日起 30 天内，未拆封商品可全额退款。已拆封商品在 7 天内可退货，需扣除 10% 手续费。退货时请携带购买凭证和原包装。特价商品和定制商品不支持退货。退货审核周期为 3-5 个工作日，退款将原路返回。' },\n  { source: '保修条款', text: '所有电子产品享受 12 个月官方保修，保修期内免费维修硬件故障。人为损坏（跌落、进水）不在保修范围内。保修维修时间为 7-14 个工作日。保修到期后可购买延保服务，价格为产品原价的 8%/年。' },\n  { source: '配送说明', text: '标准配送 3-5 个工作日，运费 15 元。订单满 299 元免运费。加急配送（次日达）额外收取 25 元。部分偏远地区配送时间可能延长 2-3 天。配送过程中如有损坏，请在签收后 48 小时内联系客服。' },\n  { source: '会员权益', text: '银卡会员：消费满 2000 元自动升级，享 95 折优惠。金卡会员：消费满 8000 元，享 9 折优惠 + 优先客服。钻石会员：消费满 20000 元，享 85 折 + 专属客服 + 免费加急配送。会员等级每年 1 月重新评定。' },\n  { source: '支付方式', text: '支持微信支付、支付宝、银行卡（Visa/Mastercard/银联）。分期付款：订单满 1000 元可选 3/6/12 期，3 期免息，6 期手续费 1.5%，12 期手续费 3%。企业采购支持对公转账，需提前联系商务部门。' },\n  { source: '客服渠道', text: '在线客服：工作日 9:00-21:00，周末 10:00-18:00。电话客服：400-123-4567，工作日 9:00-18:00。邮件：support@example.com，48 小时内回复。紧急问题（订单异常、支付失败）可通过 App 内「紧急通道」联系值班客服。' },\n  { source: '产品规格-手机', text: '旗舰手机 Pro Max：6.7 英寸 OLED 屏幕，A18 芯片，256GB/512GB/1TB 存储，4800 万像素三摄，5000mAh 电池，支持 45W 快充，IP68 防水，重量 228g。颜色：深空黑、星光银、海洋蓝。' },\n  { source: '产品规格-耳机', text: '降噪耳机 Air：主动降噪（-40dB），蓝牙 5.3，续航 30 小时（开降噪 24 小时），支持空间音频，IPX4 防汗，重量 250g。充电盒支持无线充电。颜色：午夜黑、云白。' },\n];\n\n// 根据 chunkSize 分块\nexport function knowledgeBase(chunkSize) {\n  const chunks = [];\n  for (const doc of RAW_DOCS) {\n    if (doc.text.length <= chunkSize) {\n      chunks.push({ source: doc.source, text: doc.text });\n    } else {\n      // 按 chunkSize 切分\n      for (let i = 0; i < doc.text.length; i += chunkSize) {\n        chunks.push({ source: doc.source, text: doc.text.slice(i, i + chunkSize) });\n      }\n    }\n  }\n  return chunks;\n}\n\n// 模拟向量检索（关键词匹配模拟相似度）\nexport function search(query, chunks, topK) {\n  const keywords = query.replace(/[？?，。！、]/g, '').split('').filter(c => c.trim());\n  const scored = chunks.map(chunk => {\n    let score = 0;\n    for (const kw of keywords) {\n      if (chunk.text.includes(kw)) score++;\n      if (chunk.source.includes(kw)) score += 2;\n    }\n    // 优先匹配 source 标题\n    if (query.includes('退货') && chunk.source.includes('退货')) score += 10;\n    if (query.includes('保修') && chunk.source.includes('保修')) score += 10;\n    if (query.includes('客服') && chunk.source.includes('客服')) score += 10;\n    if (query.includes('会员') && chunk.source.includes('会员')) score += 10;\n    if (query.includes('配送') && chunk.source.includes('配送')) score += 10;\n    if (query.includes('支付') && chunk.source.includes('支付')) score += 10;\n    return { ...chunk, score };\n  });\n  scored.sort((a, b) => b.score - a.score);\n  return scored.slice(0, topK).filter(r => r.score > 0);\n}"
    }
  ],
  "outputHeight": 380
}
```

### 关键实验

| 试什么 | 观察什么 |
|--------|---------|
| 问"退货政策" | 检索到退货相关片段，LLM 引用来源回答 |
| 问"怎么联系客服" | 检索到客服渠道片段，不会返回产品规格 |
| 问"最新的 iPhone 价格" | 知识库没有 → LLM 应回答"未找到相关信息" |
| `topK = 1` vs `topK = 8` | 1 = 可能遗漏信息，8 = 包含无关的产品规格噪声 |
| `chunkSize = 200` | 切得太碎，退货政策被截断成多个片段 |
| `chunkSize = 1000` | 一个 chunk 包含了整段退货政策 + 部分保修内容 |

---

## 5 · 练习：检验你的理解

```widget:quiz
{
  "title": "RAG 检索增强测验",
  "questions": [
    {
      "id": "q1",
      "text": "Chunk size 对 RAG 效果的影响是什么？",
      "type": "single",
      "options": [
        { "text": "Chunk 越大越好，信息越完整", "correct": false },
        { "text": "Chunk 越小越好，检索越精确", "correct": false },
        { "text": "需要权衡：太大噪声多，太小上下文不完整，通常 512-1024 tokens", "correct": true }
      ],
      "explanation": "Chunk size 是 RAG 最关键的超参数。太大 = 每个 chunk 包含无关内容（噪声），占更多 context。太小 = 语义被截断，一个完整的段落可能被切成无意义的碎片。512-1024 tokens 是大多数文档类型的经验平衡点。"
    },
    {
      "id": "q2",
      "text": "为什么不直接把整个知识库塞进 context？",
      "type": "single",
      "options": [
        { "text": "技术上可以，只是比较慢", "correct": false },
        { "text": "知识库通常远超 context 上限，且全量注入噪声大、成本高", "correct": true },
        { "text": "LLM 不能读取太长的文本", "correct": false }
      ],
      "explanation": "一个 500 页文档 ≈ 25 万 tokens，远超 128k 窗口。即使将来窗口更大，全量注入仍然不好：① 大量无关内容干扰 LLM ② 每次调用消耗全量 token（成本高）③ 长 context 导致 LLM 注意力退化。RAG 只注入相关片段是正确做法。"
    },
    {
      "id": "q3",
      "text": "索引时用 text-embedding-3-large，查询时换用 text-embedding-ada-002，会有什么问题？",
      "type": "single",
      "options": [
        { "text": "没有影响，都是 Embedding 模型", "correct": false },
        { "text": "查询可能稍慢一些", "correct": false },
        { "text": "向量空间不同，距离计算失去意义，检索结果完全错误", "correct": true }
      ],
      "explanation": "不同 Embedding 模型把文本映射到不同的向量空间。用模型 A 生成的文档向量和用模型 B 生成的查询向量之间的余弦相似度没有意义——就像用公里和英里混合计算距离。索引和查询必须使用完全相同的 Embedding 模型。"
    }
  ]
}
```

---

## 本课小结

- **RAG 解决两个问题**：LLM 知识截止 + 私有数据不可见
- **两阶段管道**：离线索引（分块 → Embedding → 存储）+ 在线检索（Embedding → 检索 → 注入）
- **Chunk size** 是最关键的超参数：太大噪声多，太小语义断裂，512-1024 是平衡点
- **top-k** 控制注入量：过少遗漏信息，过多引入噪声
- **Embedding 模型一致性**：索引和查询必须用同一个模型
- RAG 的核心优势是**可扩展性**——文档库从 100 页到 10 万页，检索逻辑和 context 消耗不变

```widget:checklist
{
  "title": "第 7 课完成清单",
  "id": "module-2-lesson-07",
  "items": [
    "我理解 RAG 解决的两个核心问题",
    "我能画出 RAG 的两阶段管道",
    "我理解 Chunk size 太大和太小的问题",
    "我理解 top-k 对检索质量和 context 消耗的影响",
    "我知道 Embedding 模型必须索引和查询一致",
    "我做了沙盒实验，调优 Chunk size 和 top-k",
    "我做了代码实验，体验了完整的 RAG 检索流程",
    "我完成了 3 道测验题"
  ]
}
```

---

[← 上一课](/lesson/module-2/06-multi-agent) · [返回课程目录](/courses/agent-engineering)

**恭喜完成 Agent 工程全部 7 课！** 🎉
