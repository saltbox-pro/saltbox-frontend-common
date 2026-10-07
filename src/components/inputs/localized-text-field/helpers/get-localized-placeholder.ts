import { getLocalizedText, type LocalizedTextMap } from "../../../../utils/localized-text";

export function getLocalizedPlaceholder(
  placeholder: string | LocalizedTextMap | undefined,
  language: string
): string | undefined {
  if (placeholder == null) {
    return undefined;
  }
  if (typeof placeholder === "string") {
    return placeholder;
  }

  const text = getLocalizedText(placeholder, language);
  return text || undefined;
}
