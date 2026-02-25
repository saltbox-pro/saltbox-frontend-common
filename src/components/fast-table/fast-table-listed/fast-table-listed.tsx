import {
  ColumnFiltersState,
  ExpandedState,
  OnChangeFn,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Empty, Flex, Spin } from "antd";
import { toJS } from "mobx";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import { CellActions } from "../cell-actions/cell-actions";
import { FastTableHeader } from "../fast-table-header/fast-table-header";
import { CellMeta } from "../types";
import "./fast-table-listed.css";

export type FastTableListedProps<DataType> = {
  columns: Array<any>;
  data: Array<DataType>;
  total?: number;
  isEmpty?: boolean;
  isLoading?: boolean;
  hideFooter?: boolean;
  forceExpandAll?: boolean;
  onRowClick?: (item: DataType, event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
  renderSubComponent?: (props: { row: Row<DataType> }) => React.ReactElement;
  getRowCanExpand?: (row: Row<DataType>) => boolean;
  columnFilters?: ColumnFiltersState;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  getRowId?: (originalRow: DataType, index: number, parent?: Row<DataType> | undefined) => string;
  locale?: {
    sortAscending?: string;
    sortDescending?: string;
    clearSort?: string;
    total?: string;
    empty?: string;
  };
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

export function FastTableListed<DataType>({
  columns,
  data,
  total,
  isEmpty,
  isLoading,
  hideFooter,
  forceExpandAll,
  onRowClick,
  renderSubComponent,
  getRowCanExpand,
  sorting,
  onSortingChange,
  getRowId,
  locale,
}: FastTableListedProps<DataType>) {
  const [tableLocale, setTableLocale] = useState(locale ?? {});
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  useEffect(() => {
    const nextLocale: typeof locale = {
      sortAscending: locale?.sortAscending ?? "Sort ascending",
      sortDescending: locale?.sortDescending ?? "Sort descending",
      clearSort: locale?.clearSort ?? "Clear sort",
      total: locale?.total ?? "Total:",
      empty: locale?.empty ?? "No data",
    };
    setTableLocale(nextLocale);
  }, [locale]);

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

  const { onExpandedChange, expanded } = useExpanded({ forceExpandAll });

  const table = useReactTable({
    columns,
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
    state: {
      sorting,
      expanded,
    },
    enableSorting: !!sorting,
  });

  const rows = table.getRowModel().rows;

  const renderTableRows = () => {
    return rows.map((row) => (
      <Fragment key={`${row.id}-group-row`}>
        <tr
          key={row.id}
          role={onRowClick ? "button" : undefined}
          onClick={(event) => {
            if (!onRowClick) return;
            // Проверяем, что клик был не по кнопке, ссылке или input элементу
            const target = event.target as HTMLElement;
            if (target.closest("button, a, input, .prevent-row-click")) {
              return;
            }
            onRowClick(toJS(row.original), event);
          }}
        >
          {row.getVisibleCells().map((cell, index) => {
            const width = columnWidths[`col-${index}`];
            const meta = cell.column.columnDef.meta as CellMeta<DataType> | undefined;

            return (
              <td
                key={cell.id}
                className={`${meta?.tdClassName ?? ""} cell-with-actions${meta?.color ? ` cell-color-${meta.color}` : ""}`}
                style={
                  width
                    ? {
                        width: `${width}px`,
                        minWidth: `${width}px`,
                        maxWidth: `${width}px`,
                      }
                    : undefined
                }
              >
                <span className="cell-content">
                  <span className="cell-content-text">
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
          })}
        </tr>
        {row.getIsExpanded() && (
          <tr>
            <td colSpan={row.getVisibleCells().length}>{renderSubComponent?.({ row })}</td>
          </tr>
        )}
      </Fragment>
    ));
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
    <div className={`fast-table ${isEmpty && "empty"} ${isLoading && "loading"}`}>
      <div className="fast-table-wrapper" ref={tableContainerRef}>
        <table>
          <thead>
            <FastTableHeader table={table} locale={tableLocale} columnWidths={columnWidths} />
          </thead>
          <tbody>
            {renderTableRows()}
            {isEmpty && renderEmptyState()}
            {isLoading && renderLoadingState()}
          </tbody>
        </table>
      </div>
      {!hideFooter && renderTableFooter()}
    </div>
  );
}
