"use client"

import { useState } from "react"
import type { MarkdownWidgetUi } from "@/lib/i18n/messages"
import type { ScenarioEvalConfig } from "@/lib/types"

interface EvalDim  { name: string; score: number; comment: string }
interface EvalResult {
  verdict: string
  score: number
  reason: string
  dimensions: EvalDim[]
  suggestion?: string
}

function verdictBadge(verdict: string, ui: MarkdownWidgetUi["scenarioEval"]) {
  const opts: readonly string[] = ui.verdictOptions
  const i = opts.indexOf(verdict)
  if (i === 0 || i === 1) {
    return { fg: "var(--color-text-success)", bg: "var(--color-background-success)" }
  }
  if (i === 2) {
    return { fg: "var(--color-text-warning)", bg: "var(--color-background-warning)" }
  }
  return { fg: "var(--color-text-danger)", bg: "var(--color-background-danger)" }
}

function scoreColor(score: number) {
  if (score >= 70) return "var(--color-text-success)"
  if (score >= 40) return "var(--color-text-warning)"
  return "var(--color-text-danger)"
}
function scoreBg(score: number) {
  if (score >= 70) return "var(--color-background-success)"
  if (score >= 40) return "var(--color-background-warning)"
  return "var(--color-background-danger)"
}

function buildPrompt(
  input: string,
  config: ScenarioEvalConfig,
  ui: MarkdownWidgetUi["scenarioEval"]
): string {
  const dimensions = config.dimensions ?? [...ui.defaultDimensions]
  const dims = dimensions
    .map(
      (d) =>
        `    {"name": ${JSON.stringify(d)}, "score": 0-100, "comment": ${JSON.stringify(ui.dimensionCommentGuide)}}`
    )
    .join(",\n")

  const base = config.systemPrompt
    ? `${config.systemPrompt}${ui.withSystemSceneBlock.replace("{input}", input)}`
    : ui.noSystemSceneBlock.replace("{input}", input)

  const verdictUnion = ui.verdictOptions.map((v) => JSON.stringify(v)).join(" | ")

  return `${base}${ui.jsonOnlyLead}{
  "verdict": ${verdictUnion},
  "score": 0-100,
  "reason": ${JSON.stringify(ui.reasonFieldGuide)},
  "dimensions": [
${dims}
  ],
  "suggestion": ${JSON.stringify(ui.suggestionFieldGuide)}
}`
}

interface Props {
  config: ScenarioEvalConfig
  children?: React.ReactNode
  ui: MarkdownWidgetUi["scenarioEval"]
}

export function ScenarioEvalWidget({ config, children, ui }: Props) {
  const [input, setInput]   = useState("")
  const [result, setResult] = useState<EvalResult | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [errMsg, setErrMsg] = useState("")

  const run = async () => {
    const text = input.trim()
    if (!text || status === "loading") return
    setStatus("loading")
    setResult(null)
    setErrMsg("")

    const prompt = buildPrompt(text, config, ui)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          systemPrompt: ui.apiSystemPrompt,
        }),
      })

      if (!res.ok || !res.body) throw new Error(ui.requestFailed)

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let raw = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        raw += decoder.decode(value, { stream: true })
      }

      // Extract JSON from potential markdown fences
      const jsonStr = raw.replace(/```json|```/g, "").trim()
      const parsed = JSON.parse(jsonStr) as EvalResult
      setResult(parsed)
      setStatus("idle")
    } catch (e) {
      setStatus("error")
      setErrMsg(String(e))
    }
  }

  const vc = result ? verdictBadge(result.verdict, ui) : null
  const circumference = 2 * Math.PI * 20

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
        <span style={{ color: "var(--color-accent)", fontSize: 14, fontWeight: 600 }}>✦</span>
        <p className="text-sm" style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
          {config.title ?? ui.defaultTitle}
        </p>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Description: directive children (Markdown) or JSON string */}
        {children ? (
          <div className="text-sm directive-content" style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
            {children}
          </div>
        ) : config.description ? (
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
            {config.description}
          </p>
        ) : null}

        {/* Textarea */}
        <div className="flex flex-col gap-2">
          <label className="text-xs" style={{ fontWeight: 500, color: "var(--color-text-secondary)" }}>
            {ui.sceneLabel}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={config.placeholder ?? ui.defaultPlaceholder}
            rows={3}
            className="w-full rounded-xl resize-none outline-none px-4 py-3 text-sm"
            style={{
              background: "var(--color-background-secondary)",
              border: "0.5px solid var(--color-border-tertiary)",
              color: "var(--color-text-primary)",
              lineHeight: 1.6,
              fontFamily: "inherit",
              transition: "border-color var(--transition-fast)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border-tertiary)")}
          />
        </div>

        {/* Submit button */}
        <button
          onClick={run}
          disabled={!input.trim() || status === "loading"}
          className="self-start px-5 py-2.5 rounded-xl text-sm cursor-pointer"
          style={{
            fontWeight: 500,
            background: !input.trim() || status === "loading" ? "var(--color-background-tertiary)" : "var(--color-text-primary)",
            color: !input.trim() || status === "loading" ? "var(--color-text-tertiary)" : "var(--color-background-primary)",
            border: "none",
            cursor: !input.trim() || status === "loading" ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            transition: "all var(--transition-fast)",
          }}
        >
          {status === "loading" ? ui.evaluating : (config.buttonLabel ?? ui.defaultButton)}
        </button>

        {/* Error */}
        {status === "error" && (
          <div
            className="px-4 py-3 rounded-xl text-sm animate-fade-in"
            style={{
              background: "var(--color-background-danger)",
              borderLeft: "3px solid var(--color-border-danger)",
              color: "var(--color-text-danger)",
            }}
          >
            {ui.errorPrefix}
            {errMsg || ui.retryHint}
          </div>
        )}

        {/* Result */}
        {result && vc && (
          <div
            className="rounded-xl overflow-hidden animate-fade-in"
            style={{ border: "0.5px solid var(--color-border-tertiary)" }}
          >
            {/* Score header */}
            <div
              className="flex items-center gap-4 px-5 py-4"
              style={{ background: vc.bg }}
            >
              {/* SVG score ring */}
              <svg width="52" height="52" viewBox="0 0 48 48" className="flex-shrink-0">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3"/>
                <circle
                  cx="24" cy="24" r="20" fill="none"
                  stroke={vc.fg}
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - result.score / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                  style={{ transition: "stroke-dashoffset var(--transition-slow)" }}
                />
                <text
                  x="24" y="29"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill={vc.fg}
                  fontFamily="var(--font-mono)"
                >
                  {result.score}
                </text>
              </svg>
              <div>
                <p className="text-sm font-semibold" style={{ color: vc.fg }}>{result.verdict}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {result.reason}
                </p>
              </div>
            </div>

            {/* Dimensions */}
            {result.dimensions?.length > 0 && (
              <div className="flex flex-col gap-2 px-5 py-4">
                {result.dimensions.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: "var(--color-background-secondary)" }}
                  >
                    <p className="text-xs font-medium flex-shrink-0" style={{ color: "var(--color-text-secondary)", minWidth: 60, marginTop: 1 }}>
                      {d.name}
                    </p>
                    <p className="text-xs flex-1 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      {d.comment}
                    </p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        fontWeight: 600,
                        fontFamily: "var(--font-mono)",
                        background: scoreBg(d.score),
                        color: scoreColor(d.score),
                      }}
                    >
                      {d.score}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Suggestion */}
            {result.suggestion && (
              <div
                className="mx-5 mb-5 px-4 py-3 rounded-xl text-sm leading-relaxed"
                style={{
                  background: "var(--color-background-info)",
                  borderLeft: "3px solid var(--color-border-info)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <span className="block text-xs font-semibold mb-1" style={{ color: "var(--color-text-info)" }}>
                  {ui.suggestionHeading}
                </span>
                {result.suggestion}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
