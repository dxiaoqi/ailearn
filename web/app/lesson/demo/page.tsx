import { LessonLayout } from "@/components/lesson/LessonLayout"
import { MarkdownRenderer } from "@/components/lesson/MarkdownRenderer"
import { extractToc } from "@/lib/toc"
import { demoContent, demoMeta } from "@/lib/demo-content"

export default function DemoLessonPage() {
  const toc = extractToc(demoContent)

  return (
    <LessonLayout meta={demoMeta} toc={toc}>
      <MarkdownRenderer content={demoContent} />
    </LessonLayout>
  )
}
