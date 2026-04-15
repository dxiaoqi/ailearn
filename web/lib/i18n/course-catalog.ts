import type { Locale } from "./locale"

type Accent = {
  accentColor: string
  accentBg: string
  accentBorder: string
}

export type HomeCourse = Accent & {
  slug: string
  firstLesson: string
  available: boolean
  title: string
  subtitle: string
  description: string
  tags: string[]
  stats: { value: string; label: string }[]
}

const accentPrompt: Accent = {
  accentColor: "var(--color-accent)",
  accentBg: "var(--color-accent-light)",
  accentBorder: "var(--color-border-warning)",
}

const accentAgent: Accent = {
  accentColor: "var(--color-text-info)",
  accentBg: "var(--color-background-info)",
  accentBorder: "var(--color-border-info)",
}

const accentFinance: Accent = {
  accentColor: "var(--color-text-warning)",
  accentBg: "var(--color-background-warning)",
  accentBorder: "var(--color-border-warning)",
}

export function getHomeCourses(locale: Locale): HomeCourse[] {
  if (locale === "en") {
    return [
      {
        ...accentPrompt,
        slug: "prompt-engineering",
        title: "Claude Prompt Engineering",
        subtitle: "From basics to agents",
        description:
          "Anthropic’s core prompt engineering ideas turned into a practical, chapter-by-chapter track—from the five-part framework to agent design. Each chapter is self-contained and actionable.",
        tags: ["Anthropic playbook", "10 chapters", "20 drills"],
        stats: [
          { value: "10", label: "Chapters" },
          { value: "29", label: "Concept cards" },
          { value: "20", label: "Exercises" },
          { value: "~7h", label: "Duration" },
        ],
        firstLesson: "/lesson/module-1/01-prompt-structure",
        available: true,
      },
      {
        ...accentAgent,
        slug: "agent-engineering",
        title: "Agent engineering",
        subtitle: "From the Agent loop to multi-agent collaboration",
        description:
          "A structured path for designing and building AI agents—from loop architecture to memory, tools, multi-agent workflows, and RAG. Each lesson includes sandboxes and real code experiments.",
        tags: ["Full track", "7 lessons", "Runnable sandboxes"],
        stats: [
          { value: "7", label: "Lessons" },
          { value: "21", label: "Quiz items" },
          { value: "7", label: "Code labs" },
          { value: "~3.5h", label: "Duration" },
        ],
        firstLesson: "/lesson/module-2/01-agent-loop",
        available: true,
      },
      {
        ...accentFinance,
        slug: "finance-macro-agent",
        title: "Macro analysis agent in practice",
        subtitle: "From flowcharts to a refreshable AP News web app",
        description:
          "A five-lesson finance sprint: node types and prompts, context design, Trae vibe coding for fetch + Claude, then a small Flask UI—bilingual lessons with the same artifacts as the live cohort.",
        tags: ["Finance", "5 lessons", "Trae + Claude"],
        stats: [
          { value: "5", label: "Lessons" },
          { value: "15+", label: "In-class blocks" },
          { value: "6", label: "Deliverables" },
          { value: "~8h", label: "Duration" },
        ],
        firstLesson: "/lesson/module-3/01-agent-intro",
        available: true,
      },
    ]
  }

  return [
    {
      ...accentPrompt,
      slug: "prompt-engineering",
      title: "Claude Prompt Engineering",
      subtitle: "从入门到智能体",
      description:
        "把 Anthropic 官方 Prompt Engineering 核心方法论，转化为可立即落地的实战教程。从五要素框架到智能体设计，每章独立完整，学完即能用。",
      tags: ["Anthropic 官方方法论", "10 章", "20 个练习"],
      stats: [
        { value: "10", label: "章节" },
        { value: "29", label: "知识卡片" },
        { value: "20", label: "练习" },
        { value: "~7h", label: "时长" },
      ],
      firstLesson: "/lesson/module-1/01-prompt-structure",
      available: true,
    },
    {
      ...accentAgent,
      slug: "agent-engineering",
      title: "Agent 工程",
      subtitle: "从 Agent Loop 到 Multi-Agent 协作",
      description:
        "系统化掌握 AI Agent 的设计与工程实践。从循环架构到记忆系统、工具调用、多 Agent 协作和 RAG 检索增强，每课配备交互沙盒和真实代码实验。",
      tags: ["完整体系", "7 课", "真实代码沙盒"],
      stats: [
        { value: "7", label: "课程" },
        { value: "21", label: "测验题" },
        { value: "7", label: "代码实验" },
        { value: "~3.5h", label: "时长" },
      ],
      firstLesson: "/lesson/module-2/01-agent-loop",
      available: true,
    },
    {
      ...accentFinance,
      slug: "finance-macro-agent",
      title: "金融宏观分析 Agent 实战",
      subtitle: "从流程图到可刷新的 AP News 网页产品",
      description:
        "五课金融向实战：节点与 Prompt、Context 与 Trae 目录、Vibe Coding 跑通抓取与 Claude摘要，最后用 Flask 做成可交互网页；中英文讲义与陪跑材料同源。",
      tags: ["金融向", "5 课", "Trae + Claude"],
      stats: [
        { value: "5", label: "课程" },
        { value: "15+", label: "课堂环节" },
        { value: "6", label: "产物节点" },
        { value: "~8h", label: "时长" },
      ],
      firstLesson: "/lesson/module-3/01-agent-intro",
      available: true,
    },
  ]
}

export type ComingSoonItem = { title: string; subtitle: string; description: string }

export function getComingSoon(locale: Locale): ComingSoonItem[] {
  if (locale === "en") {
    return [
      {
        title: "AI product design",
        subtitle: "From requirements to production prompts",
        description:
          "Product-minded methods for shipping AI features—from user needs to system prompts.",
      },
      {
        title: "Full-stack AI applications",
        subtitle: "From prototype to production",
        description:
          "Build production AI apps with the AI SDK and Next.js—streaming, tool calls, and operations.",
      },
    ]
  }
  return [
    {
      title: "AI 产品设计",
      subtitle: "从需求到提示词的完整链路",
      description: "产品经理视角的 AI 功能设计方法论，从用户需求到系统提示词。",
    },
    {
      title: "AI 应用全栈开发",
      subtitle: "从原型到上线的工程实践",
      description: "用 AI SDK + Next.js 构建生产级 AI 应用，涵盖流式输出、工具调用、部署运维。",
    },
  ]
}

export type AgentLayerZh = "入门" | "初级" | "中级"
export type AgentLayerEn = "Beginner" | "Intermediate" | "Advanced"

type AgentChapterDef = {
  num: string
  slug: string
  duration: { zh: string; en: string }
  layer: { zh: AgentLayerZh; en: AgentLayerEn }
  title: { zh: string; en: string }
  subtitle: { zh: string; en: string }
  outcomes: { zh: string[]; en: string[] }
  prereqs?: { zh: string; en: string }
}

const agentChapters: AgentChapterDef[] = [
  {
    num: "01",
    slug: "module-2/01-agent-loop",
    title: {
      zh: "Agent Loop",
      en: "Agent Loop",
    },
    subtitle: {
      zh: "什么驱动 Agent 持续运行？",
      en: "What keeps an Agent running?",
    },
    layer: { zh: "入门", en: "Beginner" },
    duration: { zh: "20 分钟", en: "20 min" },
    outcomes: {
      zh: [
        "理解 Loop 的四个阶段（观测/推理/行动/终止）",
        "计算任意轮次的 context 大小",
        "设计合理的终止条件",
      ],
      en: [
        "Explain the four stages (observe → reason → act → stop)",
        "Estimate context size for any turn",
        "Design sound stopping conditions",
      ],
    },
  },
  {
    num: "02",
    slug: "module-2/02-context-compression",
    title: {
      zh: "Context 管理与压缩",
      en: "Context management & compression",
    },
    subtitle: {
      zh: "context 为什么会爆，怎么救？",
      en: "Why contexts explode—and how to fix them",
    },
    layer: { zh: "初级", en: "Intermediate" },
    duration: { zh: "25 分钟", en: "25 min" },
    outcomes: {
      zh: [
        "说清四种压缩策略的核心机制",
        "根据任务特征选择合适的策略",
        "理解冷热分层等生产级方案",
      ],
      en: [
        "Describe four compression strategies and when they apply",
        "Pick a strategy for a given task shape",
        "Understand tiered hot/cold memory in production",
      ],
    },
    prereqs: { zh: "课 1", en: "Lesson 1" },
  },
  {
    num: "03",
    slug: "module-2/03-memory-system",
    title: { zh: "Memory 系统", en: "Memory systems" },
    subtitle: { zh: "三层记忆各管什么？", en: "What each memory layer does" },
    layer: { zh: "初级", en: "Intermediate" },
    duration: { zh: "30 分钟", en: "30 min" },
    outcomes: {
      zh: [
        "判断信息应该存在哪层（Short/Long/External）",
        "设计会话开始的读取和结束的写入",
        "避免常见的 Memory 误用",
      ],
      en: [
        "Place facts in short-, long-, or external memory",
        "Design read/write patterns per session",
        "Avoid common memory pitfalls",
      ],
    },
    prereqs: { zh: "课 1+2", en: "Lessons 1–2" },
  },
  {
    num: "04",
    slug: "module-2/04-tool-use",
    title: { zh: "Tool Use / Function Calling", en: "Tool use / function calling" },
    subtitle: {
      zh: "Agent 怎么触达真实世界？",
      en: "How agents touch the real world",
    },
    layer: { zh: "初级", en: "Intermediate" },
    duration: { zh: "25 分钟", en: "25 min" },
    outcomes: {
      zh: [
        "说清 tool_call 的完整生命周期",
        "设计健壮的超时、重试和降级策略",
        "判断串行 vs 并行的适用场景",
      ],
      en: [
        "Walk through the full tool-call lifecycle",
        "Design timeouts, retries, and graceful fallback",
        "Choose serial vs parallel tool use",
      ],
    },
    prereqs: { zh: "课 1", en: "Lesson 1" },
  },
  {
    num: "05",
    slug: "module-2/05-planning-react",
    title: { zh: "Planning & ReAct", en: "Planning & ReAct" },
    subtitle: { zh: "怎么让 Agent 先想再做？", en: "Plan before you act" },
    layer: { zh: "中级", en: "Advanced" },
    duration: { zh: "35 分钟", en: "35 min" },
    outcomes: {
      zh: [
        "理解 ReAct 的 Thought 步骤如何减少错误",
        "判断什么任务需要 ReAct",
        "用 Planning 将复杂任务分解为子任务",
      ],
      en: [
        "See how ReAct “thought” steps reduce errors",
        "Know when ReAct is worth the cost",
        "Break complex work into planned subtasks",
      ],
    },
    prereqs: { zh: "课 1+2", en: "Lessons 1–2" },
  },
  {
    num: "06",
    slug: "module-2/06-multi-agent",
    title: { zh: "Multi-Agent 协作", en: "Multi-agent collaboration" },
    subtitle: {
      zh: "一个 Agent 不够用时怎么办？",
      en: "When one agent is not enough",
    },
    layer: { zh: "中级", en: "Advanced" },
    duration: { zh: "40 分钟", en: "40 min" },
    outcomes: {
      zh: [
        "说清 Orchestrator / Subagent 角色边界",
        "设计并行子任务的协作流程",
        "实现故障处理策略（重试/降级）",
      ],
      en: [
        "Separate orchestrator vs sub-agent duties",
        "Coordinate parallel child agents",
        "Handle failures with retry and downgrade",
      ],
    },
    prereqs: { zh: "课 1-4", en: "Lessons 1–4" },
  },
  {
    num: "07",
    slug: "module-2/07-rag",
    title: { zh: "RAG 检索增强", en: "RAG retrieval augmentation" },
    subtitle: {
      zh: "怎么给 Agent 注入外部知识？",
      en: "Ground agents with external knowledge",
    },
    layer: { zh: "初级", en: "Intermediate" },
    duration: { zh: "30 分钟", en: "30 min" },
    outcomes: {
      zh: [
        "画出 RAG 的两阶段管道",
        "理解 Chunk size 和 top-k 的权衡",
        "知道 Embedding 模型一致性的重要性",
      ],
      en: [
        "Sketch the two-stage RAG pipeline",
        "Reason about chunk size and top-k trade-offs",
        "Keep embedding models consistent across stages",
      ],
    },
    prereqs: { zh: "课 1+3", en: "Lessons 1 & 3" },
  },
]

export type AgentChapter = {
  num: string
  slug: string
  title: string
  subtitle: string
  layer: AgentLayerZh | AgentLayerEn
  duration: string
  outcomes: string[]
  prereqs?: string
}

const agentLayerStyleZh: Record<
  AgentLayerZh,
  { color: string; bg: string; border: string }
> = {
  入门: {
    color: "var(--color-text-success)",
    bg: "var(--color-background-success)",
    border: "var(--color-border-success)",
  },
  初级: {
    color: "var(--color-text-info)",
    bg: "var(--color-background-info)",
    border: "var(--color-border-info)",
  },
  中级: {
    color: "var(--color-text-warning)",
    bg: "var(--color-background-warning)",
    border: "var(--color-border-warning)",
  },
}

const agentLayerStyleEn: Record<
  AgentLayerEn,
  { color: string; bg: string; border: string }
> = {
  Beginner: {
    color: "var(--color-text-success)",
    bg: "var(--color-background-success)",
    border: "var(--color-border-success)",
  },
  Intermediate: {
    color: "var(--color-text-info)",
    bg: "var(--color-background-info)",
    border: "var(--color-border-info)",
  },
  Advanced: {
    color: "var(--color-text-warning)",
    bg: "var(--color-background-warning)",
    border: "var(--color-border-warning)",
  },
}

export function getAgentChapterStyles(locale: Locale) {
  return locale === "en" ? agentLayerStyleEn : agentLayerStyleZh
}

export function getAgentChapters(locale: Locale): AgentChapter[] {
  return agentChapters.map((ch) => ({
    num: ch.num,
    slug: ch.slug,
    title: locale === "en" ? ch.title.en : ch.title.zh,
    subtitle: locale === "en" ? ch.subtitle.en : ch.subtitle.zh,
    layer: locale === "en" ? ch.layer.en : ch.layer.zh,
    duration: locale === "en" ? ch.duration.en : ch.duration.zh,
    outcomes: locale === "en" ? ch.outcomes.en : ch.outcomes.zh,
    prereqs: ch.prereqs
      ? locale === "en"
        ? ch.prereqs.en
        : ch.prereqs.zh
      : undefined,
  }))
}

export type PromptLayerZh = "基础" | "进阶" | "综合"
export type PromptLayerEn = "Foundations" | "Going deeper" | "Capstone"

type PromptChapterDef = {
  num: string
  slug: string
  layer: { zh: PromptLayerZh; en: PromptLayerEn }
  difficulty: { zh: string; en: string }
  duration: { zh: string; en: string }
  title: { zh: string; en: string }
  subtitle: { zh: string; en: string }
  outcomes: { zh: string[]; en: string[] }
  exercises: number
}

const promptChapters: PromptChapterDef[] = [
  {
    num: "01",
    slug: "module-1/01-prompt-structure",
    title: {
      zh: "提示词基础结构",
      en: "Prompt structure fundamentals",
    },
    subtitle: {
      zh: "五要素框架 · 从随意写到有意识地设计",
      en: "Five-part framework · from ad hoc to intentional design",
    },
    layer: { zh: "基础", en: "Foundations" },
    difficulty: { zh: "入门", en: "Intro" },
    duration: { zh: "30 分钟", en: "30 min" },
    exercises: 2,
    outcomes: {
      zh: [
        "识别一个提示词缺少哪些要素",
        "将任意差的提示词改写为结构化版本",
        "在自己的工作场景中套用五要素框架",
      ],
      en: [
        "Spot missing pieces in a prompt",
        "Rewrite weak prompts into a structured template",
        "Apply the five-part frame to your own work",
      ],
    },
  },
  {
    num: "02",
    slug: "module-1/02-xml-isolation",
    title: { zh: "XML 与信息隔离", en: "XML and separation of concerns" },
    subtitle: {
      zh: "系统提示词 vs 用户提示词 · 动静态内容分离",
      en: "System vs user prompts · dynamic vs static content",
    },
    layer: { zh: "基础", en: "Foundations" },
    difficulty: { zh: "入门", en: "Intro" },
    duration: { zh: "35 分钟", en: "35 min" },
    exercises: 2,
    outcomes: {
      zh: [
        "判断哪些内容放系统提示词、哪些放用户提示词",
        "用 XML 标签将指令与数据彻底分离",
        "写出可多次复用的提示词模板（带占位符）",
      ],
      en: [
        "Decide what belongs in system vs user messages",
        "Use XML tags to separate instructions from data",
        "Author reusable templates with placeholders",
      ],
    },
  },
  {
    num: "03",
    slug: "module-1/03-step-instructions",
    title: { zh: "步骤指令与分析顺序", en: "Step-by-step instructions" },
    subtitle: {
      zh: "规定思考路径 · 把复杂任务拆解为可执行步骤",
      en: "Define reasoning order · decompose complex tasks",
    },
    layer: { zh: "基础", en: "Foundations" },
    difficulty: { zh: "入门", en: "Intro" },
    duration: { zh: "30 分钟", en: "30 min" },
    exercises: 2,
    outcomes: {
      zh: [
        "识别哪类任务需要步骤指令",
        "写出逻辑顺序合理的步骤序列",
        "用步骤指令处理多维度分析任务",
      ],
      en: [
        "Recognize when step instructions help",
        "Write coherent step sequences",
        "Apply them to multi-axis analysis tasks",
      ],
    },
  },
  {
    num: "04",
    slug: "module-1/04-fewshot",
    title: { zh: "Few-shot 示例注入", en: "Few-shot examples" },
    subtitle: {
      zh: "把人类判断力装进提示词 · 处理边缘情况的最优解",
      en: "Encode human judgment · cover edge cases",
    },
    layer: { zh: "基础", en: "Foundations" },
    difficulty: { zh: "入门→中级", en: "Intro → Intermediate" },
    duration: { zh: "40 分钟", en: "40 min" },
    exercises: 2,
    outcomes: {
      zh: [
        "判断什么时候必须用示例、什么时候不需要",
        "写出能有效传递判断逻辑的示例",
        "用 2-3 个示例覆盖任务的关键边界情况",
      ],
      en: [
        "Decide when few-shot is worth the tokens",
        "Craft examples that communicate judgment",
        "Cover key edge cases with 2–3 demonstrations",
      ],
    },
  },
  {
    num: "05",
    slug: "module-1/05-output-format",
    title: { zh: "输出格式控制", en: "Output formatting" },
    subtitle: {
      zh: "预填充 · JSON · 格式化输出 · 去掉废话开头",
      en: "Prefill · JSON · structured output · trim boilerplate",
    },
    layer: { zh: "基础", en: "Foundations" },
    difficulty: { zh: "中级", en: "Intermediate" },
    duration: { zh: "35 分钟", en: "35 min" },
    exercises: 2,
    outcomes: {
      zh: [
        "用预填充（Prefill）强制模型按格式输出",
        "让模型输出可直接解析的 JSON",
        "消除模型的废话开头，让输出直接可用",
      ],
      en: [
        "Use prefills to enforce formats",
        "Emit machine-parseable JSON",
        "Remove hedging intros for direct answers",
      ],
    },
  },
  {
    num: "06",
    slug: "module-1/06-system-prompt-production",
    title: {
      zh: "系统提示词与生产部署",
      en: "System prompts in production",
    },
    subtitle: {
      zh: "从一次性对话到稳定可复用的 AI 功能",
      en: "From one-off chats to reliable product features",
    },
    layer: { zh: "进阶", en: "Going deeper" },
    difficulty: { zh: "中级", en: "Intermediate" },
    duration: { zh: "35 分钟", en: "35 min" },
    exercises: 2,
    outcomes: {
      zh: [
        "设计生产级别的系统提示词结构",
        "区分哪些指令放系统提示词 vs 动态注入",
        "用缓存机制降低延迟和成本",
      ],
      en: [
        "Design production-grade system prompt layouts",
        "Separate static system guidance from dynamic inserts",
        "Apply caching to cut latency and cost",
      ],
    },
  },
  {
    num: "07",
    slug: "module-1/07-agent-intro",
    title: { zh: "智能体提示词入门", en: "Agent prompts 101" },
    subtitle: {
      zh: "什么是 Agent · 适合和不适合的场景 · 核心设计原则",
      en: "What agents are · fit vs misfit · core design rules",
    },
    layer: { zh: "进阶", en: "Going deeper" },
    difficulty: { zh: "中级→高级", en: "Intermediate → Advanced" },
    duration: { zh: "45 分钟", en: "45 min" },
    exercises: 2,
    outcomes: {
      zh: [
        "判断一个任务是否适合用智能体来处理",
        "理解智能体提示词与普通提示词的根本区别",
        "写出智能体系统提示词的基础框架",
      ],
      en: [
        "Decide when an agent is the right tool",
        "Contrast agent prompts with single-shot prompts",
        "Draft a baseline agent system prompt",
      ],
    },
  },
  {
    num: "08",
    slug: "module-1/08-agent-tools",
    title: { zh: "智能体工具设计", en: "Designing tools for agents" },
    subtitle: {
      zh: "工具描述 · 命名规则 · 避免功能重叠 · 参数设计",
      en: "Descriptions · naming · avoiding overlap · schemas",
    },
    layer: { zh: "进阶", en: "Going deeper" },
    difficulty: { zh: "高级", en: "Advanced" },
    duration: { zh: "40 分钟", en: "40 min" },
    exercises: 2,
    outcomes: {
      zh: [
        "写出让智能体能正确使用的工具描述",
        "识别并修复工具描述中的常见问题",
        "设计功能边界清晰、没有重叠的工具集",
      ],
      en: [
        "Write tool specs agents can follow reliably",
        "Debug common tool-description mistakes",
        "Shape non-overlapping tool surfaces",
      ],
    },
  },
  {
    num: "09",
    slug: "module-1/09-context-management",
    title: { zh: "上下文管理策略", en: "Context management" },
    subtitle: {
      zh: "压缩 · 外部记忆 · 子智能体 · 长任务保质量",
      en: "Compression · memory · sub-agents · long jobs",
    },
    layer: { zh: "进阶", en: "Going deeper" },
    difficulty: { zh: "高级", en: "Advanced" },
    duration: { zh: "40 分钟", en: "40 min" },
    exercises: 1,
    outcomes: {
      zh: [
        "判断长任务中哪种上下文管理策略最合适",
        "在提示词中内置压缩触发机制",
        "设计子智能体分工方案",
      ],
      en: [
        "Pick context tactics for long-running tasks",
        "Embed compression triggers in prompts",
        "Plan sub-agent splits",
      ],
    },
  },
]

export type PromptChapter = {
  num: string
  slug: string
  title: string
  subtitle: string
  layer: PromptLayerZh | PromptLayerEn
  difficulty: string
  duration: string
  outcomes: string[]
  exercises: number
}

const promptLayerStyleZh: Record<
  PromptLayerZh,
  { color: string; bg: string; border: string }
> = {
  基础: {
    color: "var(--color-accent)",
    bg: "var(--color-accent-light)",
    border: "var(--color-border-warning)",
  },
  进阶: {
    color: "var(--color-text-info)",
    bg: "var(--color-background-info)",
    border: "var(--color-border-info)",
  },
  综合: {
    color: "var(--color-text-success)",
    bg: "var(--color-background-success)",
    border: "var(--color-border-success)",
  },
}

const promptLayerStyleEn: Record<
  PromptLayerEn,
  { color: string; bg: string; border: string }
> = {
  Foundations: {
    color: "var(--color-accent)",
    bg: "var(--color-accent-light)",
    border: "var(--color-border-warning)",
  },
  "Going deeper": {
    color: "var(--color-text-info)",
    bg: "var(--color-background-info)",
    border: "var(--color-border-info)",
  },
  Capstone: {
    color: "var(--color-text-success)",
    bg: "var(--color-background-success)",
    border: "var(--color-border-success)",
  },
}

export function getPromptChapterStyles(locale: Locale) {
  return locale === "en" ? promptLayerStyleEn : promptLayerStyleZh
}

export function getPromptChapters(locale: Locale): PromptChapter[] {
  return promptChapters.map((ch) => ({
    num: ch.num,
    slug: ch.slug,
    title: locale === "en" ? ch.title.en : ch.title.zh,
    subtitle: locale === "en" ? ch.subtitle.en : ch.subtitle.zh,
    layer: locale === "en" ? ch.layer.en : ch.layer.zh,
    difficulty: locale === "en" ? ch.difficulty.en : ch.difficulty.zh,
    duration: locale === "en" ? ch.duration.en : ch.duration.zh,
    outcomes: locale === "en" ? ch.outcomes.en : ch.outcomes.zh,
    exercises: ch.exercises,
  }))
}

export type FinanceMacroLayerZh = "实战"
export type FinanceMacroLayerEn = "Lab"

type FinanceMacroChapterDef = {
  num: string
  slug: string
  duration: { zh: string; en: string }
  layer: { zh: FinanceMacroLayerZh; en: FinanceMacroLayerEn }
  title: { zh: string; en: string }
  subtitle: { zh: string; en: string }
  outcomes: { zh: string[]; en: string[] }
  prereqs?: { zh: string; en: string }
}

const financeMacroChapters: FinanceMacroChapterDef[] = [
  {
    num: "01",
    slug: "module-3/01-agent-intro",
    title: {
      zh: "Agent 是什么，能做什么",
      en: "What is an agent, what can it do?",
    },
    subtitle: {
      zh: "流程图 + News Agent 角色卡",
      en: "Flowchart + News Agent role card",
    },
    layer: { zh: "实战", en: "Lab" },
    duration: { zh: "约 100 分钟", en: "~100 min" },
    outcomes: {
      zh: [
        "区分 Chat 与 Agent，以及三类节点",
        "画出含失败分支的 AP News 整理流程图",
        "完成五字段角色卡（含失败时）",
      ],
      en: [
        "Contrast chat vs agents and three node types",
        "Draw an AP News digest flow with a failure branch",
        "Complete the five-field role card (incl. failure handling)",
      ],
    },
  },
  {
    num: "02",
    slug: "module-3/02-prompt-engine",
    title: { zh: "Prompt Engine：写出有效指令", en: "Prompt engine: effective instructions" },
    subtitle: {
      zh: "四层结构 · JSON · 逻辑门",
      en: "Four layers · JSON · logic gates",
    },
    layer: { zh: "实战", en: "Lab" },
    duration: { zh: "约 100 分钟", en: "~100 min" },
    outcomes: {
      zh: [
        "理解 Prompt 作为逻辑门",
        "写出完整四层 News Agent Prompt",
        "约定 JSON 输出与异常分支并完成互检",
      ],
      en: [
        "See prompts as explicit logic gates",
        "Author a full four-layer News Agent prompt",
        "Lock JSON + edge cases and peer-review",
      ],
    },
    prereqs: { zh: "课 1", en: "Lesson 1" },
  },
  {
    num: "03",
    slug: "module-3/03-context-engine",
    title: {
      zh: "Context Engine：喂对信息 + 项目目录",
      en: "Context engine: inputs + repo scaffold",
    },
    subtitle: {
      zh: "三原则 · Trae 骨架 · 依赖安装",
      en: "Three rules · Trae scaffold · deps",
    },
    layer: { zh: "实战", en: "Lab" },
    duration: { zh: "约 100 分钟", en: "~100 min" },
    outcomes: {
      zh: [
        "应用 Context 三原则设计阅读材料包",
        "完成 Context 设计文档",
        "在 Trae 生成 news_agent 目录并 pip 安装成功",
      ],
      en: [
        "Apply the three context rules to the reading pack",
        "Finish the context worksheet",
        "Scaffold news_agent in Trae and install requirements",
      ],
    },
    prereqs: { zh: "课 2", en: "Lesson 2" },
  },
  {
    num: "04",
    slug: "module-3/04-vibe-coding-trae",
    title: {
      zh: "Vibe Coding：用 Trae 让系统动起来",
      en: "Vibe coding: make the pipeline real",
    },
    subtitle: {
      zh: "fetch_news · news_agent · 终端验收",
      en: "fetch_news · news_agent · terminal QA",
    },
    layer: { zh: "实战", en: "Lab" },
    duration: { zh: "约 100 分钟", en: "~100 min" },
    outcomes: {
      zh: [
        "掌握四步工作法与 I/O 契约",
        "跑通抓取 → Claude → summary.json",
        "排查常见依赖与解析错误",
      ],
      en: [
        "Use the four-step loop + I/O contracts",
        "Ship fetch → Claude → summary.json",
        "Debug common dependency/parse issues",
      ],
    },
    prereqs: { zh: "课 3", en: "Lesson 3" },
  },
  {
    num: "05",
    slug: "module-3/05-web-product-json",
    title: {
      zh: "网页产品 + 回顾 + JSON 初识",
      en: "Web UI + recap + JSON primer",
    },
    subtitle: {
      zh: "Flask 产品化 · 五课演进 · 结构化铺垫",
      en: "Flask wrap · five-lesson arc · structured I/O",
    },
    layer: { zh: "实战", en: "Lab" },
    duration: { zh: "约 100 分钟", en: "~100 min" },
    outcomes: {
      zh: [
        "用需求卡驱动 Trae 完成可刷新网页",
        "口述从角色卡到网页的演进",
        "理解 JSON 三规则并完成微练习",
      ],
      en: [
        "Brief Trae into a refreshable web product",
        "Narrate the arc from role card to UI",
        "Learn three JSON rules + a micro drill",
      ],
    },
    prereqs: { zh: "课 4", en: "Lesson 4" },
  },
]

export type FinanceMacroChapter = {
  num: string
  slug: string
  title: string
  subtitle: string
  layer: FinanceMacroLayerZh | FinanceMacroLayerEn
  duration: string
  outcomes: string[]
  prereqs?: string
}

const financeMacroLayerStyleZh: Record<
  FinanceMacroLayerZh,
  { color: string; bg: string; border: string }
> = {
  实战: {
    color: "var(--color-text-warning)",
    bg: "var(--color-background-warning)",
    border: "var(--color-border-warning)",
  },
}

const financeMacroLayerStyleEn: Record<
  FinanceMacroLayerEn,
  { color: string; bg: string; border: string }
> = {
  Lab: {
    color: "var(--color-text-warning)",
    bg: "var(--color-background-warning)",
    border: "var(--color-border-warning)",
  },
}

export function getFinanceMacroChapterStyles(locale: Locale) {
  return locale === "en" ? financeMacroLayerStyleEn : financeMacroLayerStyleZh
}

export function getFinanceMacroChapters(locale: Locale): FinanceMacroChapter[] {
  return financeMacroChapters.map((ch) => ({
    num: ch.num,
    slug: ch.slug,
    title: locale === "en" ? ch.title.en : ch.title.zh,
    subtitle: locale === "en" ? ch.subtitle.en : ch.subtitle.zh,
    layer: locale === "en" ? ch.layer.en : ch.layer.zh,
    duration: locale === "en" ? ch.duration.en : ch.duration.zh,
    outcomes: locale === "en" ? ch.outcomes.en : ch.outcomes.zh,
    prereqs: ch.prereqs
      ? locale === "en"
        ? ch.prereqs.en
        : ch.prereqs.zh
      : undefined,
  }))
}
