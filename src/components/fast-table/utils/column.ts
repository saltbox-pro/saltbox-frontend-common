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
  return element.getBoundingClientRect().width;
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
    style.width = formatCssPx(width);
  } else if (width !== undefined) {
    style.width = width;
  }

  if (minWidthPx !== undefined) style.minWidth = formatCssPx(minWidthPx);
  if (maxWidthPx !== undefined) style.maxWidth = formatCssPx(maxWidthPx);

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

export function sumColumnSizes(columnSizing: ColumnSizingState, columnIds: string[]): number {
  let total = 0;
  for (const id of columnIds) {
    const size = columnSizing[id];
    if (typeof size === "number") {
      total += size;
    }
  }
  return total;
}

export function getVirtualCellWidthStyle(measuredWidth: number | undefined): CSSProperties {
  if (measuredWidth !== undefined) {
    return { flex: "0 0 auto", width: formatCssPx(measuredWidth) };
  }

  return { flex: 1 };
}

export function areColumnWidthsMeasured(
  columnCount: number,
  columnWidths: Record<string, number>
): boolean {
  if (columnCount === 0) {
    return false;
  }

  return Array.from({ length: columnCount }, (_, index) => columnWidths[`col-${index}`]).every(
    (width) => width !== undefined
  );
}
