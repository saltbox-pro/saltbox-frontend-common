import {
  ExpandedState,
  OnChangeFn,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Empty, Pagination, PaginationProps, Spin } from "antd";
import { PaginationLocale } from "antd/es/pagination/Pagination";
import { toJS } from "mobx";
import React, {
  Fragment,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useStableLoading } from "saltbox-common/utils/table-utils";

import { CellActions } from "../cell-actions/cell-actions";
import { FastTableHeader, HeaderLocale } from "../fast-table-header/fast-table-header";
import { CellMeta } from "../types";
import { getColumnWidthStyle } from "../utils/column";

import "./fast-table-paginated.css";

export type FastTablePaginatedProps<DataType> = {
  columns: Array<any>;
  data: Array<DataType>;
  total?: number;
  isLoading?: boolean;
  pagination: PaginationState;
  sorting?: SortingState;
  onLazyLoad: (pagination: PaginationState, sorting: SortingState) => void;
  onRowClick?: (
    item: DataType,
    event: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement>
  ) => void; // TODO: rename or use separate event handlers
  getRowId?: (originalRow: DataType, index: number, parent?: Row<DataType> | undefined) => string;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  rowSelection?: RowSelectionState;
  locale?: PaginationLocale &
    HeaderLocale & {
      total?: string;
      empty?: string;
    };
  useVirtualScroll?: boolean;
  overscan?: number;
  estimatedRowHeight?: number;
  estimatedExpandedRowHeight?: number;
  forceExpandAll?: boolean;
  renderSubComponent?: (props: { row: Row<DataType> }) => React.ReactElement;
  getRowCanExpand?: (row: Row<DataType>) => boolean;
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

function useTableMeasurements<DataType>(
  tableContainerRef: RefObject<HTMLElement>,
  data: DataType[]
) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  const measureHeaderHeight = useCallback(() => {
    if (!tableContainerRef.current) return;

    const thead = tableContainerRef.current.querySelector("thead");
    if (thead) {
      const height = thead.getBoundingClientRect().height;
      setHeaderHeight(height);
    }
  }, []);

  const measureColumnWidths = useCallback(() => {
    if (!tableContainerRef.current) return;

    const tableElement = tableContainerRef.current.querySelector("table");
    if (!tableElement) return;

    const headerCells = tableElement.querySelectorAll("thead th");
    const widths: Record<string, number> = {};

    headerCells.forEach((cell, index) => {
      const width = cell.getBoundingClientRect().width;
      widths[`col-${index}`] = width;
    });

    setColumnWidths(widths);
  }, []);

  useLayoutEffect(() => {
    if (!tableContainerRef.current) return;

    const timer = setTimeout(() => {
      measureHeaderHeight();
    }, 0);

    return () => clearTimeout(timer);
  }, [columnWidths, measureHeaderHeight]);

  useEffect(() => {
    if (!tableContainerRef.current || data.length === 0) return;

    const timer = setTimeout(() => {
      measureColumnWidths();
    }, 0);

    return () => clearTimeout(timer);
  }, [data, measureColumnWidths]);

  useEffect(() => {
    if (!tableContainerRef.current || data.length === 0) return;

    const handleResize = () => {
      setColumnWidths({});
      requestAnimationFrame(() => {
        measureColumnWidths();
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data, measureColumnWidths]);

  return { headerHeight, columnWidths };
}

function useRowVirtualizer<DataType>(
  tableContainerRef: RefObject<HTMLElement>,
  rows: Array<Row<DataType>>,
  useVirtualScroll: boolean,
  overscan: number,
  estimatedRowHeight: number,
  estimatedExpandedRowHeight: number
) {
  const rowVirtualizer = useVirtualizer({
    enabled: useVirtualScroll,
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: (index) => {
      const row = rows[index];
      return row?.getIsExpanded() ? estimatedExpandedRowHeight : estimatedRowHeight;
    },
    getItemKey: (index) => rows[index].id,
    overscan,
  });

  return { rowVirtualizer };
}

export function FastTablePaginated<DataType>({
  columns,
  data,
  total,
  isLoading = false,
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
}: FastTablePaginatedProps<DataType>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { stableIsLoading, stableData } = useStableLoading(isLoading, data, {
    delay: 0,
  });
  const { onExpandedChange, expanded } = useExpanded({ forceExpandAll });
  const { headerHeight, columnWidths } = useTableMeasurements(tableContainerRef, stableData);

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

  const { rowVirtualizer } = useRowVirtualizer(
    tableContainerRef,
    rows,
    useVirtualScroll,
    overscan,
    estimatedRowHeight,
    estimatedExpandedRowHeight
  );

  const [tableLocale, setTableLocale] = useState(locale ?? {});

  useEffect(() => {
    const nextLocale: typeof locale = {
      items_per_page: locale?.items_per_page ?? "/ page",
      jump_to: locale?.jump_to ?? "Go to:",
      jump_to_confirm: locale?.jump_to_confirm ?? "Go to confirm:",
      page: locale?.page ?? "page",
      prev_page: locale?.prev_page ?? "Prev",
      next_page: locale?.next_page ?? "Next",
      prev_5: locale?.prev_5 ?? "Prev 5",
      next_5: locale?.next_5 ?? "Next 5",
      sortAscending: locale?.sortAscending ?? "Sort ascending",
      sortDescending: locale?.sortDescending ?? "Sort descending",
      clearSort: locale?.clearSort ?? "Clear sort",
      total: locale?.total ?? "Total:",
      empty: locale?.empty ?? "No data",
    };
    setTableLocale(nextLocale);
  }, [locale]);

  const showTotal: PaginationProps["showTotal"] = (total) =>
    (tableLocale?.total ?? "Total:") + ` ${total}`;

  const handlePaginationChange = (page: number, pageSize: number) => {
    table.setPagination({
      pageIndex: page - 1,
      pageSize,
    });
  };

  const renderTableRow = (row: Row<DataType>) => {
    return row.getVisibleCells().map((cell, index) => {
      const meta = cell.column.columnDef.meta as CellMeta<DataType> | undefined;
      const width = meta?.width ?? columnWidths[`col-${index}`];
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
    return rowsToRender.map((row) => (
      <Fragment key={`${row.id}-group-row`}>
        <tr
          key={row.id}
          role={onRowClick ? "button" : undefined}
          onClick={(event) => {
            if (!onRowClick) return;
            // Проверяем, что клик был не по кнопке, ссылке или input элементу
            const target = event.target as HTMLElement;
            if (target.closest("button, a, input, .prevent-row-click, .ant-popover")) {
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
    ));
  };

  const renderVirtualizedRows = () => {
    const renderRow = (row: Row<DataType>) => {
      return row.getVisibleCells().map((cell, index) => {
        const meta = cell.column.columnDef.meta as CellMeta<DataType> | undefined;
        const width = meta?.width ?? columnWidths[`col-${index}`];
        const widthStyle = width
          ? getColumnWidthStyle(width, meta && { minWidth: meta.minWidth, maxWidth: meta.maxWidth })
          : meta?.minWidth !== undefined || meta?.maxWidth !== undefined
            ? {
                ...(meta?.minWidth !== undefined && { minWidth: `${meta.minWidth}px` }),
                ...(meta?.maxWidth !== undefined && { maxWidth: `${meta.maxWidth}px` }),
                flex: 1,
              }
            : { flex: 1 };

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
            return (
              <div
                key={`${row.id}-group-row`}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className="virtual-row"
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={(event) => {
                  if (!onRowClick) return;
                  // Проверяем, что клик был не по кнопке, ссылке или input элементу
                  const target = event.target as HTMLElement;
                  if (target.closest("button, a, input, .prevent-row-click")) {
                    return;
                  }
                  onRowClick(toJS(row.original), event);
                }}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(toJS(row.original), event);
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
            total={total}
            showTotal={showTotal}
            showSizeChanger
            pageSizeOptions={[10, 50, 100, 1000]}
            defaultPageSize={50}
            showQuickJumper
            onChange={handlePaginationChange}
            locale={tableLocale}
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
              <FastTableHeader table={table} locale={tableLocale} columnWidths={columnWidths} />
            </thead>
            <tbody>
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
