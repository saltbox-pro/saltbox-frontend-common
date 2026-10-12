import type { ColumnSizingState } from "@tanstack/react-table";

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
