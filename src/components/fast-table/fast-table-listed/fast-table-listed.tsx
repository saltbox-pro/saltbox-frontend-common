import { MoreOutlined } from "@ant-design/icons";
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
import { Button, Empty, Flex, Spin } from "antd";
import { toJS } from "mobx";
import { Fragment, type RefObject, useEffect, useMemo, useRef, useState } from "react";

import type { LoadSource } from "../../../error-handling/create-loader";
import { Dropdown } from "../../antd-wrappers/dropdown";
import { TableErrorBoundary } from "../../module-error-boundary/boundaries/table-error-boundary";
import { FastTableHeader } from "../fast-table-header/fast-table-header";
import {
  FastTableBodyFallback,
  FastTableRefreshAlert,
  useLoaderBinding,
} from "../fast-table-load-error";
import { useColumnResizeLayout } from "../hooks/use-column-resize-layout";
import { type FastTableLocaleOverrides, useFastTableLocale } from "../hooks/use-fast-table-locale";
import { useFastTableTokenStyle } from "../hooks/use-fast-table-token-style";
import {
  type FastTableVirtualScrollOptions,
  isFastTableVirtualColumnsReady,
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
import {
  createClampedColumnSizingChange,
  resolveResizeColumnIds,
} from "../utils/column-sizing-change";
import { shouldPreventRowClick } from "../utils/should-prevent-row-click";
import {
  FastTableVirtualBody,
  renderFastTableSampleRow,
  renderFastTableTableCells,
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
  onRowClick?: (item: DataType, event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
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
  enableColumnResize?: boolean;
  /**
   * Лоадер загрузки данных: error-state вместо Empty, refresh-баннер, регистрация отрисовщика.
   * `isLoading` всё равно передавайте отдельно (`loader.isLoading`) — сама таблица не observer
   * и подписаться на состояние лоадера не может; реактивны только error-подкомпоненты.
   */
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
  tableId,
  enableColumnResize = true,
  useVirtualScroll = false,
  overscan = 20,
  estimatedRowHeight = 45,
  estimatedExpandedRowHeight = estimatedRowHeight * 20,
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
    replaceColumnSizingFromPixels,
  } = usePersistedColumnSizing(enableColumnResize ? tableId : undefined);

  const resizeColumns = useMemo(
    () =>
      applyColumnResizeDefaults(columns as Array<ColumnDef<DataType, unknown>>, enableColumnResize),
    [columns, enableColumnResize]
  );

  const resizeConstraintsById = useMemo(
    () => buildResizeColumnConstraintsById(resizeColumns),
    [resizeColumns]
  );

  const resizeColumnIds = useMemo(() => resolveResizeColumnIds(resizeColumns), [resizeColumns]);

  const handleColumnSizingChange = useMemo(
    () =>
      enableColumnResize
        ? createClampedColumnSizingChange(onColumnSizingChange, resizeColumnIds, (id) =>
            resizeConstraintsById.get(id)
          )
        : onColumnSizingChange,
    [enableColumnResize, onColumnSizingChange, resizeColumnIds, resizeConstraintsById]
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
      rowSelection,
      columnSizing,
    },
    enableSorting: !!sorting,
    enableColumnResizing: enableColumnResize,
    columnResizeMode: "onChange",
  });

  const rows = table.getRowModel().rows;
  const leafColumns = table.getVisibleLeafColumns();
  const { leafColumnIds, leafColumnIdsKey } = useStableLeafColumnIds(leafColumns);
  const visibleColumnCount = leafColumnIds.length;
  const isResizingColumn = Boolean(table.getState().columnSizingInfo.isResizingColumn);
  const hasResizeColumnSizing = hasAllColumnSizes(columnSizing, leafColumnIds);

  const { hasLockedColumnWidths, lockedColumnSizes, lockedColumnsTotalWidth, prepareColumnResize } =
    useColumnResizeLayout({
      enableColumnResize,
      tableContainerRef,
      leafColumns,
      leafColumnIds,
      leafColumnIdsKey,
      columnSizing,
      hasPersistedSizing,
      isResizingColumn,
      resizeConstraintsById,
      onColumnSizingChange: handleColumnSizingChange,
      persistColumnSizing,
      seedColumnSizingFromPixels,
      replaceColumnSizingFromPixels,
      syncColumnSizingToColumns,
    });

  const columnSizingKey = useFastTableVirtualColumnSizingKey({
    useVirtualScroll,
    columnSizing,
    isResizingColumn,
  });

  const measureColumnWidthsEnabled = useVirtualScroll && !enableColumnResize;
  const { headerHeight, columnWidths, tableScrollWidthRef, rowVirtualizer } =
    useFastTableVirtualization({
      enabled: useVirtualScroll,
      tableContainerRef,
      data,
      rows,
      columnCount: leafColumns.length,
      columnSizingKey,
      measureColumnWidthsEnabled,
      overscan,
      estimatedRowHeight,
      estimatedExpandedRowHeight,
    });

  const columnCount = table.getHeaderGroups()[0]?.headers.length ?? 0;
  const isVirtualColumnsReady = isFastTableVirtualColumnsReady({
    columnCount,
    columnWidths,
    hasLockedColumnWidths,
    enableColumnResize,
    hasResizeColumnSizing,
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

  const showTableLayoutToolbar = enableColumnResize;

  const tableViewMenuItems = useMemo(
    () => [
      {
        key: "reset-column-widths",
        label: tableLocale.resetColumnWidths,
        disabled: !hasPersistedSizing,
        onClick: resetColumnSizing,
      },
    ],
    [hasPersistedSizing, resetColumnSizing, tableLocale.resetColumnWidths]
  );

  const renderColGroup = () => (
    <colgroup>
      {leafColumns.map((column, index) => {
        const meta = column.columnDef.meta as CellMeta<DataType> | undefined;

        if (hasLockedColumnWidths) {
          const size = lockedColumnSizes?.[column.id] ?? column.getSize();
          const explicitMinSize = resizeConstraintsById.get(column.id)?.minSize;
          return (
            <col
              key={column.id}
              style={getColWidthStyle(size, {
                minWidth: explicitMinSize,
                maxWidth: column.columnDef.maxSize ?? meta?.maxWidth,
              })}
            />
          );
        }

        if (enableColumnResize && hasResizeColumnSizing) {
          return (
            <col
              key={column.id}
              style={getColWidthStyle(columnSizing[column.id] ?? column.getSize(), {
                minWidth: resizeConstraintsById.get(column.id)?.minSize,
                maxWidth: column.columnDef.maxSize ?? meta?.maxWidth,
              })}
            />
          );
        }

        return (
          <col
            key={column.id}
            style={getColWidthStyle(
              resolveColumnWidth(
                column,
                useVirtualScroll ? columnWidths[`col-${index}`] : undefined
              ),
              {
                minWidth: resolveColumnMinWidth(meta),
                maxWidth: meta?.maxWidth,
              }
            )}
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
        <Fragment key={`${row.id}-group-row`}>
          <tr
            key={row.id}
            role={isClickable ? "button" : undefined}
            className={getRowClassNames(row)}
            onClick={(event) => {
              if (!onRowClick || !isClickable) return;

              const target = event.target as HTMLElement;
              if (shouldPreventRowClick(target, event.currentTarget)) {
                return;
              }
              onRowClick(toJS(row.original), event);
            }}
          >
            {renderFastTableTableCells({ row, visibleColumnCount })}
          </tr>
          {row.getIsExpanded() && (
            <tr>
              <td colSpan={row.getVisibleCells().length}>{renderSubComponent?.({ row })}</td>
            </tr>
          )}
        </Fragment>
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
      } ${enableColumnResize ? "has-column-resize" : ""} ${
        isResizingColumn ? "is-column-resizing" : ""
      }`}
      style={fastTableTokenStyle}
    >
      {showTableLayoutToolbar && (
        <div className="fast-table-toolbar">
          <Dropdown menu={{ items: tableViewMenuItems }} trigger={["click"]}>
            <Button
              type="text"
              className="fast-table-toolbar-button"
              icon={<MoreOutlined />}
              aria-label={tableLocale.tableViewMenu}
            />
          </Dropdown>
        </div>
      )}
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
            />
          </thead>
          <tbody ref={bodyRef}>
            {shouldRenderVirtualRows
              ? renderFastTableSampleRow({ row: rows[0], visibleColumnCount })
              : renderTableRows()}
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
            isVirtualColumnsReady={isVirtualColumnsReady}
            tableScrollWidthRef={tableScrollWidthRef}
            visibleColumnCount={visibleColumnCount}
            hasLockedColumnWidths={hasLockedColumnWidths}
            lockedColumnSizes={lockedColumnSizes}
            lockedColumnsTotalWidth={lockedColumnsTotalWidth}
            enableColumnResize={enableColumnResize}
            columnSizing={columnSizing}
            columnWidths={columnWidths}
            leafColumnIds={leafColumnIds}
            hasResizeColumnSizing={hasResizeColumnSizing}
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
