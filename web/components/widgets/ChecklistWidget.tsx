"use client"

import { useState, useEffect } from "react"
import type { MarkdownWidgetUi } from "@/lib/i18n/messages"
import type { ChecklistConfig } from "@/lib/types"

export function ChecklistWidget({
  config,
  ui,
}: {
  config: ChecklistConfig
  ui: MarkdownWidgetUi["checklist"]
}) {
  const [checked, setChecked] = useState<boolean[]>(() => new Array(config.items.length).fill(false))

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`checklist:${config.id}`)
      if (saved) setChecked(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [config.id])

  const toggle = (i: number) => {
    const next = checked.map((v, idx) => (idx === i ? !v : v))
    setChecked(next)
    try {
      localStorage.setItem(`checklist:${config.id}`, JSON.stringify(next))
    } catch { /* ignore */ }
  }

  const doneCount = checked.filter(Boolean).length
  const total = config.items.length
  const allDone = doneCount === total

  return (
    <div
      className="my-6 rounded-xl overflow-hidden animate-fade-in"
      style={{
        border: `0.5px solid ${allDone ? "var(--color-border-success)" : "var(--color-border-tertiary)"}`,
        background: allDone ? "var(--color-background-success)" : "var(--color-background-primary)",
        transition: "background var(--transition-normal), border-color var(--transition-normal)",
      }}
    >
      <div className="px-5 py-4">
        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm" style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
            {config.title}
          </p>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              fontWeight: 500,
              background: allDone ? "var(--color-text-success)" : "var(--color-background-secondary)",
              color: allDone ? "var(--color-background-primary)" : "var(--color-text-tertiary)",
              border: allDone ? "none" : "0.5px solid var(--color-border-tertiary)",
            }}
          >
            {doneCount} / {total}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="w-full mb-4 rounded-full overflow-hidden"
          style={{ height: 6, background: "var(--color-background-tertiary)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${(doneCount / total) * 100}%`,
              background: allDone ? "var(--color-text-success)" : "var(--color-text-primary)",
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {/* Items */}
        <ul className="space-y-2.5">
          {config.items.map((item, i) => (
            <li
              key={i}
              onClick={() => toggle(i)}
              className="flex items-start gap-3 cursor-pointer"
            >
              {/* Checkbox */}
              <div
                className="flex-shrink-0 flex items-center justify-center"
                style={{
                  width: 18,
                  height: 18,
                  marginTop: 2,
                  border: checked[i] ? "none" : "1.5px solid var(--color-border-secondary)",
                  background: checked[i] ? "var(--color-text-success)" : "transparent",
                  borderRadius: "var(--radius-sm)",
                  transition: "all var(--transition-fast)",
                }}
              >
                {checked[i] && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                className="text-sm leading-snug select-none"
                style={{
                  color: checked[i] ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
                  textDecoration: checked[i] ? "line-through" : "none",
                  transition: "all var(--transition-normal)",
                }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>

        {allDone && (
          <div
            className="mt-4 text-sm text-center py-2 rounded-lg animate-fade-in"
            style={{
              fontWeight: 500,
              color: "var(--color-text-success)",
              background: "rgba(39,80,10,0.06)",
            }}
          >
            {ui.allDone}
          </div>
        )}
      </div>
    </div>
  )
}
