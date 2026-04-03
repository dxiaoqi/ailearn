"use client"

import { useState } from "react"
import type { ScenarioEvalConfig } from "@/lib/types"

interface EvalDim  { name: string; score: number; comment: string }
interface EvalResult {
  verdict: string
  score: number
  reason: string
  dimensions: EvalDim[]
  suggestion?: string
}

const VERDICT_COLORS: Record<string, { fg: string; bg: string }> = {
  "非常适合": { fg: "var(--color-text-success)", bg: "var(--color-background-success)" },
  "适合":     { fg: "var(--color-text-success)", bg: "var(--color-background-success)" },
  "部分适合": { fg: "var(--color-text-warning)", bg: "var(--color-background-warning)" },
  "不适合":   { fg: "var(--color-text-danger)",  bg: "var(--color-background-danger)" },
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

function buildPrompt(input: string, config: ScenarioEvalConfig): string {
  const dims = (config.dimensions ?? ["重复性", "可分解性", "可验证性", "数据可获取性"])
    .map((d) => `{"name": "${d}", "score": 0-100, "comment": "25字内"}`)
    .join(",\n    ")

  const base = config.systemPrompt
    ? `${config.systemPrompt}\n\n学员描述的场景：「${input}」\n\n`
    : `你是 AI 课程导师。学员描述了以下工作场景：「${input}」\n\n`

  return (
    base +
    `请只输出 JSON，不要有任何其他内容：
{
  "verdict": "非常适合" | "适合" | "部分适合" | "不适合",
  "score": 0-100,
  "reason": "30字内说明主要理由",
  "dimensions": [
    ${dims}
  ],
  "suggestion": "最重要的一条改造建议，30字内"
}`
  )
}

interface Props {
  config: ScenarioEvalConfig
  children?: React.ReactNode
}

export function ScenarioEvalWidget({ config, children }: Props) {
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

    const prompt = buildPrompt(text, config)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          systemPrompt: "你是 AI 场景评估助手。只输出 JSON，不要有任何其他文字。",
        }),
      })

      if (!res.ok || !res.body) throw new Error("请求失败")

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

  const vc = result ? VERDICT_COLORS[result.verdict] ?? { fg: "var(--color-text-primary)", bg: "var(--color-background-secondary)" } : null
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
          {config.title ?? "AI 场景适配评估"}
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
            描述你的工作场景
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={config.placeholder ?? "例如：我每天需要……"}
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
          {status === "loading" ? "评估中…" : (config.buttonLabel ?? "✦ AI 评估适配度")}
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
            评估失败：{errMsg || "请稍后重试"}
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
                  改造建议
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
