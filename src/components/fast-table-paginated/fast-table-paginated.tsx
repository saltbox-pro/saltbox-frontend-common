import React, { useEffect, useState } from "react";
import {
  Header,
  OnChangeFn,
  PaginationState,
  Row,
  RowSelectionState,
  SortDirection,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toJS } from "mobx";
import { Empty, Pagination, PaginationProps, Spin } from "antd";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { PaginationLocale } from "antd/es/pagination/Pagination";
import "./fast-table-paginated.css";
import { useStableLoading } from "saltbox-common/utils/table-utils";

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
};

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
}: FastTablePaginatedProps<DataType>) {
  const { stableIsLoading, stableData } = useStableLoading(isLoading, data, {
    delay: 0,
  });

  const table = useReactTable({
    columns,
    data: stableData,
    getRowId,
    getCoreRowModel: getCoreRowModel<DataType>(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange,
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

  const showTotal: PaginationProps["showTotal"] = (total) =>
    (tableLocale?.total ?? "Total:") + ` ${total}`;

  const handlePaginationChange = (page: number, pageSize: number) => {
    table.setPagination({
      pageIndex: page - 1,
      pageSize,
    });
  };

  const handlePaginationShowSizeChange = (
    current: number,
    pageSize: number
  ) => {
    table.setPagination({
      pageIndex: current - 1,
      pageSize,
    });
  };

  const rows = table.getRowModel().rows;

  return (
    <div className="fast-table">
      <div className="fast-table-wrapper">
        <Spin className="fast-table-spinner" spinning={stableIsLoading}>
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
                        <FastTableHeader header={header} locale={tableLocale} />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {!stableIsLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={table.getAllColumns().length}>
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={tableLocale.empty}
                    />
                  </td>
                </tr>
              )}
              {rows.map((row) => (
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
              ))}
            </tbody>
          </table>
        </Spin>
      </div>
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
            onShowSizeChange={handlePaginationShowSizeChange}
            locale={tableLocale}
          />
        </div>
      </div>
    </div>
  );
}

type FastTableHeaderProps<DataType> = {
  header: Header<DataType, unknown>;
  locale: HeaderLocale;
};

type HeaderLocale = {
  sortAscending?: string;
  sortDescending?: string;
  clearSort?: string;
};

function FastTableHeader<DataType>({
  header,
  locale,
}: FastTableHeaderProps<DataType>) {
  const getSortTitle = () => {
    if (!header.column.getCanSort()) return undefined;

    const nextOrder = header.column.getNextSortingOrder();
    if (nextOrder === "asc") return locale.sortAscending;
    if (nextOrder === "desc") return locale.sortDescending;
    return locale.clearSort;
  };

  const sortIcons = {
    asc: <CaretUpOutlined />,
    desc: <CaretDownOutlined />,
  };

  return (
    <div
      className={
        header.column.getCanSort()
          ? "fast-table-header"
          : "fast-table-header-nosort"
      }
      onClick={header.column.getToggleSortingHandler()}
      title={getSortTitle()}
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
      <div className="fast-table-sorter">
        {sortIcons[header.column.getIsSorted() as SortDirection] ?? null}
      </div>
    </div>
  );
}
