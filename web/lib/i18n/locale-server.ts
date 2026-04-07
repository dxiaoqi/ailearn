import { cookies } from "next/headers"
import { LOCALE_COOKIE, parseLocale, type Locale } from "./locale"

/** Server-only: reads locale from cookie. Import only from Server Components / Route Handlers. */
export async function getLocale(): Promise<Locale> {
  const jar = await cookies()
  return parseLocale(jar.get(LOCALE_COOKIE)?.value)
}
