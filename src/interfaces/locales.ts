export enum AppLanguage {
  EN = "en",
  RU = "ru",
}

export enum AppLanguageLabel {
  en = "EN",
  ru = "RU",
}

export const APP_LANGUAGES = [AppLanguage.EN, AppLanguage.RU] as const;

export const DAYJS_LOCALE_MAP: Record<AppLanguage, string> = {
  [AppLanguage.EN]: "en",
  [AppLanguage.RU]: "ru",
};
