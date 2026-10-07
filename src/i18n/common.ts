import { useEffect, useState } from "react";

import { AppLanguage } from "../interfaces/locales";
import { UiEvent } from "../interfaces/ui-events";
import enCommon from "../locales/en/common.json";
import ruCommon from "../locales/ru/common.json";

export const APP_LANG_STORAGE_KEY = "currentLocale";
export const I18NEXT_LANG_STORAGE_KEY = "i18nextLng";
export const LOCALE_CHANGE_EVENT = UiEvent.LocaleChange;

const normalizeLang = (value: string | null | undefined): AppLanguage | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase().trim();
  if (normalized === AppLanguage.RU || normalized.startsWith(`${AppLanguage.RU}-`)) {
    return AppLanguage.RU;
  }

  if (normalized === AppLanguage.EN || normalized.startsWith(`${AppLanguage.EN}-`)) {
    return AppLanguage.EN;
  }

  return undefined;
};

const isLocaleStorageKey = (key: string | null): boolean =>
  key === APP_LANG_STORAGE_KEY || key === I18NEXT_LANG_STORAGE_KEY;

export const detectLang = (): AppLanguage => {
  if (typeof localStorage !== "undefined") {
    const fromApp = normalizeLang(localStorage.getItem(APP_LANG_STORAGE_KEY));
    if (fromApp) {
      return fromApp;
    }

    const fromI18nextStorage = normalizeLang(localStorage.getItem(I18NEXT_LANG_STORAGE_KEY));
    if (fromI18nextStorage) {
      return fromI18nextStorage;
    }
  }

  if (typeof document !== "undefined") {
    const fromDocument = normalizeLang(document.documentElement.lang);
    if (fromDocument) {
      return fromDocument;
    }
  }

  if (typeof navigator !== "undefined") {
    const fromNavigator = normalizeLang(navigator.language);
    if (fromNavigator) {
      return fromNavigator;
    }
  }

  return AppLanguage.EN;
};

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
