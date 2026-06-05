import { DEFAULT_INFO_CARD_EMPTY_PLACEHOLDER } from "../constants/default-empty-placeholder";

export function formatInfoCardTextValue(
  value: unknown,
  emptyPlaceholder: string = DEFAULT_INFO_CARD_EMPTY_PLACEHOLDER
): string {
  if (value == null) {
    return emptyPlaceholder;
  }

  const text = String(value).trim();
  return text !== "" ? text : emptyPlaceholder;
}

export function isInfoCardEmptyValue(
  value: string,
  emptyPlaceholder: string = DEFAULT_INFO_CARD_EMPTY_PLACEHOLDER
): boolean {
  return value === emptyPlaceholder;
}
