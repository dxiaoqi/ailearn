import type { ExpertConfig } from "@/lib/types"
import type { Locale } from "./locale"

export const messages = {
  zh: {
    nav: {
      courseCenter: "课程中心",
    },
    localeSwitcher: {
      aria: "切换语言",
      zh: "中文",
      en: "English",
    },
    home: {
      metaTitle: "课程中心",
      metaDescription: "AI 实战课程，以练带学，学完即用",
      heroLine1: "以练带学，",
      heroAccent: "学完即用",
      heroSub:
        "每门课程聚焦一个实战主题，配套真实场景练习，可直接应用到工作中。",
      sectionAvailable: "可学习",
      sectionComingSoon: "即将上线",
      viewCourse: "查看课程 →",
      jumpFirstLesson: "直接进入第一章 ↗",
      badgeComingSoon: "即将上线",
      footer: "以练带学 · 章节独立 · 学完即用",
      stats: {
        chapters: "章节",
        knowledgeCards: "知识卡片",
        exercises: "练习",
        duration: "时长",
        lessons: "课程",
        quizQuestions: "测验题",
        codeLabs: "代码实验",
        courses: "课程",
        totalDuration: "总时长",
      },
    },
    lesson: {
      breadcrumbHome: "课程中心",
      articleEnd: "本文结束",
      expertHint: (name: string) => `有疑问？按 ⌘K 咨询 ${name}`,
      tocHeading: "目录",
      fallbackBanner:
        "本课正文暂无英文稿，以下为中文原文。完整英文版将陆续补齐。",
    },
    agentCourse: {
      metaTitle: "Agent 工程 · 课程详情",
      metaDescription:
        "从 Agent Loop 到 Multi-Agent 协作，7 课完整体系掌握 Agent 设计",
      badge: "7 课 · 完整体系",
      title: "Agent 工程",
      description:
        "从 Agent Loop 的基本机制到 Multi-Agent 协作和 RAG 检索增强，7 课体系化掌握 AI Agent 的设计与工程实践。每课配备交互沙盒和真实代码实验。",
      statLessons: "课程",
      statQuiz: "测验题",
      statLabs: "代码实验",
      statTotal: "总时长",
      footerBack: "← 返回课程中心",
      prereq: "前置：",
    },
    financeCourse: {
      metaTitle: "金融宏观分析 Agent · 课程详情",
      metaDescription:
        "五课从流程图与 Prompt 到 Trae 跑通 AP News + Claude，再到可刷新网页产品",
      badge: "5 课 · 金融实战",
      title: "金融宏观分析 Agent 实战",
      description:
        "面向金融信息整理场景：掌握节点类型与四层 Prompt、Context 与项目骨架、Vibe Coding 生成抓取与摘要脚本，最后用 Trae 将流水线产品化为网页。每课约 100 分钟，讲义与陪跑材料对齐，中英文并排维护。",
      statLessons: "课程",
      statBlocks: "课堂环节",
      statDeliverables: "产物节点",
      statTotal: "总时长",
      footerBack: "← 返回课程中心",
      prereq: "前置：",
    },
    promptCourse: {
      metaTitle: "Claude Prompt Engineering · 课程详情",
      metaDescription: "从随意写提示词到系统化设计，10 章独立成章的实战课程",
      chapterLabel: (n: string) => `第 ${n} 章`,
      badgeLeft: "Anthropic 官方方法论",
      badgeRight: "10 章完整课程",
      heroTitle: "Prompt Engineering",
      heroSubtitle: "从入门到智能体",
      heroLead:
        "把 Anthropic 官方 Prompt Engineering 核心方法论，转化为可立即落地的实战教程。每章独立完整，可按需跳读；每个概念配套真实练习场景，学完即能用。",
      ctaStart: "从第一章开始 →",
      navStart: "开始学习 →",
      stats: {
        chapters: "章节",
        cards: "知识卡片",
        practice: "实战练习",
        hours: "总学习时长",
      },
      sectionAll: "全部章节",
      exercisesMeta: (n: number, difficulty: string) =>
        `${n} 个练习 · ${difficulty}`,
      ctaCard: "开始 →",
      footer: "基于 Anthropic 官方 Prompt Engineering 方法论 · 以练带学 · 章节独立",
    },
    expertUi: {
      errorRequest: "请求失败",
      chatErrorRetry: "抱歉，出了点问题，请稍后再试。",
      welcomeFallback: (name: string) => `你好！我是 ${name}，有什么问题可以问我。`,
      floatingTitle: "咨询专家顾问 (⌘K)",
      collapse: "收起",
      badge: "本课专属顾问",
      closeDialog: "关闭对话框",
      askPlaceholder: (name: string) => `问 ${name} 任何关于本课的问题…`,
      sendAria: "发送",
      shortcutHint: "Enter 发送 · Shift+Enter 换行 · ⌘K 收起",
    },
    promptPractice: {
      scenarioHeading: "选择你的工作场景（影响改写思路）",
      rewrittenLabel: "你改写后的提示词",
      hintStructureTitle: "参考结构",
      submitFeedback: "提交查看反馈 ↗",
      submitting: "AI 评估中…",
      showHint: "查看提示",
      hideHint: "收起提示",
      feedbackTitle: "AI 反馈",
      feedbackErrorTitle: "出错了",
      feedbackFetchError: "获取反馈时出错，请稍后重试。",
      requestFailed: "请求失败",
      defaultSystemPrompt:
        "你是一个 Prompt 工程专家，评估学生的 Prompt 改写质量，给出简洁实用的反馈，用中文回复。",
      studentScenarioPrefix: "学生选择的场景：",
      originalPromptPrefix: "原始提示词：",
      rewrittenPromptPrefix: "学生改写后的提示词：\n",
    },
    widgets: {
      beforeAfter: {
        tabGood: "✓ 分析",
        tabBad: "✗ 问题",
        tabNeutral: "分析",
        promptHeading: "提示词",
      },
      quiz: {
        questionsUnit: " 题",
        includesMulti: "含多选",
        singleOnly: "单选",
        correctSuffix: " 正确",
        multiMark: "（多选）",
        optionCorrect: "✓ 正确",
        explainHeadingCorrect: "✓ 回答正确",
        explainHeadingWrong: "解析",
        confirmAnswers: "确认答案",
        allCorrect: "全部答对！",
      },
      checklist: {
        allDone: "🎉 本模块全部完成！",
      },
      sandbox: {
        defaultTitle: "参数沙盒",
        growthDefaultTitle: "增长曲线",
        minutesSuffix: " 分钟",
      },
      aiChat: {
        defaultSystemPrompt:
          "你是一个专业的 AI 课程导师，用简洁中文回答，控制在 150 字内。",
        requestFailed: "请求失败",
        connectionError: "暂时无法连接，请稍后重试。",
        defaultTitle: "AI 导师",
        defaultHint: "有疑问直接问",
        defaultPlaceholder: "输入你的问题…",
      },
      scenarioEval: {
        defaultTitle: "AI 场景适配评估",
        sceneLabel: "描述你的工作场景",
        defaultPlaceholder: "例如：我每天需要……",
        evaluating: "评估中…",
        defaultButton: "✦ AI 评估适配度",
        errorPrefix: "评估失败：",
        retryHint: "请稍后重试",
        suggestionHeading: "改造建议",
        requestFailed: "请求失败",
        apiSystemPrompt: "你是 AI 场景评估助手。只输出 JSON，不要有任何其他文字。",
        noSystemSceneBlock: "你是 AI 课程导师。学员描述了以下工作场景：「{input}」\n\n",
        withSystemSceneBlock: "\n\n学员描述的场景：「{input}」\n\n",
        jsonOnlyLead: "请只输出 JSON，不要有任何其他内容：\n",
        reasonFieldGuide: "30字内说明主要理由",
        suggestionFieldGuide: "最重要的一条改造建议，30字内",
        dimensionCommentGuide: "25字内",
        defaultDimensions: ["重复性", "可分解性", "可验证性", "数据可获取性"],
        verdictOptions: ["非常适合", "适合", "部分适合", "不适合"],
      },
      codePlayground: {
        configMissing: "Code Playground: 未配置文件",
        requestFailedHttp: "请求失败 (HTTP {status})",
        serverErrorHttp: "服务端错误 (HTTP {status})",
        emptyResponse: "服务端返回为空",
        runCancelled: "\n[已取消执行]",
        networkErrorPrefix: "网络错误: ",
        noFileSelected: "未选择文件",
        runPlaceholder: "点击 Run 执行代码...",
      },
    },
  },
  en: {
    nav: {
      courseCenter: "Courses",
    },
    localeSwitcher: {
      aria: "Switch language",
      zh: "中文",
      en: "English",
    },
    home: {
      metaTitle: "Course hub",
      metaDescription: "Hands-on AI courses: practice-first, ready to use",
      heroLine1: "Learn by doing,",
      heroAccent: "apply immediately",
      heroSub:
        "Each course focuses on one practical theme with realistic drills you can bring to work.",
      sectionAvailable: "Available",
      sectionComingSoon: "Coming soon",
      viewCourse: "View course →",
      jumpFirstLesson: "Jump to lesson 1 ↗",
      badgeComingSoon: "Coming soon",
      footer: "Practice-first · Modular lessons · Ready to use",
      stats: {
        chapters: "Chapters",
        knowledgeCards: "Concept cards",
        exercises: "Exercises",
        duration: "Duration",
        lessons: "Lessons",
        quizQuestions: "Quiz items",
        codeLabs: "Code labs",
        courses: "Lessons",
        totalDuration: "Total time",
      },
    },
    lesson: {
      breadcrumbHome: "Courses",
      articleEnd: "End of article",
      expertHint: (name: string) => `Questions? Press ⌘K to ask ${name}`,
      tocHeading: "Contents",
      fallbackBanner:
        "This lesson has no English manuscript yet; showing the Chinese original. Full English lessons will roll out gradually.",
    },
    agentCourse: {
      metaTitle: "Agent engineering · Course overview",
      metaDescription:
        "From the Agent loop to multi-agent collaboration—seven lessons for designing real agents.",
      badge: "7 lessons · Full track",
      title: "Agent engineering",
      description:
        "From the Agent loop to multi-agent systems and RAG—seven lessons on designing and shipping AI agents. Every lesson includes interactive sandboxes and runnable code experiments.",
      statLessons: "Lessons",
      statQuiz: "Quiz items",
      statLabs: "Code labs",
      statTotal: "Total time",
      footerBack: "← Back to course hub",
      prereq: "Prereqs: ",
    },
    financeCourse: {
      metaTitle: "Macro finance agent · Course overview",
      metaDescription:
        "Five lessons from flowcharts and prompts to Trae-shipped AP News + Claude, then a refreshable web UI.",
      badge: "5 lessons · Finance lab",
      title: "Macro analysis agent in practice",
      description:
        "Finance-flavored sprint: node types, four-layer prompts, context design, Trae vibe coding for fetch + Claude summaries, and a Flask-style web shell you can refresh. ~100 minutes per lesson; Chinese and English manuscripts stay in sync with the cohort materials.",
      statLessons: "Lessons",
      statBlocks: "In-class blocks",
      statDeliverables: "Deliverables",
      statTotal: "Total time",
      footerBack: "← Back to course hub",
      prereq: "Prereqs: ",
    },
    promptCourse: {
      metaTitle: "Claude Prompt Engineering · Course overview",
      metaDescription:
        "From ad-hoc prompts to systematic design—ten self-contained chapters.",
      chapterLabel: (n: string) => `Chapter ${n}`,
      badgeLeft: "Anthropic methodology",
      badgeRight: "10 chapters",
      heroTitle: "Prompt Engineering",
      heroSubtitle: "From basics to agents",
      heroLead:
        "Turn Anthropic’s prompt engineering playbook into a hands-on curriculum. Each chapter stands alone with realistic practice so you can apply ideas immediately.",
      ctaStart: "Start with chapter 1 →",
      navStart: "Start learning →",
      stats: {
        chapters: "Chapters",
        cards: "Concept cards",
        practice: "Drills",
        hours: "Study time",
      },
      sectionAll: "All chapters",
      exercisesMeta: (n: number, difficulty: string) =>
        `${n} exercises · ${difficulty}`,
      ctaCard: "Open →",
      footer:
        "Built on Anthropic’s prompt engineering guidance · Practice-first · Modular chapters",
    },
    expertUi: {
      errorRequest: "Request failed",
      chatErrorRetry: "Something went wrong. Please try again.",
      welcomeFallback: (name: string) =>
        `Hi! I'm ${name}. Ask me anything about this lesson.`,
      floatingTitle: "Lesson expert (⌘K)",
      collapse: "Close",
      badge: "Lesson advisor",
      closeDialog: "Close dialog",
      askPlaceholder: (name: string) => `Ask ${name} anything about this lesson…`,
      sendAria: "Send",
      shortcutHint: "Enter to send · Shift+Enter newline · ⌘K toggle",
    },
    promptPractice: {
      scenarioHeading: "Pick a work scenario (shapes how you rewrite)",
      rewrittenLabel: "Your rewritten prompt",
      hintStructureTitle: "Reference structure",
      submitFeedback: "Submit for feedback ↗",
      submitting: "Evaluating…",
      showHint: "Show hint",
      hideHint: "Hide hint",
      feedbackTitle: "AI feedback",
      feedbackErrorTitle: "Something went wrong",
      feedbackFetchError: "Couldn’t load feedback. Please try again.",
      requestFailed: "Request failed",
      defaultSystemPrompt:
        "You are a prompt engineering expert. Evaluate the student’s prompt rewrite with concise, practical feedback. Reply in English.",
      studentScenarioPrefix: "Scenario chosen by the student: ",
      originalPromptPrefix: "Original prompt:\n",
      rewrittenPromptPrefix: "Student’s rewritten prompt:\n",
    },
    widgets: {
      beforeAfter: {
        tabGood: "✓ Takeaway",
        tabBad: "✗ Issue",
        tabNeutral: "Analysis",
        promptHeading: "Prompt",
      },
      quiz: {
        questionsUnit: " questions",
        includesMulti: "Includes multi-select",
        singleOnly: "Single choice",
        correctSuffix: " correct",
        multiMark: "(multi-select)",
        optionCorrect: "✓ Correct",
        explainHeadingCorrect: "✓ Correct",
        explainHeadingWrong: "Explanation",
        confirmAnswers: "Check answer",
        allCorrect: "Perfect score!",
      },
      checklist: {
        allDone: "🎉 You’ve checked every item!",
      },
      sandbox: {
        defaultTitle: "Parameter sandbox",
        growthDefaultTitle: "Growth curve",
        minutesSuffix: " min",
      },
      aiChat: {
        defaultSystemPrompt:
          "You are a professional AI course tutor. Answer clearly in English, about 150 words max.",
        requestFailed: "Request failed",
        connectionError: "Can’t connect right now. Please try again.",
        defaultTitle: "AI tutor",
        defaultHint: "Ask anything",
        defaultPlaceholder: "Type your question…",
      },
      scenarioEval: {
        defaultTitle: "AI scenario fit check",
        sceneLabel: "Describe your work scenario",
        defaultPlaceholder: "e.g. Every day I need to…",
        evaluating: "Evaluating…",
        defaultButton: "✦ Assess fit",
        errorPrefix: "Assessment failed: ",
        retryHint: "Please try again later",
        suggestionHeading: "Suggested improvement",
        requestFailed: "Request failed",
        apiSystemPrompt:
          "You are an AI scenario evaluator. Output JSON only—no other text.",
        noSystemSceneBlock:
          'You are an AI course tutor. The learner described this work scenario: "{input}"\n\n',
        withSystemSceneBlock: '\n\nLearner scenario: "{input}"\n\n',
        jsonOnlyLead: "Output JSON only, with no other content:\n",
        reasonFieldGuide: "Main reason in ~30 characters",
        suggestionFieldGuide: "One top improvement, ~30 characters",
        dimensionCommentGuide: "~25 characters",
        defaultDimensions: [
          "Repeatability",
          "Decomposability",
          "Verifiability",
          "Data availability",
        ],
        verdictOptions: ["Excellent fit", "Good fit", "Partial fit", "Not a fit"],
      },
      codePlayground: {
        configMissing: "Code Playground: no files configured",
        requestFailedHttp: "Request failed (HTTP {status})",
        serverErrorHttp: "Server error (HTTP {status})",
        emptyResponse: "Empty response from server",
        runCancelled: "\n[Run cancelled]",
        networkErrorPrefix: "Network error: ",
        noFileSelected: "No file selected",
        runPlaceholder: "Click Run to execute…",
      },
    },
  },
} as const

export type Messages = (typeof messages)[Locale]

export function getMessages(locale: Locale): Messages {
  return messages[locale]
}

/** Serializable strings only — safe to pass from Server Components into Client Components. */
export type ExpertAdvisorUiPlain = {
  errorRequest: string
  chatErrorRetry: string
  welcomeMessage: string
  floatingTitle: string
  collapse: string
  badge: string
  closeDialog: string
  inputPlaceholder: string
  sendAria: string
  shortcutHint: string
}

export function expertUiPlain(
  m: Messages,
  expert: Pick<ExpertConfig, "name" | "intro">
): ExpertAdvisorUiPlain {
  return {
    errorRequest: m.expertUi.errorRequest,
    chatErrorRetry: m.expertUi.chatErrorRetry,
    welcomeMessage: expert.intro ?? m.expertUi.welcomeFallback(expert.name),
    floatingTitle: m.expertUi.floatingTitle,
    collapse: m.expertUi.collapse,
    badge: m.expertUi.badge,
    closeDialog: m.expertUi.closeDialog,
    inputPlaceholder: m.expertUi.askPlaceholder(expert.name),
    sendAria: m.expertUi.sendAria,
    shortcutHint: m.expertUi.shortcutHint,
  }
}

export type PromptPracticeUiPlain = Messages["promptPractice"]

export type MarkdownWidgetUi = {
  promptPractice: PromptPracticeUiPlain
  beforeAfter: Messages["widgets"]["beforeAfter"]
  quiz: Messages["widgets"]["quiz"]
  checklist: Messages["widgets"]["checklist"]
  sandbox: Messages["widgets"]["sandbox"]
  aiChat: Messages["widgets"]["aiChat"]
  scenarioEval: Messages["widgets"]["scenarioEval"]
  codePlayground: Messages["widgets"]["codePlayground"]
}

export function markdownWidgetUiPlain(m: Messages): MarkdownWidgetUi {
  return {
    promptPractice: m.promptPractice,
    beforeAfter: m.widgets.beforeAfter,
    quiz: m.widgets.quiz,
    checklist: m.widgets.checklist,
    sandbox: m.widgets.sandbox,
    aiChat: m.widgets.aiChat,
    scenarioEval: m.widgets.scenarioEval,
    codePlayground: m.widgets.codePlayground,
  }
}
