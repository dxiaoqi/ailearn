/**
 * remarkDirectiveWidgets.ts
 *
 * Converts `:::widget-name{attrs}` container directives into interactive widgets.
 *
 * ─── Content-first widgets (children = rendered Markdown) ────────────────────
 *   :::callout{variant="amber" title="注意"}
 *   **重要**：内容支持完整 Markdown 语法。
 *   :::
 *
 *   :::ai-chat{title="AI 导师" systemPrompt="你是课程导师"}
 *   你好！有什么问题都可以问我。
 *   :::
 *
 *   :::scenario-eval{title="场景评估" dimensions="重复性,可分解性"}
 *   描述你的工作场景，AI 会评估它是否适合用 Agent 解决。
 *   :::
 *
 * ─── Structure-first widgets (children = structured Markdown) ────────────────
 *   :::quiz{title="课后检验"}
 *   **Agent Loop 终止靠什么？**
 *   - [ ] 超时计时器
 *   - [x] stop signal + max_turns 双重保障
 *   - [ ] 用户手动中断
 *   > 两者结合才是生产级方案，缺一不可。
 *   :::
 *
 * ─── JSON widgets (existing code-block syntax, unchanged) ────────────────────
 *   ```widget:sandbox
 *   { "params": [...], "metrics": [...] }
 *   ```
 */

import { visit, SKIP } from "unist-util-visit"
import { toString } from "mdast-util-to-string"
import type { Root } from "mdast"
import type { QuizConfig } from "./types"

// ── Types for directive AST nodes (from remark-directive) ──────────────────
interface DirectiveAttributes { [key: string]: string | undefined }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DirectiveNode = any

// ── Widget types that render children as Markdown ──────────────────────────
const CONTENT_DIRECTIVE_TYPES = new Set(["callout", "ai-chat", "scenario-eval"])

// ── Config builders for content-first widgets ─────────────────────────────
function buildContentConfig(type: string, attrs: DirectiveAttributes): Record<string, unknown> {
  switch (type) {
    case "callout":
      return { variant: attrs.variant ?? "blue", title: attrs.title }
    case "ai-chat":
      return {
        title:         attrs.title,
        hint:          attrs.hint,
        systemPrompt:  attrs.systemPrompt,
        placeholder:   attrs.placeholder,
        maxHeight:     attrs.maxHeight ? +attrs.maxHeight : undefined,
        maxTokens:     attrs.maxTokens ? +attrs.maxTokens : undefined,
      }
    case "scenario-eval":
      return {
        title:        attrs.title,
        placeholder:  attrs.placeholder,
        buttonLabel:  attrs.buttonLabel,
        systemPrompt: attrs.systemPrompt,
        dimensions:   attrs.dimensions ? attrs.dimensions.split(",").map((s) => s.trim()) : undefined,
      }
    default:
      return {}
  }
}

// ── Quiz parser ────────────────────────────────────────────────────────────
// Parses this structure into QuizConfig:
//
//   **Question text?**
//   - [ ] Wrong option
//   - [x] Correct option
//   > Explanation (optional)
//   ---              ← optional separator between questions
//

function parseQuiz(children: DirectiveNode[], attrs: DirectiveAttributes): QuizConfig {
  const questions: QuizConfig["questions"] = []
  let i = 0

  while (i < children.length) {
    const node = children[i]

    // Skip separators
    if (node.type === "thematicBreak") { i++; continue }

    // A question block starts with a paragraph
    if (node.type === "paragraph") {
      const questionText = toString(node).trim()
      if (!questionText) { i++; continue }

      i++
      const options: Array<{ text: string; correct: boolean }> = []
      let explanation: string | undefined

      // Options: a task list immediately following the question
      if (i < children.length && children[i].type === "list") {
        const list = children[i]
        for (const item of list.children) {
          // remark-gfm sets item.checked for task items
          if (item.checked === null || item.checked === undefined) {
            // Regular list item with no checkbox — treat as wrong option
            options.push({ text: toString(item).trim(), correct: false })
          } else {
            options.push({ text: toString(item).trim(), correct: item.checked === true })
          }
        }
        i++
      }

      // Explanation: blockquote immediately following the options
      if (i < children.length && children[i].type === "blockquote") {
        explanation = toString(children[i]).trim()
        i++
      }

      if (options.length > 0) {
        const correctCount = options.filter((o) => o.correct).length
        questions.push({
          id: `q${questions.length + 1}`,
          text: questionText,
          type: correctCount > 1 ? "multiple" : "single",
          options,
          explanation,
        })
      }
      continue
    }

    i++
  }

  return { title: attrs.title ?? "测验", questions }
}

// ── Main remark plugin ─────────────────────────────────────────────────────
export function remarkDirectiveWidgets() {
  return (tree: Root) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, (node: DirectiveNode, index: number | null, parent: any) => {
      if (node.type !== "containerDirective") return

      const type  = node.name as string
      const attrs = (node.attributes ?? {}) as DirectiveAttributes

      // ── Content-first: keep children as Markdown, add data-widget wrapper ──
      if (CONTENT_DIRECTIVE_TYPES.has(type)) {
        const config = buildContentConfig(type, attrs)
        node.data = {
          hName: "div",
          hProperties: {
            "data-widget": type,
            // Compact JSON without whitespace (safe to embed in an HTML attribute)
            "data-config": JSON.stringify(config),
          },
        }
        return // children are processed normally as Markdown
      }

      // ── Quiz: parse structured Markdown → QuizConfig JSON code block ────
      if (type === "quiz") {
        if (parent == null || index == null) return
        const config = parseQuiz(node.children as DirectiveNode[], attrs)
        const codeNode = {
          type: "code",
          lang: "widget:quiz",
          value: JSON.stringify(config),
        }
        parent.children.splice(index, 1, codeNode)
        return [SKIP, index] as [symbol, number]
      }
    })
  }
}
