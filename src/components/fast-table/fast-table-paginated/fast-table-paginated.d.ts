import { RowData } from "@tanstack/table-core";

declare module "@tanstack/table-core" {
  interface ColumnMeta<TData extends RowData, TValue> {
    thClassName?: string;
    tdClassName?: string;
  }
}
