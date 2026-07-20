import type { ColumnDef, ColumnSizingState, OnChangeFn } from "@tanstack/react-table";

import type { ColumnResizeConstraints } from "./column";
import { clampColumnSizingForIds } from "./persisted-column-sizing";

export function resolveResizeColumnIds<TData>(columns: Array<ColumnDef<TData, unknown>>): string[] {
  const ids: string[] = [];

  for (const column of columns) {
    if (typeof column.id === "string") {
      ids.push(column.id);
      continue;
    }

    if ("accessorKey" in column && typeof column.accessorKey === "string") {
      ids.push(column.accessorKey);
    }
  }

  return ids;
}

export function createClampedColumnSizingChange(
  onColumnSizingChange: OnChangeFn<ColumnSizingState>,
  columnIds: string[],
  getConstraints: (columnId: string) => ColumnResizeConstraints | undefined
): OnChangeFn<ColumnSizingState> {
  return (updaterOrValue) => {
    onColumnSizingChange((prev) => {
      const next = typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue;
      return clampColumnSizingForIds(next, columnIds, (id) => getConstraints(id));
    });
  };
}
