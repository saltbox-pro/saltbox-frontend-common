function toStringList(items: unknown[]): string[] {
  return items.map(String).filter(Boolean);
}

export function parseCommaSeparatedListValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return toStringList(value);
  }
  if (typeof value === "string" && value) {
    return value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

const LIST_VALUE_DELIMITERS = /[,\t\r\n]+/;
const LIST_PASTE_DELIMITER_PATTERN = /[,\t\r\n]/;

function splitListInputValue(value: string): string[] {
  return value
    .split(LIST_VALUE_DELIMITERS)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function normalizeListInputValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return toStringList(value);
  }
  if (typeof value === "string" && value.trim()) {
    return splitListInputValue(value);
  }
  return [];
}

export function isListPasteDelimiterPresent(text: string): boolean {
  return LIST_PASTE_DELIMITER_PATTERN.test(text);
}

export function formatPastedListValue(text: string): string {
  return normalizeListInputValue(text).join(",");
}
