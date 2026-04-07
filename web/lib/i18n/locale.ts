/** Shared locale types & cookie name — safe to import from Client Components. */

export const LOCALE_COOKIE = "class-note-locale"

export type Locale = "zh" | "en"

export const locales: Locale[] = ["zh", "en"]

export function parseLocale(value: string | undefined | null): Locale {
  if (value === "en") return "en"
  return "zh"
}
