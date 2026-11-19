import type { Column, ColumnDef, ColumnSizingState } from "@tanstack/react-table";
import type { CSSProperties } from "react";

import type { CellMeta } from "../types";

export type ColumnResizeConstraints = {
  minSize?: number;
  maxSize?: number;
};

export function buildResizeColumnConstraintsById<TData>(
  columns: Array<ColumnDef<TData, unknown>>
): Map<string, ColumnResizeConstraints> {
  const map = new Map<string, ColumnResizeConstraints>();

  for (const column of columns) {
    const constraints: ColumnResizeConstraints = {
      minSize: column.minSize,
      maxSize: column.maxSize,
    };

    if (typeof column.id === "string") {
      map.set(column.id, constraints);
    }
    if ("accessorKey" in column && typeof column.accessorKey === "string") {
      map.set(column.accessorKey, constraints);
    }
  }

  return map;
}

export function resolveColumnMinWidth(meta?: CellMeta): number | undefined {
  return meta?.minWidth;
}

export function resolveCellTitle(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value.length > 0 ? value : undefined;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

export function formatCssPx(width: number): string {
  return `${Number(width.toFixed(3))}px`;
}

export function readElementContentWidth(element: HTMLElement): number {
  const outerWidth = element.getBoundingClientRect().width;
  const scrollbarWidth = element.offsetWidth - element.clientWidth;

  return Math.max(0, outerWidth - scrollbarWidth);
}

export function measureLeafColumnWidthsFromHeader(
  tableContainer: HTMLElement,
  leafColumns: Array<{ id: string }>
): ColumnSizingState | undefined {
  const headerCells = tableContainer.querySelectorAll("thead th");
  if (headerCells.length !== leafColumns.length) return undefined;

  const measured: ColumnSizingState = {};
  leafColumns.forEach((column, index) => {
    const cellWidth = (headerCells[index] as HTMLElement).getBoundingClientRect().width;
    if (cellWidth > 0) {
      measured[column.id] = cellWidth;
    }
  });

  return Object.keys(measured).length > 0 ? measured : undefined;
}

export function getMissingColumnSizing(
  columnSizing: ColumnSizingState,
  measured: ColumnSizingState,
  leafColumns: Array<{ id: string }>
): ColumnSizingState {
  const missing: ColumnSizingState = {};

  for (const column of leafColumns) {
    if (columnSizing[column.id] === undefined && measured[column.id] !== undefined) {
      missing[column.id] = measured[column.id];
    }
  }

  return missing;
}

export function getColWidthStyle(
  width: number | string | undefined,
  metaExtras?: { minWidth?: number; maxWidth?: number }
): CSSProperties | undefined {
  const { minWidth: minWidthPx, maxWidth: maxWidthPx } = metaExtras ?? {};

  if (width === undefined && minWidthPx === undefined && maxWidthPx === undefined) return undefined;

  const style: CSSProperties = {};

  if (typeof width === "number") {
    // table-layout:fixed ignores min-width on <col>; bake the floor into width.
    style.width = formatCssPx(minWidthPx !== undefined ? Math.max(width, minWidthPx) : width);
  } else if (width !== undefined) {
    style.width = width;
    if (minWidthPx !== undefined) style.minWidth = formatCssPx(minWidthPx);
  }

  if (maxWidthPx !== undefined) style.maxWidth = formatCssPx(maxWidthPx);

  return style;
}

export function getColumnCellStyle(meta?: CellMeta): CSSProperties | undefined {
  if (!meta) return undefined;

  const isFixed =
    typeof meta.minWidth === "number" &&
    meta.minWidth === meta.maxWidth &&
    (meta.width === undefined || meta.width === meta.minWidth);

  if (isFixed) {
    const px = formatCssPx(meta.minWidth);
    return { width: px, minWidth: px, maxWidth: px, boxSizing: "border-box" };
  }

  if (meta.minWidth === undefined && meta.maxWidth === undefined) return undefined;

  const style: CSSProperties = { boxSizing: "border-box" };
  if (meta.minWidth !== undefined) style.minWidth = formatCssPx(meta.minWidth);
  if (meta.maxWidth !== undefined) style.maxWidth = formatCssPx(meta.maxWidth);
  return style;
}

export function resolveColumnWidth<TData>(
  column: Column<TData, unknown>,
  measuredWidth?: number
): number | string | undefined {
  const meta = column.columnDef.meta as CellMeta | undefined;
  return meta?.width ?? measuredWidth;
}

export function hasAllColumnSizes(columnSizing: ColumnSizingState, columnIds: string[]): boolean {
  return columnIds.length > 0 && columnIds.every((id) => columnSizing[id] !== undefined);
}

export function resolveLockedColSize<TData>(
  column: Column<TData, unknown>,
  fillColumnId: string | undefined,
  lockedColumnSizes: ColumnSizingState | undefined
): number | undefined {
  if (column.id === fillColumnId) return undefined;
  return lockedColumnSizes?.[column.id] ?? column.getSize();
}

export function getFastTableStyle(
  lockedColumnsTotalWidth: number | undefined
): CSSProperties | undefined {
  if (lockedColumnsTotalWidth === undefined) return undefined;
  // minWidth keeps horizontal scroll when column sum exceeds the container.
  return {
    width: "100%",
    minWidth: formatCssPx(lockedColumnsTotalWidth),
  };
}
