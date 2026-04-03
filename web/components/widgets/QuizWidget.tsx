"use client"

import { useState } from "react"
import type { QuizConfig } from "@/lib/types"

export function QuizWidget({ config }: { config: QuizConfig }) {
  const [answers, setAnswers] = useState<Record<string, Set<number>>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})

  const handleSelect = (qId: string, optIdx: number, type: "single" | "multiple") => {
    if (submitted[qId]) return
    setAnswers((prev) => {
      const cur = new Set(prev[qId] ?? [])
      if (type === "single") {
        return { ...prev, [qId]: new Set([optIdx]) }
      } else {
        cur.has(optIdx) ? cur.delete(optIdx) : cur.add(optIdx)
        return { ...prev, [qId]: cur }
      }
    })
  }

  const handleSubmit = (qId: string) => {
    if (!answers[qId]?.size) return
    setSubmitted((prev) => ({ ...prev, [qId]: true }))
  }

  const getScore = (qId: string, opts: QuizConfig["questions"][number]["options"]) => {
    const sel = answers[qId] ?? new Set()
    const correctIdxs = opts.reduce<number[]>((acc, o, i) => (o.correct ? [...acc, i] : acc), [])
    const isCorrect =
      sel.size === correctIdxs.length && correctIdxs.every((i) => sel.has(i))
    return isCorrect
  }

  const totalQuestions = config.questions.length
  const doneCount = Object.keys(submitted).length
  const correctCount = config.questions.filter(
    (q) => submitted[q.id] && getScore(q.id, q.options)
  ).length

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
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}
      >
        <div>
          <p className="text-sm" style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
            {config.title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            {totalQuestions} 题 · {config.questions.some((q) => q.type === "multiple") ? "含多选" : "单选"}
          </p>
        </div>
        {doneCount > 0 && (
          <div
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
            style={{
              background: correctCount === doneCount ? "var(--color-background-success)" : "var(--color-background-warning)",
              color: correctCount === doneCount ? "var(--color-text-success)" : "var(--color-text-warning)",
              fontWeight: 500,
            }}
          >
            <span>{correctCount} / {doneCount} 正确</span>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="px-5 py-4 flex flex-col gap-6">
        {config.questions.map((q, qi) => {
          const sel = answers[q.id] ?? new Set<number>()
          const isDone = submitted[q.id] ?? false
          const isCorrect = isDone && getScore(q.id, q.options)

          return (
            <div key={q.id}>
              {/* Question text */}
              <p className="text-sm mb-3 leading-relaxed" style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                <span
                  className="text-xs mr-2 px-1.5 py-0.5 rounded"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "var(--color-background-tertiary)",
                    color: "var(--color-text-tertiary)",
                    fontWeight: 400,
                  }}
                >
                  Q{qi + 1}
                </span>
                {q.text}
                {q.type === "multiple" && (
                  <span className="text-xs ml-2" style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>
                    （多选）
                  </span>
                )}
              </p>

              {/* Options */}
              <div className="flex flex-col gap-2">
                {q.options.map((opt, oi) => {
                  const isSelected = sel.has(oi)
                  let bg = "var(--color-background-secondary)"
                  let border = "var(--color-border-tertiary)"
                  let textColor = "var(--color-text-primary)"
                  let indicator = null

                  if (isDone) {
                    if (opt.correct) {
                      bg = "var(--color-background-success)"
                      border = "var(--color-border-success)"
                      textColor = "var(--color-text-success)"
                      indicator = <span className="ml-auto text-xs font-medium" style={{ color: "var(--color-text-success)" }}>✓ 正确</span>
                    } else if (isSelected && !opt.correct) {
                      bg = "var(--color-background-danger)"
                      border = "var(--color-border-danger)"
                      textColor = "var(--color-text-danger)"
                      indicator = <span className="ml-auto text-xs font-medium" style={{ color: "var(--color-text-danger)" }}>✕</span>
                    } else {
                      textColor = "var(--color-text-tertiary)"
                    }
                  } else if (isSelected) {
                    bg = "var(--color-accent-light)"
                    border = "var(--color-accent)"
                  }

                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(q.id, oi, q.type)}
                      disabled={isDone}
                      className="flex items-start gap-3 text-left px-4 py-3 rounded-xl text-sm leading-relaxed"
                      style={{
                        background: bg,
                        border: `0.5px solid ${border}`,
                        color: textColor,
                        cursor: isDone ? "default" : "pointer",
                        transition: "all var(--transition-fast)",
                        fontFamily: "inherit",
                        width: "100%",
                      }}
                    >
                      {/* Checkbox / radio indicator */}
                      <div
                        className="flex-shrink-0 flex items-center justify-center"
                        style={{
                          width: 18,
                          height: 18,
                          marginTop: 1,
                          borderRadius: q.type === "single" ? "50%" : "var(--radius-sm)",
                          border: `1.5px solid ${isSelected || (isDone && opt.correct) ? "currentColor" : "var(--color-border-secondary)"}`,
                          background: isSelected || (isDone && opt.correct) ? "currentColor" : "transparent",
                          flexShrink: 0,
                          transition: "all var(--transition-fast)",
                        }}
                      >
                        {(isSelected || (isDone && opt.correct)) && (
                          <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                            <path d="M1 3.5L3 5.5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="flex-1">{opt.text}</span>
                      {indicator}
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {isDone && q.explanation && (
                <div
                  className="mt-3 px-4 py-3 rounded-xl text-sm leading-relaxed animate-fade-in"
                  style={{
                    background: isCorrect ? "var(--color-background-info)" : "var(--color-background-warning)",
                    borderLeft: `3px solid ${isCorrect ? "var(--color-border-info)" : "var(--color-border-warning)"}`,
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  <span
                    className="block text-xs mb-1"
                    style={{
                      fontWeight: 600,
                      color: isCorrect ? "var(--color-text-info)" : "var(--color-text-warning)",
                    }}
                  >
                    {isCorrect ? "✓ 回答正确" : "解析"}
                  </span>
                  {q.explanation}
                </div>
              )}

              {/* Submit button */}
              {!isDone && sel.size > 0 && (
                <button
                  onClick={() => handleSubmit(q.id)}
                  className="mt-3 px-4 py-2 rounded-xl text-xs cursor-pointer"
                  style={{
                    fontWeight: 500,
                    background: "var(--color-text-primary)",
                    color: "var(--color-background-primary)",
                    border: "none",
                    transition: "opacity var(--transition-fast)",
                    fontFamily: "inherit",
                  }}
                >
                  确认答案
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* All-correct banner */}
      {doneCount === totalQuestions && correctCount === totalQuestions && (
        <div
          className="mx-5 mb-5 px-4 py-3 rounded-xl text-center text-sm animate-fade-in"
          style={{
            background: "var(--color-background-success)",
            border: "0.5px solid var(--color-border-success)",
            color: "var(--color-text-success)",
            fontWeight: 500,
          }}
        >
          全部答对！
        </div>
      )}
    </div>
  )
}
