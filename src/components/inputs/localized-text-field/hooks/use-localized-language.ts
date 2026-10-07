import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { APP_LANGUAGES } from "../../../../interfaces/locales";
import {
  orderLocalizedLanguages,
  resolveLocalizedLanguage,
} from "../helpers/resolve-localized-language";

export type UseLocalizedLanguageParams = {
  languages?: readonly string[];
  defaultLanguage?: string;
  activeLanguage?: string;
  onActiveLanguageChange?: (language: string) => void;
};

export function useLocalizedLanguage({
  languages = APP_LANGUAGES,
  defaultLanguage,
  activeLanguage: activeLanguageProp,
  onActiveLanguageChange,
}: UseLocalizedLanguageParams = {}) {
  const { i18n } = useTranslation();
  const preferredLanguage = defaultLanguage ?? i18n.language;
  const orderedLanguages = useMemo(
    () => orderLocalizedLanguages(languages, preferredLanguage),
    [languages, preferredLanguage]
  );
  const [uncontrolledLanguage, setUncontrolledLanguage] = useState(() =>
    resolveLocalizedLanguage(preferredLanguage, languages)
  );

  const isLanguageControlled = activeLanguageProp != null;
  const activeLanguage = isLanguageControlled ? activeLanguageProp : uncontrolledLanguage;

  const setActiveLanguage = (language: string) => {
    if (!isLanguageControlled) {
      setUncontrolledLanguage(language);
    }
    onActiveLanguageChange?.(language);
  };

  return {
    languages: orderedLanguages,
    activeLanguage,
    setActiveLanguage,
  };
}
