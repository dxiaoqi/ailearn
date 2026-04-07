"use client"

import { useState, useRef, useEffect } from "react"
import type { MarkdownWidgetUi } from "@/lib/i18n/messages"
import type { AiChatConfig } from "@/lib/types"

type Role = "user" | "assistant"
interface Msg { role: Role; content: string }

interface Props {
  config: AiChatConfig
  children?: React.ReactNode
  ui: MarkdownWidgetUi["aiChat"]
}

export function AiChatWidget({ config, children, ui }: Props) {
  // `children` (directive mode) or `config.welcome` (JSON mode) seeds the first bubble
  const hasWelcome = !!(children || config.welcome)
  const [history, setHistory] = useState<Msg[]>(() =>
    // Store welcome text only for history purposes (not sent to API)
    config.welcome ? [{ role: "assistant", content: config.welcome }] : []
  )
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const msgsRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }
  }, [history])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput("")

    // Build messages for API — exclude the welcome message (role: assistant, first item)
    const apiHistory = history.filter(
      (m, i) => !(i === 0 && m.role === "assistant" && m.content === config.welcome)
    )

    const newHistory: Msg[] = [...history, { role: "user", content: text }]
    setHistory([...newHistory, { role: "assistant", content: "" }])
    setLoading(true)

    const apiMessages = [
      ...apiHistory,
      { role: "user", content: text },
    ]

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt: config.systemPrompt ?? ui.defaultSystemPrompt,
          ...(config.maxTokens ? { maxTokens: config.maxTokens } : {}),
        }),
      })

      if (!res.ok || !res.body) throw new Error(ui.requestFailed)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setHistory((prev) => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last?.role === "assistant") {
            next[next.length - 1] = { ...last, content: last.content + chunk }
          }
          return next
        })
      }
    } catch {
      setHistory((prev) => {
        const next = [...prev]
        const last = next[next.length - 1]
        if (last?.role === "assistant" && last.content === "") {
          next[next.length - 1] = { ...last, content: ui.connectionError }
        }
        return next
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

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
        <span className="text-xs ml-auto" style={{ color: "var(--color-text-tertiary)" }}>
          {config.hint ?? ui.defaultHint}
        </span>
      </div>

      {/* Messages */}
      <div
        ref={msgsRef}
        className="flex flex-col gap-3 px-4 py-4 overflow-y-auto"
        style={{ maxHeight: config.maxHeight ?? 280 }}
      >
        {/* Directive-mode welcome bubble (rendered Markdown children) */}
        {children && (
          <div className="flex gap-2.5">
            <div
              className="flex-shrink-0 flex items-center justify-center text-xs rounded-full"
              style={{ width: 24, height: 24, marginTop: 2, background: "var(--color-accent-light)", color: "var(--color-accent)", fontWeight: 600 }}
            >✦</div>
            <div
              className="px-3 py-2.5 rounded-2xl text-sm"
              style={{
                maxWidth: "80%",
                background: "var(--color-background-secondary)",
                color: "var(--color-text-primary)",
                borderRadius: "4px 16px 16px 16px",
                lineHeight: 1.65,
              }}
            >
              {children}
            </div>
          </div>
        )}
        {/* JSON-mode or subsequent chat history */}
        {history.filter((_, i) => !(i === 0 && hasWelcome && children)).map((msg, i) => (
          <div
            key={i}
            className="flex gap-2.5"
            style={{ flexDirection: msg.role === "user" ? "row-reverse" : "row" }}
          >
            {/* Avatar */}
            <div
              className="flex-shrink-0 flex items-center justify-center text-xs rounded-full"
              style={{
                width: 24,
                height: 24,
                marginTop: 2,
                background: msg.role === "user" ? "var(--color-background-success)" : "var(--color-accent-light)",
                color: msg.role === "user" ? "var(--color-text-success)" : "var(--color-accent)",
                fontWeight: 600,
              }}
            >
              {msg.role === "user" ? "U" : "✦"}
            </div>
            {/* Bubble */}
            <div
              className="px-3 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={{
                maxWidth: "80%",
                background: msg.role === "user" ? "var(--color-text-primary)" : "var(--color-background-secondary)",
                color: msg.role === "user" ? "var(--color-background-primary)" : "var(--color-text-primary)",
                borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                lineHeight: 1.65,
              }}
            >
              {msg.content || (
                // Typing indicator
                <span className="flex gap-1 items-center py-1">
                  {[0, 1, 2].map((n) => (
                    <span
                      key={n}
                      className="inline-block rounded-full"
                      style={{
                        width: 5,
                        height: 5,
                        background: "var(--color-text-tertiary)",
                        animation: `typingPulse 1.2s infinite ${n * 0.2}s`,
                      }}
                    />
                  ))}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input row */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderTop: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={config.placeholder ?? ui.defaultPlaceholder}
          disabled={loading}
          className="flex-1 text-sm outline-none px-3 py-1.5 rounded-full"
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            color: "var(--color-text-primary)",
            fontFamily: "inherit",
            transition: "border-color var(--transition-fast)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border-tertiary)")}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="flex items-center justify-center rounded-full text-sm flex-shrink-0"
          style={{
            width: 32,
            height: 32,
            background: !input.trim() || loading ? "var(--color-background-tertiary)" : "var(--color-text-primary)",
            color: !input.trim() || loading ? "var(--color-text-tertiary)" : "var(--color-background-primary)",
            border: "none",
            cursor: !input.trim() || loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            transition: "all var(--transition-fast)",
          }}
        >
          ↑
        </button>
      </div>

      <style>{`
        @keyframes typingPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
