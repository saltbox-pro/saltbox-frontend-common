import type { Row } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export const FAST_TABLE_VIRTUAL_DEFAULT_OVERSCAN = 8;

export type FastTableVirtualScrollOptions = {
  useVirtualScroll?: boolean;
  overscan?: number;
  estimatedRowHeight?: number;
  estimatedExpandedRowHeight?: number;
  enableDynamicRowHeight?: boolean;
};

export type UseFastTableVirtualColumnSizingKeyOptions = {
  useVirtualScroll: boolean;
  columnSizing: Record<string, number>;
  isResizingColumn: boolean;
};

export function useFastTableVirtualColumnSizingKey({
  useVirtualScroll,
  columnSizing,
  isResizingColumn,
}: UseFastTableVirtualColumnSizingKeyOptions) {
  const frozenColumnSizingKeyRef = useRef("{}");

  return useMemo(() => {
    if (!useVirtualScroll) return "";

    if (isResizingColumn) {
      return frozenColumnSizingKeyRef.current;
    }

    const key = JSON.stringify(columnSizing);
    frozenColumnSizingKeyRef.current = key;
    return key;
  }, [columnSizing, isResizingColumn, useVirtualScroll]);
}

function areColumnWidthMapsEqual(
  prev: Record<string, number>,
  next: Record<string, number>
): boolean {
  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);
  if (prevKeys.length !== nextKeys.length) return false;
  return nextKeys.every((key) => prev[key] === next[key]);
}

export type UseFastTableVirtualizationOptions<DataType> = {
  enabled: boolean;
  tableContainerRef: RefObject<HTMLElement | null>;
  data: unknown[];
  rows: Array<Row<DataType>>;
  columnCount: number;
  columnSizingKey: string;
  measureColumnWidthsEnabled: boolean;
  overscan?: number;
  estimatedRowHeight?: number;
  estimatedExpandedRowHeight?: number;
};

export function useFastTableVirtualization<DataType>({
  enabled,
  tableContainerRef,
  data,
  rows,
  columnCount,
  columnSizingKey,
  measureColumnWidthsEnabled,
  overscan = FAST_TABLE_VIRTUAL_DEFAULT_OVERSCAN,
  estimatedRowHeight = 45,
  estimatedExpandedRowHeight = estimatedRowHeight * 20,
}: UseFastTableVirtualizationOptions<DataType>) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const tableScrollWidthRef = useRef(0);

  const measureHeaderHeight = useCallback(() => {
    if (!enabled || !tableContainerRef.current) return;

    const thead = tableContainerRef.current.querySelector("thead");
    if (!thead) return;

    const height = thead.getBoundingClientRect().height;
    setHeaderHeight((prev) => (prev === height ? prev : height));
  }, [enabled, tableContainerRef]);

  const measureColumnWidths = useCallback(() => {
    if (!enabled || !measureColumnWidthsEnabled || !tableContainerRef.current) return;

    const tableElement = tableContainerRef.current.querySelector("table");
    if (!tableElement) return;

    const headerCells = tableElement.querySelectorAll("thead th");
    const widths: Record<string, number> = {};

    headerCells.forEach((cell, index) => {
      widths[`col-${index}`] = cell.getBoundingClientRect().width;
    });

    tableScrollWidthRef.current = tableElement.offsetWidth;
    setColumnWidths((prev) => (areColumnWidthMapsEqual(prev, widths) ? prev : widths));
  }, [enabled, measureColumnWidthsEnabled, tableContainerRef]);

  useLayoutEffect(() => {
    if (!enabled) return;

    measureHeaderHeight();

    if (data.length === 0) return;

    if (measureColumnWidthsEnabled) {
      measureColumnWidths();
    }
  }, [
    columnCount,
    columnSizingKey,
    data,
    enabled,
    measureColumnWidths,
    measureColumnWidthsEnabled,
    measureHeaderHeight,
  ]);

  useEffect(() => {
    if (!enabled) return;

    const element = tableContainerRef.current;
    if (!element || data.length === 0) return;

    const observer = new ResizeObserver(() => {
      measureHeaderHeight();
      if (measureColumnWidthsEnabled) {
        measureColumnWidths();
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    data,
    enabled,
    measureColumnWidths,
    measureColumnWidthsEnabled,
    measureHeaderHeight,
    tableContainerRef,
  ]);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const getScrollElement = useCallback(() => tableContainerRef.current, [tableContainerRef]);

  const getItemKey = useCallback((index: number) => rowsRef.current[index]?.id ?? index, []);

  const estimateSize = useCallback(
    (index: number) => {
      const row = rowsRef.current[index];
      return row?.getIsExpanded() ? estimatedExpandedRowHeight : estimatedRowHeight;
    },
    [estimatedExpandedRowHeight, estimatedRowHeight]
  );

  const rowVirtualizer = useVirtualizer({
    enabled: enabled && rows.length > 0,
    count: rows.length,
    getScrollElement,
    estimateSize,
    getItemKey,
    overscan,
    scrollMargin: headerHeight,
  });

  return {
    headerHeight,
    columnWidths,
    tableScrollWidthRef,
    rowVirtualizer,
  };
}
