"use client"

import type { CalloutConfig } from "@/lib/types"

const VARIANTS = {
  blue: {
    bg: "var(--color-background-info)",
    border: "var(--color-border-info)",
    text: "var(--color-text-info)",
    icon: "ℹ",
  },
  green: {
    bg: "var(--color-background-success)",
    border: "var(--color-border-success)",
    text: "var(--color-text-success)",
    icon: "✓",
  },
  amber: {
    bg: "var(--color-background-warning)",
    border: "var(--color-border-warning)",
    text: "var(--color-text-warning)",
    icon: "⚠",
  },
  red: {
    bg: "var(--color-background-danger)",
    border: "var(--color-border-danger)",
    text: "var(--color-text-danger)",
    icon: "✕",
  },
} as const

interface Props {
  config: CalloutConfig
  children?: React.ReactNode
}

export function CalloutWidget({ config, children }: Props) {
  const variant = VARIANTS[config.variant ?? "blue"]

  return (
    <div
      className="my-5 rounded-xl px-4 py-3.5 animate-fade-in"
      style={{
        background: variant.bg,
        borderLeft: `3px solid ${variant.border}`,
        border: `0.5px solid ${variant.border}`,
        borderLeftWidth: 3,
      }}
    >
      {config.title && (
        <p
          className="text-xs mb-1.5 flex items-center gap-1.5"
          style={{ fontWeight: 600, color: variant.text }}
        >
          <span>{variant.icon}</span>
          {config.title}
        </p>
      )}
      {/* Directive mode: children is rendered Markdown; JSON mode: plain string */}
      {children ? (
        <div
          className="text-sm directive-content"
          style={{ color: "var(--color-text-primary)", lineHeight: 1.7 }}
        >
          {children}
        </div>
      ) : (
        <p
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: "var(--color-text-primary)", lineHeight: 1.7 }}
        >
          {config.body}
        </p>
      )}
    </div>
  )
}
