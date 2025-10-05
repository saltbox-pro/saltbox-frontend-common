import { AppLanguage } from "./locales";

export interface LocaleStore {
  currentLocale: AppLanguage;
  readonly supportedLocales: ReadonlyArray<AppLanguage>;
  setLocale(locale: AppLanguage): void;

  /**
   * Subscribe to locale changes using MobX autorun.
   * Use this method instead of direct autorun() in child microfrontends
   * to avoid mixing MobX instances between microfrontends.
   *
   * @example
   * ```ts
   * localeStore.subscribe(() => {
   *   console.log('Locale changed:', localeStore.currentLocale);
   * });
   * ```
   */
  subscribe(callback: () => void): () => void;
}
