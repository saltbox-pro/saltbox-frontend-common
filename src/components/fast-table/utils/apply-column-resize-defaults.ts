import type { ColumnDef } from "@tanstack/react-table";

import type { CellMeta } from "../types";

export const COLUMN_RESIZE_MAX_SIZE = 1200;
export const COLUMN_RESIZE_MIN_SIZE = 80;

function isColumnWidthLocked(meta: CellMeta | undefined): boolean {
  if (meta?.minWidth === undefined || meta?.maxWidth === undefined) return false;
  return meta.minWidth === meta.maxWidth;
}

export function applyColumnResizeDefaults<TData>(
  columns: Array<ColumnDef<TData, unknown>>,
  enabled: boolean
): Array<ColumnDef<TData, unknown>> {
  if (!enabled) return columns;

  return columns.map((column) => {
    const meta = column.meta as CellMeta | undefined;
    const locked = isColumnWidthLocked(meta);

    const minSize = locked
      ? (meta?.minWidth ?? column.minSize ?? COLUMN_RESIZE_MIN_SIZE)
      : (column.minSize ?? COLUMN_RESIZE_MIN_SIZE);

    return {
      ...column,
      enableResizing: column.enableResizing ?? !locked,
      size: column.size ?? (typeof meta?.width === "number" ? meta.width : undefined),
      minSize,
      maxSize: column.maxSize ?? meta?.maxWidth ?? COLUMN_RESIZE_MAX_SIZE,
    };
  });
}
