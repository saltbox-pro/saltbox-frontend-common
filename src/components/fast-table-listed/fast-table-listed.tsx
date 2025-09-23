import React, { Fragment, useEffect } from "react";
import {
  Column,
  ColumnFiltersState,
  OnChangeFn,
  Row,
  SortDirection,
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
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { DebouncedInput } from "../debounced-input/debounced-input";
import "./fast-table-listed.css";

export type FastTableListedProps<DataType> = {
  columns: Array<any>;
  data: Array<DataType>;
  total?: number;
  isEmpty?: boolean;
  isLoading?: boolean;
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
  onRowClick,
  renderSubComponent,
  getRowCanExpand,
  sorting,
  onSortingChange,
  getRowId,
  locale,
}: FastTableListedProps<DataType>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

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
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
      sorting,
    },
    enableSorting: !!sorting,
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="fast-table">
      <div className="fast-table-wrapper">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={
                      (header.column.columnDef.meta as any)?.thClassName
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "fast-table-listed-header"
                            : "fast-table-listed-header-nosort"
                        }
                        onClick={header.column.getToggleSortingHandler()}
                        title={
                          header.column.getCanSort()
                            ? header.column.getNextSortingOrder() === "asc"
                              ? tableLocale.sortAscending
                              : header.column.getNextSortingOrder() === "desc"
                              ? tableLocale.sortDescending
                              : tableLocale.clearSort
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <div className="fast-table-listed-sorter">
                          {{
                            asc: <CaretUpOutlined />,
                            desc: <CaretDownOutlined />,
                          }[header.column.getIsSorted() as SortDirection] ??
                            null}
                        </div>
                        {header.column.getCanFilter() ? (
                          <div>
                            <Filter column={header.column} />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <Fragment key={`${row.id}-group-row`}>
                <tr
                  key={row.id}
                  onClick={(event) =>
                    onRowClick
                      ? onRowClick(toJS(row.original), event)
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={
                        (cell.column.columnDef.meta as any)?.tdClassName
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
                {row.getIsExpanded() && (
                  <tr>
                    <td colSpan={row.getVisibleCells().length}>
                      {renderSubComponent && renderSubComponent({ row })}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {isEmpty && (
              <tr>
                <td colSpan={table.getAllColumns().length}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={tableLocale.empty}
                  />
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={table.getAllColumns().length}>
                  <Flex justify="center" align="center" style={{ height: 200 }}>
                    <Spin />
                  </Flex>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="fast-table-summary">
        <div className="fast-table-pagination">
          {total !== undefined && (
            <>
              {tableLocale.total} {table.getRowCount()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = (column.columnDef.meta as any) ?? {};

  return filterVariant === "range" ? (
    <div>
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min`}
          className="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max`}
          className="w-24 border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === "select" ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      <option value="">All</option>
      <option value="complicated">complicated</option>
      <option value="relationship">relationship</option>
      <option value="single">single</option>
    </select>
  ) : filterVariant === "text" ? (
    <DebouncedInput
      className="w-36 border shadow rounded"
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? "") as string}
    />
  ) : (
    <div></div>
  );
}
