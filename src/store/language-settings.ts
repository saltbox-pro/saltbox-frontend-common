import { type AppLanguage, isAppLanguage } from "saltbox-common/interfaces/locales";
import {
  getUserSettingsValue,
  setUserSettingsValue,
} from "saltbox-common/store/user-settings-store";

const LANGUAGE_KEY = "language";

export function getLanguageSetting(): AppLanguage | undefined {
  const value = getUserSettingsValue([LANGUAGE_KEY]);

  return isAppLanguage(value) ? value : undefined;
}

export function setLanguageSetting(language: AppLanguage | undefined): void {
  setUserSettingsValue([LANGUAGE_KEY], language);
}
