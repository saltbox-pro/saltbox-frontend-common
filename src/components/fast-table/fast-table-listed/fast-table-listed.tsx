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
import { FastTableColGroup } from "../fast-table-col-group";
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
import { useColumnSizing } from "../hooks/use-column-sizing";
import { type FastTableLocaleOverrides, useFastTableLocale } from "../hooks/use-fast-table-locale";
import { useFastTableTokenStyle } from "../hooks/use-fast-table-token-style";
import { useFastTableViewLayout } from "../hooks/use-fast-table-view-layout";
import {
  FAST_TABLE_VIRTUAL_DEFAULT_OVERSCAN,
  type FastTableVirtualScrollOptions,
} from "../hooks/use-fast-table-virtualization";
import { useRowSelectionShortcuts } from "../hooks/use-row-selection-shortcuts";
import { useStableLeafColumnIds } from "../hooks/use-stable-leaf-column-ids";
import { applyColumnResizeDefaults } from "../utils/apply-column-resize-defaults";
import { buildResizeColumnConstraintsById } from "../utils/column";
import { buildColumnSettingsItems } from "../utils/column-layout";
import {
  createClampedColumnSizingChange,
  resolveResizeColumnIds,
} from "../utils/column-sizing-change";
import { FastTableTableRow } from "../virtual-scroll/fast-table-table-row";
import { FastTableVirtualBody } from "../virtual-scroll/fast-table-virtual-body";
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
  enableRowSelectionShortcuts?: boolean;
  locale?: FastTableLocaleOverrides;
  bodyRef?: RefObject<HTMLTableSectionElement>;
  tableId: string;
  defaultHiddenColumnIds?: string[];
  enableColumnSettings?: boolean;
  wrapHeaders?: boolean;
  compactLoader?: boolean;
  onRefresh?: () => void;
  loader?: LoadSource;
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
  enableRowSelectionShortcuts = false,
  tableId,
  defaultHiddenColumnIds,
  enableColumnSettings = true,
  wrapHeaders = false,
  compactLoader = false,
  onRefresh,
  useVirtualScroll = false,
  overscan = FAST_TABLE_VIRTUAL_DEFAULT_OVERSCAN,
  estimatedRowHeight = 45,
  estimatedExpandedRowHeight = estimatedRowHeight * 20,
  enableDynamicRowHeight = true,
  loader,
}: FastTableListedProps<DataType>) {
  useLoaderBinding(loader);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableLocale = useFastTableLocale(locale);
  const fastTableTokenStyle = useFastTableTokenStyle();
  const { onExpandedChange, expanded } = useExpanded({ forceExpandAll });

  const {
    columnSizing,
    hasPersistedSizing,
    onColumnSizingChange,
    persistColumnSizing,
    resetColumnSizing,
    syncColumnSizingToColumns,
    seedColumnSizingFromPixels,
  } = useColumnSizing(enableColumnSettings ? tableId : undefined);

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
    defaultHiddenColumnIds,
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

  const rowSelectionShortcuts = useRowSelectionShortcuts<DataType>({
    enabled: enableRowSelectionShortcuts && onRowSelectionChange != null,
    containerRef: tableContainerRef,
  });

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
  rowSelectionShortcuts.tableRef.current = table;

  const rows = table.getRowModel().rows;
  const leafColumns = table.getVisibleLeafColumns();
  const allLeafColumns = table.getAllLeafColumns();
  const { leafColumnIds, leafColumnIdsKey } = useStableLeafColumnIds(leafColumns);
  const { leafColumnIds: allLeafColumnIds } = useStableLeafColumnIds(allLeafColumns);
  const visibleColumnCount = leafColumnIds.length;
  const isResizingColumn = Boolean(table.getState().columnSizingInfo.isResizingColumn);

  const { prepareColumnResize, headerHeight, rowVirtualizer, tableStyle, colGroupModel } =
    useFastTableViewLayout({
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
      useVirtualScroll,
      rows,
      overscan,
      estimatedRowHeight,
      estimatedExpandedRowHeight,
    });

  const shouldRenderVirtualRows = useVirtualScroll && !isEmpty && !isLoading && rows.length > 0;

  const getRowClassNames = (row: Row<DataType>) => {
    const classNames = [
      row.id === activeRowId && "fast-table-row-active",
      row.getIsSelected() && "fast-table-row-selected",
    ].filter(Boolean);

    return classNames.length > 0 ? classNames.join(" ") : undefined;
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
          leafColumnIdsKey={leafColumnIdsKey}
          isResizingColumn={isResizingColumn}
          onRowClick={onRowClick}
          onRowModifierClick={rowSelectionShortcuts.onRowModifierClick}
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
      } ${compactLoader ? "fast-table-compact-loader" : ""}`}
      style={fastTableTokenStyle}
    >
      {shouldRenderInlineToolbar && <FastTableInlineToolbar model={toolbarModel} />}
      <FastTableRefreshAlert loader={loader} />
      <div className="fast-table-wrapper" ref={tableContainerRef}>
        <table className={wrapHeaders ? "fast-table-wrap-headers" : undefined} style={tableStyle}>
          <FastTableColGroup {...colGroupModel} />
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
            {shouldRenderVirtualRows && (
              <FastTableVirtualBody
                rows={rows}
                rowVirtualizer={rowVirtualizer}
                headerHeight={headerHeight}
                visibleColumnCount={visibleColumnCount}
                leafColumnIdsKey={leafColumnIdsKey}
                isResizingColumn={isResizingColumn}
                estimatedRowHeight={estimatedRowHeight}
                enableDynamicRowHeight={enableDynamicRowHeight}
                onRowClick={onRowClick}
                onRowModifierClick={rowSelectionShortcuts.onRowModifierClick}
                isRowClickable={isRowClickable}
                getRowClassName={getRowClassNames}
                renderSubComponent={renderSubComponent}
              />
            )}
            {!shouldRenderVirtualRows && renderTableRows()}
            {isEmpty &&
              !isLoading &&
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
      </div>
      {!hideFooter && renderTableFooter()}
    </div>
  );
}
