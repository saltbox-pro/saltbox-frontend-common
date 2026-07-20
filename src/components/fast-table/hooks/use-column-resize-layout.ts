import type { Column, ColumnSizingState, OnChangeFn } from "@tanstack/react-table";
import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import {
  type ColumnResizeConstraints,
  getMissingColumnSizing,
  hasAllColumnSizes,
  measureLeafColumnWidthsFromHeader,
  readElementContentWidth,
} from "../utils/column";
import {
  isColumnWidthLocked,
  resolveColumnWidthLayoutMode,
} from "../utils/column-width-layout-mode";
import { applyExplicitFillColumnWidths, resolveFillColumnId } from "../utils/filled-column-widths";
import { clampColumnSizingForIds } from "../utils/persisted-column-sizing";

type UseColumnResizeLayoutArgs<DataType> = {
  enableColumnResize: boolean;
  tableContainerRef: RefObject<HTMLElement | null>;
  leafColumns: Array<Column<DataType, unknown>>;
  leafColumnIds: string[];
  leafColumnIdsKey: string;
  columnSizing: ColumnSizingState;
  hasPersistedSizing: boolean;
  isResizingColumn: boolean;
  resizeConstraintsById: Map<string, ColumnResizeConstraints>;
  onColumnSizingChange: OnChangeFn<ColumnSizingState>;
  persistColumnSizing: (sizing: ColumnSizingState, columnIds?: string[]) => void;
  seedColumnSizingFromPixels: (pixelSizing: ColumnSizingState, replace?: boolean) => void;
  replaceColumnSizingFromPixels: (pixelSizing: ColumnSizingState) => void;
  syncColumnSizingToColumns: (columnIds: string[]) => void;
};

export function useColumnResizeLayout<DataType>({
  enableColumnResize,
  tableContainerRef,
  leafColumns,
  leafColumnIds,
  leafColumnIdsKey,
  columnSizing,
  hasPersistedSizing,
  isResizingColumn,
  resizeConstraintsById,
  onColumnSizingChange,
  persistColumnSizing,
  seedColumnSizingFromPixels,
  replaceColumnSizingFromPixels,
  syncColumnSizingToColumns,
}: UseColumnResizeLayoutArgs<DataType>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const wasResizingRef = useRef(false);
  const isResizingColumnRef = useRef(isResizingColumn);
  isResizingColumnRef.current = isResizingColumn;

  const hasSizing = hasAllColumnSizes(columnSizing, leafColumnIds);
  const hasLockedColumnWidths = isColumnWidthLocked(
    resolveColumnWidthLayoutMode({
      enableColumnResize,
      hasSizing,
      hasPersistedSizing,
      isResizingColumn,
    })
  );

  const clampSizingState = useCallback(
    (sizing: ColumnSizingState, columnIds: string[]) =>
      clampColumnSizingForIds(sizing, columnIds, (id) => resizeConstraintsById.get(id)),
    [resizeConstraintsById]
  );

  const fillColumnId = hasLockedColumnWidths
    ? resolveFillColumnId(
        leafColumns.map((column) => ({
          id: column.id,
          canResize: column.getCanResize(),
        }))
      )
    : undefined;

  let lockedColumnSizes: ColumnSizingState | undefined;
  let lockedColumnsTotalWidth: number | undefined;

  if (hasLockedColumnWidths) {
    const sizingFromGetSize: ColumnSizingState = {};
    for (const column of leafColumns) {
      sizingFromGetSize[column.id] = column.getSize();
    }

    const minWidthById = (columnId: string) =>
      resizeConstraintsById.get(columnId)?.minSize ?? sizingFromGetSize[columnId] ?? 0;

    const { sizes, totalWidth } = applyExplicitFillColumnWidths(
      sizingFromGetSize,
      leafColumnIds,
      fillColumnId,
      containerWidth,
      minWidthById
    );

    if (totalWidth > 0) {
      lockedColumnSizes = sizes;
      lockedColumnsTotalWidth = totalWidth;
    }
  }

  useLayoutEffect(() => {
    if (!enableColumnResize || !tableContainerRef.current) return;
    if (isResizingColumnRef.current) return;

    const width = readElementContentWidth(tableContainerRef.current);
    if (width > 0) {
      setContainerWidth(width);
    }
  }, [enableColumnResize, hasPersistedSizing, leafColumnIdsKey, tableContainerRef]);

  useLayoutEffect(() => {
    if (!enableColumnResize || !hasPersistedSizing || !tableContainerRef.current) return;
    if (isResizingColumnRef.current) return;

    const measured = measureLeafColumnWidthsFromHeader(tableContainerRef.current, leafColumns);
    if (!measured) return;

    const missing = getMissingColumnSizing(columnSizing, measured, leafColumns);
    if (Object.keys(missing).length === 0) return;

    const next = { ...columnSizing, ...missing };
    seedColumnSizingFromPixels(missing, false);
    persistColumnSizing(next, leafColumnIds);
  }, [
    columnSizing,
    enableColumnResize,
    hasPersistedSizing,
    leafColumnIds,
    leafColumnIdsKey,
    leafColumns,
    persistColumnSizing,
    seedColumnSizingFromPixels,
    tableContainerRef,
  ]);

  const prepareColumnResize = useCallback(() => {
    if (!enableColumnResize || !tableContainerRef.current) return;
    if (hasAllColumnSizes(columnSizing, leafColumnIds)) return;

    const measured = measureLeafColumnWidthsFromHeader(tableContainerRef.current, leafColumns);
    if (!measured) return;

    flushSync(() => {
      if (hasPersistedSizing) {
        const missing = getMissingColumnSizing(columnSizing, measured, leafColumns);
        if (Object.keys(missing).length === 0) return;
        seedColumnSizingFromPixels(missing, false);
        persistColumnSizing({ ...columnSizing, ...missing }, leafColumnIds);
        return;
      }

      replaceColumnSizingFromPixels(measured);
    });
  }, [
    columnSizing,
    enableColumnResize,
    hasPersistedSizing,
    leafColumnIds,
    leafColumns,
    persistColumnSizing,
    replaceColumnSizingFromPixels,
    seedColumnSizingFromPixels,
    tableContainerRef,
  ]);

  useEffect(() => {
    if (!enableColumnResize) return;

    const element = tableContainerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      const width = readElementContentWidth(element);
      if (width > 0) {
        setContainerWidth(width);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [enableColumnResize, tableContainerRef]);

  useEffect(() => {
    if (!enableColumnResize) return;
    syncColumnSizingToColumns(leafColumnIds);
  }, [enableColumnResize, leafColumnIds, syncColumnSizingToColumns]);

  useLayoutEffect(() => {
    if (wasResizingRef.current && !isResizingColumn) {
      const clamped = clampSizingState(columnSizing, leafColumnIds);
      onColumnSizingChange(clamped);
      persistColumnSizing(clamped, leafColumnIds);
    }
    wasResizingRef.current = isResizingColumn;
  }, [
    clampSizingState,
    columnSizing,
    isResizingColumn,
    leafColumnIds,
    onColumnSizingChange,
    persistColumnSizing,
  ]);

  return {
    hasLockedColumnWidths,
    lockedColumnSizes,
    lockedColumnsTotalWidth,
    prepareColumnResize,
  };
}
