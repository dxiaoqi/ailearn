import Link from "next/link"
import type { Metadata } from "next"
import { LocaleSwitcher } from "@/components/LocaleSwitcher"
import {
  getPromptChapterStyles,
  getPromptChapters,
} from "@/lib/i18n/course-catalog"
import { getLocale } from "@/lib/i18n/locale"
import { getMessages } from "@/lib/i18n/messages"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const m = getMessages(locale)
  return { title: m.promptCourse.metaTitle, description: m.promptCourse.metaDescription }
}

export default async function PromptEngineeringCoursePage() {
  const locale = await getLocale()
  const m = getMessages(locale)
  const chapters = getPromptChapters(locale)
  const layerStyle = getPromptChapterStyles(locale) as Record<
    string,
    { color: string; bg: string; border: string }
  >

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background-primary)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-sans)",
      }}
    >
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
            {m.nav.courseCenter}
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
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/lesson/module-1/01-prompt-structure"
              style={{
                fontSize: 13,
                color: "var(--color-accent)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {m.promptCourse.navStart}
            </Link>
            <LocaleSwitcher
              locale={locale}
              ariaLabel={m.localeSwitcher.aria}
              labelZh={m.localeSwitcher.zh}
              labelEn={m.localeSwitcher.en}
            />
          </div>
        </div>
      </header>

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
            <span style={{ opacity: 0.7 }}>{m.promptCourse.badgeLeft}</span>
            <span>·</span>
            <span>{m.promptCourse.badgeRight}</span>
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
            {m.promptCourse.heroTitle}
            <br />
            <span style={{ color: "var(--color-accent)" }}>{m.promptCourse.heroSubtitle}</span>
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
            {m.promptCourse.heroLead}
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
            {m.promptCourse.ctaStart}
          </Link>
        </div>
      </section>

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
            { value: "9", label: m.promptCourse.stats.chapters },
            { value: "26", label: m.promptCourse.stats.cards },
            { value: "17", label: m.promptCourse.stats.practice },
            { value: "~6h", label: m.promptCourse.stats.hours },
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
          {m.promptCourse.sectionAll}
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
                      {m.promptCourse.chapterLabel(ch.num)}
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
                      {m.promptCourse.exercisesMeta(ch.exercises, ch.difficulty)}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--color-accent)", fontWeight: 500 }}>
                      {m.promptCourse.ctaCard}
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
          {m.promptCourse.footer}
        </p>
      </footer>
    </div>
  )
}
