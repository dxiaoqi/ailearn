"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/locale"

interface Props {
  locale: Locale
  ariaLabel: string
  labelZh: string
  labelEn: string
}

export function LocaleSwitcher({ locale, ariaLabel, labelZh, labelEn }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const apply = (next: Locale) => {
    if (next === locale) return
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`
    startTransition(() => router.refresh())
  }

  const btn = (active: boolean) =>
    ({
      fontSize: 12,
      fontWeight: 500,
      padding: "4px 10px",
      borderRadius: 6,
      border: "0.5px solid var(--color-border-tertiary)",
      cursor: pending ? "wait" : "pointer",
      opacity: pending ? 0.7 : 1,
      background: active ? "var(--color-background-tertiary)" : "transparent",
      color: active ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
    }) as const

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
    >
      <button type="button" style={btn(locale === "zh")} onClick={() => apply("zh")}>
        {labelZh}
      </button>
      <button type="button" style={btn(locale === "en")} onClick={() => apply("en")}>
        {labelEn}
      </button>
    </div>
  )
}
