import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Claude Prompt Engineering · 课程详情",
  description: "从随意写提示词到系统化设计，10 章独立成章的实战课程",
}

type Layer = "基础" | "进阶" | "综合"

interface Chapter {
  num: string
  slug: string
  title: string
  subtitle: string
  layer: Layer
  difficulty: string
  duration: string
  outcomes: string[]
  exercises: number
}

const chapters: Chapter[] = [
  {
    num: "01",
    slug: "module-1/01-prompt-structure",
    title: "提示词基础结构",
    subtitle: "五要素框架 · 从随意写到有意识地设计",
    layer: "基础",
    difficulty: "入门",
    duration: "30 分钟",
    exercises: 2,
    outcomes: [
      "识别一个提示词缺少哪些要素",
      "将任意差的提示词改写为结构化版本",
      "在自己的工作场景中套用五要素框架",
    ],
  },
  {
    num: "02",
    slug: "module-1/02-xml-isolation",
    title: "XML 与信息隔离",
    subtitle: "系统提示词 vs 用户提示词 · 动静态内容分离",
    layer: "基础",
    difficulty: "入门",
    duration: "35 分钟",
    exercises: 2,
    outcomes: [
      "判断哪些内容放系统提示词、哪些放用户提示词",
      "用 XML 标签将指令与数据彻底分离",
      "写出可多次复用的提示词模板（带占位符）",
    ],
  },
  {
    num: "03",
    slug: "module-1/03-step-instructions",
    title: "步骤指令与分析顺序",
    subtitle: "规定思考路径 · 把复杂任务拆解为可执行步骤",
    layer: "基础",
    difficulty: "入门",
    duration: "30 分钟",
    exercises: 2,
    outcomes: [
      "识别哪类任务需要步骤指令",
      "写出逻辑顺序合理的步骤序列",
      "用步骤指令处理多维度分析任务",
    ],
  },
  {
    num: "04",
    slug: "module-1/04-fewshot",
    title: "Few-shot 示例注入",
    subtitle: "把人类判断力装进提示词 · 处理边缘情况的最优解",
    layer: "基础",
    difficulty: "入门→中级",
    duration: "40 分钟",
    exercises: 2,
    outcomes: [
      "判断什么时候必须用示例、什么时候不需要",
      "写出能有效传递判断逻辑的示例",
      "用 2-3 个示例覆盖任务的关键边界情况",
    ],
  },
  {
    num: "05",
    slug: "module-1/05-output-format",
    title: "输出格式控制",
    subtitle: "预填充 · JSON · 格式化输出 · 去掉废话开头",
    layer: "基础",
    difficulty: "中级",
    duration: "35 分钟",
    exercises: 2,
    outcomes: [
      "用预填充（Prefill）强制模型按格式输出",
      "让模型输出可直接解析的 JSON",
      "消除模型的废话开头，让输出直接可用",
    ],
  },
  {
    num: "06",
    slug: "module-1/06-system-prompt-production",
    title: "系统提示词与生产部署",
    subtitle: "从一次性对话到稳定可复用的 AI 功能",
    layer: "进阶",
    difficulty: "中级",
    duration: "40 分钟",
    exercises: 2,
    outcomes: [
      "设计生产级别的系统提示词结构",
      "区分哪些指令放系统提示词 vs 动态注入",
      "用缓存机制降低延迟和成本",
    ],
  },
  {
    num: "07",
    slug: "module-1/07-agent-intro",
    title: "智能体提示词入门",
    subtitle: "什么是 Agent · 适合和不适合的场景 · 核心设计原则",
    layer: "进阶",
    difficulty: "中级→高级",
    duration: "45 分钟",
    exercises: 2,
    outcomes: [
      "判断一个任务是否适合用智能体来处理",
      "理解智能体提示词与普通提示词的根本区别",
      "写出智能体系统提示词的基础框架",
    ],
  },
  {
    num: "08",
    slug: "module-1/08-agent-tools",
    title: "智能体工具设计",
    subtitle: "工具描述 · 命名规则 · 避免功能重叠 · 参数设计",
    layer: "进阶",
    difficulty: "高级",
    duration: "40 分钟",
    exercises: 2,
    outcomes: [
      "写出让智能体能正确使用的工具描述",
      "识别并修复工具描述中的常见问题",
      "设计功能边界清晰、没有重叠的工具集",
    ],
  },
  {
    num: "09",
    slug: "module-1/09-context-management",
    title: "上下文管理策略",
    subtitle: "压缩 · 外部记忆 · 子智能体 · 长任务保质量",
    layer: "进阶",
    difficulty: "高级",
    duration: "40 分钟",
    exercises: 1,
    outcomes: [
      "判断长任务中哪种上下文管理策略最合适",
      "在提示词中内置压缩触发机制",
      "设计子智能体分工方案",
    ],
  },
]

const layerStyle: Record<Layer, { color: string; bg: string; border: string }> = {
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

export default function PromptEngineeringCoursePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background-primary)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── 顶部导航 ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--color-background-header)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "0 24px",
            height: 52,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: "var(--color-text-tertiary)",
              textDecoration: "none",
            }}
          >
            课程中心
          </Link>
          <span style={{ color: "var(--color-border-secondary)", fontSize: 13 }}>/</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            Claude Prompt Engineering
          </span>
          <div style={{ marginLeft: "auto" }}>
            <Link
              href="/lesson/module-1/01-prompt-structure"
              style={{
                fontSize: 13,
                color: "var(--color-accent)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              开始学习 →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "64px 24px 48px",
        }}
      >
        <div style={{ maxWidth: 680 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              color: "var(--color-accent)",
              background: "var(--color-accent-light)",
              border: "0.5px solid var(--color-border-warning)",
              borderRadius: "var(--radius-pill)",
              padding: "3px 10px",
              marginBottom: 20,
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ opacity: 0.7 }}>Anthropic 官方方法论</span>
            <span>·</span>
            <span>10 章完整课程</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              margin: "0 0 14px",
              color: "var(--color-text-primary)",
            }}
          >
            Prompt Engineering
            <br />
            <span style={{ color: "var(--color-accent)" }}>从入门到智能体</span>
          </h1>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--color-text-secondary)",
              margin: "0 0 28px",
              maxWidth: 540,
            }}
          >
            把 Anthropic 官方 Prompt Engineering 核心方法论，转化为可立即落地的实战教程。每章独立完整，可按需跳读；每个概念配套真实练习场景，学完即能用。
          </p>

          <Link
            href="/lesson/module-1/01-prompt-structure"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              background: "var(--color-accent)",
              color: "#fff",
              borderRadius: "var(--radius-md)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            从第一章开始 →
          </Link>
        </div>
      </section>

      {/* ── 数据统计 ── */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px 48px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            background: "var(--color-border-tertiary)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          {[
            { value: "9", label: "章节" },
            { value: "26", label: "知识卡片" },
            { value: "17", label: "实战练习" },
            { value: "~6 小时", label: "总学习时长" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--color-background-secondary)",
                padding: "18px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text-primary)",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 章节列表 ── */}
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px 96px" }}>
        <h2
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-tertiary)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            margin: "0 0 16px",
          }}
        >
          全部章节
        </h2>

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}
          className="chapter-grid"
        >
          {chapters.map((ch) => {
            const s = layerStyle[ch.layer]
            return (
              <Link
                key={ch.num}
                href={`/lesson/${ch.slug}`}
                style={{ textDecoration: "none", display: "block" }}
                className="chapter-card"
              >
                <article
                  style={{
                    background: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--radius-xl)",
                    padding: "24px",
                    height: "100%",
                    transition:
                      "border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      第 {ch.num} 章
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: s.color,
                          background: s.bg,
                          border: `0.5px solid ${s.border}`,
                          borderRadius: "var(--radius-pill)",
                          padding: "2px 8px",
                        }}
                      >
                        {ch.layer}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-tertiary)",
                          background: "var(--color-background-tertiary)",
                          borderRadius: "var(--radius-pill)",
                          padding: "2px 8px",
                        }}
                      >
                        {ch.duration}
                      </span>
                    </div>
                  </div>

                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 500,
                      letterSpacing: "-0.015em",
                      lineHeight: 1.3,
                      color: "var(--color-text-primary)",
                      margin: "0 0 6px",
                    }}
                  >
                    {ch.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-tertiary)",
                      margin: "0 0 18px",
                      lineHeight: 1.5,
                    }}
                  >
                    {ch.subtitle}
                  </p>

                  <ul
                    style={{
                      listStyle: "none",
                      margin: "0 0 20px",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                    }}
                  >
                    {ch.outcomes.map((item) => (
                      <li
                        key={item}
                        style={{
                          fontSize: 12.5,
                          color: "var(--color-text-secondary)",
                          display: "flex",
                          gap: 6,
                          lineHeight: 1.5,
                        }}
                      >
                        <span
                          style={{ color: "var(--color-accent)", flexShrink: 0, marginTop: 1 }}
                        >
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 16,
                      borderTop: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
                      {ch.exercises} 个练习 · {ch.difficulty}
                    </span>
                    <span
                      style={{ fontSize: 13, color: "var(--color-accent)", fontWeight: 500 }}
                    >
                      开始 →
                    </span>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      </section>

      <footer
        style={{
          borderTop: "0.5px solid var(--color-border-tertiary)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: 0 }}>
          基于 Anthropic 官方 Prompt Engineering 方法论 · 以练带学 · 章节独立
        </p>
      </footer>
    </div>
  )
}
