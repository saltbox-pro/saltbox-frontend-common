import React, { useEffect, useState } from "react";
import {
  OnChangeFn,
  PaginationState,
  Row,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toJS } from "mobx";
import { Pagination, PaginationProps } from "antd";
import { PaginationLocale } from "antd/es/pagination/Pagination";
import "./fast-table-paginated.css";

export type FastTablePaginatedProps<DataType> = {
  columns: Array<any>;
  data: Array<DataType>;
  total?: number;
  pagination: PaginationState;
  onLazyLoad: (pagination: PaginationState) => void;
  onRowClick?: (
    item: DataType,
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
  ) => void;
  getRowId?: (
    originalRow: DataType,
    index: number,
    parent?: Row<DataType> | undefined,
  ) => string;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  rowSelection?: RowSelectionState;
  locale?: PaginationLocale & {
    total?: string;
  };
};

export function FastTablePaginated<DataType>({
  columns,
  data,
  total,
  pagination,
  onLazyLoad,
  onRowClick,
  getRowId,
  onRowSelectionChange,
  rowSelection,
  locale,
}: FastTablePaginatedProps<DataType>) {
  const table = useReactTable({
    columns,
    data,
    getRowId,
    getCoreRowModel: getCoreRowModel<DataType>(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const nextPagination = updater(pagination);
        onLazyLoad(nextPagination);
      }
    },
    state: {
      pagination,
      rowSelection,
    },
    manualPagination: true,
    rowCount: total,
  });

  const [tableLocale, setTableLocale] = useState(locale ?? {});

  useEffect(() => {
    const nextLocale: typeof locale = {
      items_per_page: locale?.items_per_page ?? 'Items per page:',
      jump_to: locale?.jump_to ?? 'Jump to:',
      jump_to_confirm: locale?.jump_to_confirm ?? 'Jump to confirm:',
      page: locale?.page ?? 'Page:',
      prev_page: locale?.prev_page ?? 'Prev page:',
      next_page: locale?.next_page ?? 'Next page:',
      prev_5: locale?.prev_5 ?? 'Prev 5:',
      next_5: locale?.next_5 ?? 'Next 5:',
      total: locale?.total ?? 'Total:',
    };
    setTableLocale(nextLocale);
  }, [locale]);

  const showTotal: PaginationProps["showTotal"] = (total) =>
    tableLocale?.total ?? 'Total:' + ` ${total}`;

  const handlePaginationChange = (page: number, pageSize: number) => {
    table.setPagination({
      pageIndex: page - 1,
      pageSize,
    });
  };

  const handlePaginationShowSizeChange: (
    current: number,
    pageSize: number,
  ) => void = (current: number, pageSize: number) => {
    table.setPagination({
      pageIndex: current - 1,
      pageSize,
    });
  };

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
                    className={(header.column.columnDef.meta as any)?.thClassName}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
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
            ))}
          </tbody>
        </table>
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
