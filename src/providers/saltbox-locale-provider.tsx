import {
  TranslationContext,
  en as formGeneratorEn,
  ru as formGeneratorRu,
  type Translation,
} from "@saltbox/react-jsonschema-form-generator";
import { ConfigProvider } from "antd";
import type { Locale } from "antd/es/locale";
import en_US from "antd/locale/en_US";
import ru_RU from "antd/locale/ru_RU";
import i18next, { type Resource } from "i18next";
import React, { useEffect, useMemo } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";

import { notifyLocaleChange } from "../components/module-error-boundary/utils/i18n";
import { AppLanguage } from "../interfaces/locales";
import enCommon from "../locales/en/common.json";
import ruCommon from "../locales/ru/common.json";

const ANTD_LOCALE_MAP: Record<AppLanguage, Locale> = {
  [AppLanguage.EN]: en_US,
  [AppLanguage.RU]: ru_RU,
};

const FORM_GENERATOR_LOCALE_MAP: Record<AppLanguage, Translation> = {
  [AppLanguage.EN]: formGeneratorEn,
  [AppLanguage.RU]: formGeneratorRu,
};

function createI18nInstance(locale: AppLanguage, resources?: Resource) {
  const mergedResources: Resource = {
    [AppLanguage.EN]: { common: enCommon, ...resources?.[AppLanguage.EN] },
    [AppLanguage.RU]: { common: ruCommon, ...resources?.[AppLanguage.RU] },
  };

  const namespaces = ["common", ...Object.keys(resources?.[AppLanguage.EN] ?? {})];

  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: AppLanguage.EN,
    ns: namespaces,
    defaultNS: namespaces.length > 1 ? namespaces[1] : "common",
    resources: mergedResources,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  return instance;
}

interface SaltboxLocaleProviderProps {
  locale: AppLanguage;
  children: React.ReactNode;
  resources?: Resource;
}

export const SaltboxLocaleProvider: React.FC<SaltboxLocaleProviderProps> = ({
  locale,
  children,
  resources,
}) => {
  const i18nInstance = useMemo(() => createI18nInstance(locale, resources), []);

  useEffect(() => {
    notifyLocaleChange(locale);
  }, [locale]);

  if (i18nInstance.language !== locale) {
    i18nInstance.changeLanguage(locale);
  }

  const antdLocale = ANTD_LOCALE_MAP[locale];
  const formGeneratorTranslation = FORM_GENERATOR_LOCALE_MAP[locale];

  return (
    <I18nextProvider i18n={i18nInstance}>
      <ConfigProvider locale={antdLocale}>
        <TranslationContext.Provider value={formGeneratorTranslation}>
          {children}
        </TranslationContext.Provider>
      </ConfigProvider>
    </I18nextProvider>
  );
};
