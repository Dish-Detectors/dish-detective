import { cookies, headers } from "next/headers";
import {
  DEFAULT_LANG,
  isSupportedLang,
  LANG_COOKIE,
  t as translate,
  type SupportedLang,
} from "@/utils/i18n.shared";

export async function getServerLang(): Promise<SupportedLang> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieValue = cookieStore.get(LANG_COOKIE)?.value;
  if (isSupportedLang(cookieValue)) return cookieValue;

  const accept = (headerStore.get("accept-language") || "").toLowerCase();
  if (accept.startsWith("hr")) return "HR";
  if (accept.length === 0) return DEFAULT_LANG;
  return "EN";
}

export async function tServer(
  key: string,
  vars?: Record<string, string | number>,
): Promise<string> {
  const lang = await getServerLang();
  return translate(lang, key, vars);
}
