import en from "./en.json";
import bg from "./bg.json";

export const locales = {
  en: { route: "/", ogLocale: "en_US", name: "English", flag: "gb", dict: en.en },
  bg: { route: "/bg/", ogLocale: "bg_BG", name: "Български", flag: "bg", dict: bg.bg },
} as const;

export type Locale = keyof typeof locales;

/** Returns a lookup for one language; a missing key fails the build. */
export function useTranslations(locale: Locale) {
  const dict = locales[locale].dict as Record<string, string>;
  return (key: string): string => {
    const value = dict[key];
    if (value === undefined) throw new Error(`${locale} is missing the translation "${key}"`);
    return value;
  };
}
