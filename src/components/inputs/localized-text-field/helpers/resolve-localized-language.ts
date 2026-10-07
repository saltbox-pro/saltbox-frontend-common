import { AppLanguage } from "../../../../interfaces/locales";
import { getLanguageCode } from "../../../../utils/localized-text";

export function resolveLocalizedLanguage(
  preferred: string | undefined,
  languages: readonly string[]
): string {
  const code = getLanguageCode(preferred);
  if (code && languages.includes(code)) {
    return code;
  }
  if (languages.includes(AppLanguage.EN)) {
    return AppLanguage.EN;
  }
  return languages[0] ?? AppLanguage.EN;
}

export function orderLocalizedLanguages(
  languages: readonly string[],
  preferred: string | undefined
): string[] {
  const primary = resolveLocalizedLanguage(preferred, languages);
  return [primary, ...languages.filter((language) => language !== primary)];
}
