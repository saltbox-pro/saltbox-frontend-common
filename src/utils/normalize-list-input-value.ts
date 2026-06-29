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

export function normalizeListInputValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return toStringList(value);
  }
  if (typeof value === "string" && value.trim()) {
    return value.split(/[,\s]+/).filter(Boolean);
  }
  return [];
}
