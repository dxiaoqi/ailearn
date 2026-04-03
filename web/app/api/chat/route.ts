export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, systemPrompt, userApiKey } = await req.json()

  const apiKey = userApiKey || process.env.OPENAI_API_KEY
  const baseURL = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "")
  const modelName = process.env.MODEL_NAME ?? "gpt-4o"

  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 })
  }

  const allMessages = [
    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
    ...messages,
  ]

  // Call upstream OpenAI-compatible API directly
  let upstream: Response
  try {
    upstream = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: modelName, messages: allMessages, stream: true }),
    })
  } catch (err) {
    return Response.json({ error: `Network error: ${String(err)}` }, { status: 502 })
  }

  if (!upstream.ok) {
    const text = await upstream.text()
    return new Response(
      `Upstream error ${upstream.status}: ${text}`,
      { status: upstream.status, headers: { "Content-Type": "text/plain" } }
    )
  }

  // Parse SSE stream from upstream and forward only the text deltas as plain text
  const encoder = new TextEncoder()
  const upstreamBody = upstream.body!

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstreamBody.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          // Keep the last (potentially incomplete) line in the buffer
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const data = line.slice(6).trim()
            if (data === "[DONE]") continue
            try {
              const json = JSON.parse(data)
              const text: string | undefined = json.choices?.[0]?.delta?.content
              if (text) controller.enqueue(encoder.encode(text))
            } catch {
              // Skip malformed SSE chunks
            }
          }
        }
      } finally {
        controller.close()
      }
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
