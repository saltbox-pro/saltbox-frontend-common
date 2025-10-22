import React, { Fragment, useEffect, useRef, useState } from "react";
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
import { toJS } from "mobx";
import { Empty, Pagination, PaginationProps, Spin } from "antd";
import { PaginationLocale } from "antd/es/pagination/Pagination";
import { useStableLoading } from "saltbox-common/utils/table-utils";
import {
  FastTableHeader,
  HeaderLocale,
} from "../fast-table-header/fast-table-header";

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
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => void;
  getRowId?: (
    originalRow: DataType,
    index: number,
    parent?: Row<DataType> | undefined
  ) => string;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  rowSelection?: RowSelectionState;
  locale?: PaginationLocale &
  HeaderLocale & {
    total?: string;
    empty?: string;
  };
  enableVirtualScroll?: boolean;
  estimateRowHeight?: number;
  forceExpandAll?: boolean;
  renderSubComponent?: (props: { row: Row<DataType> }) => React.ReactElement;
  getRowCanExpand?: (row: Row<DataType>) => boolean;
};

function useExpanded({
  forceExpandAll,
}: Pick<FastTablePaginatedProps<unknown>, "forceExpandAll">) {
  const [expanded, setExpanded] = useState<ExpandedState | undefined>(
    undefined
  );

  useEffect(() => {
    setExpanded(forceExpandAll || {});
  }, [forceExpandAll]);

  return {
    expanded,
    onExpandedChange: setExpanded,
  };
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
  enableVirtualScroll = false,
  estimateRowHeight = 45,
  forceExpandAll,
  renderSubComponent,
  getRowCanExpand,
}: FastTablePaginatedProps<DataType>) {
  const { stableIsLoading, stableData } = useStableLoading(isLoading, data, {
    delay: 0,
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  const { onExpandedChange, expanded } = useExpanded({ forceExpandAll });

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
      const nextSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;
      onLazyLoad(pagination, nextSorting);
    },
    onPaginationChange: (updaterOrValue) => {
      const nextPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue;
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

  const measureColumnWidths = React.useCallback(() => {
    if (!tableContainerRef.current) return;

    const tableElement = tableContainerRef.current.querySelector('table');
    if (!tableElement) return;

    const headerCells = tableElement.querySelectorAll('thead th');
    const widths: Record<string, number> = {};

    headerCells.forEach((cell, index) => {
      const width = cell.getBoundingClientRect().width;
      widths[`col-${index}`] = width;
    });

    setColumnWidths(widths);
  }, []);

  useEffect(() => {
    if (!tableContainerRef.current || stableData.length === 0) return;

    const timer = setTimeout(() => {
      measureColumnWidths();
    }, 0);

    return () => clearTimeout(timer);
  }, [stableData, measureColumnWidths]);

  useEffect(() => {
    if (!tableContainerRef.current || stableData.length === 0) return;

    const handleResize = () => {
      setColumnWidths({});
      requestAnimationFrame(() => {
        measureColumnWidths();
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [stableData, measureColumnWidths]);

  const showTotal: PaginationProps["showTotal"] = (total) =>
    (tableLocale?.total ?? "Total:") + ` ${total}`;

  const handlePaginationChange = (page: number, pageSize: number) => {
    table.setPagination({
      pageIndex: page - 1,
      pageSize,
    });
  };

  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 10,
    enabled: enableVirtualScroll,
  });

  const renderTableRow = (row: Row<DataType>) => {
    return row.getVisibleCells().map((cell, index) => {
      const width = columnWidths[`col-${index}`];
      return (
        <td
          key={cell.id}
          className={(cell.column.columnDef.meta as any)?.tdClassName}
          style={width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : undefined}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      );
    });
  }

  const renderTableRows = () => {
    if (!enableVirtualScroll) {
      return rows.map((row) => (
        <Fragment key={`${row.id}-group-row`}>
          <tr
            key={row.id}
            onClick={(event) =>
              onRowClick ? onRowClick(toJS(row.original), event) : undefined
            }
          >
            {renderTableRow(row)}
          </tr>
          {row.getIsExpanded() && (
            <tr key={`${row.id}-sub-row`}>
              <td colSpan={row.getVisibleCells().length}>
                {renderSubComponent?.({ row })}
              </td>
            </tr>
          )}
        </Fragment>
      ));
    }

    const virtualRows = rowVirtualizer.getVirtualItems();
    const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
    const paddingBottom =
      virtualRows.length > 0
        ? rowVirtualizer.getTotalSize() -
        (virtualRows[virtualRows.length - 1]?.end || 0)
        : 0;

    return (
      <>
        {paddingTop > 0 && (
          <tr>
            <td style={{ height: `${paddingTop}px` }} />
          </tr>
        )}
        {virtualRows.map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <Fragment key={`${row.id}-group-row`}>
              <tr
                key={row.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                onClick={(event) =>
                  onRowClick ? onRowClick(toJS(row.original), event) : undefined
                }
              >
                {renderTableRow(row)}
              </tr>
              {row.getIsExpanded() && (
                <tr key={`${row.id}-sub-row`}>
                  <td colSpan={row.getVisibleCells().length}>
                    {renderSubComponent?.({ row })}
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
        {paddingBottom > 0 && (
          <tr>
            <td style={{ height: `${paddingBottom}px` }} />
          </tr>
        )}
      </>
    );
  };

  const renderEmptyState = () => {
    return (
      <tr>
        <td colSpan={table.getAllColumns().length}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={tableLocale.empty}
          />
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
    <div className={`fast-table ${shouldShowEmpty && "empty"} ${enableVirtualScroll ? "virtual-scroll" : ""}`}>
      <Spin
        wrapperClassName="fast-table-spinner-wrapper"
        className="fast-table-spinner"
        spinning={stableIsLoading}
      >
        <div
          className="fast-table-wrapper"
          ref={tableContainerRef}
          style={enableVirtualScroll ? {
            height: '100%',
            overflow: 'auto'
          } : undefined}
        >
          <table>
            <thead>
              <FastTableHeader table={table} locale={tableLocale} columnWidths={columnWidths} />
            </thead>
            <tbody>
              {shouldShowEmpty && renderEmptyState()}
              {renderTableRows()}
            </tbody>
          </table>
        </div>
      </Spin>
      {renderTableFooter()}
    </div>
  );
}
