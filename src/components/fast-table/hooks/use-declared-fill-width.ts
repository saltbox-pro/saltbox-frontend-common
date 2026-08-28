import type { Column } from "@tanstack/react-table";
import { useMemo } from "react";

import type { CellMeta } from "../types";
import { type DeclaredFillWidth, resolveDeclaredFillWidth } from "../utils/filled-column-widths";

export function useDeclaredFillWidth<DataType>(
  leafColumns: Array<Column<DataType, unknown>>
): DeclaredFillWidth | undefined {
  return useMemo(
    () =>
      resolveDeclaredFillWidth(
        leafColumns.map((column) => {
          const meta = column.columnDef.meta as CellMeta<DataType> | undefined;
          return {
            id: column.id,
            canResize: column.getCanResize(),
            width: meta?.width,
            minWidth: meta?.minWidth,
            maxWidth: meta?.maxWidth,
          };
        })
      ),
    [leafColumns]
  );
}
