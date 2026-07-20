import type { ColumnSizingState } from "@tanstack/react-table";

const STORAGE_KEY_PREFIX = "fastTable.columnSizing:";

export function getColumnSizingStorageKey(tableId: string): string {
  return `${STORAGE_KEY_PREFIX}${tableId}`;
}

export function pruneColumnSizing<T extends Record<string, number>>(
  sizing: T,
  columnIds: Iterable<string>
): T {
  const allowed = new Set(columnIds);
  let changed = false;
  const next: Record<string, number> = {};

  for (const [id, size] of Object.entries(sizing)) {
    if (allowed.has(id)) {
      next[id] = size;
    } else {
      changed = true;
    }
  }

  return (changed ? next : sizing) as T;
}

function isPlausiblePixelSize(value: number): boolean {
  return Number.isFinite(value) && value > 0 && value <= 10_000;
}

export function loadColumnSizing(tableId: string): ColumnSizingState | undefined {
  try {
    const saved = localStorage.getItem(getColumnSizingStorageKey(tableId));
    if (!saved) return undefined;

    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;

    const result: ColumnSizingState = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== "number" || !isPlausiblePixelSize(value)) {
        return undefined;
      }
      result[key] = value;
    }

    return Object.keys(result).length > 0 ? result : undefined;
  } catch {
    return undefined;
  }
}

export function saveColumnSizing(tableId: string, sizing: ColumnSizingState): void {
  try {
    if (Object.keys(sizing).length === 0) {
      localStorage.removeItem(getColumnSizingStorageKey(tableId));
      return;
    }
    localStorage.setItem(getColumnSizingStorageKey(tableId), JSON.stringify(sizing));
  } catch {}
}

export function clampColumnSizing(
  sizing: ColumnSizingState,
  columns: Array<{ id: string; columnDef: { minSize?: number; maxSize?: number } }>
): ColumnSizingState {
  const next: ColumnSizingState = { ...sizing };

  for (const column of columns) {
    const size = next[column.id];
    if (typeof size !== "number") continue;

    const minSize = column.columnDef.minSize;
    const maxSize = column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER;
    const clampedMin = minSize !== undefined ? Math.max(minSize, size) : size;
    next[column.id] = Math.min(maxSize, clampedMin);
  }

  return next;
}

export function clampColumnSizingForIds(
  sizing: ColumnSizingState,
  columnIds: string[],
  getDef: (id: string) => { minSize?: number; maxSize?: number } | undefined
): ColumnSizingState {
  return clampColumnSizing(
    sizing,
    columnIds.map((id) => ({
      id,
      columnDef: {
        minSize: getDef(id)?.minSize,
        maxSize: getDef(id)?.maxSize,
      },
    }))
  );
}
