import en from "@/messages/en.json";
import ar from "@/messages/ar.json";

export type Locale = "en" | "ar";
export const defaultLocale: Locale = "en";
export const locales: Locale[] = ["en", "ar"];
export const LOCALE_COOKIE = "NEXT_LOCALE";

const messages = { en, ar } as const;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (!current || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

export function createT(locale: Locale) {
  const msgs = messages[locale] as unknown as Record<string, unknown>;
  return function t(key: string, params?: Record<string, string>): string {
    let value = getNestedValue(msgs, key);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, v);
      });
    }
    return value;
  };
}
