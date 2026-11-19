import type { Row } from "@tanstack/react-table";
import type { Virtualizer } from "@tanstack/react-virtual";
import { Fragment, type ReactElement, type ReactNode } from "react";

import type {
  CellActionLinkComponent,
  FastTableRowClickHandler,
  FastTableRowModifierClickHandler,
} from "../types";

import { FastTableTableRow } from "./fast-table-table-row";
import { SyncFixedVirtualRowSize } from "./sync-fixed-virtual-row-size";
import { VirtualSizeSpacer } from "./virtual-size-spacer";
import "./fast-table-virtual-scroll.css";

export type FastTableVirtualBodyProps<DataType> = {
  rows: Array<Row<DataType>>;
  rowVirtualizer: Virtualizer<HTMLElement, Element>;
  headerHeight: number;
  visibleColumnCount: number;
  leafColumnIdsKey: string;
  isResizingColumn: boolean;
  estimatedRowHeight: number;
  enableDynamicRowHeight?: boolean;
  onRowClick?: FastTableRowClickHandler<DataType>;
  onRowModifierClick?: FastTableRowModifierClickHandler<DataType>;
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
  leafColumnIdsKey,
  isResizingColumn,
  estimatedRowHeight,
  enableDynamicRowHeight = true,
  onRowClick,
  onRowModifierClick,
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
  // getTotalSize() excludes scrollMargin (the header), while item offsets include it.
  const paddingBottom = Math.max(0, rowVirtualizer.getTotalSize() + headerHeight - lastRow.end);
  const colSpan = Math.max(visibleColumnCount, 1);

  return (
    <>
      <VirtualSizeSpacer colSpan={colSpan} height={paddingTop} />
      {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index];
        if (!row) return null;

        const isExpanded = row.getIsExpanded();
        const shouldMeasureRow = enableDynamicRowHeight || isExpanded;
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
          <Fragment key={`${row.id}-group-row`}>
            {!enableDynamicRowHeight && (
              <SyncFixedVirtualRowSize
                active={!isExpanded}
                index={virtualRow.index}
                itemKey={row.id}
                size={estimatedRowHeight}
                rowVirtualizer={rowVirtualizer}
              />
            )}
            <FastTableTableRow
              row={row}
              className={className || undefined}
              isClickable={isClickable}
              isExpanded={isExpanded}
              visibleColumnCount={visibleColumnCount}
              leafColumnIdsKey={leafColumnIdsKey}
              isResizingColumn={isResizingColumn}
              actionLinkComponent={actionLinkComponent}
              virtualIndex={virtualRow.index}
              rowHeight={shouldMeasureRow ? undefined : estimatedRowHeight}
              rowRef={shouldMeasureRow ? rowVirtualizer.measureElement : undefined}
              onRowClick={onRowClick}
              onRowModifierClick={onRowModifierClick}
              renderSubComponent={renderSubComponent}
            />
          </Fragment>
        );
      })}
      <VirtualSizeSpacer colSpan={colSpan} height={paddingBottom} />
    </>
  );
}
