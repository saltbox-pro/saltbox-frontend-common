import type { Column, ColumnSizingState, OnChangeFn, Row } from "@tanstack/react-table";
import type { CSSProperties, RefObject } from "react";

import { type FastTableColGroupProps } from "../fast-table-col-group";
import { type ColumnResizeConstraints, getFastTableStyle } from "../utils/column";

import { useColumnResizeLayout } from "./use-column-resize-layout";
import { useFastTableVirtualization } from "./use-fast-table-virtualization";

type UseFastTableViewLayoutArgs<DataType> = {
  enableColumnResize: boolean;
  tableContainerRef: RefObject<HTMLElement | null>;
  leafColumns: Array<Column<DataType, unknown>>;
  leafColumnIds: string[];
  leafColumnIdsKey: string;
  allLeafColumnIds: string[];
  columnSizing: ColumnSizingState;
  hasPersistedSizing: boolean;
  isResizingColumn: boolean;
  resizeConstraintsById: Map<string, ColumnResizeConstraints>;
  onColumnSizingChange: OnChangeFn<ColumnSizingState>;
  persistColumnSizing: (sizing: ColumnSizingState, columnIds?: string[]) => void;
  seedColumnSizingFromPixels: (pixelSizing: ColumnSizingState, replace?: boolean) => void;
  syncColumnSizingToColumns: (columnIds: string[]) => void;
  useVirtualScroll: boolean;
  rows: Array<Row<DataType>>;
  overscan?: number;
  estimatedRowHeight?: number;
  estimatedExpandedRowHeight?: number;
};

export function useFastTableViewLayout<DataType>({
  enableColumnResize,
  tableContainerRef,
  leafColumns,
  leafColumnIds,
  leafColumnIdsKey,
  allLeafColumnIds,
  columnSizing,
  hasPersistedSizing,
  isResizingColumn,
  resizeConstraintsById,
  onColumnSizingChange,
  persistColumnSizing,
  seedColumnSizingFromPixels,
  syncColumnSizingToColumns,
  useVirtualScroll,
  rows,
  overscan,
  estimatedRowHeight,
  estimatedExpandedRowHeight,
}: UseFastTableViewLayoutArgs<DataType>): {
  prepareColumnResize: () => void;
  headerHeight: number;
  rowVirtualizer: ReturnType<typeof useFastTableVirtualization<DataType>>["rowVirtualizer"];
  tableStyle: CSSProperties | undefined;
  colGroupModel: FastTableColGroupProps<DataType>;
} {
  const {
    hasLockedColumnWidths,
    fillColumnId,
    lockedColumnSizes,
    lockedColumnsTotalWidth,
    prepareColumnResize,
  } = useColumnResizeLayout({
    enableColumnResize,
    tableContainerRef,
    leafColumns,
    leafColumnIds,
    leafColumnIdsKey,
    allLeafColumnIds,
    columnSizing,
    hasPersistedSizing,
    isResizingColumn,
    resizeConstraintsById,
    onColumnSizingChange,
    persistColumnSizing,
    seedColumnSizingFromPixels,
    syncColumnSizingToColumns,
  });

  const { headerHeight, rowVirtualizer } = useFastTableVirtualization({
    enabled: useVirtualScroll,
    tableContainerRef,
    rows,
    overscan,
    estimatedRowHeight,
    estimatedExpandedRowHeight,
  });

  return {
    prepareColumnResize,
    headerHeight,
    rowVirtualizer,
    tableStyle: getFastTableStyle(lockedColumnsTotalWidth),
    colGroupModel: {
      leafColumns,
      hasLockedColumnWidths,
      fillColumnId,
      lockedColumnSizes,
      resizeConstraintsById,
    },
  };
}
