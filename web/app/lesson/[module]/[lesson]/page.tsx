import { notFound } from "next/navigation"
import { LessonLayout } from "@/components/lesson/LessonLayout"
import { MarkdownRenderer } from "@/components/lesson/MarkdownRenderer"
import { getLessonData } from "@/lib/content"
import { getLocale } from "@/lib/i18n/locale"
import { getMessages } from "@/lib/i18n/messages"
import { extractToc } from "@/lib/toc"

interface Props {
  params: Promise<{ module: string; lesson: string }>
}

export default async function LessonPage({ params }: Props) {
  const { module, lesson } = await params
  const locale = await getLocale()
  const messages = getMessages(locale)

  let data
  try {
    data = getLessonData(module, lesson, locale)
  } catch {
    notFound()
  }

  const { meta, content, usedFallback } = data
  const toc = extractToc(content)

  return (
    <LessonLayout
      meta={meta}
      toc={toc}
      locale={locale}
      messages={messages}
      usedFallback={usedFallback}
    >
      <MarkdownRenderer content={content} />
    </LessonLayout>
  )
}
