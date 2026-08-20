import type { SortingState } from "@tanstack/react-table";

const STORAGE_KEY_PREFIX = "fastTable.sorting:";

export function getColumnSortingStorageKey(tableId: string): string {
  return `${STORAGE_KEY_PREFIX}${tableId}`;
}

function isColumnSort(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.desc === "boolean";
}

export function pruneColumnSorting(
  sorting: SortingState,
  columnIds: Iterable<string>
): SortingState {
  const allowed = new Set(columnIds);
  const next = sorting.filter((item) => allowed.has(item.id));

  return next.length === sorting.length ? sorting : next;
}

export function isSameColumnSorting(a: SortingState, b: SortingState): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item.id === b[index].id && item.desc === b[index].desc);
}

export function serializeColumnSorting(sorting: SortingState): string {
  return JSON.stringify(sorting);
}

export function loadColumnSorting(tableId: string): SortingState | undefined {
  try {
    const saved = localStorage.getItem(getColumnSortingStorageKey(tableId));
    if (!saved) return undefined;

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(isColumnSort)) return undefined;

    return parsed.length > 0 ? (parsed as SortingState) : undefined;
  } catch {
    return undefined;
  }
}

export function saveColumnSorting(tableId: string, sorting: SortingState): void {
  try {
    if (sorting.length === 0) {
      localStorage.removeItem(getColumnSortingStorageKey(tableId));
      return;
    }

    localStorage.setItem(getColumnSortingStorageKey(tableId), JSON.stringify(sorting));
  } catch {}
}
