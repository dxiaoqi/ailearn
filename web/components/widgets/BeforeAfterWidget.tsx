"use client"

import { useState } from "react"
import type { MarkdownWidgetUi } from "@/lib/i18n/messages"
import type { BeforeAfterConfig } from "@/lib/types"

export function BeforeAfterWidget({
  config,
  ui,
}: {
  config: BeforeAfterConfig
  ui: MarkdownWidgetUi["beforeAfter"]
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = config.tabs[activeIdx]

  const typeStyles = {
    good: {
      color: "var(--color-text-success)",
      bg: "var(--color-background-success)",
      border: "var(--color-border-success)",
      label: ui.tabGood,
    },
    bad: {
      color: "var(--color-text-danger)",
      bg: "var(--color-background-danger)",
      border: "var(--color-border-danger)",
      label: ui.tabBad,
    },
    neutral: {
      color: "var(--color-text-info)",
      bg: "var(--color-background-info)",
      border: "var(--color-border-info)",
      label: ui.tabNeutral,
    },
  }[active.type ?? "neutral"]

  return (
    <div
      className="my-6 rounded-xl overflow-hidden animate-fade-in"
      style={{
        border: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-primary)",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <p className="text-sm mb-0.5" style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
          {config.title}
        </p>
        {config.subtitle && (
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {config.subtitle}
          </p>
        )}

        {/* Tabs */}
        <div
          className="flex gap-1 mt-3 p-1 rounded-lg"
          style={{ background: "var(--color-background-secondary)" }}
        >
          {config.tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className="flex-1 px-3 py-1.5 rounded-md text-xs cursor-pointer transition-all"
              style={{
                fontWeight: 500,
                ...(activeIdx === i
                  ? {
                      background: "var(--color-background-primary)",
                      color: "var(--color-text-primary)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
                    }
                  : {
                      background: "transparent",
                      color: "var(--color-text-secondary)",
                    }),
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        <p className="text-xs mb-2" style={{ fontWeight: 500, color: "var(--color-text-tertiary)", letterSpacing: "0.02em" }}>
          {ui.promptHeading}
        </p>
        <div
          className="rounded-lg p-3.5 whitespace-pre-wrap"
          style={{
            background: "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            lineHeight: 1.7,
          }}
        >
          {active.prompt}
        </div>

        {/* Analysis */}
        <div
          className="mt-3 rounded-lg px-3.5 py-3"
          style={{
            borderLeft: `3px solid ${typeStyles.border}`,
            background: typeStyles.bg,
            color: "var(--color-text-secondary)",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          <span className="text-xs mr-1.5" style={{ fontWeight: 500, color: typeStyles.color }}>
            {typeStyles.label}
          </span>
          {active.analysis}
        </div>
      </div>
    </div>
  )
}
