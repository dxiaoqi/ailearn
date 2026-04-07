import type { Metadata } from "next"
import "./globals.css"
import { getLocale } from "@/lib/i18n/locale-server"
import { getMessages } from "@/lib/i18n/messages"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const m = getMessages(locale)
  const site = m.home.metaTitle
  return {
    title: { default: site, template: `%s · ${site}` },
    description: m.home.metaDescription,
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale === "en" ? "en" : "zh-CN"} className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
