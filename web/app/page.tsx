import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "课程中心",
  description: "AI 实战课程，以练带学，学完即用",
}

// ── 课程数据 ──────────────────────────────────────────────────────

interface Course {
  slug: string
  title: string
  subtitle: string
  description: string
  tags: string[]
  stats: { value: string; label: string }[]
  firstLesson: string
  available: boolean
  accentColor: string
  accentBg: string
  accentBorder: string
}

const courses: Course[] = [
  {
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
    accentColor: "var(--color-accent)",
    accentBg: "var(--color-accent-light)",
    accentBorder: "var(--color-border-warning)",
  },
]

const comingSoon = [
  {
    title: "RAG 系统设计",
    subtitle: "检索增强生成的工程实践",
    description: "从向量检索到 Rerank，设计可落地的企业级 RAG 系统。",
  },
  {
    title: "AI 产品设计",
    subtitle: "从需求到提示词的完整链路",
    description: "产品经理视角的 AI 功能设计方法论，从用户需求到系统提示词。",
  },
]

// ── Page ─────────────────────────────────────────────────────────

export default function HomePage() {
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
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              textDecoration: "none",
              letterSpacing: "-0.02em",
            }}
          >
            课程中心
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "80px 24px 56px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            margin: "0 0 16px",
            color: "var(--color-text-primary)",
          }}
        >
          以练带学，
          <br />
          <span style={{ color: "var(--color-accent)" }}>学完即用</span>
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.7,
            color: "var(--color-text-secondary)",
            margin: 0,
            maxWidth: 480,
          }}
        >
          每门课程聚焦一个实战主题，配套真实场景练习，可直接应用到工作中。
        </p>
      </section>

      {/* ── 可用课程 ── */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 24px 48px",
        }}
      >
        <h2
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--color-text-tertiary)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            margin: "0 0 16px",
          }}
        >
          可学习
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {courses.map((course) => (
            <article
              key={course.slug}
              style={{
                background: "var(--color-background-secondary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: "var(--radius-xl)",
                padding: "32px",
              }}
              className="course-card"
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 32,
                  alignItems: "start",
                }}
                className="course-card-inner"
              >
                {/* 左：课程信息 */}
                <div>
                  {/* 标签行 */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: course.accentColor,
                          background: course.accentBg,
                          border: `0.5px solid ${course.accentBorder}`,
                          borderRadius: "var(--radius-pill)",
                          padding: "2px 8px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 标题 */}
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 500,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.25,
                      color: "var(--color-text-primary)",
                      margin: "0 0 4px",
                    }}
                  >
                    {course.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      color: course.accentColor,
                      fontWeight: 500,
                      margin: "0 0 14px",
                    }}
                  >
                    {course.subtitle}
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.65,
                      color: "var(--color-text-secondary)",
                      margin: "0 0 24px",
                      maxWidth: 520,
                    }}
                  >
                    {course.description}
                  </p>

                  {/* 数据统计 */}
                  <div style={{ display: "flex", gap: 24 }}>
                    {course.stats.map((stat) => (
                      <div key={stat.label}>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 500,
                            letterSpacing: "-0.02em",
                            color: "var(--color-text-primary)",
                            lineHeight: 1,
                            marginBottom: 2,
                          }}
                        >
                          {stat.value}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 右：进入按钮 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 12,
                    paddingTop: 4,
                  }}
                >
                  <Link
                    href={`/courses/${course.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 18px",
                      background: course.accentColor,
                      color: "#fff",
                      borderRadius: "var(--radius-md)",
                      fontSize: 13,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      textDecoration: "none",
                    }}
                  >
                    查看课程 →
                  </Link>
                  <Link
                    href={course.firstLesson}
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-tertiary)",
                      textDecoration: "none",
                    }}
                  >
                    直接进入第一章 ↗
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 即将上线 ── */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 24px 96px",
        }}
      >
        <h2
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--color-text-tertiary)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            margin: "0 0 16px",
          }}
        >
          即将上线
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
          }}
          className="coming-soon-grid"
        >
          {comingSoon.map((item) => (
            <div
              key={item.title}
              style={{
                background: "var(--color-background-secondary)",
                border: "0.5px dashed var(--color-border-tertiary)",
                borderRadius: "var(--radius-xl)",
                padding: "24px",
                opacity: 0.6,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  fontSize: 10,
                  fontWeight: 500,
                  color: "var(--color-text-tertiary)",
                  background: "var(--color-background-tertiary)",
                  borderRadius: "var(--radius-pill)",
                  padding: "2px 8px",
                  marginBottom: 12,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                即将上线
              </div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 500,
                  letterSpacing: "-0.015em",
                  color: "var(--color-text-primary)",
                  margin: "0 0 4px",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-tertiary)",
                  margin: "0 0 10px",
                }}
              >
                {item.subtitle}
              </p>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--color-text-secondary)",
                  margin: 0,
                }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "0.5px solid var(--color-border-tertiary)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: 0 }}>
          以练带学 · 章节独立 · 学完即用
        </p>
      </footer>
    </div>
  )
}
