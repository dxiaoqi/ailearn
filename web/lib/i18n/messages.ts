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
  },
} as const

export type Messages = (typeof messages)[Locale]

export function getMessages(locale: Locale): Messages {
  return messages[locale]
}
