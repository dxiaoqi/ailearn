import type { Metadata } from "next"
import "./globals.css"
import { getLocale } from "@/lib/i18n/locale"

export const metadata: Metadata = {
  title: "AI 学习课程",
  description: "学习 AI 在各类场景的应用",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale === "en" ? "en" : "zh-CN"} className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
