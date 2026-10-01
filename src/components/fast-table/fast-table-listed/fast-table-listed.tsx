import {
  type ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  OnChangeFn,
  Row,
  RowSelectionState,
  SortingState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Empty, Flex, Spin } from "antd";
import {
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { LoadSource } from "../../../error-handling/create-loader";
import { TableErrorBoundary } from "../../module-error-boundary/boundaries/table-error-boundary";
import { FastTableHeader } from "../fast-table-header/fast-table-header";
import {
  FastTableBodyFallback,
  FastTableRefreshAlert,
  useLoaderBinding,
} from "../fast-table-load-error";
import { FastTableInlineToolbar } from "../fast-table-toolbar/fast-table-inline-toolbar";
import { usePublishFastTableToolbar } from "../fast-table-toolbar/use-publish-fast-table-toolbar";
import { useColumnLayout } from "../hooks/use-column-layout";
import { useColumnMove } from "../hooks/use-column-move";
import { useColumnResizeLayout } from "../hooks/use-column-resize-layout";
import { useDeclaredFillWidth } from "../hooks/use-declared-fill-width";
import { type FastTableLocaleOverrides, useFastTableLocale } from "../hooks/use-fast-table-locale";
import { useFastTableTokenStyle } from "../hooks/use-fast-table-token-style";
import {
  FAST_TABLE_VIRTUAL_DEFAULT_OVERSCAN,
  type FastTableVirtualScrollOptions,
  useFastTableVirtualColumnSizingKey,
  useFastTableVirtualization,
} from "../hooks/use-fast-table-virtualization";
import { usePersistedColumnSizing } from "../hooks/use-persisted-column-sizing";
import { useStableLeafColumnIds } from "../hooks/use-stable-leaf-column-ids";
import { CellMeta } from "../types";
import { applyColumnResizeDefaults } from "../utils/apply-column-resize-defaults";
import {
  buildResizeColumnConstraintsById,
  formatCssPx,
  getColWidthStyle,
  hasAllColumnSizes,
  resolveColumnMinWidth,
  resolveColumnWidth,
} from "../utils/column";
import { buildColumnSettingsItems } from "../utils/column-layout";
import {
  createClampedColumnSizingChange,
  resolveResizeColumnIds,
} from "../utils/column-sizing-change";
import { resolveCellsRevisionKey } from "../utils/column-sort";
import { FastTableTableRow } from "../virtual-scroll/fast-table-table-row";
import {
  FastTableVirtualBody,
  renderFastTableVirtualSpacer,
} from "../virtual-scroll/fast-table-virtual-body";
import "../fast-table-tokens.css";
import "../fast-table-column-resize.css";
import "./fast-table-listed.css";

export type FastTableListedProps<DataType> = FastTableVirtualScrollOptions & {
  columns: Array<any>;
  data: Array<DataType>;
  total?: number;
  isEmpty?: boolean;
  isLoading?: boolean;
  hideFooter?: boolean;
  forceExpandAll?: boolean;
  activeRowId?: string | null;
  onRowClick?: (
    item: DataType,
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
  ) => void;
  isRowClickable?: (item: DataType) => boolean;
  renderSubComponent?: (props: { row: Row<DataType> }) => React.ReactElement;
  getRowCanExpand?: (row: Row<DataType>) => boolean;
  columnFilters?: ColumnFiltersState;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  getRowId?: (originalRow: DataType, index: number, parent?: Row<DataType> | undefined) => string;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  rowSelection?: RowSelectionState;
  locale?: FastTableLocaleOverrides;
  bodyRef?: RefObject<HTMLTableSectionElement>;
  tableId: string;
  enableColumnSettings?: boolean;
  onRefresh?: () => void;
  loader?: LoadSource;
  cellsRevisionKey?: string | number;
};

function useExpanded({ forceExpandAll }: Pick<FastTableListedProps<unknown>, "forceExpandAll">) {
  const [expanded, setExpanded] = useState<ExpandedState | undefined>(undefined);

  useEffect(() => {
    setExpanded(forceExpandAll || {});
  }, [forceExpandAll]);

  return {
    expanded,
    onExpandedChange: setExpanded,
  };
}

export function FastTableListed<DataType>(props: FastTableListedProps<DataType>) {
  return (
    <TableErrorBoundary>
      <FastTableListedContent {...props} />
    </TableErrorBoundary>
  );
}

function FastTableListedContent<DataType>({
  columns,
  data,
  total,
  isEmpty,
  isLoading,
  hideFooter,
  forceExpandAll,
  activeRowId,
  onRowClick,
  isRowClickable,
  renderSubComponent,
  getRowCanExpand,
  sorting,
  onSortingChange,
  getRowId,
  locale,
  bodyRef,
  onRowSelectionChange,
  rowSelection,
  tableId,
  enableColumnSettings = true,
  onRefresh,
  useVirtualScroll = false,
  overscan = FAST_TABLE_VIRTUAL_DEFAULT_OVERSCAN,
  estimatedRowHeight = 45,
  estimatedExpandedRowHeight = estimatedRowHeight * 20,
  enableDynamicRowHeight = true,
  loader,
  cellsRevisionKey,
}: FastTableListedProps<DataType>) {
  useLoaderBinding(loader);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableLocale = useFastTableLocale(locale);
  const fastTableTokenStyle = useFastTableTokenStyle();
  const { onExpandedChange, expanded } = useExpanded({ forceExpandAll });
  const resolvedCellsRevisionKey = useMemo(
    () => resolveCellsRevisionKey(cellsRevisionKey, sorting),
    [cellsRevisionKey, sorting]
  );

  const {
    columnSizing,
    hasPersistedSizing,
    onColumnSizingChange,
    persistColumnSizing,
    resetColumnSizing,
    syncColumnSizingToColumns,
    seedColumnSizingFromPixels,
  } = usePersistedColumnSizing(enableColumnSettings ? tableId : undefined);

  const resizeColumns = useMemo(
    () =>
      applyColumnResizeDefaults(
        columns as Array<ColumnDef<DataType, unknown>>,
        enableColumnSettings
      ),
    [columns, enableColumnSettings]
  );

  const resizeConstraintsById = useMemo(
    () => buildResizeColumnConstraintsById(resizeColumns),
    [resizeColumns]
  );

  const resizeColumnIds = useMemo(() => resolveResizeColumnIds(resizeColumns), [resizeColumns]);

  const { columnOrder, columnVisibility, applyColumnLayout } = useColumnLayout({
    tableId: enableColumnSettings ? tableId : undefined,
    columns: resizeColumns,
  });

  const handleColumnSizingChange = useMemo(
    () =>
      enableColumnSettings
        ? createClampedColumnSizingChange(onColumnSizingChange, resizeColumnIds, (id) =>
            resizeConstraintsById.get(id)
          )
        : onColumnSizingChange,
    [enableColumnSettings, onColumnSizingChange, resizeColumnIds, resizeConstraintsById]
  );

  const table = useReactTable({
    columns: resizeColumns,
    data,
    getRowId,
    getCoreRowModel: getCoreRowModel<DataType>(),
    getRowCanExpand: getRowCanExpand,
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    filterFns: {},
    onSortingChange,
    onExpandedChange,
    onRowSelectionChange,
    onColumnSizingChange: handleColumnSizingChange,
    state: {
      sorting,
      expanded,
      rowSelection: rowSelection ?? {},
      columnSizing,
      columnOrder,
      columnVisibility,
    },
    enableSorting: !!sorting,
    enableColumnResizing: enableColumnSettings,
    columnResizeMode: "onChange",
  });

  const rows = table.getRowModel().rows;
  const leafColumns = table.getVisibleLeafColumns();
  const allLeafColumns = table.getAllLeafColumns();
  const { leafColumnIds, leafColumnIdsKey } = useStableLeafColumnIds(leafColumns);
  const { leafColumnIds: allLeafColumnIds } = useStableLeafColumnIds(allLeafColumns);
  const visibleColumnCount = leafColumnIds.length;
  const isResizingColumn = Boolean(table.getState().columnSizingInfo.isResizingColumn);
  const hasResizeColumnSizing = hasAllColumnSizes(columnSizing, leafColumnIds);

  const { hasLockedColumnWidths, lockedColumnSizes, lockedColumnsTotalWidth, prepareColumnResize } =
    useColumnResizeLayout({
      enableColumnResize: enableColumnSettings,
      tableContainerRef,
      leafColumns,
      leafColumnIds,
      leafColumnIdsKey,
      allLeafColumnIds,
      columnSizing,
      hasPersistedSizing,
      isResizingColumn,
      resizeConstraintsById,
      onColumnSizingChange: handleColumnSizingChange,
      persistColumnSizing,
      seedColumnSizingFromPixels,
      syncColumnSizingToColumns,
    });

  const columnSizingKey = useFastTableVirtualColumnSizingKey({
    useVirtualScroll,
    columnSizing,
    isResizingColumn,
  });

  const measureColumnWidthsEnabled = useVirtualScroll && !hasResizeColumnSizing;
  const { headerHeight, columnWidths, tableScrollWidthRef, rowVirtualizer } =
    useFastTableVirtualization({
      enabled: useVirtualScroll,
      tableContainerRef,
      data,
      rows,
      columnCount: visibleColumnCount,
      columnSizingKey,
      columnLayoutKey: leafColumnIdsKey,
      measureColumnWidthsEnabled,
      overscan,
      estimatedRowHeight,
      estimatedExpandedRowHeight,
    });

  const shouldRenderVirtualRows = useVirtualScroll && !isEmpty && !isLoading && rows.length > 0;

  const getRowClassNames = (row: Row<DataType>, isVirtualRow = false) => {
    const activeClassName =
      row.id === activeRowId
        ? isVirtualRow
          ? "virtual-row virtual-row-active"
          : "fast-table-row-active"
        : isVirtualRow
          ? "virtual-row"
          : undefined;

    return activeClassName;
  };

  const columnSettings = useMemo(
    () => ({
      items: buildColumnSettingsItems(allLeafColumns),
      onApply: applyColumnLayout,
    }),
    [allLeafColumns, applyColumnLayout]
  );

  const refresh = useMemo(
    () => (onRefresh ? { onRefresh, isLoading: !!isLoading } : undefined),
    [onRefresh, isLoading]
  );

  const toolbarModel = useMemo(
    () => ({
      locale: tableLocale,
      showColumnControls: enableColumnSettings,
      canResetColumnWidths: hasPersistedSizing,
      onResetColumnWidths: resetColumnSizing,
      columnSettings,
      refresh,
    }),
    [
      tableLocale,
      enableColumnSettings,
      hasPersistedSizing,
      resetColumnSizing,
      columnSettings,
      refresh,
    ]
  );

  const shouldRenderInlineToolbar = usePublishFastTableToolbar(
    enableColumnSettings || !!onRefresh,
    toolbarModel
  );

  const { canMoveColumn, moveColumn } = useColumnMove({
    items: columnSettings.items,
    onApply: applyColumnLayout,
  });

  const declaredFillWidth = useDeclaredFillWidth(leafColumns);

  const renderColGroup = () => (
    <colgroup>
      {leafColumns.map((column) => {
        const meta = column.columnDef.meta as CellMeta<DataType> | undefined;

        if (hasLockedColumnWidths) {
          const size = lockedColumnSizes?.[column.id] ?? column.getSize();
          const explicitMinSize = resizeConstraintsById.get(column.id)?.minSize;
          return (
            <col
              key={column.id}
              style={getColWidthStyle(size, {
                minWidth: explicitMinSize,
                maxWidth: meta?.maxWidth,
              })}
            />
          );
        }

        if (enableColumnSettings && hasResizeColumnSizing) {
          return (
            <col
              key={column.id}
              style={getColWidthStyle(columnSizing[column.id] ?? column.getSize(), {
                minWidth: resizeConstraintsById.get(column.id)?.minSize,
                maxWidth: meta?.maxWidth,
              })}
            />
          );
        }

        const declaredWidth =
          declaredFillWidth?.columnId === column.id
            ? declaredFillWidth.width
            : resolveColumnWidth(column);

        return (
          <col
            key={column.id}
            style={getColWidthStyle(declaredWidth, {
              minWidth: resolveColumnMinWidth(meta),
              maxWidth: meta?.maxWidth,
            })}
          />
        );
      })}
    </colgroup>
  );

  const renderTableRows = () => {
    return rows.map((row) => {
      const isClickable = Boolean(
        onRowClick && (isRowClickable == null || isRowClickable(row.original))
      );
      return (
        <FastTableTableRow
          key={`${row.id}-group-row`}
          row={row}
          className={getRowClassNames(row)}
          isClickable={isClickable}
          isExpanded={row.getIsExpanded()}
          visibleColumnCount={visibleColumnCount}
          columnOrderKey={leafColumnIdsKey}
          cellsRevisionKey={resolvedCellsRevisionKey}
          onRowClick={onRowClick}
          renderSubComponent={renderSubComponent}
        />
      );
    });
  };

  const renderEmptyState = () => {
    return (
      <tr className="empty-state-row">
        <td colSpan={table.getAllColumns().length}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={tableLocale.empty} />
        </td>
      </tr>
    );
  };

  const renderLoadingState = () => {
    return (
      <tr className="loading-state-row">
        <td colSpan={table.getAllColumns().length}>
          <Flex justify="center" align="center" className="fast-table-loader">
            <Spin />
          </Flex>
        </td>
      </tr>
    );
  };

  const renderTableFooter = () => {
    return (
      <div className="fast-table-summary">
        <div className="fast-table-pagination">
          {total !== undefined && (
            <>
              {tableLocale.total} {table.getRowCount()}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`fast-table ${isEmpty ? "empty" : ""} ${isLoading ? "loading" : ""} ${
        useVirtualScroll ? "virtual-scroll" : ""
      } ${enableColumnSettings ? "has-column-resize" : ""} ${
        isResizingColumn ? "is-column-resizing" : ""
      }`}
      style={fastTableTokenStyle}
    >
      {shouldRenderInlineToolbar && <FastTableInlineToolbar model={toolbarModel} />}
      <FastTableRefreshAlert loader={loader} />
      <div className="fast-table-wrapper" ref={tableContainerRef}>
        <table
          style={
            lockedColumnsTotalWidth !== undefined
              ? { width: formatCssPx(lockedColumnsTotalWidth) }
              : undefined
          }
        >
          {renderColGroup()}
          <thead>
            <FastTableHeader
              table={table}
              locale={tableLocale}
              onPrepareColumnResize={prepareColumnResize}
              canMoveColumn={enableColumnSettings ? canMoveColumn : undefined}
              onMoveColumn={enableColumnSettings ? moveColumn : undefined}
            />
          </thead>
          <tbody ref={bodyRef}>
            {shouldRenderVirtualRows &&
              renderFastTableVirtualSpacer({
                colSpan: Math.max(visibleColumnCount, 1),
                height: rowVirtualizer.getTotalSize(),
              })}
            {!shouldRenderVirtualRows && renderTableRows()}
            {isEmpty &&
              (loader ? (
                <FastTableBodyFallback
                  loader={loader}
                  colSpan={table.getAllColumns().length}
                  emptyDescription={tableLocale.empty}
                />
              ) : (
                renderEmptyState()
              ))}
            {isLoading && renderLoadingState()}
          </tbody>
        </table>
        {shouldRenderVirtualRows && (
          <FastTableVirtualBody
            rows={rows}
            rowVirtualizer={rowVirtualizer}
            headerHeight={headerHeight}
            tableScrollWidthRef={tableScrollWidthRef}
            visibleColumnCount={visibleColumnCount}
            hasLockedColumnWidths={hasLockedColumnWidths}
            lockedColumnSizes={lockedColumnSizes}
            lockedColumnsTotalWidth={lockedColumnsTotalWidth}
            enableColumnResize={enableColumnSettings}
            columnSizing={columnSizing}
            columnWidths={columnWidths}
            leafColumnIds={leafColumnIds}
            leafColumnIdsKey={leafColumnIdsKey}
            hasResizeColumnSizing={hasResizeColumnSizing}
            estimatedRowHeight={estimatedRowHeight}
            enableDynamicRowHeight={enableDynamicRowHeight}
            cellsRevisionKey={resolvedCellsRevisionKey}
            onRowClick={onRowClick}
            isRowClickable={isRowClickable}
            getRowClassName={getRowClassNames}
            renderSubComponent={renderSubComponent}
          />
        )}
      </div>
      {!hideFooter && renderTableFooter()}
    </div>
  );
}
