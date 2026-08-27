import { type ColumnLayout, isEmptyColumnLayout } from "./column-layout";

const STORAGE_KEY_PREFIX = "fastTable.columnLayout:";

export function getColumnLayoutStorageKey(tableId: string): string {
  return `${STORAGE_KEY_PREFIX}${tableId}`;
}

function readColumnIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.every((item) => typeof item === "string") ? (value as string[]) : [];
}

export function loadColumnLayout(tableId: string): ColumnLayout | undefined {
  try {
    const saved = localStorage.getItem(getColumnLayoutStorageKey(tableId));
    if (!saved) return undefined;

    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;

    const layout: ColumnLayout = {
      order: readColumnIds((parsed as ColumnLayout).order),
      hidden: readColumnIds((parsed as ColumnLayout).hidden),
    };

    return isEmptyColumnLayout(layout) ? undefined : layout;
  } catch {
    return undefined;
  }
}

export function saveColumnLayout(tableId: string, layout: ColumnLayout): void {
  try {
    if (isEmptyColumnLayout(layout)) {
      localStorage.removeItem(getColumnLayoutStorageKey(tableId));
      return;
    }

    localStorage.setItem(getColumnLayoutStorageKey(tableId), JSON.stringify(layout));
  } catch {}
}
