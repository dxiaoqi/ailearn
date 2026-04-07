import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import vm from "node:vm"

export const maxDuration = 60

// Model/API config is read exclusively from env.
// A future settings panel will allow users to configure multiple models;
// at that point this route will accept an optional modelId to select from
// a server-side registry — never raw keys from the client.

interface RunRequest {
  code?: string
  systemPrompt?: string
  mode?: "sandbox" | "ai"
}

interface TokenStats {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  llmCalls: number
}

// ── Rough token estimator (teaching aid, not billing-grade) ──────
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5)
}

export async function POST(req: Request) {
  let body: RunRequest
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 })
  }

  const { code, systemPrompt, mode = "sandbox" } = body

  if (!code || typeof code !== "string" || !code.trim()) {
    return Response.json({ error: "没有提供代码内容" }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json({ error: "API Key 未配置，请在 .env.local 中设置 OPENAI_API_KEY" }, { status: 500 })
  }

  const baseURL = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "")
  const modelName = process.env.MODEL_NAME ?? "gpt-4o"
  const provider = createOpenAI({ apiKey, baseURL })

  // ── AI simulation mode (fallback) ───────────────────────────────
  if (mode === "ai") {
    const { streamText } = await import("ai")
    try {
      const result = streamText({
        model: provider.chat(modelName),
        system: systemPrompt || "You are a JavaScript runtime sandbox. Execute the code and return ONLY the console output.",
        prompt: code,
      })
      return result.toTextStreamResponse()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      return Response.json({ error: `执行失败: ${msg}` }, { status: 502 })
    }
  }

  // ── Real sandbox mode ───────────────────────────────────────────
  const encoder = new TextEncoder()
  const stats: TokenStats = { promptTokens: 0, completionTokens: 0, totalTokens: 0, llmCalls: 0 }

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (line: string) => {
        controller.enqueue(encoder.encode(line + "\n"))
      }

      // Injected console that streams each call
      const sandboxConsole = {
        log: (...args: unknown[]) => emit(args.map(formatArg).join(" ")),
        warn: (...args: unknown[]) => emit(`⚠ ${args.map(formatArg).join(" ")}`),
        error: (...args: unknown[]) => emit(`✗ ${args.map(formatArg).join(" ")}`),
        info: (...args: unknown[]) => emit(args.map(formatArg).join(" ")),
      }

      // Injected callLLM — real AI call via AI SDK
      const callLLM = async (
        messages: Array<{ role: string; content: string }>,
        options?: { model?: string; temperature?: number; maxOutputTokens?: number },
      ) => {
        stats.llmCalls++
        const callModel = options?.model || modelName
        emit(`[LLM] → ${callModel} (${messages.length} messages)`)

        try {
          const result = await generateText({
            model: provider.chat(callModel),
            messages: messages.map((m) => ({
              role: m.role as "system" | "user" | "assistant",
              content: m.content,
            })),
            temperature: options?.temperature ?? 0,
            maxOutputTokens: options?.maxOutputTokens,
          })

          const usage = result.usage
          if (usage) {
            const inTok = usage.inputTokens ?? 0
            const outTok = usage.outputTokens ?? 0
            stats.promptTokens += inTok
            stats.completionTokens += outTok
            stats.totalTokens += inTok + outTok
            emit(`[LLM] ← ${inTok}+${outTok} tokens`)
          }

          return {
            content: result.text,
            toolCalls: result.toolCalls ?? [],
            usage: usage ? {
              inputTokens: usage.inputTokens ?? 0,
              outputTokens: usage.outputTokens ?? 0,
            } : undefined,
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          emit(`[LLM] ✗ Error: ${msg}`)
          return { content: `Error: ${msg}`, toolCalls: [] }
        }
      }

      // Injected countTokens — rough estimator
      const countTokens = (text: string) => {
        const count = estimateTokens(text)
        return { text: text.slice(0, 50) + (text.length > 50 ? "..." : ""), tokens: count }
      }

      // Injected sleep
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, Math.min(ms, 10000)))

      // Build the VM context
      const context = vm.createContext({
        console: sandboxConsole,
        callLLM,
        countTokens,
        sleep,
        setTimeout: (fn: () => void, ms: number) => setTimeout(fn, Math.min(ms, 10000)),
        JSON,
        Math,
        Date,
        Array,
        Object,
        String,
        Number,
        Boolean,
        RegExp,
        Map,
        Set,
        Promise,
        Error,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        encodeURIComponent,
        decodeURIComponent,
      })

      try {
        // Wrap user code in an async IIFE so top-level await works
        const wrappedCode = `(async () => {\n${code}\n})()`
        const script = new vm.Script(wrappedCode, { filename: "playground.js" })
        await script.runInContext(context, { timeout: 30000 })
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes("Script execution timed out")) {
            emit(`\n✗ 执行超时 (30s limit)`)
          } else {
            emit(`\n✗ ${err.name}: ${err.message}`)
          }
        } else {
          emit(`\n✗ ${String(err)}`)
        }
      }

      // Send final stats
      emit(`\n────────────────────────────`)
      emit(`📊 LLM 调用: ${stats.llmCalls} 次`)
      if (stats.totalTokens > 0) {
        emit(`📊 Token 消耗: ${stats.promptTokens} (prompt) + ${stats.completionTokens} (completion) = ${stats.totalTokens} total`)
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  })
}

function formatArg(arg: unknown): string {
  if (arg === null) return "null"
  if (arg === undefined) return "undefined"
  if (typeof arg === "string") return arg
  try {
    return JSON.stringify(arg, null, 2)
  } catch {
    return String(arg)
  }
}
