import "server-only";
import { cookies } from "next/headers";
import { createT, defaultLocale, locales, LOCALE_COOKIE, type Locale } from "./i18n";

export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get(LOCALE_COOKIE)?.value as Locale;
    return locales.includes(locale) ? locale : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

export async function getT() {
  const locale = await getServerLocale();
  return createT(locale);
}
