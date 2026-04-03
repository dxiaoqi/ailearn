"use client"

import React, { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkDirective from "remark-directive"
import rehypeSlug from "rehype-slug"
import { WidgetRenderer } from "@/components/widgets/WidgetRenderer"
import { remarkDirectiveWidgets } from "@/lib/remarkDirectiveWidgets"
import type { Components } from "react-markdown"

interface Props {
  content: string
}

// Rehype plugin: stamps data-block="true" on every <code> that is a direct
// child of a <pre> node. This runs inside unified (before React renders),
// so the attribute is present on both the SSR pass and the client pass —
// giving the code component a reliable, prop-based signal with zero
// React-runtime ambiguity.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rehypeMarkBlockCode() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walk = (node: any) => {
      if (node.type === "element" && node.tagName === "pre") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const child of (node.children ?? []) as any[]) {
          if (child.type === "element" && child.tagName === "code") {
            child.properties = child.properties ?? {}
            child.properties["data-block"] = "true"
          }
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const child of (node.children ?? []) as any[]) {
        walk(child)
      }
    }
    walk(tree)
  }
}

// rehype-slug runs first so headings get their id attributes, then
// rehypeMarkBlockCode stamps data-block on fenced code elements.
const rehypePlugins = [rehypeSlug, rehypeMarkBlockCode] as const

// remark-directive must run before remarkDirectiveWidgets so that
// :::name{} syntax is parsed into containerDirective AST nodes first.
const remarkPlugins = [remarkGfm, remarkDirective, remarkDirectiveWidgets] as const

const components: Components = {
  // ── Headings with anchor IDs ──────────────────────────────────
  // id is injected by rehype-slug (same github-slugger algorithm as toc.ts)
  h1: ({ id, children }) => (
    <h1
      id={id}
      style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.3, letterSpacing: "-0.01em", margin: "0 0 0.75rem", color: "var(--color-text-primary)" }}
    >
      {children}
    </h1>
  ),
  h2: ({ id, children }) => (
    <h2
      id={id}
      className="scroll-mt-6"
      style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.4, margin: "2.5rem 0 0.875rem", paddingBottom: "0.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)", color: "var(--color-text-primary)" }}
    >
      {children}
    </h2>
  ),
  h3: ({ id, children }) => (
    <h3
      id={id}
      className="scroll-mt-6"
      style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.4, margin: "1.75rem 0 0.5rem", color: "var(--color-text-primary)" }}
    >
      {children}
    </h3>
  ),

  // ── Pre: transparent pass-through ────────────────────────────
  // The code component handles all block-code rendering (including the outer
  // wrapper). Pre just needs to dissolve so its child code component can
  // render at the right place in the DOM.
  pre: ({ children }) => <>{children}</>,

  // ── Code: block code (data-block="true") AND inline code ─────
  // data-block is stamped by the rehype plugin above — it exists on both
  // the server HTML and the client React tree, so hydration always matches.
  code({ className, children, ...rest }) {
    const isBlock = (rest as Record<string, unknown>)["data-block"] === "true"

    if (isBlock) {
      const rawText = (Array.isArray(children) ? children.join("") : String(children ?? "")).trim()

      // Widget protocol: ```widget:type
      const widgetMatch = /^language-widget:(.+)$/.exec(className ?? "")
      if (widgetMatch) {
        const widgetType = widgetMatch[1].trim()
        try {
          return <WidgetRenderer type={widgetType} config={JSON.parse(rawText)} />
        } catch (err) {
          return (
            <div
              className="my-4 rounded-lg px-4 py-3 text-xs whitespace-pre-wrap"
              style={{
                fontFamily: "var(--font-mono)",
                background: "var(--color-background-danger)",
                border: "0.5px solid var(--color-border-danger)",
                color: "var(--color-text-danger)",
              }}
            >
              <strong>Widget parse error ({widgetType}):</strong>{"\n"}{String(err)}{"\n\n"}
              <span style={{ opacity: 0.6 }}>Raw:{"\n"}{rawText.slice(0, 300)}</span>
            </div>
          )
        }
      }

      // Fenced block code (with or without language tag)
      const lang = /^language-(.+)$/.exec(className ?? "")?.[1] ?? ""
      return (
        <div
          className="my-5 rounded-xl"
          style={{
            border: "0.5px solid var(--color-border-tertiary)",
            overflow: "clip",
          }}
        >
          {lang && (
            <div
              className="flex items-center gap-1.5 px-4 py-2 text-xs"
              style={{
                fontFamily: "var(--font-mono)",
                background: "var(--color-background-tertiary)",
                color: "var(--color-text-tertiary)",
                borderBottom: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--color-border-secondary)" }}
              />
              {lang}
            </div>
          )}
          <pre
            style={{
              background: "var(--color-background-secondary)",
              margin: 0,
              padding: "1rem 1.25rem",
              overflowX: "auto",
              overflowY: "visible",
            }}
          >
            <code
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                whiteSpace: "pre",
                display: "block",
              }}
            >
              {children}
            </code>
          </pre>
        </div>
      )
    }

    // Inline code
    return (
      <code
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.825em",
          background: "var(--color-background-tertiary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "var(--radius-sm)",
          padding: "0.1em 0.35em",
          color: "var(--color-accent)",
        }}
      >
        {children}
      </code>
    )
  },

  // ── Table ──────────────────────────────────────────────────────
  table: ({ children }) => (
    <div className="my-5 overflow-x-auto rounded-xl" style={{ border: "0.5px solid var(--color-border-tertiary)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th
      style={{
        background: "var(--color-background-tertiary)",
        fontWeight: 500,
        textAlign: "left",
        padding: "9px 14px",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        fontSize: "12px",
        color: "var(--color-text-secondary)",
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      style={{
        padding: "10px 14px",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        fontSize: "13px",
        color: "var(--color-text-primary)",
        lineHeight: 1.6,
      }}
    >
      {children}
    </td>
  ),

  // ── Blockquote ────────────────────────────────────────────────
  blockquote: ({ children }) => (
    <blockquote
      className="my-5 rounded-r-xl px-4 py-3"
      style={{
        borderLeft: "3px solid var(--color-accent)",
        background: "var(--color-accent-light)",
        color: "var(--color-text-secondary)",
        fontStyle: "normal",
      }}
    >
      {children}
    </blockquote>
  ),

  // ── HR ────────────────────────────────────────────────────────
  hr: () => (
    <hr className="my-8" style={{ border: "none", borderTop: "0.5px solid var(--color-border-tertiary)" }} />
  ),

  // ── Directive widgets: :::name{attrs} with Markdown children ──
  // The remarkDirectiveWidgets plugin converts containerDirectives into
  // <div data-widget="type" data-config="JSON"> nodes. We intercept here
  // and pass the already-rendered React children to WidgetRenderer.
  div: ({ children, ...props }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = props as Record<string, unknown>
    const widgetType = p["data-widget"] as string | undefined
    const configStr  = p["data-config"] as string | undefined

    if (widgetType && configStr) {
      try {
        const config = JSON.parse(configStr)
        return <WidgetRenderer type={widgetType} config={config}>{children}</WidgetRenderer>
      } catch {
        return (
          <div
            className="my-4 rounded-lg px-4 py-3 text-xs"
            style={{
              fontFamily: "var(--font-mono)",
              background: "var(--color-background-danger)",
              border: "0.5px solid var(--color-border-danger)",
              color: "var(--color-text-danger)",
            }}
          >
            Widget config parse error ({widgetType})
          </div>
        )
      }
    }
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
  },
}

export function MarkdownRenderer({ content }: Props) {
  // Defer ReactMarkdown entirely to the client to avoid hydration mismatches.
  // react-markdown's component overrides (pre/code) are not applied consistently
  // during Next.js SSR pre-rendering of "use client" components, causing the
  // server HTML to differ from the client render. By rendering nothing on the
  // server and only mounting after hydration, server and client always agree
  // on the initial HTML (an empty div), and the full content renders immediately
  // after React mounts — imperceptible to users.
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="prose">
      {mounted && (
        <ReactMarkdown
          remarkPlugins={remarkPlugins}
          rehypePlugins={rehypePlugins}
          components={components}
        >
          {content}
        </ReactMarkdown>
      )}
    </div>
  )
}
