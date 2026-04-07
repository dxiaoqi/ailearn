import Link from "next/link"
import type { Metadata } from "next"
import { LocaleSwitcher } from "@/components/LocaleSwitcher"
import { getComingSoon, getHomeCourses } from "@/lib/i18n/course-catalog"
import { getLocale } from "@/lib/i18n/locale"
import { getMessages } from "@/lib/i18n/messages"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const m = getMessages(locale)
  return {
    title: m.home.metaTitle,
    description: m.home.metaDescription,
  }
}

export default async function HomePage() {
  const locale = await getLocale()
  const m = getMessages(locale)
  const courses = getHomeCourses(locale)
  const comingSoon = getComingSoon(locale)

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
            justifyContent: "space-between",
            gap: 16,
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
            {m.nav.courseCenter}
          </Link>
          <LocaleSwitcher
            locale={locale}
            ariaLabel={m.localeSwitcher.aria}
            labelZh={m.localeSwitcher.zh}
            labelEn={m.localeSwitcher.en}
          />
        </div>
      </header>

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
          {m.home.heroLine1}
          <br />
          <span style={{ color: "var(--color-accent)" }}>{m.home.heroAccent}</span>
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
          {m.home.heroSub}
        </p>
      </section>

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
          {m.home.sectionAvailable}
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
                <div>
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
                    {m.home.viewCourse}
                  </Link>
                  <Link
                    href={course.firstLesson}
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-tertiary)",
                      textDecoration: "none",
                    }}
                  >
                    {m.home.jumpFirstLesson}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

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
          {m.home.sectionComingSoon}
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
                {m.home.badgeComingSoon}
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

      <footer
        style={{
          borderTop: "0.5px solid var(--color-border-tertiary)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: 0 }}>
          {m.home.footer}
        </p>
      </footer>
    </div>
  )
}
