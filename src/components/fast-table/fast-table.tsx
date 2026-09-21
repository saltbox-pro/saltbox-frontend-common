import { FastTableListed } from "./fast-table-listed/fast-table-listed";
import { FastTablePaginated } from "./fast-table-paginated/fast-table-paginated";
import { FastTableToolbar } from "./fast-table-toolbar/fast-table-toolbar";
import { FastTableProvider } from "./fast-table-toolbar/fast-table-toolbar-context";

export const FastTable = {
  Provider: FastTableProvider,
  Toolbar: FastTableToolbar,
  Paginated: FastTablePaginated,
  Listed: FastTableListed,
} as const;
