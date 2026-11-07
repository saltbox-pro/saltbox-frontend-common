import type { Cell, Row } from "@tanstack/react-table";

import { CellActions } from "../cell-actions/cell-actions";
import type { CellActionLinkComponent, CellMeta } from "../types";
import { resolveCellTitle } from "../utils/column";
import { getSortedColumnClassName } from "../utils/column-sort";

import { FastTableCellValue } from "./fast-table-cell-value";

function renderFastTableCellContent<DataType>({
  row,
  cell,
  actionLinkComponent,
}: {
  row: Row<DataType>;
  cell: Cell<DataType, unknown>;
  actionLinkComponent?: CellActionLinkComponent;
}) {
  const meta = cell.column.columnDef.meta as CellMeta<DataType> | undefined;
  const isEllipsis = meta?.ellipsis ?? true;
  const cellTitle =
    meta?.getTitle?.(cell.getValue(), row.original) ??
    (isEllipsis ? resolveCellTitle(meta?.copyValue?.(row.original) ?? cell.getValue()) : undefined);

  return (
    <span className="cell-content">
      <span
        className={`cell-content-text ${isEllipsis ? "cell-content-text-ellipsis" : ""}`}
        title={cellTitle}
      >
        <FastTableCellValue cell={cell} />
      </span>
      {(meta?.showCopy || meta?.renderCopy || (meta?.actions?.length ?? 0) > 0) && (
        <CellActions
          value={cell.getValue()}
          row={row.original}
          showCopy={meta.showCopy}
          copyValue={meta.copyValue?.(row.original)}
          renderCopy={meta.renderCopy?.(row.original)}
          actions={meta.actions}
          linkComponent={actionLinkComponent}
        />
      )}
    </span>
  );
}

function getFastTableCellClassName<DataType>(
  cell: Cell<DataType, unknown>,
  visibleColumnCount: number
) {
  const meta = cell.column.columnDef.meta as CellMeta<DataType> | undefined;
  return [
    "cell-with-actions",
    meta?.tdClassName ?? "",
    getSortedColumnClassName(cell.column.getIsSorted(), visibleColumnCount),
    meta?.color ? `cell-color-${meta.color}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function renderFastTableTableCells<DataType>({
  row,
  visibleColumnCount,
  actionLinkComponent,
}: {
  row: Row<DataType>;
  visibleColumnCount: number;
  actionLinkComponent?: CellActionLinkComponent;
}) {
  return row.getVisibleCells().map((cell) => (
    <td key={cell.id} className={getFastTableCellClassName(cell, visibleColumnCount)}>
      {renderFastTableCellContent({ row, cell, actionLinkComponent })}
    </td>
  ));
}
