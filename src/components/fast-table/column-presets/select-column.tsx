import type { ColumnDef, Row, Table } from "@tanstack/react-table";
import { Checkbox } from "antd";

export function createSelectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }: { table: Table<TData> }) => (
      <Checkbox
        className="prevent-row-click"
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }: { row: Row<TData> }) => (
      <Checkbox
        className="prevent-row-click"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  };
}
