import {
  DEFAULT_LANG,
  isSupportedLang,
  LANG_COOKIE,
  t as translate,
  type SupportedLang,
} from "@/utils/i18n.shared";

export type { SupportedLang };

export function getCurrentLang(): SupportedLang {
  if (typeof document === "undefined") return DEFAULT_LANG;

  const cookies = document.cookie.split("; ");
  const langCookie = cookies
    .find((c) => c.startsWith(`${LANG_COOKIE}=`))
    ?.split("=")[1];

  if (isSupportedLang(langCookie)) {
    return langCookie;
  }

  // Fallback to browser lang
  if (navigator.language.toUpperCase().startsWith("HR")) {
    return "HR";
  }
  return "EN"; // Default fallback
}

export function setCurrentLang(lang: SupportedLang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}

export function t(key: string, vars?: Record<string, string | number>) {
  return translate(getCurrentLang(), key, vars);
}
