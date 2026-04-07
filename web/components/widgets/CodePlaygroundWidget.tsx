"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import type { MarkdownWidgetUi } from "@/lib/i18n/messages"
import type { CodePlaygroundConfig, CodePlaygroundFile, CodePlaygroundSlot } from "@/lib/types"

// ── JS syntax tokenizer ─────────────────────────────────────────────
type TokenType = "keyword" | "string" | "comment" | "number" | "punctuation" | "plain"
interface Token { type: TokenType; text: string }

const JS_KEYWORDS = new Set([
  "async","await","break","case","catch","class","const","continue","debugger",
  "default","delete","do","else","export","extends","finally","for","from",
  "function","if","import","in","instanceof","let","new","of","return","static",
  "super","switch","this","throw","try","typeof","var","void","while","with","yield",
])

function tokenize(code: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < code.length) {
    // single-line comment
    if (code[i] === "/" && code[i + 1] === "/") {
      const end = code.indexOf("\n", i)
      const slice = end === -1 ? code.slice(i) : code.slice(i, end)
      tokens.push({ type: "comment", text: slice })
      i += slice.length
      continue
    }
    // multi-line comment
    if (code[i] === "/" && code[i + 1] === "*") {
      const end = code.indexOf("*/", i + 2)
      const slice = end === -1 ? code.slice(i) : code.slice(i, end + 2)
      tokens.push({ type: "comment", text: slice })
      i += slice.length
      continue
    }
    // strings
    if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
      const q = code[i]
      let j = i + 1
      while (j < code.length && code[j] !== q) {
        if (code[j] === "\\") j++
        j++
      }
      tokens.push({ type: "string", text: code.slice(i, j + 1) })
      i = j + 1
      continue
    }
    // numbers
    if (/[0-9]/.test(code[i]) && (i === 0 || /[^a-zA-Z_$]/.test(code[i - 1]))) {
      let j = i
      while (j < code.length && /[0-9.xXa-fA-F_eEn]/.test(code[j])) j++
      tokens.push({ type: "number", text: code.slice(i, j) })
      i = j
      continue
    }
    // identifier / keyword
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++
      const word = code.slice(i, j)
      tokens.push({ type: JS_KEYWORDS.has(word) ? "keyword" : "plain", text: word })
      i = j
      continue
    }
    // punctuation
    if (/[{}()[\];,.:?!<>=+\-*/%&|^~@#]/.test(code[i])) {
      tokens.push({ type: "punctuation", text: code[i] })
      i++
      continue
    }
    // whitespace / other — advance at least one character
    tokens.push({ type: "plain", text: code[i] })
    i++
  }
  return tokens
}

const TOKEN_COLORS: Record<TokenType, string> = {
  keyword: "var(--color-accent)",
  string: "var(--color-text-success)",
  comment: "var(--color-text-tertiary)",
  number: "var(--color-text-info)",
  punctuation: "var(--color-text-secondary)",
  plain: "var(--color-text-primary)",
}

// ── File tree builder ───────────────────────────────────────────────
interface TreeNode {
  name: string
  path: string
  type: "folder" | "file"
  children?: TreeNode[]
}

function buildTree(files: CodePlaygroundFile[]): TreeNode[] {
  const root: TreeNode[] = []
  for (const f of files) {
    const parts = f.path.split("/")
    let level = root
    let cumPath = ""
    for (let i = 0; i < parts.length; i++) {
      cumPath += (i > 0 ? "/" : "") + parts[i]
      const isFile = i === parts.length - 1
      let existing = level.find((n) => n.name === parts[i] && n.type === (isFile ? "file" : "folder"))
      if (!existing) {
        existing = { name: parts[i], path: cumPath, type: isFile ? "file" : "folder", ...(isFile ? {} : { children: [] }) }
        level.push(existing)
      }
      if (!isFile) level = existing.children!
    }
  }
  return root
}

function fileExtIcon(name: string): string {
  if (name.endsWith(".js") || name.endsWith(".mjs")) return "JS"
  if (name.endsWith(".ts") || name.endsWith(".mts")) return "TS"
  if (name.endsWith(".json")) return "{}"
  if (name.endsWith(".yaml") || name.endsWith(".yml")) return "Y"
  if (name.endsWith(".md")) return "M"
  return "·"
}

// ── Slot-aware code segments ────────────────────────────────────────
interface CodeSegment {
  type: "code" | "slot"
  text: string
  slotId?: string
  slot?: CodePlaygroundSlot
}

function parseCodeSegments(code: string, slots: CodePlaygroundSlot[]): CodeSegment[] {
  const slotMap = new Map(slots.map((s) => [s.id, s]))
  const segments: CodeSegment[] = []
  const regex = /\{\{(\w+)\}\}/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "code", text: code.slice(lastIndex, match.index) })
    }
    const id = match[1]
    segments.push({ type: "slot", text: "", slotId: id, slot: slotMap.get(id) })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < code.length) {
    segments.push({ type: "code", text: code.slice(lastIndex) })
  }
  return segments
}

// ── Fill slot values into a file's code ─────────────────────────────
function fillSlots(code: string, fileSlots: Record<string, string>): string {
  for (const [id, val] of Object.entries(fileSlots)) {
    code = code.replace(new RegExp(`\\{\\{${id}\\}\\}`, "g"), val)
  }
  return code
}

// ── Transform import/export into require/exports ────────────────────
function transformImports(code: string): string {
  // import { a, b } from './path'  →  const { a, b } = require('./path')
  code = code.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?/g,
    (_, names, path) => `const {${names}} = require('${path}');`,
  )
  // import X from './path'  →  const X = require('./path').default ?? require('./path')
  code = code.replace(
    /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?/g,
    (_, name, path) => `const ${name} = (() => { const _m = require('${path}'); return _m.default ?? _m; })();`,
  )
  // export function name(...)  →  exports.name = function name(...)
  code = code.replace(
    /export\s+function\s+(\w+)/g,
    (_, name) => `exports.${name} = function ${name}`,
  )
  // export async function name(...)  →  exports.name = async function name(...)
  code = code.replace(
    /export\s+async\s+function\s+(\w+)/g,
    (_, name) => `exports.${name} = async function ${name}`,
  )
  // export const name = ...  →  const name = exports.name = ...
  code = code.replace(
    /export\s+const\s+(\w+)\s*=/g,
    (_, name) => `const ${name} = exports.${name} =`,
  )
  // export { a, b } from './path'  →  Object.assign(exports, require('./path'))
  code = code.replace(
    /export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?/g,
    (_, names, path) => {
      const ids = (names as string).split(",").map((n: string) => n.trim())
      return ids.map((n) => `exports.${n} = require('${path}').${n};`).join("\n")
    },
  )
  // export { a, b }  →  (local re-exports, keep as-is with assignment)
  code = code.replace(
    /export\s+\{([^}]+)\}\s*;?/g,
    (_, names) => {
      const ids = (names as string).split(",").map((n: string) => n.trim())
      return ids.map((n) => `exports.${n} = ${n};`).join("\n")
    },
  )
  // export default X  →  exports.default = X
  code = code.replace(/export\s+default\s+/g, "exports.default = ")
  return code
}

// ── Resolve relative path against a base ────────────────────────────
function resolvePath(from: string, to: string): string {
  if (!to.startsWith(".")) return to
  const fromParts = from.split("/").slice(0, -1)
  const toParts = to.split("/")
  for (const p of toParts) {
    if (p === "..") fromParts.pop()
    else if (p !== ".") fromParts.push(p)
  }
  return fromParts.join("/")
}

// ── Bundle all files into a self-contained module system ────────────
function assembleCode(
  files: CodePlaygroundFile[],
  slotValues: Record<string, Record<string, string>>,
  entryFile: string,
): string {
  const registry: string[] = []

  for (const f of files) {
    const raw = fillSlots(f.code, slotValues[f.path] ?? {})
    const transformed = transformImports(raw)
    const escaped = JSON.stringify(f.path)
    registry.push(
      `__modules[${escaped}] = async function(__exports, require) {\n  const exports = __exports;\n${transformed}\n};`,
    )
  }

  // The require() implementation resolves relative paths and caches results
  const runtime = `
const __modules = {};
const __cache = {};

${registry.join("\n\n")}

function __resolve(from, to) {
  if (!to.startsWith('.')) return to;
  const base = from.split('/').slice(0, -1);
  for (const p of to.split('/')) {
    if (p === '..') base.pop();
    else if (p !== '.') base.push(p);
  }
  let resolved = base.join('/');
  if (__modules[resolved]) return resolved;
  for (const ext of ['.js', '.mjs', '.json', '.ts']) {
    if (__modules[resolved + ext]) return resolved + ext;
  }
  if (__modules[resolved + '/index.js']) return resolved + '/index.js';
  return resolved;
}

function __require(fromPath) {
  return function require(specifier) {
    const resolved = __resolve(fromPath, specifier);
    if (__cache[resolved]) return __cache[resolved];
    const factory = __modules[resolved];
    if (!factory) throw new Error('Module not found: ' + specifier + ' (resolved: ' + resolved + ')');
    const moduleExports = {};
    __cache[resolved] = moduleExports;
    const result = factory(moduleExports, __require(resolved));
    // If factory returns a promise (async module), attach it for await
    if (result && typeof result.then === 'function') {
      moduleExports.__ready = result;
    }
    return moduleExports;
  };
}

// await all async modules that were required
async function __awaitModules() {
  for (const mod of Object.values(__cache)) {
    if (mod.__ready) await mod.__ready;
  }
}

// Entry point
const __entryFn = __modules[${JSON.stringify(entryFile)}];
if (!__entryFn) throw new Error('Entry file not found: ${entryFile}');
const __entryExports = {};
__cache[${JSON.stringify(entryFile)}] = __entryExports;
await __entryFn(__entryExports, __require(${JSON.stringify(entryFile)}));
`
  return runtime
}

// ═══════════════════════════════════════════════════════════════════
// Main Widget
// ═══════════════════════════════════════════════════════════════════

export function CodePlaygroundWidget({
  config,
  ui,
}: {
  config: CodePlaygroundConfig
  ui: MarkdownWidgetUi["codePlayground"]
}) {
  const files = config.files ?? []

  // Validate config
  if (!files.length) {
    return (
      <div
        className="my-6 rounded-xl px-5 py-4 text-sm"
        style={{ background: "var(--color-background-warning)", border: "0.5px solid var(--color-border-warning)", color: "var(--color-text-warning)" }}
      >
        {ui.configMissing}
      </div>
    )
  }

  const defaultActive = files.find((f) => f.active)?.path ?? files[0].path

  // State
  const [activeFile, setActiveFile] = useState(defaultActive)
  const [openTabs, setOpenTabs] = useState<string[]>(() => {
    const actives = files.filter((f) => f.active).map((f) => f.path)
    return actives.length ? actives : [files[0].path]
  })
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set())
  const [slotValues, setSlotValues] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {}
    for (const f of files) {
      if (f.slots?.length) {
        init[f.path] = Object.fromEntries(f.slots.map((s) => [s.id, s.default ?? ""]))
      }
    }
    return init
  })
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const abortRef = useRef<AbortController | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  // File tree
  const tree = useMemo(() => buildTree(files), [files])

  const currentFile = useMemo(() => files.find((f) => f.path === activeFile), [files, activeFile])

  const segments = useMemo(
    () => currentFile ? parseCodeSegments(currentFile.code, currentFile.slots ?? []) : [],
    [currentFile],
  )

  // Slot change handler
  const setSlot = useCallback((filePath: string, slotId: string, value: string) => {
    setSlotValues((prev) => ({
      ...prev,
      [filePath]: { ...(prev[filePath] ?? {}), [slotId]: value },
    }))
  }, [])

  // Tab management
  const openFile = useCallback((path: string) => {
    setActiveFile(path)
    setOpenTabs((prev) => prev.includes(path) ? prev : [...prev, path])
  }, [])

  const closeTab = useCallback((path: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenTabs((prev) => {
      const next = prev.filter((p) => p !== path)
      if (!next.length && files.length) next.push(files[0].path)
      if (path === activeFile) setActiveFile(next[next.length - 1] ?? files[0]?.path)
      return next
    })
  }, [activeFile, files])

  const toggleFolder = useCallback((path: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev)
      next.has(path) ? next.delete(path) : next.add(path)
      return next
    })
  }, [])

  // Run code
  const runCode = useCallback(async () => {
    if (isRunning) {
      abortRef.current?.abort()
      return
    }
    setOutput("")
    setError(null)
    setIsRunning(true)

    const code = assembleCode(files, slotValues, activeFile)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, systemPrompt: config.systemPrompt, mode: config.mode ?? "sandbox" }),
        signal: controller.signal,
      })

      if (!res.ok) {
        let msg: string
        try {
          const json = await res.json()
          msg =
            json.error ??
            ui.requestFailedHttp.replace("{status}", String(res.status))
        } catch {
          msg = ui.serverErrorHttp.replace("{status}", String(res.status))
        }
        setError(msg)
        setIsRunning(false)
        return
      }

      if (!res.body) {
        setError(ui.emptyResponse)
        setIsRunning(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setOutput((prev) => prev + chunk)
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setOutput((prev) => prev + ui.runCancelled)
      } else {
        setError(`${ui.networkErrorPrefix}${err instanceof Error ? err.message : String(err)}`)
      }
    } finally {
      setIsRunning(false)
      abortRef.current = null
    }
  }, [isRunning, files, slotValues, config.systemPrompt, config.mode, ui])

  // Auto-run on mount
  useEffect(() => {
    if (config.autoRun) runCode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div
      className="my-6 rounded-xl overflow-hidden animate-fade-in"
      style={{ border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)" }}
    >
      {/* ── Window Chrome ─────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-4"
        style={{ height: 38, background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}
      >
        <div className="flex items-center gap-1.5">
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57", display: "inline-block" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E", display: "inline-block" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840", display: "inline-block" }} />
        </div>
        <p
          className="flex-1 text-center text-xs select-none"
          style={{ color: "var(--color-text-tertiary)", fontWeight: 500 }}
        >
          {config.title ?? "Code Playground"}
        </p>
        {config.hint && (
          <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{config.hint}</span>
        )}
      </div>

      {/* ── IDE Body ──────────────────────────────────────────── */}
      <div className="flex" style={{ minHeight: 200, maxHeight: 600 }}>
        {/* ── File Tree ─────────────────────────────────────── */}
        {sidebarOpen && (
          <div
            className="flex-shrink-0 overflow-y-auto overflow-x-hidden select-none"
            style={{
              width: 160,
              borderRight: "0.5px solid var(--color-border-tertiary)",
              background: "var(--color-background-secondary)",
              fontSize: 12,
            }}
          >
            <div
              className="px-3 py-2 text-xs uppercase tracking-wider"
              style={{ color: "var(--color-text-tertiary)", fontWeight: 600, fontSize: 10 }}
            >
              Explorer
            </div>
            <TreeView
              nodes={tree}
              activeFile={activeFile}
              collapsed={collapsedFolders}
              onToggleFolder={toggleFolder}
              onSelectFile={openFile}
              depth={0}
            />
          </div>
        )}

        {/* ── Editor Area ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Tab Bar */}
          <div
            className="flex items-center overflow-x-auto"
            style={{
              borderBottom: "0.5px solid var(--color-border-tertiary)",
              background: "var(--color-background-secondary)",
              minHeight: 34,
            }}
          >
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: 34, height: 34,
                color: "var(--color-text-tertiary)",
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14,
              }}
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? "◧" : "◨"}
            </button>
            {openTabs.map((tabPath) => {
              const isActive = tabPath === activeFile
              const fileName = tabPath.split("/").pop()!
              return (
                <div
                  key={tabPath}
                  onClick={() => setActiveFile(tabPath)}
                  className="flex items-center gap-1.5 px-3 cursor-pointer flex-shrink-0"
                  style={{
                    height: 34,
                    borderRight: "0.5px solid var(--color-border-tertiary)",
                    background: isActive ? "var(--color-background-primary)" : "transparent",
                    color: isActive ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    fontWeight: isActive ? 500 : 400,
                    borderBottom: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <span style={{ color: "var(--color-text-tertiary)", fontSize: 10 }}>
                    {fileExtIcon(fileName)}
                  </span>
                  {fileName}
                  <span
                    onClick={(e) => closeTab(tabPath, e)}
                    className="flex items-center justify-center rounded"
                    style={{
                      width: 16, height: 16, fontSize: 10,
                      color: "var(--color-text-tertiary)",
                      opacity: isActive ? 1 : 0,
                      transition: "opacity var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-background-tertiary)" }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
                  >
                    ✕
                  </span>
                </div>
              )
            })}
          </div>

          {/* Code Area */}
          {currentFile ? (
            <CodeEditorPanel
              segments={segments}
              filePath={currentFile.path}
              slotValues={slotValues[currentFile.path] ?? {}}
              onSlotChange={(id, val) => setSlot(currentFile.path, id, val)}
            />
          ) : (
            <div
              className="flex-1 flex items-center justify-center text-xs"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {ui.noFileSelected}
            </div>
          )}
        </div>
      </div>

      {/* ── Terminal Panel ────────────────────────────────────── */}
      <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }}>
        {/* Terminal Header */}
        <div
          className="flex items-center justify-between px-4"
          style={{ height: 34, background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
              ▸ Terminal
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={runCode}
              className="flex items-center gap-1.5 px-3 rounded-md text-xs"
              style={{
                height: 24,
                background: isRunning ? "var(--color-background-danger)" : "var(--color-accent)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
                transition: "all var(--transition-fast)",
              }}
            >
              {isRunning ? "■ Stop" : "▶ Run"}
            </button>
            {output && !isRunning && (
              <button
                onClick={() => { setOutput(""); setError(null) }}
                className="flex items-center px-2 rounded-md text-xs"
                style={{
                  height: 24,
                  background: "var(--color-background-tertiary)",
                  color: "var(--color-text-secondary)",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Terminal Output */}
        <div
          ref={outputRef}
          className="overflow-y-auto px-4 py-3"
          style={{
            maxHeight: config.outputHeight ?? 200,
            minHeight: 60,
            background: "var(--color-background-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {error ? (
            <span style={{ color: "var(--color-text-danger)" }}>Error: {error}</span>
          ) : output ? (
            <span style={{ color: "var(--color-text-primary)" }}>
              {output}
              {isRunning && <span className="cursor-blink" style={{ color: "var(--color-accent)" }}>▋</span>}
            </span>
          ) : isRunning ? (
            <span className="flex items-center gap-1" style={{ color: "var(--color-text-tertiary)" }}>
              Running
              {[0, 1, 2].map((n) => (
                <span
                  key={n}
                  className="inline-block rounded-full"
                  style={{
                    width: 4, height: 4,
                    background: "var(--color-text-tertiary)",
                    animation: `typingPulse 1.2s infinite ${n * 0.2}s`,
                  }}
                />
              ))}
            </span>
          ) : (
            <span style={{ color: "var(--color-text-tertiary)", fontStyle: "italic" }}>
              {ui.runPlaceholder}
            </span>
          )}
        </div>
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

// ═══════════════════════════════════════════════════════════════════
// File Tree View (recursive)
// ═══════════════════════════════════════════════════════════════════

function TreeView({
  nodes, activeFile, collapsed, onToggleFolder, onSelectFile, depth,
}: {
  nodes: TreeNode[]
  activeFile: string
  collapsed: Set<string>
  onToggleFolder: (path: string) => void
  onSelectFile: (path: string) => void
  depth: number
}) {
  const sorted = [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return (
    <>
      {sorted.map((node) => {
        const isFolder = node.type === "folder"
        const isCollapsed = collapsed.has(node.path)
        const isActive = !isFolder && node.path === activeFile

        return (
          <div key={node.path}>
            <div
              onClick={() => isFolder ? onToggleFolder(node.path) : onSelectFile(node.path)}
              className="flex items-center gap-1 cursor-pointer"
              style={{
                paddingLeft: 8 + depth * 12,
                paddingRight: 8,
                height: 26,
                color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                background: isActive ? "var(--color-accent-light)" : "transparent",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "background var(--transition-fast)",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--color-background-tertiary)" }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent" }}
            >
              {isFolder ? (
                <span style={{ fontSize: 10, width: 12, textAlign: "center", color: "var(--color-text-tertiary)", flexShrink: 0 }}>
                  {isCollapsed ? "▸" : "▾"}
                </span>
              ) : (
                <span style={{ fontSize: 9, width: 12, textAlign: "center", color: "var(--color-text-tertiary)", flexShrink: 0, fontWeight: 600 }}>
                  {fileExtIcon(node.name)}
                </span>
              )}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{node.name}</span>
            </div>
            {isFolder && !isCollapsed && node.children && (
              <TreeView
                nodes={node.children}
                activeFile={activeFile}
                collapsed={collapsed}
                onToggleFolder={onToggleFolder}
                onSelectFile={onSelectFile}
                depth={depth + 1}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Code Editor Panel (with syntax highlighting + editable slots)
// ═══════════════════════════════════════════════════════════════════

function CodeEditorPanel({
  segments, filePath, slotValues, onSlotChange,
}: {
  segments: CodeSegment[]
  filePath: string
  slotValues: Record<string, string>
  onSlotChange: (id: string, val: string) => void
}) {
  // Build lines from segments (for line numbers)
  const renderedContent = useMemo(() => {
    const elements: React.ReactNode[] = []
    let lineNum = 1
    let lineElements: React.ReactNode[] = []

    const flushLine = () => {
      elements.push(
        <div key={`line-${lineNum}`} className="flex" style={{ minHeight: 22 }}>
          <span
            className="flex-shrink-0 select-none text-right pr-3"
            style={{
              width: 40, color: "var(--color-text-tertiary)", fontSize: 12,
              fontFamily: "var(--font-mono)", opacity: 0.5, userSelect: "none",
            }}
          >
            {lineNum}
          </span>
          <span className="flex-1" style={{ minWidth: 0, whiteSpace: "pre" }}>
            {lineElements.length ? lineElements : " "}
          </span>
        </div>,
      )
      lineNum++
      lineElements = []
    }

    for (const seg of segments) {
      if (seg.type === "slot") {
        const slot = seg.slot
        const value = slotValues[seg.slotId!] ?? slot?.default ?? ""
        const displayText = value || slot?.placeholder || seg.slotId || ""
        const inputWidth = Math.max(displayText.length, 2) * 7.4 + 20
        lineElements.push(
          <span
            key={`slot-${filePath}-${seg.slotId}`}
            className="inline-flex items-center"
            style={{ position: "relative", whiteSpace: "normal", verticalAlign: "baseline" }}
            title={slot?.tooltip}
          >
            <input
              type="text"
              value={value}
              onChange={(e) => onSlotChange(seg.slotId!, e.target.value)}
              placeholder={slot?.placeholder ?? seg.slotId}
              style={{
                width: inputWidth,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                lineHeight: "18px",
                padding: "1px 6px",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--color-accent)",
                background: "var(--color-accent-light)",
                color: "var(--color-text-primary)",
                outline: "none",
                transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
              }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px rgba(207,106,37,0.2)" }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "none" }}
            />
            {slot?.tooltip && (
              <span
                style={{
                  position: "absolute", right: -16, top: "50%", transform: "translateY(-50%)",
                  width: 14, height: 14, borderRadius: "50%",
                  background: "var(--color-background-tertiary)",
                  color: "var(--color-text-tertiary)",
                  fontSize: 9, fontWeight: 700,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  cursor: "help",
                }}
                title={slot.tooltip}
              >
                ?
              </span>
            )}
          </span>,
        )
        continue
      }

      // Code segment — may contain newlines
      const lines = seg.text.split("\n")
      for (let li = 0; li < lines.length; li++) {
        if (li > 0) flushLine()
        if (lines[li]) {
          const tokens = tokenize(lines[li])
          for (let ti = 0; ti < tokens.length; ti++) {
            const t = tokens[ti]
            lineElements.push(
              <span key={`t-${lineNum}-${ti}-${li}`} style={{ color: TOKEN_COLORS[t.type] }}>
                {t.text}
              </span>,
            )
          }
        }
      }
    }

    // Flush last line
    if (lineElements.length || segments.length === 0) flushLine()

    return elements
  }, [segments, slotValues, filePath, onSlotChange])

  return (
    <div
      className="flex-1 overflow-auto"
      style={{
        background: "var(--color-background-primary)",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        lineHeight: "22px",
        padding: "8px 0",
        tabSize: 2,
      }}
    >
      {renderedContent}
    </div>
  )
}
