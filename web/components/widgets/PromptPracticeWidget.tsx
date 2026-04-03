"use client"

import { useState } from "react"
import type { PromptPracticeConfig } from "@/lib/types"

type FeedbackState = "idle" | "loading" | "done" | "error"

export function PromptPracticeWidget({ config }: { config: PromptPracticeConfig }) {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null)
  const [userPrompt, setUserPrompt] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle")

  const handleSubmit = async () => {
    if (!userPrompt.trim()) return
    setFeedbackState("loading")
    setFeedback("")

    const scenarioContext =
      selectedScenario !== null
        ? `学生选择的场景：${config.scenarios[selectedScenario].label} — ${config.scenarios[selectedScenario].description}`
        : ""

    const userMessage = `原始提示词：${config.original}\n\n${scenarioContext}\n\n学生改写后的提示词：\n${userPrompt}`

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage }],
          systemPrompt:
            config.systemPrompt ||
            "你是一个 Prompt 工程专家，评估学生的 Prompt 改写质量，给出简洁实用的反馈，用中文回复。",
        }),
      })

      if (!res.ok || !res.body) throw new Error("请求失败")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      setFeedbackState("done")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setFeedback((prev) => prev + chunk)
      }
    } catch {
      setFeedbackState("error")
      setFeedback("获取反馈时出错，请稍后重试。")
    }
  }

  const isDisabled = !userPrompt.trim() || feedbackState === "loading"

  return (
    <div
      className="my-6 rounded-xl overflow-hidden animate-fade-in"
      style={{
        border: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-primary)",
      }}
    >
      <div className="px-5 py-4">
        {/* Header */}
        <p className="text-sm mb-1" style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
          {config.title}
        </p>
        <p className="text-sm mb-3" style={{ color: "var(--color-text-secondary)" }}>
          {config.instruction}
        </p>

        {/* Original prompt */}
        <div
          className="rounded-lg px-4 py-3 mb-4"
          style={{
            background: "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            lineHeight: 1.7,
          }}
        >
          {config.original}
        </div>

        {/* Scenario selector */}
        <p className="text-xs mb-2.5" style={{ fontWeight: 500, color: "var(--color-text-secondary)" }}>
          选择你的工作场景（影响改写思路）
        </p>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {config.scenarios.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelectedScenario(i === selectedScenario ? null : i)}
              className="flex flex-col items-start p-3 rounded-xl text-left cursor-pointer"
              style={{
                border: `0.5px solid ${
                  selectedScenario === i ? "var(--color-border-primary)" : "var(--color-border-tertiary)"
                }`,
                background:
                  selectedScenario === i ? "var(--color-accent-light)" : "var(--color-background-secondary)",
                transition: "border-color var(--transition-fast), background var(--transition-fast)",
              }}
            >
              <span className="text-xl mb-1.5">{s.emoji}</span>
              <span
                className="text-xs block"
                style={{ fontWeight: 500, color: "var(--color-text-primary)" }}
              >
                {s.label}
              </span>
              <span className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                {s.description}
              </span>
            </button>
          ))}
        </div>

        {/* Textarea */}
        <p className="text-xs mb-2" style={{ fontWeight: 500, color: "var(--color-text-secondary)" }}>
          你改写后的提示词
        </p>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder={config.placeholder}
          rows={5}
          className="w-full rounded-xl resize-none outline-none p-3.5"
          style={{
            background: "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            lineHeight: 1.7,
            transition: "border-color var(--transition-fast)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border-tertiary)")}
        />

        {/* Hint */}
        {showHint && config.hint && (
          <div
            className="mt-3 rounded-xl p-3.5 whitespace-pre-wrap animate-fade-in"
            style={{
              background: "var(--color-background-warning)",
              borderLeft: "3px solid var(--color-border-warning)",
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              lineHeight: 1.7,
            }}
          >
            <span
              className="block mb-1.5"
              style={{
                fontWeight: 500,
                color: "var(--color-text-warning)",
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
              }}
            >
              💡 参考结构
            </span>
            {config.hint}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2.5 mt-3">
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="flex-1 py-2.5 rounded-xl text-sm cursor-pointer"
            style={{
              fontWeight: 500,
              background: isDisabled ? "var(--color-background-tertiary)" : "var(--color-text-primary)",
              color: isDisabled ? "var(--color-text-tertiary)" : "var(--color-background-primary)",
              cursor: isDisabled ? "not-allowed" : "pointer",
              opacity: isDisabled ? 0.45 : 1,
              transition: "opacity var(--transition-fast)",
            }}
          >
            {feedbackState === "loading" ? "AI 评估中…" : "提交查看反馈 ↗"}
          </button>
          {config.hint && (
            <button
              onClick={() => setShowHint((v) => !v)}
              className="px-4 py-2.5 rounded-xl text-sm cursor-pointer"
              style={{
                fontWeight: 500,
                border: "0.5px solid var(--color-border-tertiary)",
                background: showHint ? "var(--color-background-secondary)" : "var(--color-background-primary)",
                color: "var(--color-text-secondary)",
                transition: "background var(--transition-fast)",
              }}
            >
              {showHint ? "收起提示" : "查看提示"}
            </button>
          )}
        </div>

        {/* Feedback output */}
        {(feedbackState === "done" || feedbackState === "error") && feedback && (
          <div
            className="mt-4 rounded-xl p-4 whitespace-pre-wrap leading-relaxed animate-fade-in"
            style={{
              background:
                feedbackState === "error"
                  ? "var(--color-background-danger)"
                  : "var(--color-background-info)",
              borderLeft: `3px solid ${
                feedbackState === "error"
                  ? "var(--color-border-danger)"
                  : "var(--color-border-info)"
              }`,
              color: "var(--color-text-primary)",
              fontSize: "13px",
              lineHeight: 1.7,
            }}
          >
            <span
              className="block mb-2"
              style={{
                fontWeight: 500,
                fontSize: "12px",
                color:
                  feedbackState === "error"
                    ? "var(--color-text-danger)"
                    : "var(--color-text-info)",
              }}
            >
              {feedbackState === "error" ? "⚠ 出错了" : "✦ AI 反馈"}
            </span>
            {feedback}
          </div>
        )}
      </div>
    </div>
  )
}
