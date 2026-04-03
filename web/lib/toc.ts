import GithubSlugger from "github-slugger"
import type { TocItem } from "./types"

export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = []
  const slugger = new GithubSlugger()
  let inCodeBlock = false

  for (const line of markdown.split("\n")) {
    if (/^```/.test(line.trim())) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue

    const m = /^(#{2,3})\s+(.+)$/.exec(line.trim())
    if (m) {
      // Strip inline markdown markers (*, _, `) to get plain text,
      // matching what rehype-slug sees when it processes the rendered AST.
      const text = m[2].replace(/[*_`]/g, "").trim()
      const id = slugger.slug(text)
      items.push({ id, text, level: m[1].length })
    }
  }
  return items
}
