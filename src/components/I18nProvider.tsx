"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { setCurrentLang } from "@/utils/i18n";
import { t as translate, type SupportedLang } from "@/utils/i18n.shared";

type I18nContextValue = {
  lang: SupportedLang;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLang: (lang: SupportedLang) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLang,
  children,
}: {
  initialLang: SupportedLang;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [lang, setLangState] = useState<SupportedLang>(initialLang);

  const setLang = useCallback(
    (nextLang: SupportedLang) => {
      setCurrentLang(nextLang);
      setLangState(nextLang);
      window.dispatchEvent(
        new CustomEvent("dd:langChanged", { detail: nextLang }),
      );
      router.refresh();
    },
    [router],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(lang, key, vars),
    [lang],
  );

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
