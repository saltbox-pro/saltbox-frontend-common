import React, { Fragment, useEffect } from "react";
import {
  ColumnFiltersState,
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
import { toJS } from "mobx";
import { Empty, Flex, Spin } from "antd";
import "./fast-table-listed.css";
import { FastTableHeader } from "../fast-table-header/fast-table-header";

export type FastTableListedProps<DataType> = {
  columns: Array<any>;
  data: Array<DataType>;
  total?: number;
  isEmpty?: boolean;
  isLoading?: boolean;
  hideFooter?: boolean;
  onRowClick?: (
    item: DataType,
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>
  ) => void;
  renderSubComponent?: (props: { row: Row<DataType> }) => React.ReactElement;
  getRowCanExpand?: (row: Row<DataType>) => boolean;
  columnFilters?: ColumnFiltersState;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  getRowId?: (
    originalRow: DataType,
    index: number,
    parent?: Row<DataType> | undefined
  ) => string;
  locale?: {
    sortAscending?: string;
    sortDescending?: string;
    clearSort?: string;
    total?: string;
    empty?: string;
  };
};

export function FastTableListed<DataType>({
  columns,
  data,
  total,
  isEmpty,
  isLoading,
  hideFooter,
  onRowClick,
  renderSubComponent,
  getRowCanExpand,
  sorting,
  onSortingChange,
  getRowId,
  locale,
}: FastTableListedProps<DataType>) {
  const [tableLocale, setTableLocale] = React.useState(locale ?? {});

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
    state: {
      sorting,
    },
    enableSorting: !!sorting,
  });

  const rows = table.getRowModel().rows;

  const renderTableRows = () => {
    return rows.map((row) => (
      <Fragment key={`${row.id}-group-row`}>
        <tr
          key={row.id}
          onClick={(event) =>
            onRowClick ? onRowClick(toJS(row.original), event) : undefined
          }
        >
          {row.getVisibleCells().map((cell) => (
            <td
              key={cell.id}
              className={(cell.column.columnDef.meta as any)?.tdClassName}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
        {row.getIsExpanded() && (
          <tr>
            <td colSpan={row.getVisibleCells().length}>
              {renderSubComponent?.({ row })}
            </td>
          </tr>
        )}
      </Fragment>
    ));
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

  const renderLoadingState = () => {
    return (
      <tr>
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
    <div className={`fast-table ${isEmpty && "empty"}`}>
      <div className="fast-table-wrapper">
        <table>
          <thead>
            <FastTableHeader table={table} locale={tableLocale} />
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
