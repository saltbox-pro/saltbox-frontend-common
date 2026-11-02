import type { Row } from "@tanstack/react-table";
import type { Virtualizer } from "@tanstack/react-virtual";
import { type ReactElement, type ReactNode } from "react";

import type { CellActionLinkComponent } from "../types";
import { formatCssPx } from "../utils/column";

import { type FastTableRowClickHandler, FastTableTableRow } from "./fast-table-table-row";
import "./fast-table-virtual-scroll.css";

function renderVirtualSpacer(colSpan: number, height: number) {
  if (height <= 0) return null;

  return (
    <tr className="virtual-size-spacer" aria-hidden="true">
      <td colSpan={colSpan} style={{ height: formatCssPx(height) }} />
    </tr>
  );
}

export type FastTableVirtualBodyProps<DataType> = {
  rows: Array<Row<DataType>>;
  rowVirtualizer: Virtualizer<HTMLElement, Element>;
  headerHeight: number;
  visibleColumnCount: number;
  renderToken: object;
  isResizingColumn: boolean;
  estimatedRowHeight: number;
  enableDynamicRowHeight?: boolean;
  onRowClick?: FastTableRowClickHandler<DataType>;
  isRowClickable?: (item: DataType) => boolean;
  getRowClassName?: (row: Row<DataType>) => string | undefined;
  renderSubComponent?: (props: { row: Row<DataType> }) => ReactElement;
  actionLinkComponent?: CellActionLinkComponent;
};

export function FastTableVirtualBody<DataType>({
  rows,
  rowVirtualizer,
  headerHeight,
  visibleColumnCount,
  renderToken,
  isResizingColumn,
  estimatedRowHeight,
  enableDynamicRowHeight = true,
  onRowClick,
  isRowClickable,
  getRowClassName,
  renderSubComponent,
  actionLinkComponent,
}: FastTableVirtualBodyProps<DataType>): ReactNode {
  const virtualRows = rowVirtualizer.getVirtualItems();
  if (virtualRows.length === 0) return null;

  const firstRow = virtualRows[0];
  const lastRow = virtualRows[virtualRows.length - 1];
  const paddingTop = Math.max(0, firstRow.start - headerHeight);
  const paddingBottom = Math.max(0, rowVirtualizer.getTotalSize() - lastRow.end);
  const colSpan = Math.max(visibleColumnCount, 1);

  return (
    <>
      {renderVirtualSpacer(colSpan, paddingTop)}
      {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index];
        if (!row) return null;

        const isClickable = Boolean(
          onRowClick && (isRowClickable == null || isRowClickable(row.original))
        );
        const className = [
          getRowClassName?.(row),
          enableDynamicRowHeight ? undefined : "virtual-row-fixed",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <FastTableTableRow
            key={`${row.id}-group-row`}
            row={row}
            className={className || undefined}
            isClickable={isClickable}
            isExpanded={row.getIsExpanded()}
            visibleColumnCount={visibleColumnCount}
            renderToken={renderToken}
            isResizingColumn={isResizingColumn}
            actionLinkComponent={actionLinkComponent}
            virtualIndex={virtualRow.index}
            rowHeight={enableDynamicRowHeight ? undefined : estimatedRowHeight}
            rowRef={enableDynamicRowHeight ? rowVirtualizer.measureElement : undefined}
            onRowClick={onRowClick}
            renderSubComponent={renderSubComponent}
          />
        );
      })}
      {renderVirtualSpacer(colSpan, paddingBottom)}
    </>
  );
}
