import type { ColumnDef, RowData } from "@tanstack/react-table";

import { tCommon } from "../../../i18n/common";
import { BooleanDisplay } from "../../boolean-display";
import type { CellMeta } from "../types";

export type CreateBooleanColumnOptions<TData extends RowData = RowData> = {
  accessorKey: keyof TData & string;
  header: ColumnDef<TData, boolean>["header"];
  id?: string;
  meta?: Omit<CellMeta<TData>, "getTitle">;
  enableSorting?: boolean;
  enableHiding?: boolean;
  labels?: {
    true?: string;
    false?: string;
  };
  getTitle?: (value: unknown, row: TData) => string | undefined;
};

function resolveBooleanTitle<TData extends RowData>(
  value: unknown,
  row: TData,
  options: Pick<CreateBooleanColumnOptions<TData>, "getTitle" | "labels">
): string | undefined {
  if (options.getTitle) {
    return options.getTitle(value, row);
  }

  const isTruthy = Boolean(value);
  if (isTruthy) {
    return options.labels?.true ?? tCommon("boolean-display.true");
  }

  return options.labels?.false ?? tCommon("boolean-display.false");
}

export function createBooleanColumn<TData extends RowData = RowData>(
  options: CreateBooleanColumnOptions<TData>
): ColumnDef<TData, boolean> {
  const { labels, getTitle, meta, ...columnOptions } = options;

  return {
    enableSorting: true,
    ...columnOptions,
    cell: ({ getValue }) => <BooleanDisplay value={getValue()} />,
    meta: {
      ...meta,
      getTitle: (value, row) => resolveBooleanTitle(value, row, { labels, getTitle }),
    },
  };
}
