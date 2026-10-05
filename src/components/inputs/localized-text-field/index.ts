export type { LocalizedTextMap } from "../../../utils/localized-text";

export {
  orderLocalizedLanguages,
  resolveLocalizedLanguage,
} from "./helpers/resolve-localized-language";

export {
  useLocalizedLanguage,
  type UseLocalizedLanguageParams,
} from "./hooks/use-localized-language";

export {
  LocalizedLanguageSwitcher,
  type LocalizedLanguageSwitcherProps,
} from "./ui/localized-language-switcher";
export { LocalizedInput, type LocalizedInputProps } from "./ui/localized-input";
export { LocalizedTextArea, type LocalizedTextAreaProps } from "./ui/localized-text-area";
export { renderLocalizedFormLabel } from "./ui/render-localized-form-label";
