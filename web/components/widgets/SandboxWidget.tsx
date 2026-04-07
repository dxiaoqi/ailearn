"use client"

import { useState, useCallback, useMemo } from "react"
import type { MarkdownWidgetUi } from "@/lib/i18n/messages"
import type { SandboxConfig, SandboxMetric } from "@/lib/types"

// ── Safe expression evaluator ──────────────────────────────────────
// expr is author-controlled (from lesson JSON config), not user input.
function evalExpr(expr: string, vars: Record<string, number>): number {
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function(...Object.keys(vars), `"use strict"; return (${expr})`)
    return fn(...Object.values(vars)) as number
  } catch {
    return 0
  }
}

// ── Value formatter ────────────────────────────────────────────────
function fmtVal(val: number, fmt?: string, minSuffix = " min"): string {
  if (!fmt || fmt === "auto") {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
    if (val >= 10_000)    return `${(val / 1_000).toFixed(0)}k`
    if (val >= 100)       return val.toFixed(0)
    if (val >= 10)        return val.toFixed(1)
    return val.toFixed(2)
  }
  if (fmt === "k")    return `${(val / 1_000).toFixed(1)}k`
  if (fmt === "M")    return `${(val / 1_000_000).toFixed(2)}M`
  if (fmt === "$")    return `$${val.toFixed(3)}`
  if (fmt === "%")    return `${val.toFixed(1)}%`
  if (fmt === "s")    return `${val.toFixed(0)}s`
  if (fmt === "min") return `${(val / 60).toFixed(1)}${minSuffix}`
  return val.toFixed(+fmt || 0)
}

// ── Color by warn/danger thresholds ───────────────────────────────
function metricColor(val: number, m: SandboxMetric): string {
  if (m.dangerAbove !== undefined && val > m.dangerAbove) return "var(--color-text-danger)"
  if (m.warnAbove   !== undefined && val > m.warnAbove)   return "var(--color-text-warning)"
  return "var(--color-text-primary)"
}

export function SandboxWidget({
  config,
  ui,
}: {
  config: SandboxConfig
  ui: MarkdownWidgetUi["sandbox"]
}) {
  // Build initial slider values from defaults
  const [sliders, setSliders] = useState<Record<string, number>>(() =>
    Object.fromEntries(config.params.map((p) => [p.id, p.default]))
  )
  const [checks, setChecks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries((config.checkboxes ?? []).map((c) => [c.id, c.default ?? false]))
  )

  const setSlider = useCallback((id: string, val: number) => {
    setSliders((prev) => ({ ...prev, [id]: val }))
  }, [])

  const toggleCheck = useCallback((id: string) => {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  // Compute metric values from current sliders + checkboxes
  const vars = useMemo(() => ({ ...sliders, ...Object.fromEntries(Object.entries(checks).map(([k, v]) => [k, v ? 1 : 0])) }), [sliders, checks])
  const metricValues = useMemo(() =>
    config.metrics.map((m) => ({ ...m, computed: evalExpr(m.expr, vars) })),
    [config.metrics, vars]
  )

  // Optional growth bar
  const growthRows = useMemo(() => {
    if (!config.growth) return null
    const { steps, labelExpr, valueExpr, maxExpr } = config.growth
    const minSfx = ui.minutesSuffix
    const stepCount = Math.min(Math.round(evalExpr(steps, vars)), 12)
    const maxVal = evalExpr(maxExpr, vars)
    return Array.from({ length: stepCount }, (_, i) => {
      const stepVars = { ...vars, i: i + 1 }
      const val = evalExpr(valueExpr, stepVars)
      const pct = maxVal > 0 ? Math.min((val / maxVal) * 100, 100) : 0
      const label = evalExpr(labelExpr, stepVars)
      return {
        label: String(Math.round(label)),
        val: fmtVal(val, config.growth!.fmt, minSfx),
        pct,
      }
    })
  }, [config.growth, vars, ui.minutesSuffix])

  return (
    <div
      className="my-6 rounded-xl overflow-hidden animate-fade-in"
      style={{
        border: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-primary)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3.5 flex items-center gap-2"
        style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}
      >
        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>⊟</span>
        <p className="text-sm" style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
          {config.title ?? ui.defaultTitle}
        </p>
        {config.hint && (
          <p className="text-xs ml-auto" style={{ color: "var(--color-text-tertiary)" }}>{config.hint}</p>
        )}
      </div>

      <div className="px-5 py-4 flex flex-col gap-5">
        {/* Two-column: sliders | metrics */}
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: config.metrics.length ? "1fr 1fr" : "1fr" }}
        >
          {/* Sliders */}
          <div className="flex flex-col gap-4">
            {config.params.map((p) => (
              <div key={p.id} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <span
                    className="text-xs"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", fontWeight: 500 }}
                  >
                    {p.label}
                  </span>
                  <span
                    className="text-sm"
                    style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--color-text-primary)" }}
                  >
                    {fmtVal(sliders[p.id], p.fmt, ui.minutesSuffix)}
                  </span>
                </div>
                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step ?? 1}
                  value={sliders[p.id]}
                  onChange={(e) => setSlider(p.id, +e.target.value)}
                  style={{ width: "100%", accentColor: "var(--color-accent)", cursor: "pointer" }}
                />
                {p.hint && (
                  <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{p.hint}</p>
                )}
              </div>
            ))}

            {/* Checkboxes */}
            {(config.checkboxes ?? []).map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 text-xs cursor-pointer select-none"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <input
                  type="checkbox"
                  checked={checks[c.id] ?? false}
                  onChange={() => toggleCheck(c.id)}
                  style={{ accentColor: "var(--color-accent)", cursor: "pointer" }}
                />
                {c.label}
                {c.hint && (
                  <span style={{ color: "var(--color-text-tertiary)", marginLeft: 2 }}>{c.hint}</span>
                )}
              </label>
            ))}
          </div>

          {/* Metrics grid */}
          {config.metrics.length > 0 && (
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: "repeat(2, 1fr)", alignContent: "start" }}
            >
              {metricValues.map((m, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3 flex flex-col items-center justify-center text-center"
                  style={{ background: "var(--color-background-secondary)" }}
                >
                  <span
                    className="text-xl leading-none mb-1"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      color: metricColor(m.computed, m),
                      transition: "color var(--transition-fast)",
                    }}
                  >
                    {fmtVal(m.computed, m.fmt, ui.minutesSuffix)}
                  </span>
                  <span className="text-xs leading-snug" style={{ color: "var(--color-text-tertiary)" }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Growth bars */}
        {growthRows && growthRows.length > 0 && (
          <div className="flex flex-col gap-1">
            <p
              className="text-xs mb-2"
              style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}
            >
              {config.growth!.title ?? ui.growthDefaultTitle}
            </p>
            {growthRows.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="text-xs text-right"
                  style={{ minWidth: 28, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}
                >
                  {r.label}
                </span>
                <div
                  className="flex-1 rounded-full overflow-hidden"
                  style={{ height: 5, background: "var(--color-background-tertiary)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${r.pct}%`,
                      background: r.pct > 80 ? "var(--color-text-danger)" : r.pct > 50 ? "var(--color-text-warning)" : "var(--color-accent)",
                      transition: "width var(--transition-slow)",
                    }}
                  />
                </div>
                <span
                  className="text-xs"
                  style={{ minWidth: 40, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}
                >
                  {r.val}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
