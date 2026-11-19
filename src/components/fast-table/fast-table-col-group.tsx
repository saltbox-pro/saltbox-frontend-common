import type { Column, ColumnSizingState } from "@tanstack/react-table";

import type { CellMeta } from "./types";
import {
  type ColumnResizeConstraints,
  getColWidthStyle,
  resolveColumnMinWidth,
  resolveColumnWidth,
  resolveLockedColSize,
} from "./utils/column";

export type FastTableColGroupProps<DataType> = {
  leafColumns: Array<Column<DataType, unknown>>;
  hasLockedColumnWidths: boolean;
  fillColumnId: string | undefined;
  lockedColumnSizes: ColumnSizingState | undefined;
  resizeConstraintsById: Map<string, ColumnResizeConstraints>;
};

export function FastTableColGroup<DataType>({
  leafColumns,
  hasLockedColumnWidths,
  fillColumnId,
  lockedColumnSizes,
  resizeConstraintsById,
}: FastTableColGroupProps<DataType>) {
  return (
    <colgroup>
      {leafColumns.map((column) => {
        const meta = column.columnDef.meta as CellMeta<DataType> | undefined;

        if (hasLockedColumnWidths) {
          const size = resolveLockedColSize(column, fillColumnId, lockedColumnSizes);
          if (size === undefined) {
            return <col key={column.id} />;
          }

          const explicitMinSize = resizeConstraintsById.get(column.id)?.minSize;
          return (
            <col
              key={column.id}
              style={getColWidthStyle(size, {
                minWidth: explicitMinSize,
                maxWidth: meta?.maxWidth,
              })}
            />
          );
        }

        const declaredWidth = resolveColumnWidth(column);
        if (declaredWidth === undefined) {
          return <col key={column.id} />;
        }

        return (
          <col
            key={column.id}
            style={getColWidthStyle(declaredWidth, {
              minWidth: resolveColumnMinWidth(meta),
              maxWidth: meta?.maxWidth,
            })}
          />
        );
      })}
    </colgroup>
  );
}
