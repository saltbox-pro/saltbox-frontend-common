import { useEffect, useState } from "react";

import { AppLanguage } from "../interfaces/locales";
import enCommon from "../locales/en/common.json";
import ruCommon from "../locales/ru/common.json";

import { detectLang, isLocaleStorageKey, LOCALE_CHANGE_EVENT, normalizeLang } from "./detect-lang";

export {
  APP_LANG_STORAGE_KEY,
  detectLang,
  I18NEXT_LANG_STORAGE_KEY,
  LOCALE_CHANGE_EVENT,
} from "./detect-lang";

const getByPath = (obj: unknown, path: string): unknown => {
  const parts = path.split(".");
  let cur: unknown = obj;

  for (const part of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }

  return cur;
};

const interpolate = (template: string, vars?: Record<string, string>): string => {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => vars[key] ?? "");
};

export const tCommon = (
  key: string,
  vars?: Record<string, string>,
  lang: AppLanguage = detectLang()
): string => {
  const dict = lang === AppLanguage.RU ? ruCommon : enCommon;
  const value = getByPath(dict, key);

  if (typeof value === "string") {
    return interpolate(value, vars);
  }

  return key;
};

export const notifyLocaleChange = (locale: AppLanguage): void => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, { detail: { locale } }));
  }
};

export const useCommonLocale = (): AppLanguage => {
  const [lang, setLang] = useState<AppLanguage>(detectLang);

  useEffect(() => {
    const sync = (): void => {
      setLang(detectLang());
    };

    const onLocaleChange = (event: Event): void => {
      const locale = normalizeLang((event as CustomEvent<{ locale?: string }>).detail?.locale);
      setLang(locale ?? detectLang());
    };

    const onStorage = (event: StorageEvent): void => {
      if (isLocaleStorageKey(event.key)) {
        sync();
      }
    };

    window.addEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
    window.addEventListener("storage", onStorage);

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    sync();

    return () => {
      window.removeEventListener(LOCALE_CHANGE_EVENT, onLocaleChange);
      window.removeEventListener("storage", onStorage);
      observer.disconnect();
    };
  }, []);

  return lang;
};
