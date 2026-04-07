import fs from "fs"
import path from "path"
import matter from "gray-matter"
import type { Locale } from "./i18n/locale"
import type { LessonMeta } from "./types"

const CONTENT_DIR = path.join(process.cwd(), "content")

export interface LessonData {
  meta: LessonMeta
  content: string
  /** True when English was requested but only the Chinese manuscript exists */
  usedFallback?: boolean
}

export function getLessonData(
  module: string,
  lesson: string,
  locale: Locale = "zh"
): LessonData {
  const baseZh = path.join(CONTENT_DIR, module, `${lesson}.md`)
  const baseEn = path.join(CONTENT_DIR, module, `${lesson}.en.md`)

  let filePath = baseZh
  let usedFallback: boolean | undefined

  if (locale === "en") {
    if (fs.existsSync(baseEn)) {
      filePath = baseEn
    } else {
      filePath = baseZh
      usedFallback = true
    }
  }

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  const meta: LessonMeta = {
    title: data.title ?? "Untitled",
    module: data.module ?? module,
    moduleTitle: data.moduleTitle ?? module,
    duration: data.duration ?? "",
    description: data.description,
    tags: data.tags,
    expert: data.expert,
  }

  return { meta, content, usedFallback }
}

export function listLessons(module: string): string[] {
  const dir = path.join(CONTENT_DIR, module)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.endsWith(".en.md"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort()
}

export function listModules(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => fs.statSync(path.join(CONTENT_DIR, f)).isDirectory())
    .sort()
}
