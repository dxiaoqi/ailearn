"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Messages } from "@/lib/i18n/messages"
import type { ExpertConfig } from "@/lib/types"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Props {
  expert: ExpertConfig
  ui: Messages["expertUi"]
}

export function ExpertAdvisor({ expert, ui }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: expert.intro ?? ui.welcomeFallback(expert.name) },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: "user", content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: expert.systemPrompt,
        }),
      })

      if (!res.ok || !res.body) throw new Error(ui.errorRequest)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ""

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: "assistant", content: assistantText }
          return updated
        })
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: ui.chatErrorRetry },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, expert.systemPrompt, ui])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title={ui.floatingTitle}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all"
        style={{
          fontWeight: 500,
          background: open ? "var(--color-text-primary)" : "var(--color-accent)",
          color: "white",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          transition: "background var(--transition-fast)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M5.5 6.5C5.5 5.12 6.62 4 8 4s2.5 1.12 2.5 2.5c0 1.15-.77 2.12-1.83 2.42L8.5 10h-1V8.75C8.68 8.6 9.5 7.64 9.5 6.5 9.5 5.67 8.83 5 8 5s-1.5.67-1.5 1.5h-1z"
            fill="currentColor"
          />
          <circle cx="8" cy="12" r="0.75" fill="currentColor" />
        </svg>
        <span className="hidden sm:block">{open ? ui.collapse : expert.name}</span>
        <kbd
          className="hidden sm:flex items-center opacity-70 ml-0.5"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Bottom drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Drawer panel */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
            style={{ maxHeight: "60vh" }}
          >
            <div
              className="mx-auto rounded-t-2xl flex flex-col overflow-hidden"
              style={{
                maxWidth: 720,
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-secondary)",
                borderBottom: "none",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.10)",
                height: "60vh",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
                style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                    style={{
                      fontWeight: 500,
                      background: "var(--color-accent-light)",
                      color: "var(--color-accent)",
                    }}
                  >
                    {expert.name[0]}
                  </div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {expert.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      {ui.badge}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
                  aria-label={ui.closeDialog}
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                      style={
                        msg.role === "user"
                          ? {
                              background: "var(--color-text-primary)",
                              color: "var(--color-background-primary)",
                              borderBottomRightRadius: 6,
                            }
                          : {
                              background: "var(--color-background-secondary)",
                              color: "var(--color-text-primary)",
                              border: "0.5px solid var(--color-border-tertiary)",
                              borderBottomLeftRadius: 6,
                            }
                      }
                    >
                      {msg.content || (
                        <span
                          className="inline-block rounded-sm cursor-blink"
                          style={{
                            width: 6,
                            height: 16,
                            background: "var(--color-text-tertiary)",
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
                {loading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div
                      className="rounded-2xl px-4 py-3 flex gap-1.5 items-center"
                      style={{
                        background: "var(--color-background-secondary)",
                        border: "0.5px solid var(--color-border-tertiary)",
                        borderBottomLeftRadius: 6,
                      }}
                    >
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="rounded-full"
                          style={{
                            width: 6,
                            height: 6,
                            background: "var(--color-text-tertiary)",
                            animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div
                className="px-4 pb-4 pt-3 flex-shrink-0"
                style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }}
              >
                <div
                  className="flex items-end gap-2.5 rounded-xl px-3.5 py-2.5"
                  style={{
                    border: "0.5px solid var(--color-border-tertiary)",
                    background: "var(--color-background-secondary)",
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={ui.askPlaceholder(expert.name)}
                    rows={1}
                    className="flex-1 text-sm outline-none resize-none bg-transparent"
                    style={{ color: "var(--color-text-primary)", maxHeight: 120, lineHeight: 1.6 }}
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || loading}
                    className="flex-shrink-0 rounded-lg flex items-center justify-center cursor-pointer"
                    aria-label={ui.sendAria}
                    style={{
                      width: 32,
                      height: 32,
                      background:
                        input.trim() && !loading
                          ? "var(--color-accent)"
                          : "var(--color-background-tertiary)",
                      color:
                        input.trim() && !loading
                          ? "white"
                          : "var(--color-text-tertiary)",
                      opacity: !input.trim() || loading ? 0.55 : 1,
                      transition: "background var(--transition-fast), opacity var(--transition-fast)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M1 7h12M7 1l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-center text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>
                  {ui.shortcutHint}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
