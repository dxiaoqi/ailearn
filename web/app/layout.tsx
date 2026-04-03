import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI 学习课程",
  description: "学习 AI 在各类场景的应用",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
