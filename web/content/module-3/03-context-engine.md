---
title: "Context Engine：喂对信息 + 项目目录搭建"
module: "module-3"
moduleTitle: "金融宏观分析 Agent 实战（第一期）"
duration: "约 100 分钟"
description: "掌握 Context 三原则（给什么、顺序、给多少），完成 Context 设计文档；在 Trae 中生成 news_agent 项目骨架并安装依赖，为第 4 课编码做准备。"
tags: ["Context", "Trae", "项目结构", "AP News", "数据管道"]
expert:
  name: "工程教练 Ren"
  model: "gpt-4o"
  intro: "我是 Ren，帮你把 Context 设计和 Trae 项目脚手架理清楚。目录、依赖、预习页面都可以问我。"
  systemPrompt: |
    你是 Ren，面向金融分析场景的 Context 与轻量工程实践教练。
    用中文回答，200 字以内；优先谈信息边界、注入顺序、成本控制；代码只点到为止。
---

本课结束时，你能做到：

- 陈述 Context 三原则，并解释「输入质量决定输出质量」  
- 完成 News Agent 的 Context 设计文档（来源、字段、上限、顺序、失败）  
- 在 Trae 中创建约定目录、装好依赖，并预习 AP News Business 页面结构  

---

## 课堂节奏（参考）

| 时段 | 模块 | 备注 |
|------|------|------|
| 0–5′ | 回顾 | `{news_list}` 从哪来 |
| 5–30′ | Context 三原则 | 演示：信息过载 vs 精准 |
| 30–50′ | 练习① | Context 设计文档 |
| 50–55′ | Trae 界面 | 文件树 / 终端 / AI 对话框 |
| 55–80′ | 练习② | Trae 生成目录 + pip |
| 80–90′ | AP News 预习 | 列表、标题、时间、链接 |
| 90–100′ | 预告 | API Key、python --version |

---

## 1 · 回顾：Prompt 已就绪，材料从哪来？

模型不会自己打开 AP News。运行前必须把「阅读材料包」准备好，再注入 Prompt——这就是 **Context**。

---

## 2 · Context 三原则

**类比**：投委会前的助理材料——空的、500页堆砌、精准 10 页，哪一种能帮决策者？

### 原则 1：给什么？

- 宜：标题、时间、摘要前约 100 字、链接；当日日期。  
- 不宜：整篇长文 ×多条；明显无关栏目；过期新闻淹没当日信号。

### 原则 2：顺序（推荐）

1. 角色设定  
2. 今日日期  
3. 新闻列表  
4. 任务指令  
5. 输出约束  

先立身份，再给材料，最后重申任务。

### 原则 3：给多少？

- 例如最多 **20 条**，每条摘要控制在约 **100 字** 量级。  
- 过多条数会稀释重点；全文会拖慢、变贵。

**课堂演示建议**：同一套 Prompt，先塞 50 条混杂新闻，再换 15 条偏金融相关——对比输出，强调**差别在 Context，不在 Prompt 模板**。

---

## 3 · 练习①：Context 设计文档

填写五部分：**信息来源 / 字段清单 / 数量限制 / 注入顺序 / 失败处理**。

**点评**：避免「来源 = 整站所有频道」——应在抓取阶段就收窄栏目，否则窗口里大量噪声浪费 token。

---

## 4 · Trae 界面（三个区域）

- **左侧文件树**：浏览与编辑文件。  
- **终端**：运行 `python ...`、`pip install ...`。  
- **AI 对话框**：用自然语言让 Trae 生成或改文件。

本课侧重用对话框**搭骨架**；第 4 课再在终端跑通脚本。

---

## 5 · 练习②：用 Trae 生成项目目录

**讲师演示**：将下方整段需求复制到 Trae AI，展示生成结果；学员跟做。

```
请帮我创建一个名为 news_agent 的项目，包含以下文件和目录：

- app.py（Flask 后端，暂时留空，顶部加注释说明：本文件是 Flask 后端，第5节课完善）
- fetch_news.py（AP News 抓取脚本，顶部加注释：本文件负责从 apnews.com 抓取新闻）
- news_agent.py（Claude API 调用，顶部加注释：本文件调用 Claude API 整理新闻摘要）
- index.html（前端展示页面，顶部加注释：本文件是网页展示页，第5节课完善）
- data/summary.json（初始内容：{"date": "", "raw_news": [], "items": []}）
- .env（内容：ANTHROPIC_API_KEY=your_api_key_here）
- .gitignore（忽略 .env 文件和 __pycache__ 目录）
- requirements.txt（包含以下库，每行一个：requests, beautifulsoup4, anthropic, flask, python-dotenv, apscheduler, flask-cors）

请在每个 Python 文件顶部加上说明注释。
```

**学员步骤**：

1. 发送上述指令，检查文件是否齐全。  
2. 终端执行：`pip install -r requirements.txt`（或 `pip3` / `python -m pip`）。  
3. 打开 `.env`，确认有 `ANTHROPIC_API_KEY=` 一行（第 4 课再填真实 Key）。

**常见问题**：`pip` 找不到；网络超时（可换国内镜像）；文件未生成全（重发指令或手动补建）。

---

## 6 · AP News 页面预习

打开 [AP News Business hub](https://apnews.com/hub/business)，浏览：

1. 列表区域大致位置；  
2. 每条标题、时间、摘要在哪；  
3. 点进文章后 URL 形态。

**说明**：第 4 课会用自然语言让 Trae 写抓取逻辑；本课只需「踩点」页面长什么样。

---

## 7 · 课后必做（第 4 课之前）

1. 将 `.env` 中 `your_api_key_here` 换成真实 **Anthropic API Key**。  
2. 终端执行 `python --version`（或 `python3`），确认有 Python 3.x。

---

## 8 · 本课交付清单

- [ ] Context 设计文档五部分完整  
- [ ] Trae 中项目文件树齐全  
- [ ] `pip install -r requirements.txt` 成功  
- [ ] 知道 Business 栏目入口与列表大致结构  
- [ ] （课后）`.env` 已填入真实 Key  

**下节预告**：**Vibe Coding**——用四步法生成 `fetch_news.py` 与 `news_agent.py`，在终端看到真实摘要。
