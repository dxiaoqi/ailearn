import Link from "next/link"
import type { Metadata } from "next"
import { LocaleSwitcher } from "@/components/LocaleSwitcher"
import {
  getFinanceMacroChapterStyles,
  getFinanceMacroChapters,
} from "@/lib/i18n/course-catalog"
import { getLocale } from "@/lib/i18n/locale-server"
import { getMessages } from "@/lib/i18n/messages"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const m = getMessages(locale)
  return {
    title: m.financeCourse.metaTitle,
    description: m.financeCourse.metaDescription,
  }
}

export default async function FinanceMacroAgentCoursePage() {
  const locale = await getLocale()
  const m = getMessages(locale)
  const chapters = getFinanceMacroChapters(locale)
  const layerStyle = getFinanceMacroChapterStyles(locale) as Record<
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
            style={{ fontSize: 13, color: "var(--color-text-tertiary)", textDecoration: "none" }}
          >
            {m.nav.courseCenter}
          </Link>
          <span style={{ color: "var(--color-border-secondary)", fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
            {m.financeCourse.title}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <LocaleSwitcher
              locale={locale}
              ariaLabel={m.localeSwitcher.aria}
              labelZh={m.localeSwitcher.zh}
              labelEn={m.localeSwitcher.en}
            />
          </div>
        </div>
      </header>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "64px 24px 48px" }}>
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 500,
            color: "var(--color-text-warning)",
            background: "var(--color-background-warning)",
            border: "0.5px solid var(--color-border-warning)",
            borderRadius: "var(--radius-pill)",
            padding: "3px 10px",
            marginBottom: 16,
          }}
        >
          {m.financeCourse.badge}
        </div>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            margin: "0 0 12px",
          }}
        >
          {m.financeCourse.title}
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.7,
            color: "var(--color-text-secondary)",
            margin: "0 0 32px",
            maxWidth: 560,
          }}
        >
          {m.financeCourse.description}
        </p>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {[
            { value: "5", label: m.financeCourse.statLessons },
            { value: "15+", label: m.financeCourse.statBlocks },
            { value: "6", label: m.financeCourse.statDeliverables },
            { value: "~8h", label: m.financeCourse.statTotal },
          ].map((s) => (
            <div key={s.label}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text-primary)",
                  lineHeight: 1,
                  marginBottom: 2,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 12,
          }}
          className="chapter-grid"
        >
          {chapters.map((ch) => {
            const style = layerStyle[ch.layer]
            return (
              <Link
                key={ch.slug}
                href={`/lesson/${ch.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
                className="chapter-card"
              >
                <article
                  style={{
                    background: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px 22px",
                    transition:
                      "transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast)",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      {ch.num}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 500,
                          color: style.color,
                          background: style.bg,
                          border: `0.5px solid ${style.border}`,
                          borderRadius: "var(--radius-pill)",
                          padding: "1px 7px",
                        }}
                      >
                        {ch.layer}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
                        {ch.duration}
                      </span>
                    </div>
                  </div>

                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      letterSpacing: "-0.015em",
                      color: "var(--color-text-primary)",
                      margin: "0 0 4px",
                      lineHeight: 1.3,
                    }}
                  >
                    {ch.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                      margin: "0 0 14px",
                      lineHeight: 1.5,
                    }}
                  >
                    {ch.subtitle}
                  </p>

                  <ul style={{ margin: 0, padding: "0 0 0 16px", listStyleType: "disc" }}>
                    {ch.outcomes.map((o) => (
                      <li
                        key={o}
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-secondary)",
                          lineHeight: 1.6,
                          marginBottom: 2,
                        }}
                      >
                        {o}
                      </li>
                    ))}
                  </ul>

                  {ch.prereqs && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-tertiary)",
                        margin: "10px 0 0",
                      }}
                    >
                      {m.financeCourse.prereq}
                      {ch.prereqs}
                    </p>
                  )}
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
        <Link
          href="/"
          style={{ fontSize: 12, color: "var(--color-text-tertiary)", textDecoration: "none" }}
        >
          {m.financeCourse.footerBack}
        </Link>
      </footer>
    </div>
  )
}
