import type { MaterialSymbol } from "@material-symbols/font-300";

const ICON_NAME_PATTERN = /^[a-z0-9_]+$/;

export function isMaterialIconName(value: string): boolean {
  return ICON_NAME_PATTERN.test(value);
}

export function normalizeMaterialIconValue(
  value: string | null | undefined
): MaterialSymbol | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || !isMaterialIconName(trimmed)) {
    return null;
  }

  return trimmed as MaterialSymbol;
}
