import { AppLanguage } from "../interfaces/locales";
import { UiEvent } from "../interfaces/ui-events";

export const APP_LANG_STORAGE_KEY = "currentLocale";
export const I18NEXT_LANG_STORAGE_KEY = "i18nextLng";
export const LOCALE_CHANGE_EVENT = UiEvent.LocaleChange;

export const normalizeLang = (value: string | null | undefined): AppLanguage | undefined => {
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

export const isLocaleStorageKey = (key: string | null): boolean =>
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
