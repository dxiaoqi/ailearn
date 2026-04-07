# Agent Design 课程设计文档

> 版本 1.0 · 面向混合受众 · 七模块完整体系
> 
> 本文档包含：课程整体架构、每课完整大纲、内容设计、组件规格、AI 接入点说明。可直接用于开发实现。

---

## 目录

1. [课程总览](#一课程总览)
2. [学习路径设计](#二学习路径设计)
3. [课程页面结构规范](#三课程页面结构规范)
4. [第 1 课 · Agent Loop](#第-1-课--agent-loop)
5. [第 2 课 · Context 管理与压缩](#第-2-课--context-管理与压缩)
6. [第 3 课 · Memory 系统](#第-3-课--memory-系统)
7. [第 4 课 · Tool Use / Function Calling](#第-4-课--tool-use--function-calling)
8. [第 5 课 · Planning & ReAct](#第-5-课--planning--react)
9. [第 6 课 · Multi-Agent 协作](#第-6-课--multi-agent-协作)
10. [第 7 课 · RAG 检索增强](#第-7-课--rag-检索增强)
11. [AI 接入点规格](#十一ai-接入点规格)
12. [组件系统规格](#十二组件系统规格)
13. [进度与数据持久化](#十三进度与数据持久化)

---

## 一、课程总览

### 定位

面向希望理解并设计 AI Agent 系统的混合受众——从零基础的产品经理到有经验的工程师。每课设计为独立完整的学习单元，同时保持模块间的知识递进关系。

### 核心理念

```
看懂（图解建立直觉）→ 感受（沙盒感受行为）→ 动手（实验改代码）→ 验证（判断题固化）
```

### 七课概览

| # | 模块 | 核心问题 | 时长 | 难度 | 前置 |
|---|------|---------|------|------|------|
| 1 | Agent Loop | 什么驱动 Agent 持续运行？ | 20 min | 入门 | 无 |
| 2 | Context 管理与压缩 | context 为什么会爆，怎么救？ | 25 min | 初级 | 课 1 |
| 3 | Memory 系统 | 三层记忆各管什么？ | 30 min | 初级 | 课 1+2 |
| 4 | Tool Use | Agent 怎么触达真实世界？ | 25 min | 初级 | 课 1 |
| 5 | Planning & ReAct | 怎么让 Agent 先想再做？ | 35 min | 中级 | 课 1+2 |
| 6 | Multi-Agent 协作 | 一个 Agent 不够用时怎么办？ | 40 min | 中级 | 课 1-4 |
| 7 | RAG 检索增强 | 怎么给 Agent 注入外部知识？ | 30 min | 初级 | 课 1+3 |

### 解锁规则

```
课 1           → 解锁课 2、4
课 1 + 2       → 解锁课 3、5
课 1 + 2 + 3   → 解锁课 7
课 1 + 2 + 3 + 4 → 解锁课 6
```

---

## 二、学习路径设计

### 路径 A · 入门路径（60 min）

适合：产品经理、AI 应用用户、零基础学习者

```
课 1（Agent Loop）→ 课 2（Context 压缩）→ 课 4（Tool Use）
```

**学完能做什么**：理解 Agent 的运作机制，能看懂 Agent 产品的设计文档，能判断 Agent 产品的基本配置是否合理。

### 路径 B · 完整路径（3.5 h）

适合：初级开发者、想系统学习的产品技术人员

```
课 1 → 课 2 → 课 3 → 课 4 → 课 7 → 课 5 → 课 6
```

**学完能做什么**：能独立设计并实现生产级 Agent 系统，理解各组件的权衡和边界。

### 路径 C · 工程师快速通道（1.5 h）

适合：有 LLM 使用经验、想深入原理的工程师

```
课 5（ReAct）← 遇到不懂的概念再回头看课 1-4
```

从最复杂的模块开始，遇到不理解的概念再回溯。适合已有实践经验、想系统化知识的工程师。

---

## 三、课程页面结构规范

### 5 节固定结构

每课严格遵循以下 5 节结构，顺序不变：

```
节 1 · 概念     建立认知框架，回答「为什么学这个」
节 2 · 图解     交互式 SVG 图解，建立空间直觉
节 3 · 沙盒     参数滑块实时计算，感受行为边界
节 4 · 实验室   代码编辑器 + 行为模拟，动手验证
节 5 · 练习     3 道场景判断题，全对解锁下一课
```

### 页面导航规则

- 顶部导航栏常驻，显示 5 节进度
- 每节完成（访问过）标记为 done
- 5 节全部访问后显示完成态
- 判断题全对后解锁后续课程
- 进度通过 `localStorage` 持久化，刷新不丢失

### AI 接入点分布

每课固定预留 4 个 AI 接入点：

| 接入点 | 位置 | 触发方式 | 实现 |
|--------|------|---------|------|
| 对话导师 | 节 2 图解底部 | 用户主动提问 | `useChat` 流式 |
| 沙盒顾问 | 节 3 沙盒底部 | 点击「生产建议」 | `generateObject` |
| 代码解释 | 节 4 实验室底部 | 运行后点击「AI 解释」 | `streamText` 流式 |
| 答案评估 | 节 5 练习（开放题） | 提交答案 | `generateObject` |

> 当前实现为 UI 占位（dashed border 样式），接入 AI SDK 后替换对应组件。

### 代码实验室规范

- 每课提供 1 个预置代码案例（Python 风格伪代码）
- 高亮行（黄色虚线下划线）为可编辑参数
- 按 Enter 或点击「运行」触发行为模拟
- 模拟结果：执行轨迹 + 指标卡片 + AI 洞察
- 提供「重置」恢复默认值

---

## 第 1 课 · Agent Loop

**核心问题**：什么驱动 Agent 持续运行？终止条件为什么至关重要？

### 节 1 · 概念

**开场类比**（三列对比卡）：

| 人类决策 | 传统程序 | Agent |
|---------|---------|-------|
| 看红灯 → 判断 → 踩刹车 → 再观察 | 输入参数 → 固定逻辑 → 输出结果 | 观测 → LLM 推理 → 执行 → 再观测 |

**核心观点**：Agent 把「判断」这一步交给了 LLM。这让它能处理复杂不确定任务，代价是你失去了对执行路径的直接控制。

**本课收获清单**：
- 理解 Loop 的四个组成部分（观测/推理/行动/终止）
- 知道 context 为什么线性增长
- 能设计合理的终止条件
- 通过场景判断题检验理解

### 节 2 · 图解

**SVG 图解节点**：

```
Environment（蓝）← → Context Window（蓝）← → LLM（绿）← → Action（橙）
                                                    ↓
                                               终止条件（灰）
```

**5 步骤内容**：

1. **观测入 Context**：环境返回观测值（工具结果、用户消息、代码输出），追加进 context window。Context 是 Agent 的「工作记忆」，每轮持续增长。

2. **Context 送入 LLM**：完整 context（system + 历史 + 最新观测）作为输入。注意：每轮都要传完整 context，这是为什么 context 越长，每轮推理代价越高。

3. **LLM 决策**：输出下一步行动（tool_call / 文本 / 代码），同时判断是否满足终止条件。两个输出互斥——继续循环或触发终止信号退出。

4. **Action 执行并反馈**：行动被执行，结果作为新观测值返回环境，驱动下一轮。这就是「loop」——驱动力是观测，终点是终止条件，而非任务本身。

5. **终止条件设计**：三道保障：(a) LLM 主动输出终止信号；(b) 达到 max_turns 强制停止；(c) 外部中断。缺一则 Agent 有无限运行的风险。

**配套知识卡片（两列）**：
- context 每轮增长计算示例（第 1/5/20 轮的 token 量对比）
- 终止条件三种类型及适用场景

### 节 3 · 沙盒

**可调参数**（4 个滑块）：

| 参数 | 范围 | 默认值 | 说明 |
|------|------|-------|------|
| `max_turns` | 1-30 | 8 | 最大执行轮次 |
| `system_tokens` | 100-2000 | 400 | System prompt token 量 |
| `obs_per_turn` | 50-1000 | 280 | 每轮观测 token 量 |
| `asst_per_turn` | 50-600 | 160 | 每轮回复 token 量 |

**复选框开关**（2 个）：
- 启用 stop signal 检测（默认开）
- 模拟第 5 轮工具错误（默认关）

**实时计算指标**（4 格）：
- 最大轮次
- 末轮占 128k 窗口百分比（>80% 警告色）
- 总 tokens 消耗
- 估算费用（Sonnet 定价）

**增长曲线**：每轮 context 大小横向条形图，超过 80k 变警告色，超过 115k 变危险色。

**执行轨迹模拟**：按参数实时渲染每轮的 Loop 行为，包含终止信号检测结果和冗余轮次提示。

### 节 4 · 实验室

**案例名称**：Loop 失控

**可编辑参数**（4 行，黄色高亮）：
- `max_turns = 8`（提示：试试 2 / 15 / 0）
- `check_stop = True`（提示：改成 False 看看）
- `system_tokens = 400`
- `obs_per_turn = 280`

**行为模拟逻辑**：
- `max_turns=0`：Loop 体不执行，立即返回空结果
- `check_stop=False` + turns>自然完成轮次：显示冗余循环轨迹 + 冗余 token 消耗警告
- 正常配置：显示在第 3 轮提前终止，max_turns 作为安全网未触发

**洞察文案示例**：
> 关闭 stop signal 检测后，Agent 在任务完成后还运行了 N 轮，额外消耗约 Xk tokens（≈$Y）。max_turns 是最后防线，不能替代 stop signal。

### 节 5 · 练习

**题目 1**（终止条件）：
> 一个 Agent 已成功完成任务，但代码中 `check_stop=False`，`max_turns=20`。此时 Agent 会怎么做？

- 立即停止，任务完成是隐式终止条件
- ✓ **继续执行，直到 max_turns=20 被触发或外部中断**
- LLM 会自动识别任务完成并发出停止信号

**解析**：Agent loop 只响应显式终止条件。「任务完成」的概念对 loop 透明——除非 LLM 被明确指示输出终止信号且 check_stop=True，否则 loop 会一直跑到 max_turns。

**题目 2**（context 计算）：
> 某 Agent：`max_turns=5`，`system_tokens=800`，`obs_per_turn=400`，`asst_per_turn=200`。第 5 轮 context 是多少？

- `max_turns × (obs+asst) = 3,000 tokens`
- ✓ **`system + max_turns × (obs+asst) = 800 + 5×600 = 3,800 tokens`**
- 只算最后一轮：`obs+asst = 600 tokens`

**解析**：Context window 是累积的——system prompt 每轮固定存在，历史对话随轮次线性叠加。公式：`system + turns × (obs+asst)`。

**题目 3**（生产设计）：
> 生产环境中，下列哪种终止条件设计最稳健？

- 只设 max_turns，足够安全
- 只设 stop signal 检测，任务完成就退出
- ✓ **同时设 stop signal + max_turns，两者都触发则停止**

**解析**：Stop signal 是主动终止（效率优先），max_turns 是被动安全网（防止失控）。两者结合才是生产级配置。

---

## 第 2 课 · Context 管理与压缩

**核心问题**：context 线性增长终将触顶，四种压缩策略各有什么权衡？

### 节 1 · 概念

**开场**：以第 1 课的 context 增长公式引入。在没有压缩的情况下，一个 20 轮的 Agent 任务 context 末轮可能达到 12k tokens——看起来不多，但如果 obs 稍大一点，30 轮后就会逼近 128k 上限。

**四种策略卡片**：

| 策略 | 核心机制 | 信息损失 | 实现复杂度 |
|------|---------|---------|-----------|
| 无压缩 | 全量保留 | 无 | 极低 |
| 滑动窗口 | 丢弃早期历史 | 早期信息 | 低 |
| 摘要压缩 | LLM 生成摘要替代历史 | 细节信息 | 中 |
| 混合策略 | 摘要 + 保留最近 N 轮 | 最少 | 高 |

**核心观点**：没有最好的策略，只有最适合当前任务的策略。判断标准只有一个：早期历史对后续推理还重不重要？

### 节 2 · 图解

**SVG 图解**：四列并排，展示 Round 1 / Round 4 / Round 8 / Round 12 时 context 大小的增长。各 segment 颜色语义：
- 紫色：System prompt（固定）
- 蓝色：历史对话（随轮次增长）
- 绿色：摘要块（压缩产物）
- 橙色：最近 N 轮（混合策略保留部分）
- 红色：溢出区域（超过 128k）

**5 步骤内容**：

1. **线性增长本质**：每轮都在向 context 追加内容。展示 4 列不同轮次的 context 体积对比，让用户直觉感受增长速度。

2. **增长代价可视化**：叠加费用信息（每轮输入成本）和窗口占比，显示红色「danger zone」趋向上限。

3. **128k 上限线**：加入横向上限标记线，展示哪一轮会触顶，触顶后的截断行为。

4. **压缩触发点**：在第 4 轮处加入绿色虚线「触发压缩」标注，展示早期历史被摘要块替代后的 context 体积变化。

5. **压缩后增长曲线**：对比无压缩 vs 摘要压缩的 context 增长斜率差异。

### 节 3 · 沙盒

**策略选择器**（4 个卡片 Tab）：
- 无压缩（红色主题，对照组）
- 滑动窗口（蓝色主题）
- 摘要压缩（绿色主题）
- 混合策略（紫色主题，推荐）

**可调参数**：
- 已执行轮次（1-24）
- 保留最近轮数（窗口大小，1-10）
- System prompt tokens（100-2000）
- 每轮 obs tokens（50-800）
- 每轮 asst tokens（50-500）
- 压缩触发阈值（占窗口 30%-95%）

**可视化**：
- 压缩前 / 压缩后双列 context 可视化（分段色块）
- 每列底部 token meter（占 128k 比例）
- 四格权衡指标：tokens 节省率 / 信息保留率 / 实现复杂度 / 末轮成本
- 每轮增长条形图（按策略实时更新）

### 节 4 · 实验室

**案例名称**：Context 爆炸

**可编辑参数**：
- `strategy = "none"` （试试 sliding_window / summarize / hybrid）
- `window_size = 4`
- `trigger_at = 0.65`
- `total_turns = 16`

**模拟逻辑**：
- 按策略计算每轮实际 context 大小
- 显示压缩触发轮次（绿色高亮行）
- 超过 128k 时显示截断错误行
- 输出权衡指标（节省率 / 保留率）

### 节 5 · 练习

**题目 1**（策略选择）：
> 用户在第 1 轮说「我是素食主义者」，Agent 执行 20 轮后还在推荐菜品。滑动窗口（size=5）的 Agent 有什么问题？

答案：第 1 轮已被丢弃，Agent「忘记」了用户是素食主义者。

**题目 2**（摘要代价）：
> 摘要压缩相比滑动窗口的核心优势是什么？

答案：保留早期历史的语义信息，而非直接丢弃。代价是额外一次 LLM 调用和摘要质量不可控。

**题目 3**（策略适用）：
> 什么情况下「无压缩」是合理的选择？

答案：短任务、轮次少（<10 轮）、context 不会触顶的场景。

---

## 第 3 课 · Memory 系统

**核心问题**：context window 只是临时工作区，如何设计三层记忆让 Agent 真正「记得」？

### 节 1 · 概念

**开场对比**：
- 「你刚才说的话」→ Short-term（当前 context）
- 「你上次来说你是素食」→ Long-term（跨会话数据库）
- 「查一下公司产品文档」→ External（向量数据库检索）

**核心观点**：三层记忆不是可选功能，而是不同时间跨度信息管理的必要架构。混用会导致信息丢失（该持久化的没持久化）或资源浪费（不该全量注入的全塞进 context）。

### 节 2 · 图解

**SVG 图解**：三层嵌套容器架构
- 最外层：Agent 实例
- 中层：Context Window（Short-term）
- 外部连接：Long-term DB 和 External Vector DB

**5 步骤内容**：

1. **Short-term memory**：Context window 就是短期记忆，会话结束自动清除。所有工具调用中间结果、当前对话历史都在这里。

2. **Long-term memory 的读取**：会话开始时，Agent 应主动从 Long-term 读取用户偏好、历史任务摘要，注入 system prompt。这步需要显式设计，不会自动发生。

3. **External memory 检索**：当 Agent 需要外部知识时，将问题 embed 为向量，在知识库中检索语义相似片段（top-k），注入当前 context。这是 RAG 的核心机制。

4. **三层协同**：完整 Agent 同时使用三层。边界清晰是关键——不要把应该写 Long-term 的信息只留在 Short-term 里。

5. **写入时机**：会话结束前，Agent 需要判断哪些信息值得长期保存并显式写入 Long-term。这个写入决策本身也是 LLM 的职责。

### 节 3 · 沙盒

**读写场景模拟器**（5 个场景按钮）：
- 新对话开始
- 用户说了新偏好
- Agent 查询知识库
- 跨会话续接任务
- 会话结束清理

每个场景：逐条动画播放读写事件流（写入=橙色，读取=绿色，过期=灰色）

**三层对比指标**：
- 生命周期 / 读写方式 / 容量上限 / 检索方式 / 跨会话支持

### 节 4 · 实验室

**案例名称**：Memory 误用

**可编辑参数**：
- `user_prefs_store = "short_term"`（试试 long_term / external）
- `task_state_store = "short_term"`
- `knowledge_base = "inject_all"`（试试 rag_retrieval）
- `persist_on_end = False`（改成 True）

**模拟逻辑**：
- 根据每个参数显示正确/错误的行为轨迹
- 输出「架构评分」（0-4 分）
- 高亮最关键的错误项

### 节 5 · 练习

**题目 1**（跨会话记忆）：
> 用户上周告诉 Agent「我喜欢简洁的回答」。这周新开会话，Agent 应该怎么知道这个偏好？

答案：Long-term memory，会话开始时从数据库读取注入。

**题目 2**（大文档检索）：
> Agent 需要回答关于 500 页公司文档的问题。应该用哪一层 Memory？

答案：External memory（向量数据库），按需检索相关片段 top-k。

**题目 3**（中间状态）：
> Agent 在执行 10 步工具调用链时，中间步骤的结果存在哪里？

答案：Short-term memory（context window 内），无需持久化。

---

## 第 4 课 · Tool Use / Function Calling

**核心问题**：Tool 是 Agent 触达真实世界的唯一方式，如何设计健壮的工具调用？

### 节 1 · 概念

**核心框架**：Tool = 接口声明 + 执行层 + 结果封装

- LLM 只生成 tool_call（JSON），从不直接执行
- 执行层负责调用、超时、错误处理
- 结果（包括错误）封装为 tool_result 返回给 LLM

**两种调用模式对比**：

| 串行调用 | 并行调用 |
|---------|---------|
| A 完成 → B 开始 | A、B 同时发起 |
| 总时长 = 各步之和 | 总时长 = 最慢步骤 |
| 适合有依赖关系的工具 | 适合独立工具（如同时搜索多个来源）|

### 节 2 · 图解

**时序图**（SVG 序列图格式）：
- 参与者：用户 / Agent / Tool executor / 外部 API
- 展示完整的一次 tool_call 生命周期
- 包含错误处理分支（超时/失败 → tool_result 返回错误 → LLM 决策重试或降级）

**5 步骤内容**：

1. **Tool Schema 定义**：LLM 通过 JSON Schema 了解可用工具。Schema 质量直接决定 LLM 能否正确调用。

2. **LLM 生成 tool_call**：LLM 输出 `{ "name": "search", "arguments": { "query": "..." } }`，这是一个 JSON 对象，不是可执行代码。

3. **执行层处理**：执行层接收 tool_call，执行真实操作，设置超时，捕获所有异常。

4. **tool_result 封装**：无论成功或失败，都封装为标准格式返回给 LLM。错误信息本身就是有价值的观测值。

5. **并行调用**：LLM 可以在一次输出中生成多个 tool_call，执行层并行执行，所有结果返回后下一轮 loop 才开始。

### 节 3 · 沙盒

**可调参数**：
- 工具数量（1-6）
- 串行 vs 并行模式
- 工具平均延迟（ms）
- 超时阈值（ms）
- 失败重试次数（0-3）

**可视化**：
- 时间轴甘特图（展示串行 vs 并行的实际耗时对比）
- 成功率热力图（按失败率和重试次数）
- 总延迟计算

### 节 4 · 实验室

**案例名称**：工具超时处理

**可编辑参数**：
- `timeout_ms = 5000`
- `retry_count = 0`（试试 1-3）
- `fallback_on_error = False`
- `parallel = False`

### 节 5 · 练习

**题目 1**（错误处理）：
> LLM 生成了 tool_call，但工具执行超时。Agent 应该怎么做？

答案：将超时错误作为 tool_result 返回给 LLM，让其决策重试或降级。

**题目 2**（并行调用）：
> 需要同时搜索 3 个不同数据源，各耗时 1 秒。串行 vs 并行各需多久？

答案：串行 3 秒，并行约 1 秒。独立工具应优先并行化。

**题目 3**（Schema 设计）：
> 一个工具 Schema 的 description 字段写得很模糊。会有什么后果？

答案：LLM 可能错误判断何时调用该工具，或传入错误的参数格式，导致调用失败或结果不符预期。

---

## 第 5 课 · Planning & ReAct

**核心问题**：如何让 Agent 在行动前先思考，处理需要多步规划的复杂任务？

### 节 1 · 概念

**ReAct = Reasoning + Acting**

传统 Agent loop：`Observation → Action`（直接行动，容易出错）

ReAct loop：`Observation → Thought → Action → Observation → Thought → ...`

**Thought 的作用**：
- 强制 LLM 显式写出推理过程
- 提升可解释性（知道 Agent 为什么这么做）
- 减少直接行动的错误率（先想再做）
- 支持回溯（发现推理错误时可以纠正）

**Planning 与 ReAct 的关系**：
- ReAct 是执行层的思维链
- Planning 是任务层的分解策略（把复杂任务拆成子任务）
- 两者通常结合使用

### 节 2 · 图解

**SVG 图解**：展开的 ReAct 循环，与普通 loop 并排对比

展示结构：
```
Observation
    ↓
[Thought] ← 新增步骤，灰色标注「推理空间」
    ↓
Action
    ↓
Observation
    ↓
[Thought]
    ↓
Action（终止）
```

**5 步骤内容**：

1. **Thought 步骤的本质**：LLM 在输出 Action 之前，先输出一段自然语言推理。这段文字不会被执行，只是推理过程的显式化。

2. **Thought 的格式**：通常包含：当前理解任务状态、评估可用工具、计划下一步行动、预判潜在问题。

3. **ReAct 如何减少错误**：对比两个例子——无 Thought 时直接调用错误工具；有 Thought 时先分析再调用正确工具。

4. **Planning：任务分解**：复杂任务（如「帮我准备一份竞品分析报告」）需要先拆解成子任务列表，再逐一执行 ReAct 循环。

5. **什么时候 ReAct 不适用**：简单单步任务（查天气、转换单位）不需要 Thought 步骤，会增加不必要的 token 消耗。

### 节 3 · 沙盒

**可调参数**：
- ReAct 开/关（对比模式）
- 任务复杂度（1-5 步任务）
- Thought 详细程度（简洁/标准/详细）
- 最大规划深度

**可视化**：
- 思维链展开动画（逐步显示 Thought → Action → Observation）
- 有/无 ReAct 的错误率对比条形图（基于模拟数据）
- token 消耗对比（Thought 带来的额外消耗）

### 节 4 · 实验室

**案例名称**：ReAct 思维链

**可编辑参数**：
- `enable_thought = False`（改成 True 对比）
- `thought_format = "brief"`（试试 detailed）
- `max_plan_steps = 3`
- `task_complexity = 2`

### 节 5 · 练习

**题目 1**（Thought 作用）：
> ReAct 框架中，Thought 步骤的主要作用是什么？

答案：让 LLM 显式推理当前状态并规划下一步，提升可解释性和准确性。不是压缩 context，也不是直接生成答案。

**题目 2**（适用场景）：
> 下列哪个任务最适合使用 ReAct？

选项：查询当前时间 / 翻译一段文字 / **分析竞品并生成策略建议** / 计算 2+2

答案：分析竞品并生成策略建议（多步骤、需要规划的复杂任务）。

**题目 3**（Planning vs ReAct）：
> Planning 和 ReAct 的区别是什么？

答案：Planning 是任务层的分解（把大任务拆成子任务），ReAct 是执行层的思维链（每步行动前先推理）。两者通常结合使用。

---

## 第 6 课 · Multi-Agent 协作

**核心问题**：当单个 Agent 的 context 和能力不够用时，如何设计多 Agent 系统？

### 节 1 · 概念

**为什么需要 Multi-Agent**：
- 单个 context 窗口有上限（长任务撑不住）
- 专业化分工比全能更高效
- 并行执行提升速度
- 故障隔离（一个 Subagent 失败不影响整体）

**角色分工**：

| 角色 | 职责 | 不做什么 |
|------|------|---------|
| Orchestrator | 任务分解、分派、聚合结果 | 不直接执行工具 |
| Subagent | 执行具体子任务 | 不了解全局计划 |
| Specialist | 特定领域能力（代码/搜索/写作）| 只处理本领域 |

**通信模式**：
- Orchestrator → Subagent：任务描述 + 所需工具 + 期望输出格式
- Subagent → Orchestrator：执行结果 + 状态码 + 可选的中间日志

### 节 2 · 图解

**泳道图**（SVG 格式）：
- 泳道 1：用户
- 泳道 2：Orchestrator Agent
- 泳道 3：Subagent A（代码执行）
- 泳道 4：Subagent B（网络搜索）

展示一次并行子任务的完整流程，包含：任务分发 / 并行执行 / 结果聚合 / 最终输出。

**5 步骤内容**：

1. **任务分解**：Orchestrator 接收用户请求，将其分解为可并行/串行的子任务列表。分解质量决定整体效率。

2. **子任务分派**：Orchestrator 向各 Subagent 发送任务（通常通过工具调用形式）。每个 Subagent 有自己独立的 context。

3. **并行执行**：多个 Subagent 同时执行，各自维护独立的 Loop。Orchestrator 等待所有结果（或超时）。

4. **结果聚合**：Orchestrator 收集所有 Subagent 的输出，在自己的 context 中综合分析，生成最终回答。

5. **故障处理**：某个 Subagent 失败时，Orchestrator 可以重试、换备用 Subagent，或降级处理（部分结果也能给用户一个答案）。

### 节 3 · 沙盒

**可调参数**：
- Agent 数量（1-4）
- 协作模式（串行 / 并行 / 混合）
- 子任务平均时长
- 失败率模拟
- Context 共享策略（完全隔离 / 共享摘要）

**可视化**：
- 多 Agent 甘特图（时间轴上的并行执行）
- Context 消耗对比（单 Agent vs Multi-Agent）
- 总延迟和 token 消耗权衡图

### 节 4 · 实验室

**案例名称**：Orchestrator 协调

**可编辑参数**：
- `orchestrator_model = "sonnet"`
- `subagent_count = 2`
- `execution_mode = "sequential"`（试试 parallel）
- `share_context = False`

### 节 5 · 练习

**题目 1**（角色边界）：
> Orchestrator Agent 的核心职责是什么？

答案：分解任务、分配给 Subagent、聚合结果——自身不执行具体操作。

**题目 2**（何时使用）：
> 下列哪种场景最适合 Multi-Agent？

选项：回答「2+2=？」/ 写一首诗 / **同时分析 5 份竞品的官网、定价和评论** / 翻译一段文字

答案：同时分析 5 份竞品（需要并行处理 + 超过单 context 容量）。

**题目 3**（通信设计）：
> Subagent 应该知道整体任务的完整上下文吗？

答案：通常不需要，也不建议。每个 Subagent 只接收完成子任务所需的最小信息，减少 context 消耗，同时提高安全隔离性。

---

## 第 7 课 · RAG 检索增强

**核心问题**：如何给 Agent 注入实时的、大规模的外部知识，同时控制 context 消耗？

### 节 1 · 概念

**RAG 解决的两个问题**：
- LLM 知识截止日期（不知道最新信息）
- 私有知识库（公司内部文档 LLM 没见过）

**核心流程**：

```
用户提问
    ↓
问题 → Embedding 模型 → 查询向量
    ↓
向量数据库相似度检索 → top-k 文档片段
    ↓
文档片段注入 context → LLM 生成回答
```

**最关键的超参数**：Chunk size（文档分块大小）

| Chunk 太大 | Chunk 太小 |
|-----------|-----------|
| 检索相关性差 | 上下文不完整 |
| 噪声多 | 语义被截断 |
| 占用更多 context | 需要更多 top-k |

通常平衡点：512-1024 tokens，具体取决于文档类型。

### 节 2 · 图解

**流程图**（SVG 格式）：完整 RAG 管道，两个阶段：

**阶段 1 - 索引（离线）**：
```
文档 → 分块（Chunking）→ Embedding → 向量数据库存储
```

**阶段 2 - 检索（在线）**：
```
查询 → Embedding → 向量检索 → Reranking → 注入 context → LLM 生成
```

**5 步骤内容**：

1. **文档分块**：将大文档切割成 Chunk。分块策略（固定大小 / 语义分块 / 段落分块）直接影响检索质量。

2. **向量化存储**：每个 Chunk 经过 Embedding 模型转为高维向量，存入向量数据库。相似语义的文本向量距离近。

3. **查询向量化**：用户问题同样经过相同的 Embedding 模型转为查询向量。Embedding 模型必须和索引时一致。

4. **相似度检索**：在向量空间中找距离最近的 top-k 个 Chunk（通常 cosine similarity）。top-k 是关键参数，过少丢信息，过多加噪声。

5. **注入生成**：检索到的 Chunk 注入 LLM context，LLM 基于这些片段生成回答，同时给出引用来源。

### 节 3 · 沙盒

**可调参数**：
- Chunk size（128-2048 tokens）
- top-k 检索数量（1-10）
- 相似度阈值（0.5-0.95）
- 文档库大小（100-10000 chunks）
- Reranking 开/关

**可视化**：
- Chunk size vs 检索质量（模拟曲线，倒 U 形）
- top-k vs context 占用（线性增长）
- 召回率 / 精确率权衡图

### 节 4 · 实验室

**案例名称**：RAG 配置优化

**可编辑参数**：
- `chunk_size = 1024`
- `top_k = 5`（试试 1 / 10）
- `similarity_threshold = 0.75`
- `enable_reranking = False`

### 节 5 · 练习

**题目 1**（Chunk size）：
> Chunk size 对 RAG 效果的影响是什么？

答案：需要权衡——太大噪声多、相关性低；太小上下文不完整，通常 512-1024 tokens 是平衡点。

**题目 2**（RAG vs 全量注入）：
> 为什么不直接把整个知识库塞进 context，而要用 RAG？

答案：知识库通常远超 context 窗口上限（几百页 vs 128k tokens）。RAG 只注入相关片段，节省 context，同时降低噪声干扰。

**题目 3**（Embedding 一致性）：
> 索引时用 text-embedding-3-large，查询时换用 text-embedding-ada-002，会有什么问题？

答案：不同 Embedding 模型的向量空间不同，向量之间的距离失去意义，检索结果完全错误。索引和查询必须使用完全相同的 Embedding 模型。

---

## 十一、AI 接入点规格

### 接入点 1 · 对话导师

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

// 调用时机：用户在任意节点主动提问
// 输入：{ messages, moduleCtx: { moduleId, stepIndex, sandboxVals } }
// 输出：流式文本
// 模型：claude-sonnet-4-5
// 前端：useChat hook

const result = await streamText({
  model: anthropic('claude-sonnet-4-5'),
  system: buildModuleContext(TUTOR_PROMPT, moduleCtx),
  messages,
  maxTokens: 800,
})
return result.toDataStreamResponse()
```

**System Prompt 模板**：
```
你是一个 Agent 设计学习平台的导师。
用户正在学习「{{moduleName}}」模块（第 {{stepIndex}} 步）。

当前沙盒参数：
{{sandboxVals}}

回答规则：
- 聚焦当前模块概念，不扩散到无关主题
- 技术解释配合具体数字
- 回答控制在 150 字以内，追问再展开
- 中文回答
```

### 接入点 2 · 答案评估

```typescript
// app/api/evaluate/route.ts
import { generateObject } from 'ai'
import { z } from 'zod'

// 调用时机：用户提交开放题答案
// 输入：{ question, answer, moduleId }
// 输出：结构化评估对象
// 模型：claude-haiku-4-5（成本优化）

const EvalSchema = z.object({
  score:     z.number().min(0).max(10),
  level:     z.enum(['correct', 'partial', 'incorrect']),
  feedback:  z.string(),   // 具体反馈
  hint:      z.string(),   // 正确方向提示
  keyPoints: z.array(z.string()), // 答案中正确的点
})
```

### 接入点 3 · 代码解释

```typescript
// app/api/explain/route.ts
// 调用时机：代码实验室运行后，用户点击「AI 解释」
// 输入：{ caseId, defaultVals, currentVals, traceEvents }
// 输出：流式解释文本
// 模型：claude-sonnet-4-5

// buildDiff 函数：提取参数变化 diff
// { max_turns: { from: 8, to: 15 }, check_stop: { from: true, to: false } }
```

### 接入点 4 · 沙盒顾问

```typescript
// app/api/advise/route.ts
// 调用时机：用户点击「生产建议」按钮
// 输入：{ moduleId, config, metrics }
// 输出：结构化建议对象
// 模型：claude-haiku-4-5

const AdviceSchema = z.object({
  riskLevel:   z.enum(['low', 'medium', 'high']),
  summary:     z.string(),
  issues:      z.array(z.object({
    field:    z.string(),
    reason:   z.string(),
    severity: z.enum(['warn', 'error']),
  })),
  recommended: z.record(z.union([z.string(), z.number(), z.boolean()])),
})
```

---

## 十二、组件系统规格

### 页面级组件

| 组件 | 路径 | 说明 |
|------|------|------|
| `LessonShell` | `components/lesson/LessonShell.tsx` | 顶栏导航 + 5节管理 + 进度 |
| `LessonNav` | `components/lesson/LessonNav.tsx` | 顶部导航条，5个步骤点 |
| `LessonFooter` | `components/lesson/LessonFooter.tsx` | 底部上/下一节按钮 |

### 内容组件

| 组件 | 路径 | 说明 |
|------|------|------|
| `ConceptSection` | `components/lesson/ConceptSection.tsx` | 节 1 概念，含类比卡片 |
| `DiagramSection` | `components/lesson/DiagramSection.tsx` | 节 2 图解，含 SVG + 步进控制 |
| `SandboxSection` | `components/lesson/SandboxSection.tsx` | 节 3 沙盒，含滑块 + 可视化 |
| `LabSection` | `components/lesson/LabSection.tsx` | 节 4 实验室，含代码编辑器 |
| `QuizSection` | `components/lesson/QuizSection.tsx` | 节 5 练习，含题目 + 完成态 |

### AI 集成组件

| 组件 | 路径 | 接入点 |
|------|------|--------|
| `TutorChat` | `components/ai/TutorChat.tsx` | 接入点 1 |
| `AnswerEvaluator` | `components/ai/AnswerEvaluator.tsx` | 接入点 2 |
| `CodeExplainer` | `components/ai/CodeExplainer.tsx` | 接入点 3 |
| `SandboxAdvisor` | `components/ai/SandboxAdvisor.tsx` | 接入点 4 |
| `AIStatusBar` | `components/ai/AIStatusBar.tsx` | 共用状态条 |

### 工具函数

| 函数 | 路径 | 说明 |
|------|------|------|
| `buildModuleContext` | `lib/ai-context.ts` | 构建 AI 调用上下文 |
| `buildDiff` | `lib/ai-context.ts` | 计算参数变化 diff |
| `calcLoopMetrics` | `lib/sandbox/loop.ts` | Loop 沙盒计算 |
| `calcContextMetrics` | `lib/sandbox/context.ts` | Context 沙盒计算 |
| `simulateTrace` | `lib/simulator.ts` | 执行轨迹模拟 |

---

## 十三、进度与数据持久化

### 本地存储 Schema

```typescript
// localStorage key: 'agent-course-progress'
interface CourseProgress {
  version: '1.0'
  completedSections: Record<string, Set<number>>
  // moduleId → 已完成的节号集合
  // e.g. { 'loop': [0,1,2], 'context': [0] }

  quizResults: Record<string, boolean[]>
  // moduleId → 每题是否答对
  // e.g. { 'loop': [true, true, false] }

  unlockedModules: string[]
  // 已解锁的模块 id 列表
  // e.g. ['loop', 'context', 'tools']

  sandboxPresets: Record<string, Record<string, unknown>>
  // 用户保存的沙盒参数预设
  // e.g. { 'loop': { max_turns: 15, sys: 600 } }

  lastVisited: Record<string, number>
  // moduleId → 上次访问时间戳
}
```

### 解锁逻辑

```typescript
function checkUnlock(moduleId: string, progress: CourseProgress): boolean {
  const prereqs: Record<string, string[]> = {
    'loop':    [],
    'context': ['loop'],
    'memory':  ['loop', 'context'],
    'tools':   ['loop'],
    'react':   ['loop', 'context'],
    'multi':   ['loop', 'context', 'memory', 'tools'],
    'rag':     ['loop', 'context', 'memory'],
  }

  return prereqs[moduleId].every(dep =>
    progress.quizResults[dep]?.every(Boolean) ?? false
  )
}
```

### 完成判定

- **节完成**：访问过该节（不要求做完所有交互）
- **模块完成**：判断题 3 道全部答对
- **课程完成**：7 个模块全部完成

---

## 附录 A · 环境变量

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...          # 必填
AI_TUTOR_MODEL=claude-sonnet-4-5      # 可选，默认 sonnet
AI_EVAL_MODEL=claude-haiku-4-5        # 可选，默认 haiku
AI_RATE_LIMIT=20                      # 每用户每分钟请求数
```

## 附录 B · 安装依赖

```bash
# AI SDK
pnpm add ai @ai-sdk/anthropic

# 结构化输出
pnpm add zod

# 字体（已在 CSS 中通过 Google Fonts 引入）
# DM Sans + DM Mono
```

## 附录 C · 色彩系统

```css
:root {
  /* 主色 */
  --ink:    #0f0f0d;   /* 主文字 */
  --ink2:   #4a4a44;   /* 次级文字 */
  --ink3:   #8a8a82;   /* 辅助文字 */
  --paper:  #faf9f6;   /* 页面背景 */
  --surface:#f2f0eb;   /* 卡片背景 */
  --border: rgba(15,15,13,.10);

  /* 语义色 */
  --accent:      #2a52d4;  /* 信息/强调（蓝）*/
  --accent-bg:   #eef1fd;
  --loop:        #1a9e72;  /* 成功/正向（绿）*/
  --loop-bg:     #e3f5ee;
  --warn:        #c45c1a;  /* 警告（橙）*/
  --warn-bg:     #fdeee3;
  --good:        #2e7d32;  /* 正确（深绿）*/
  --good-bg:     #edf5e8;
}
```

---

*文档版本 1.0 · 如需补充某课的详细设计，在对应章节后追加即可*