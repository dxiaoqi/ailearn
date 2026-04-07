import { LessonLayout } from "@/components/lesson/LessonLayout"
import { MarkdownRenderer } from "@/components/lesson/MarkdownRenderer"
import { demoContent, demoMeta } from "@/lib/demo-content"
import { getLocale } from "@/lib/i18n/locale-server"
import { getMessages, markdownWidgetUiPlain } from "@/lib/i18n/messages"
import { extractToc } from "@/lib/toc"

export default async function DemoLessonPage() {
  const locale = await getLocale()
  const messages = getMessages(locale)
  const toc = extractToc(demoContent)

  return (
    <LessonLayout meta={demoMeta} toc={toc} locale={locale} messages={messages}>
      <MarkdownRenderer content={demoContent} widgetsUi={markdownWidgetUiPlain(messages)} />
    </LessonLayout>
  )
}
