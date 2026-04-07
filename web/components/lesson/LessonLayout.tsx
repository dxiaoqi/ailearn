import Link from "next/link"
import type { Locale } from "@/lib/i18n/locale"
import type { Messages } from "@/lib/i18n/messages"
import type { LessonMeta, TocItem } from "@/lib/types"
import { LocaleSwitcher } from "@/components/LocaleSwitcher"
import { ExpertAdvisor } from "./ExpertAdvisor"
import { TableOfContents } from "./TableOfContents"

const moduleToCourse: Record<string, string> = {
  "module-1": "/courses/prompt-engineering",
  "module-2": "/courses/agent-engineering",
}

interface Props {
  meta: LessonMeta
  toc: TocItem[]
  children: React.ReactNode
  locale: Locale
  messages: Messages
  usedFallback?: boolean
}

export function LessonLayout({
  meta,
  toc,
  children,
  locale,
  messages: m,
  usedFallback,
}: Props) {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-background-secondary)" }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-30 px-6 py-3 flex items-center gap-3"
        style={{
        background: "var(--color-background-header)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm min-w-0">
          <Link
            href="/"
            style={{ color: "var(--color-text-tertiary)", textDecoration: "none" }}
          >
            {m.lesson.breadcrumbHome}
          </Link>
          <span style={{ color: "var(--color-border-secondary)" }}>/</span>
          {moduleToCourse[meta.module] ? (
            <Link
              href={moduleToCourse[meta.module]}
              style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}
            >
              {meta.moduleTitle}
            </Link>
          ) : (
            <span style={{ color: "var(--color-text-secondary)" }}>{meta.moduleTitle}</span>
          )}
          <span style={{ color: "var(--color-border-secondary)" }}>/</span>
          <span
            className="truncate"
            style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
          >
            {meta.title}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3 flex-shrink-0">
          <LocaleSwitcher
            locale={locale}
            ariaLabel={m.localeSwitcher.aria}
            labelZh={m.localeSwitcher.zh}
            labelEn={m.localeSwitcher.en}
          />
          {/* Duration badge */}
          <span
            className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
            style={{
              background: "var(--color-background-tertiary)",
              color: "var(--color-text-secondary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {meta.duration}
          </span>

          {/* Tags */}
          {meta.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="hidden sm:block text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "var(--color-accent-light)",
                color: "var(--color-accent)",
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1120 }}>
        <div className="flex gap-12 py-10">
          {/* Left: TOC */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <TableOfContents items={toc} heading={m.lesson.tocHeading} />
          </aside>

          {/* Center: Article */}
          <main className="flex-1 min-w-0" style={{ maxWidth: 720 }}>
            {/* Article header */}
            <div className="mb-8 pb-6" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    fontWeight: 500,
                    background: "var(--color-accent-light)",
                    color: "var(--color-accent)",
                  }}
                >
                  {meta.moduleTitle}
                </span>
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {meta.duration}
                </span>
              </div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 500,
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.625rem",
                }}
              >
                {meta.title}
              </h1>
              {meta.description && (
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--color-text-secondary)" }}>
                  {meta.description}
                </p>
              )}
            </div>

            {usedFallback && (
              <div
                className="mb-8 rounded-lg px-4 py-3 text-sm"
                style={{
                  background: "var(--color-background-info)",
                  border: "0.5px solid var(--color-border-info)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {m.lesson.fallbackBanner}
              </div>
            )}

            {/* Content */}
            {children}

            {/* Footer */}
            <div
              className="mt-12 pt-6 flex items-center justify-between text-sm"
              style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }}
            >
              <span style={{ color: "var(--color-text-tertiary)" }}>{m.lesson.articleEnd}</span>
              {meta.expert && (
                <span
                  className="text-xs px-3 py-1.5 rounded-full cursor-default"
                  style={{
                    background: "var(--color-accent-light)",
                    color: "var(--color-accent)",
                    fontWeight: 500,
                  }}
                >
                  {m.lesson.expertHint(meta.expert.name)}
                </span>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Expert advisor (floating) */}
      {meta.expert && <ExpertAdvisor expert={meta.expert} ui={m.expertUi} />}
    </div>
  )
}
