const EXTRA_CATEGORY_PREFIX_RE = /^(?:extra|extra_static|extra_aggregated)\.[^.]+\.[^.]+\.(?=[^.])/;

export function getExtraCategoryPrefix(field: string): string | null {
  if (field.endsWith(".") || field.includes("..")) return null;
  return EXTRA_CATEGORY_PREFIX_RE.exec(field)?.[0] ?? null;
}
