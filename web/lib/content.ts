import fs from "fs"
import path from "path"
import matter from "gray-matter"
import type { LessonMeta } from "./types"

const CONTENT_DIR = path.join(process.cwd(), "content")

export interface LessonData {
  meta: LessonMeta
  content: string
}

export function getLessonData(module: string, lesson: string): LessonData {
  const filePath = path.join(CONTENT_DIR, module, `${lesson}.md`)
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

  return { meta, content }
}

export function listLessons(module: string): string[] {
  const dir = path.join(CONTENT_DIR, module)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
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
