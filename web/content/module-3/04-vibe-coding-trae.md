---
title: "Vibe Coding：用 Trae 让系统真正动起来"
module: "module-3"
moduleTitle: "金融宏观分析 Agent 实战（第一期）"
duration: "约 100 分钟"
description: "通过四步工作法（手动流程、I/O 契约、Trae 生成、运行验证）完成 fetch_news.py 与 news_agent.py，在终端跑通「抓取 → Claude 整理 → 写入 summary.json」。"
tags: ["Vibe Coding", "Trae", "I/O 契约", "Claude API", "Python"]
expert:
  name: "实战教练 Miko"
  model: "gpt-4o"
  intro: "我是 Miko，陪你把 Trae 四步法和 I/O 契约跑通。报错把最后一行贴给我。"
  systemPrompt: |
    你是 Miko，教金融从业者用「自然语言 + Trae」落地 Python 小工具。
    用中文回答，200 字以内；强调验证输出是否符合契约，不要求读懂每一行代码。
---

本课结束时，你能做到：

- 复述 Vibe Coding 四步，并说明「不必读懂每行代码，但必须能验收输出」  
- 实现 `fetch_news()`：写入 `data/summary.json` 的 `raw_news`  
- 实现 `run_agent()`：读取 `raw_news`、调用 Claude、更新 `items` 与 `last_updated`  
- 在终端依次运行两条脚本并排查常见报错  

---

## 课堂节奏（参考）

| 时段 | 模块 | 备注 |
|------|------|------|
| 0–10′ | 环境检查 | Python、API Key、依赖 |
| 10–20′ | 四步法 | 方法论 |
| 20–35′ | Demo | fetch_news |
| 35–55′ | 跟练 | fetch_news |
| 55–70′ | Demo | news_agent |
| 70–88′ | 跟练 | news_agent |
| 88–96′ | 集中 Debug | 常见错 |
| 96–100′ | 庆祝 + 预告 | 下节网页化 |

---

## 1 · 环境检查（开课先做）

学员在 Trae 终端依次确认：

```bash
python --version
# 或
python3 --version
```

期望：Python 3.x。打开 `.env`，确认 `ANTHROPIC_API_KEY=` 后为真实 Key（非 `your_api_key_here`）。

**快速处理**：无 `python` 可试 `python3`；缺依赖可 `pip install requests beautifulsoup4 anthropic python-dotenv`。

---

## 2 · Vibe Coding 四步法

1. **描述手动流程**：若人工操作，步骤是什么？  
2. **定义 I/O 契约**：输入、成功输出、失败输出分别是什么？  
3. **让 Trae 生成代码**：把前两步完整告诉 Trae。  
4. **运行验证**：对照契约看终端与 `summary.json`；不对则用自然语言要求 Trae 修改。

**原则**：可以不读每一行实现，但必须能判断**结果是否符合契约**。

---

## 3 · fetch_news.py：I/O 契约（先写再编码）

| 项目 | 约定 |
|------|------|
| 函数名 | `fetch_news()` |
| 输入 | 无参数 |
| 成功 | 写入 `data/summary.json` 的 `raw_news`；元素为 `title, time, summary, url`；最多 20 条；终端打印成功条数 |
| 失败 | 打印错误；`raw_news` 置为 `[]`；不破坏文件其他字段 |

**发给 Trae 的提示（示例，可按页面结构调整）**：

```
请帮我完善 fetch_news.py，实现以下功能：

【手动流程】
1. 打开 https://apnews.com/hub/business 页面
2. 找到所有新闻条目
3. 对每条新闻，提取：标题、发布时间、摘要（正文前100字）、原文链接
4. 最多保留20条最新的新闻
5. 保存成 JSON 文件

【I/O 契约】
函数名：fetch_news()
无输入参数，直接调用
成功时：
  将结果写入 data/summary.json 的 "raw_news" 字段
  在终端打印：成功抓取 N 条新闻
失败时：
  打印具体错误信息
  将 raw_news 设为空数组 []

【技术要求】
- 使用 requests 和 BeautifulSoup 库
- 请求超时设为10秒，失败时自动重试1次
- 如果 data/ 目录不存在，自动创建
- 保存时只更新 raw_news 字段，不要覆盖文件里已有的其他字段

【AP News 页面参考】
新闻条目通常在 article 标签或 class 包含 "PagePromo" 的 div 中
如果找不到，请使用更通用的选择器，我会根据实际结果调整

最后加上：
if __name__ == "__main__":
    fetch_news()
```

**验证**：运行 `python fetch_news.py`，查看 `data/summary.json` 中 `raw_news` 是否非空且四字段齐全。若0 条，可让 Trae 改用更通用选择器（例如含 `/article/` 的链接）。

---

## 4 · news_agent.py：I/O 契约

| 项目 | 约定 |
|------|------|
| 函数名 | `run_agent()` |
| 输入 | 从 `data/summary.json` 读取 `raw_news` |
| 成功 | 更新 `items` 与 `last_updated`；`items` 含 `title, summary, market_impact, url`；终端打印整理条数 |
| 失败 | 打印错误；`items` 可保持为空或不覆盖 |

**API Key**：只放在 `.env`，代码用 `python-dotenv` 读取；勿把 Key 写进仓库。

**发给 Trae 的提示（示例）**：

```
请帮我完善 news_agent.py，实现以下功能：

【功能描述】
读取 data/summary.json 中的 raw_news 字段（fetch_news.py 已经抓取好的新闻）
调用 Claude API 对这些新闻进行分析
将结果更新到 data/summary.json 的 items 字段

【I/O 契约】
函数名：run_agent()
无输入参数
成功时：
  更新 summary.json 中的 items 和 last_updated 字段
  在终端打印：整理完成，共找到 N 条金融相关新闻
失败时：
  打印具体错误，items 不变

【发送给 Claude 的 Prompt 内容】
用以下模板（把新闻列表填入 {news_list} 位置）：

你是一位专注于金融市场的新闻分析师。
你只基于我提供的新闻列表进行分析，不引用任何我没有提供的内容。

以下是今日 AP News 的新闻列表：
{news_list}

请筛选与金融市场相关的新闻（最多5条，按重要性排序），
对每条输出以下字段：
- title：保持原标题不改
- summary：2~3句话，说清楚发生了什么
- market_impact：1句话，为什么金融从业者需要关注
- url：原文链接

严格以 JSON 格式输出：{"items": [...]}
不要包含任何额外说明文字。
如果没有金融相关新闻，输出：{"items": []}

【技术要求】
- 从环境变量 ANTHROPIC_API_KEY 读取 Key（用 python-dotenv 加载 .env 文件）
- 使用 anthropic 库；模型名称请使用当前账号可用的 Claude Sonnet 系列模型 ID（若 claude-sonnet-4-6 不可用，请改为官方文档中的等价 Sonnet 模型字符串）
- 解析 Claude 返回的 JSON 时加错误处理（偶尔格式不完整）
- 更新 summary.json 时保持 raw_news 字段不变，只更新 items 和 last_updated

最后加：
if __name__ == "__main__":
    run_agent()
```

**完整流程**：`python fetch_news.py` → `python news_agent.py` → 打开 `summary.json` 查看 `items`（约 3–5 条或按当日新闻为空）。

---

## 5 · 常见报错（告诉 Trae 时可用）

| 现象 | 可能原因 | 方向 |
|------|----------|------|
| `ModuleNotFoundError: requests` | 未安装依赖 | `pip install requests beautifulsoup4` |
| `raw_news` 为空 | 选择器与页面不匹配 | 放宽选择器、筛选 `/article/` 链接 |
| `JSONDecodeError`（读 json） | 文件损坏 | 先重置为合法 JSON再写 |
| `AuthenticationError` | Key 错误或未加载 | 检查 `.env` 格式 `KEY=value` 无空格 |
| `items` 为空 | 当日无金融相关稿 | 可接受；或放宽筛选阈值 |

---

## 6 · 本课交付清单

- [ ] `fetch_news.py` 成功，`raw_news` 有数据  
- [ ] `news_agent.py` 成功，`items` 有合理条数或符合「无新闻」约定  
- [ ] 能向同伴说明两个脚本各自职责  

**下节预告**：用 Trae 把同一数据做成**可刷新**的网页产品（Flask + 前端），并做第一期回顾与 JSON 铺垫。
