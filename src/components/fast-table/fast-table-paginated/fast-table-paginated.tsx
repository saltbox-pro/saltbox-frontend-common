import {
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
import { Empty, Pagination, type PaginationProps, Spin } from "antd";
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
  useRef,
  useState,
} from "react";

import { useStableLoading } from "saltbox-common/utils/table-utils";

import { DEFAULT_PREVENT_ROW_CLICK_SELECTOR } from "../../../constants/dom-selectors";
import { CellActions } from "../cell-actions/cell-actions";
import { FastTableHeader } from "../fast-table-header/fast-table-header";
import { type FastTableLocaleOverrides, useFastTableLocale } from "../hooks/use-fast-table-locale";
import type { CellActionLinkComponent, CellMeta } from "../types";
import {
  getColumnWidthStyle,
  areColumnWidthsMeasured,
  getVirtualCellWidthStyle,
} from "../utils/column";

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
  useVirtualScroll: boolean
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
    if (!useVirtualScroll || !tableContainerRef.current) return;

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
  }, [tableContainerRef, useVirtualScroll]);

  useLayoutEffect(() => {
    if (!useVirtualScroll) return;

    measureHeaderHeight();
    measureSampleRowHeight();
  }, [columnCount, data, measureHeaderHeight, measureSampleRowHeight, useVirtualScroll]);

  useLayoutEffect(() => {
    if (!useVirtualScroll || !tableContainerRef.current || data.length === 0) return;

    measureColumnWidths();
  }, [columnCount, data, measureColumnWidths, tableContainerRef, useVirtualScroll]);

  useEffect(() => {
    if (!useVirtualScroll) return;

    const element = tableContainerRef.current;
    if (!element || data.length === 0) return;

    const observer = new ResizeObserver(() => {
      measureHeaderHeight();
      measureColumnWidths();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [data, measureColumnWidths, measureHeaderHeight, tableContainerRef, useVirtualScroll]);

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

export function FastTablePaginated<DataType>({
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
}: FastTablePaginatedProps<DataType>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { stableIsLoading, stableData } = useStableLoading(isLoading, data, {
    delay: 0,
  });
  const { onExpandedChange, expanded } = useExpanded({ forceExpandAll });
  const { headerHeight, columnWidths, sampleRowHeightRef, tableScrollWidthRef } =
    useTableMeasurements(tableContainerRef, stableData, columns.length, useVirtualScroll);

  const effectiveEstimatedRowHeight =
    sampleRowHeightRef.current > 0 ? sampleRowHeightRef.current : estimatedRowHeight;

  const table = useReactTable({
    columns,
    data: stableData,
    getRowId,
    getCoreRowModel: getCoreRowModel<DataType>(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowCanExpand: getRowCanExpand,
    onRowSelectionChange,
    onExpandedChange,
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
    },
    enableSorting: !!sorting,
    manualSorting: true,
    manualPagination: true,
    rowCount: total,
  });

  const rows = table.getRowModel().rows;

  const columnCount = table.getHeaderGroups()[0]?.headers.length ?? 0;
  const isVirtualColumnsReady = areColumnWidthsMeasured(columnCount, columnWidths);

  const { rowVirtualizer } = useRowVirtualizer(
    tableContainerRef,
    rows,
    useVirtualScroll,
    overscan,
    effectiveEstimatedRowHeight,
    estimatedExpandedRowHeight
  );

  const tableLocale = useFastTableLocale(locale);

  const showTotal: PaginationProps["showTotal"] = (total) => `${tableLocale.total} ${total}`;

  const handlePaginationChange = (page: number, pageSize: number) => {
    table.setPagination({
      pageIndex: page - 1,
      pageSize,
    });
  };

  const renderTableRow = (row: Row<DataType>, applyMeasuredWidths: boolean) => {
    return row.getVisibleCells().map((cell, index) => {
      const meta = cell.column.columnDef.meta as CellMeta<DataType> | undefined;
      const width = applyMeasuredWidths
        ? (meta?.width ?? columnWidths[`col-${index}`])
        : meta?.width;
      const widthStyle = getColumnWidthStyle(
        width,
        meta && { minWidth: meta.minWidth, maxWidth: meta.maxWidth }
      );

      const cellValue = cell.getValue();
      const title =
        meta?.ellipsis && (typeof cellValue === "string" || typeof cellValue === "number")
          ? String(cellValue)
          : undefined;

      return (
        <td
          key={cell.id}
          className={`cell-with-actions ${meta?.tdClassName ?? ""} ${meta?.color ? `cell-color-${meta.color}` : ""}`}
          style={widthStyle}
        >
          <span className="cell-content">
            <span
              className={`cell-content-text ${meta?.ellipsis ? "cell-content-text-ellipsis" : ""}`}
              title={title}
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
        </td>
      );
    });
  };

  const renderSampleRow = () => {
    const row = rows[0];
    if (!row) return null;
    return (
      <tr key={row.id} className="sample-row">
        {renderTableRow(row, true)}
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
            className={row.id === activeRowId ? "fast-table-row-active" : undefined}
            onClick={(event) => {
              if (!onRowClick || !isClickable) return;

              const target = event.target as HTMLElement;
              if (target.closest(DEFAULT_PREVENT_ROW_CLICK_SELECTOR)) {
                return;
              }
              onRowClick(toJS(row.original), event);
            }}
          >
            {renderTableRow(row, false)}
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
        const widthStyle = getVirtualCellWidthStyle(columnWidths[`col-${index}`]);

        const cellValue = cell.getValue();
        const title =
          meta?.ellipsis && (typeof cellValue === "string" || typeof cellValue === "number")
            ? String(cellValue)
            : undefined;

        return (
          <div
            key={cell.id}
            className={`virtual-cell cell-with-actions ${meta?.tdClassName ?? ""} ${meta?.color ? `cell-color-${meta.color}` : ""}`}
            style={widthStyle}
          >
            <span className="cell-content">
              <span
                className={`cell-content-text ${meta?.ellipsis ? "cell-content-text-ellipsis" : ""}`}
                title={title}
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

    return (
      <div
        className="virtual-tbody-container"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          top: `${headerHeight}px`,
          width: tableScrollWidthRef.current > 0 ? `${tableScrollWidthRef.current}px` : "100%",
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
            return (
              <div
                key={`${row.id}-group-row`}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className={`virtual-row ${row.id === activeRowId ? "virtual-row-active" : ""}`}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onClick={(event) => {
                  if (!onRowClick || !isClickable) return;

                  const target = event.target as HTMLElement;
                  if (target.closest(DEFAULT_PREVENT_ROW_CLICK_SELECTOR)) {
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
      }`}
    >
      <Spin
        wrapperClassName="fast-table-spinner-wrapper"
        className="fast-table-spinner"
        spinning={stableIsLoading}
      >
        <div className="fast-table-wrapper" ref={tableContainerRef}>
          <table>
            <thead>
              <FastTableHeader
                table={table}
                locale={tableLocale}
                columnWidths={useVirtualScroll ? columnWidths : undefined}
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
