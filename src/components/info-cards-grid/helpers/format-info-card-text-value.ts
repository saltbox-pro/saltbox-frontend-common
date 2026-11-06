import { EMPTY_VALUE } from "saltbox-common/constants/empty-value";

export function formatInfoCardTextValue(
  value: unknown,
  emptyPlaceholder: string = EMPTY_VALUE
): string {
  if (value == null) {
    return emptyPlaceholder;
  }

  const text = String(value).trim();
  return text !== "" ? text : emptyPlaceholder;
}

export function isInfoCardEmptyValue(
  value: string,
  emptyPlaceholder: string = EMPTY_VALUE
): boolean {
  return value === emptyPlaceholder;
}
