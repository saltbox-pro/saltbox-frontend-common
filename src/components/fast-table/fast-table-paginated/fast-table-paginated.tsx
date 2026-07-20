import { MoreOutlined } from "@ant-design/icons";
import {
  type ColumnDef,
  type ExpandedState,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button, Empty, Pagination, type PaginationProps, Spin } from "antd";
import { toJS } from "mobx";
import {
  type RefObject,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useStableLoading } from "saltbox-common/utils/table-utils";

import { Dropdown } from "../../antd-wrappers/dropdown";
import { TableErrorBoundary } from "../../module-error-boundary/boundaries/table-error-boundary";
import { CellActions } from "../cell-actions/cell-actions";
import { FastTableHeader } from "../fast-table-header/fast-table-header";
import { useColumnResizeLayout } from "../hooks/use-column-resize-layout";
import { type FastTableLocaleOverrides, useFastTableLocale } from "../hooks/use-fast-table-locale";
import { useFastTableTokenStyle } from "../hooks/use-fast-table-token-style";
import { usePersistedColumnSizing } from "../hooks/use-persisted-column-sizing";
import { useStableLeafColumnIds } from "../hooks/use-stable-leaf-column-ids";
import type { CellActionLinkComponent, CellMeta } from "../types";
import { applyColumnResizeDefaults } from "../utils/apply-column-resize-defaults";
import {
  buildGroupedRowClassNames,
  type GetRowGroupKey,
} from "../utils/build-grouped-row-class-names";
import {
  formatCssPx,
  getColWidthStyle,
  areColumnWidthsMeasured,
  buildResizeColumnConstraintsById,
  getVirtualCellWidthStyle,
  hasAllColumnSizes,
  resolveColumnMinWidth,
  resolveColumnWidth,
  sumColumnSizes,
} from "../utils/column";
import {
  createClampedColumnSizingChange,
  resolveResizeColumnIds,
} from "../utils/column-sizing-change";
import { getSortedColumnClassName } from "../utils/column-sort";
import { shouldPreventRowClick } from "../utils/should-prevent-row-click";

import "../fast-table-tokens.css";
import "../fast-table-column-resize.css";
import "./fast-table-paginated.css";

export type FastTablePaginatedProps<DataType> = {
  columns: Array<any>;
  data: Array<DataType>;
  total?: number;
  isLoading?: boolean;
  activeRowId?: string | null;
  pagination: PaginationState;
  sorting?: SortingState;
  onLazyLoad: (pagination: PaginationState, sorting: SortingState) => void;
  onRowClick?: (
    item: DataType,
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
  ) => void; // TODO: rename or use separate event handlers
  getRowId?: (originalRow: DataType, index: number, parent?: Row<DataType> | undefined) => string;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  rowSelection?: RowSelectionState;
  locale?: FastTableLocaleOverrides;
  useVirtualScroll?: boolean;
  overscan?: number;
  estimatedRowHeight?: number;
  estimatedExpandedRowHeight?: number;
  forceExpandAll?: boolean;
  renderSubComponent?: (props: { row: Row<DataType> }) => ReactElement;
  getRowCanExpand?: (row: Row<DataType>) => boolean;
  bodyRef?: RefObject<HTMLTableSectionElement>;
  isRowClickable?: (item: DataType) => boolean;
  actionLinkComponent?: CellActionLinkComponent;
  getRowClassName?: (row: DataType, index: number) => string | undefined;
  getRowGroupKey?: GetRowGroupKey<DataType>;
  tableId: string;
  enableColumnResize?: boolean;
};

function useExpanded({ forceExpandAll }: Pick<FastTablePaginatedProps<unknown>, "forceExpandAll">) {
  const [expanded, setExpanded] = useState<ExpandedState | undefined>(undefined);

  useEffect(() => {
    setExpanded(forceExpandAll || {});
  }, [forceExpandAll]);

  return {
    expanded,
    onExpandedChange: setExpanded,
  };
}

function useTableMeasurements(
  tableContainerRef: RefObject<HTMLElement>,
  data: unknown[],
  columnCount: number,
  useVirtualScroll: boolean,
  columnSizingKey: string,
  measureColumnWidthsEnabled: boolean
) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const sampleRowHeightRef = useRef(0);
  const tableScrollWidthRef = useRef(0);

  const measureHeaderHeight = useCallback(() => {
    if (!useVirtualScroll || !tableContainerRef.current) return;

    const thead = tableContainerRef.current.querySelector("thead");
    if (!thead) return;

    const height = thead.getBoundingClientRect().height;
    setHeaderHeight((prev) => (prev === height ? prev : height));
  }, [tableContainerRef, useVirtualScroll]);

  const measureSampleRowHeight = useCallback(() => {
    if (!useVirtualScroll || !tableContainerRef.current) return;

    const sampleRow = tableContainerRef.current.querySelector("tbody tr.sample-row");
    if (!sampleRow) return;

    sampleRowHeightRef.current = sampleRow.getBoundingClientRect().height;
  }, [tableContainerRef, useVirtualScroll]);

  const measureColumnWidths = useCallback(() => {
    if (!useVirtualScroll || !measureColumnWidthsEnabled || !tableContainerRef.current) return;

    const tableElement = tableContainerRef.current.querySelector("table");
    if (!tableElement) return;

    const headerCells = tableElement.querySelectorAll("thead th");
    const widths: Record<string, number> = {};

    headerCells.forEach((cell, index) => {
      widths[`col-${index}`] = cell.getBoundingClientRect().width;
    });

    const sampleRow = tableContainerRef.current.querySelector("tbody tr.sample-row");
    if (sampleRow) {
      sampleRowHeightRef.current = sampleRow.getBoundingClientRect().height;
    }

    tableScrollWidthRef.current = tableElement.offsetWidth;
    setColumnWidths(widths);
  }, [measureColumnWidthsEnabled, tableContainerRef, useVirtualScroll]);

  useLayoutEffect(() => {
    if (!useVirtualScroll) return;

    measureHeaderHeight();
    measureSampleRowHeight();
  }, [
    columnCount,
    columnSizingKey,
    data,
    measureHeaderHeight,
    measureSampleRowHeight,
    useVirtualScroll,
  ]);

  useLayoutEffect(() => {
    if (!useVirtualScroll || !tableContainerRef.current || data.length === 0) return;

    if (measureColumnWidthsEnabled) {
      measureColumnWidths();
      return;
    }

    measureSampleRowHeight();
  }, [
    columnCount,
    columnSizingKey,
    data,
    measureColumnWidths,
    measureColumnWidthsEnabled,
    measureSampleRowHeight,
    tableContainerRef,
    useVirtualScroll,
  ]);

  useEffect(() => {
    if (!useVirtualScroll) return;

    const element = tableContainerRef.current;
    if (!element || data.length === 0) return;

    const observer = new ResizeObserver(() => {
      measureHeaderHeight();
      if (measureColumnWidthsEnabled) {
        measureColumnWidths();
      } else {
        measureSampleRowHeight();
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    data,
    measureColumnWidths,
    measureColumnWidthsEnabled,
    measureHeaderHeight,
    measureSampleRowHeight,
    tableContainerRef,
    useVirtualScroll,
  ]);

  return { headerHeight, columnWidths, sampleRowHeightRef, tableScrollWidthRef };
}

function useRowVirtualizer<DataType>(
  tableContainerRef: RefObject<HTMLElement>,
  rows: Array<Row<DataType>>,
  useVirtualScroll: boolean,
  overscan: number,
  estimatedRowHeight: number,
  estimatedExpandedRowHeight: number
) {
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const getScrollElement = useCallback(() => tableContainerRef.current, [tableContainerRef]);

  const getItemKey = useCallback((index: number) => rowsRef.current[index]?.id ?? index, []);

  const estimateSize = useCallback(
    (index: number) => {
      const row = rowsRef.current[index];
      return row?.getIsExpanded() ? estimatedExpandedRowHeight : estimatedRowHeight;
    },
    [estimatedRowHeight, estimatedExpandedRowHeight]
  );

  const rowVirtualizer = useVirtualizer({
    enabled: useVirtualScroll && rows.length > 0,
    count: rows.length,
    getScrollElement,
    estimateSize,
    getItemKey,
    overscan,
    paddingEnd: 1,
  });

  return { rowVirtualizer };
}

export function FastTablePaginated<DataType>(props: FastTablePaginatedProps<DataType>) {
  return (
    <TableErrorBoundary>
      <FastTablePaginatedContent {...props} />
    </TableErrorBoundary>
  );
}

function FastTablePaginatedContent<DataType>({
  columns,
  data,
  total,
  isLoading = false,
  activeRowId,
  pagination,
  sorting,
  onLazyLoad,
  onRowClick,
  getRowId,
  onRowSelectionChange,
  rowSelection,
  locale,
  useVirtualScroll = false,
  overscan = 20,
  estimatedRowHeight = 45,
  estimatedExpandedRowHeight = estimatedRowHeight * 20,
  forceExpandAll,
  renderSubComponent,
  getRowCanExpand,
  bodyRef,
  isRowClickable,
  actionLinkComponent,
  getRowClassName,
  getRowGroupKey,
  tableId,
  enableColumnResize = true,
}: FastTablePaginatedProps<DataType>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { stableIsLoading, stableData } = useStableLoading(isLoading, data, {
    delay: 0,
  });
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
    data: stableData,
    getRowId,
    getCoreRowModel: getCoreRowModel<DataType>(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowCanExpand: getRowCanExpand,
    onRowSelectionChange,
    onExpandedChange,
    onColumnSizingChange: handleColumnSizingChange,
    onSortingChange: (updaterOrValue) => {
      const updatedSorting =
        typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue;

      const nextSorting =
        updatedSorting?.map((item) => {
          const column = table.getColumn(item.id);
          const columnDef = column?.columnDef;

          const accessorKey =
            columnDef && "accessorKey" in columnDef && typeof columnDef.accessorKey === "string"
              ? columnDef.accessorKey
              : undefined;

          if (accessorKey && accessorKey !== item.id) {
            return { ...item, backendId: accessorKey };
          }

          return item;
        }) ?? updatedSorting;

      onLazyLoad(pagination, nextSorting);
    },
    onPaginationChange: (updaterOrValue) => {
      const nextPagination =
        typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue;
      onLazyLoad(nextPagination, sorting);
    },
    state: {
      pagination,
      sorting,
      rowSelection,
      expanded,
      columnSizing,
    },
    enableSorting: !!sorting,
    enableColumnResizing: enableColumnResize,
    columnResizeMode: "onChange",
    manualSorting: true,
    manualPagination: true,
    rowCount: total,
  });

  const rows = table.getRowModel().rows;
  const leafColumns = table.getVisibleLeafColumns();
  const { leafColumnIds, leafColumnIdsKey } = useStableLeafColumnIds(leafColumns);
  const visibleColumnCount = leafColumnIds.length;
  const isResizingColumn = Boolean(table.getState().columnSizingInfo.isResizingColumn);
  const hasResizeColumnSizing = hasAllColumnSizes(columnSizing, leafColumnIds);

  const frozenColumnSizingKeyRef = useRef("{}");
  const columnSizingKey = useMemo(() => {
    if (!useVirtualScroll) return "";
    if (isResizingColumn) {
      return frozenColumnSizingKeyRef.current;
    }
    const key = JSON.stringify(columnSizing);
    frozenColumnSizingKeyRef.current = key;
    return key;
  }, [columnSizing, isResizingColumn, useVirtualScroll]);

  const measureColumnWidthsEnabled = useVirtualScroll && !enableColumnResize;
  const { headerHeight, columnWidths, sampleRowHeightRef, tableScrollWidthRef } =
    useTableMeasurements(
      tableContainerRef,
      stableData,
      columns.length,
      useVirtualScroll,
      columnSizingKey,
      measureColumnWidthsEnabled
    );

  const effectiveEstimatedRowHeight =
    sampleRowHeightRef.current > 0 ? sampleRowHeightRef.current : estimatedRowHeight;

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
      dataRevision: stableData,
    });

  const groupedRowClassNames = useMemo(
    () => (getRowGroupKey ? buildGroupedRowClassNames(stableData, getRowGroupKey) : undefined),
    [getRowGroupKey, stableData]
  );

  const columnCount = table.getHeaderGroups()[0]?.headers.length ?? 0;
  const isVirtualColumnsReady =
    hasLockedColumnWidths ||
    (enableColumnResize && hasResizeColumnSizing) ||
    areColumnWidthsMeasured(columnCount, columnWidths);

  const { rowVirtualizer } = useRowVirtualizer(
    tableContainerRef,
    rows,
    useVirtualScroll,
    overscan,
    effectiveEstimatedRowHeight,
    estimatedExpandedRowHeight
  );

  const tableLocale = useFastTableLocale(locale);
  const fastTableTokenStyle = useFastTableTokenStyle();
  const showTableLayoutToolbar = enableColumnResize;

  const tableViewMenuItems = useMemo(
    () => [
      {
        key: "reset-column-widths",
        label: tableLocale.resetColumnWidths,
        disabled: !hasPersistedSizing && !hasResizeColumnSizing,
        onClick: resetColumnSizing,
      },
    ],
    [hasPersistedSizing, hasResizeColumnSizing, resetColumnSizing, tableLocale.resetColumnWidths]
  );

  const showTotal: PaginationProps["showTotal"] = (total) => `${tableLocale.total} ${total}`;

  const handlePaginationChange = (page: number, pageSize: number) => {
    table.setPagination({
      pageIndex: page - 1,
      pageSize,
    });
  };

  const getRowClassNames = (row: Row<DataType>, isVirtualRow = false) => {
    const groupClassName = groupedRowClassNames?.[row.index];
    const customClassName = getRowClassName?.(row.original, row.index);
    const activeClassName =
      row.id === activeRowId
        ? isVirtualRow
          ? "virtual-row-active"
          : "fast-table-row-active"
        : undefined;

    const className = [
      isVirtualRow ? "virtual-row" : undefined,
      groupClassName,
      customClassName,
      activeClassName,
    ]
      .filter(Boolean)
      .join(" ");

    return className || undefined;
  };

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

  const renderTableRow = (row: Row<DataType>) => {
    return row.getVisibleCells().map((cell) => {
      const meta = cell.column.columnDef.meta as CellMeta<DataType> | undefined;
      const isEllipsis = meta?.ellipsis ?? true;

      return (
        <td
          key={cell.id}
          className={`cell-with-actions ${meta?.tdClassName ?? ""} ${getSortedColumnClassName(cell.column.getIsSorted(), visibleColumnCount)} ${meta?.color ? `cell-color-${meta.color}` : ""}`}
        >
          <span className="cell-content">
            <span className={`cell-content-text ${isEllipsis ? "cell-content-text-ellipsis" : ""}`}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </span>
            {(meta?.showCopy || meta?.actions) && (
              <CellActions
                value={cell.getValue()}
                row={row.original}
                showCopy={meta.showCopy}
                copyValue={meta.copyValue?.(row.original)}
                actions={meta.actions}
                linkComponent={actionLinkComponent}
              />
            )}
          </span>
        </td>
      );
    });
  };

  const renderSampleRow = () => {
    const row = rows[0];
    if (!row) return null;
    return (
      <tr key={row.id} className="sample-row">
        {renderTableRow(row)}
      </tr>
    );
  };

  const renderTableRows = (rowCount?: number) => {
    const rowsToRender = rowCount === undefined ? rows : rows.slice(0, rowCount);
    return rowsToRender.map((row) => {
      const isClickable = onRowClick && (!isRowClickable || isRowClickable(row.original));
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
            {renderTableRow(row)}
          </tr>
          {row.getIsExpanded() && (
            <tr key={`${row.id}-sub-row`}>
              <td colSpan={row.getVisibleCells().length}>{renderSubComponent?.({ row })}</td>
            </tr>
          )}
        </Fragment>
      );
    });
  };

  const renderVirtualizedRows = () => {
    const renderRow = (row: Row<DataType>) => {
      return row.getVisibleCells().map((cell, index) => {
        const meta = cell.column.columnDef.meta as CellMeta<DataType> | undefined;
        const widthStyle = (() => {
          if (hasLockedColumnWidths) {
            return getVirtualCellWidthStyle(
              lockedColumnSizes?.[cell.column.id] ?? cell.column.getSize()
            );
          }

          if (enableColumnResize) {
            return getVirtualCellWidthStyle(columnSizing[cell.column.id] ?? cell.column.getSize());
          }

          const measuredWidth = columnWidths[`col-${index}`];
          const resolvedWidth = resolveColumnWidth(cell.column, measuredWidth);
          return getVirtualCellWidthStyle(
            typeof resolvedWidth === "number" ? resolvedWidth : measuredWidth
          );
        })();

        const isEllipsis = meta?.ellipsis ?? true;

        return (
          <div
            key={cell.id}
            className={`virtual-cell cell-with-actions ${meta?.tdClassName ?? ""} ${getSortedColumnClassName(cell.column.getIsSorted(), visibleColumnCount)} ${meta?.color ? `cell-color-${meta.color}` : ""}`}
            style={widthStyle}
          >
            <span className="cell-content">
              <span
                className={`cell-content-text ${isEllipsis ? "cell-content-text-ellipsis" : ""}`}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </span>
              {(meta?.showCopy || meta?.actions) && (
                <CellActions
                  value={cell.getValue()}
                  row={row.original}
                  showCopy={meta.showCopy}
                  copyValue={meta.copyValue?.(row.original)}
                  actions={meta.actions}
                  linkComponent={actionLinkComponent}
                />
              )}
            </span>
          </div>
        );
      });
    };

    const virtualRows = rowVirtualizer.getVirtualItems();
    const paddingTop = virtualRows[0]?.start || 0;
    const resizeSizingTotalWidth = hasResizeColumnSizing
      ? sumColumnSizes(columnSizing, leafColumnIds)
      : 0;
    const virtualBodyWidth =
      lockedColumnsTotalWidth !== undefined
        ? formatCssPx(lockedColumnsTotalWidth)
        : resizeSizingTotalWidth > 0
          ? formatCssPx(resizeSizingTotalWidth)
          : tableScrollWidthRef.current > 0
            ? formatCssPx(tableScrollWidthRef.current)
            : "100%";

    return (
      <div
        className="virtual-tbody-container"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          top: `${headerHeight}px`,
          width: virtualBodyWidth,
          visibility: headerHeight > 0 && isVirtualColumnsReady ? "visible" : "hidden",
        }}
      >
        <div
          className="virtual-tbody-content"
          style={{
            transform: `translateY(${paddingTop}px)`,
            willChange: "transform",
          }}
        >
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            const isClickable = onRowClick && (!isRowClickable || isRowClickable(row.original));
            const isFirstVirtualRow = virtualRow.start === 0;
            const rowClassName = `${getRowClassNames(
              row,
              true
            )} ${isFirstVirtualRow ? "virtual-row-first" : ""}`;
            return (
              <div
                key={`${row.id}-group-row`}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className={rowClassName}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onClick={(event) => {
                  if (!onRowClick || !isClickable) return;

                  const target = event.target as HTMLElement;
                  if (shouldPreventRowClick(target, event.currentTarget)) {
                    return;
                  }
                  onRowClick(toJS(row.original), event);
                }}
                onKeyDown={
                  isClickable
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick!(toJS(row.original), event);
                        }
                      }
                    : undefined
                }
              >
                <div className="virtual-row-cells">{renderRow(row)}</div>
                {row.getIsExpanded() && renderSubComponent && (
                  <div className="virtual-row-expanded">{renderSubComponent({ row })}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
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

  const renderTableFooter = () => {
    return (
      <div className="fast-table-summary">
        <div className="fast-table-pagination">
          <Pagination
            size="small"
            current={pagination.pageIndex + 1}
            pageSize={pagination.pageSize}
            total={total}
            showTotal={showTotal}
            showSizeChanger
            pageSizeOptions={[10, 50, 100, 1000]}
            defaultPageSize={50}
            showQuickJumper
            onChange={handlePaginationChange}
          />
        </div>
      </div>
    );
  };

  const shouldShowEmpty = !stableIsLoading && rows.length === 0;

  return (
    <div
      className={`fast-table ${shouldShowEmpty ? "empty" : ""} ${
        useVirtualScroll ? "virtual-scroll" : ""
      } ${hasLockedColumnWidths || (enableColumnResize && hasResizeColumnSizing) ? "has-column-resize" : ""} ${
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
      <Spin
        wrapperClassName="fast-table-spinner-wrapper"
        className="fast-table-spinner"
        spinning={stableIsLoading}
      >
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
              {shouldShowEmpty && renderEmptyState()}
              {useVirtualScroll ? renderSampleRow() : renderTableRows()}
            </tbody>
          </table>
          {useVirtualScroll && renderVirtualizedRows()}
        </div>
      </Spin>
      {renderTableFooter()}
    </div>
  );
}
