import { notFound } from "next/navigation"
import { LessonLayout } from "@/components/lesson/LessonLayout"
import { MarkdownRenderer } from "@/components/lesson/MarkdownRenderer"
import { extractToc } from "@/lib/toc"
import { getLessonData } from "@/lib/content"

interface Props {
  params: Promise<{ module: string; lesson: string }>
}

export default async function LessonPage({ params }: Props) {
  const { module, lesson } = await params

  let data
  try {
    data = getLessonData(module, lesson)
  } catch {
    notFound()
  }

  const { meta, content } = data
  const toc = extractToc(content)

  return (
    <LessonLayout meta={meta} toc={toc}>
      <MarkdownRenderer content={content} />
    </LessonLayout>
  )
}
