import { cookies } from "next/headers"

export const LOCALE_COOKIE = "class-note-locale"

export type Locale = "zh" | "en"

export const locales: Locale[] = ["zh", "en"]

export function parseLocale(value: string | undefined | null): Locale {
  if (value === "en") return "en"
  return "zh"
}

export async function getLocale(): Promise<Locale> {
  const jar = await cookies()
  return parseLocale(jar.get(LOCALE_COOKIE)?.value)
}
