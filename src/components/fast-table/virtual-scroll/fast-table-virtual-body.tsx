import { flexRender, type Row } from "@tanstack/react-table";
import type { Virtualizer } from "@tanstack/react-virtual";
import { toJS } from "mobx";
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";

import { CellActions } from "../cell-actions/cell-actions";
import type { CellActionLinkComponent, CellMeta } from "../types";
import {
  formatCssPx,
  getVirtualCellWidthStyle,
  resolveCellTitle,
  resolveColumnWidth,
  sumColumnSizes,
} from "../utils/column";
import { getSortedColumnClassName } from "../utils/column-sort";
import { shouldPreventRowClick } from "../utils/should-prevent-row-click";

import "./fast-table-virtual-scroll.css";

type FastTableRowClickHandler<DataType> = (
  item: DataType,
  event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
) => void;

type FastTableVirtualCellContext<DataType> = {
  row: Row<DataType>;
  visibleColumnCount: number;
  hasLockedColumnWidths: boolean;
  lockedColumnSizes?: Record<string, number>;
  enableColumnResize: boolean;
  columnSizing: Record<string, number>;
  columnWidths: Record<string, number>;
  actionLinkComponent?: CellActionLinkComponent;
};

function renderFastTableVirtualCells<DataType>({
  row,
  visibleColumnCount,
  hasLockedColumnWidths,
  lockedColumnSizes,
  enableColumnResize,
  columnSizing,
  columnWidths,
  actionLinkComponent,
}: FastTableVirtualCellContext<DataType>) {
  return row.getVisibleCells().map((cell, index) => {
    const meta = cell.column.columnDef.meta as CellMeta<DataType> | undefined;
    const widthStyle = (() => {
      if (hasLockedColumnWidths) {
        return getVirtualCellWidthStyle(
          lockedColumnSizes?.[cell.column.id] ?? cell.column.getSize()
        );
      }

      if (enableColumnResize) {
        return getVirtualCellWidthStyle(columnSizing[cell.column.id] ?? cell.column.getSize());
      }

      const measuredWidth = columnWidths[`col-${index}`];
      const resolvedWidth = resolveColumnWidth(cell.column, measuredWidth);
      return getVirtualCellWidthStyle(
        typeof resolvedWidth === "number" ? resolvedWidth : measuredWidth
      );
    })();

    const isEllipsis = meta?.ellipsis ?? true;
    const cellTitle = isEllipsis
      ? resolveCellTitle(meta?.copyValue?.(row.original) ?? cell.getValue())
      : undefined;

    return (
      <div
        key={cell.id}
        className={`virtual-cell cell-with-actions ${meta?.tdClassName ?? ""} ${getSortedColumnClassName(cell.column.getIsSorted(), visibleColumnCount)} ${meta?.color ? `cell-color-${meta.color}` : ""}`}
        style={widthStyle}
      >
        <span className="cell-content">
          <span
            className={`cell-content-text ${isEllipsis ? "cell-content-text-ellipsis" : ""}`}
            title={cellTitle}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </span>
          {(meta?.showCopy || meta?.actions) && (
            <CellActions
              value={cell.getValue()}
              row={row.original}
              showCopy={meta.showCopy}
              copyValue={meta.copyValue?.(row.original)}
              actions={meta.actions}
              linkComponent={actionLinkComponent}
            />
          )}
        </span>
      </div>
    );
  });
}

export function renderFastTableTableCells<DataType>({
  row,
  visibleColumnCount,
  actionLinkComponent,
}: Pick<
  FastTableVirtualCellContext<DataType>,
  "row" | "visibleColumnCount" | "actionLinkComponent"
>) {
  return row.getVisibleCells().map((cell) => {
    const meta = cell.column.columnDef.meta as CellMeta<DataType> | undefined;
    const isEllipsis = meta?.ellipsis ?? true;
    const cellTitle = isEllipsis
      ? resolveCellTitle(meta?.copyValue?.(row.original) ?? cell.getValue())
      : undefined;

    return (
      <td
        key={cell.id}
        className={`cell-with-actions ${meta?.tdClassName ?? ""} ${getSortedColumnClassName(cell.column.getIsSorted(), visibleColumnCount)} ${meta?.color ? `cell-color-${meta.color}` : ""}`}
      >
        <span className="cell-content">
          <span
            className={`cell-content-text ${isEllipsis ? "cell-content-text-ellipsis" : ""}`}
            title={cellTitle}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </span>
          {(meta?.showCopy || meta?.actions) && (
            <CellActions
              value={cell.getValue()}
              row={row.original}
              showCopy={meta.showCopy}
              copyValue={meta.copyValue?.(row.original)}
              actions={meta.actions}
              linkComponent={actionLinkComponent}
            />
          )}
        </span>
      </td>
    );
  });
}

export function renderFastTableSampleRow<DataType>({
  row,
  visibleColumnCount,
  actionLinkComponent,
}: {
  row: Row<DataType> | undefined;
  visibleColumnCount: number;
  actionLinkComponent?: CellActionLinkComponent;
}) {
  if (!row) return null;

  return (
    <tr key={row.id} className="sample-row">
      {renderFastTableTableCells({ row, visibleColumnCount, actionLinkComponent })}
    </tr>
  );
}

export type FastTableVirtualBodyProps<DataType> = {
  rows: Array<Row<DataType>>;
  rowVirtualizer: Virtualizer<HTMLElement, Element>;
  headerHeight: number;
  isVirtualColumnsReady: boolean;
  tableScrollWidthRef: RefObject<number>;
  visibleColumnCount: number;
  hasLockedColumnWidths: boolean;
  lockedColumnSizes?: Record<string, number>;
  lockedColumnsTotalWidth?: number;
  enableColumnResize: boolean;
  columnSizing: Record<string, number>;
  columnWidths: Record<string, number>;
  leafColumnIds: string[];
  hasResizeColumnSizing: boolean;
  onRowClick?: FastTableRowClickHandler<DataType>;
  isRowClickable?: (item: DataType) => boolean;
  getRowClassName?: (row: Row<DataType>, isVirtualRow: boolean) => string | undefined;
  renderSubComponent?: (props: { row: Row<DataType> }) => ReactElement;
  actionLinkComponent?: CellActionLinkComponent;
};

export function FastTableVirtualBody<DataType>({
  rows,
  rowVirtualizer,
  headerHeight,
  isVirtualColumnsReady,
  tableScrollWidthRef,
  visibleColumnCount,
  hasLockedColumnWidths,
  lockedColumnSizes,
  lockedColumnsTotalWidth,
  enableColumnResize,
  columnSizing,
  columnWidths,
  leafColumnIds,
  hasResizeColumnSizing,
  onRowClick,
  isRowClickable,
  getRowClassName,
  renderSubComponent,
  actionLinkComponent,
}: FastTableVirtualBodyProps<DataType>): ReactNode {
  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows[0]?.start || 0;
  const resizeSizingTotalWidth = hasResizeColumnSizing
    ? sumColumnSizes(columnSizing, leafColumnIds)
    : 0;
  const virtualBodyWidth =
    lockedColumnsTotalWidth !== undefined
      ? formatCssPx(lockedColumnsTotalWidth)
      : resizeSizingTotalWidth > 0
        ? formatCssPx(resizeSizingTotalWidth)
        : tableScrollWidthRef.current > 0
          ? formatCssPx(tableScrollWidthRef.current)
          : "100%";

  const cellContext = {
    visibleColumnCount,
    hasLockedColumnWidths,
    lockedColumnSizes,
    enableColumnResize,
    columnSizing,
    columnWidths,
    actionLinkComponent,
  };

  return (
    <div
      className="virtual-tbody-container"
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        top: `${headerHeight}px`,
        width: virtualBodyWidth,
        visibility: headerHeight > 0 && isVirtualColumnsReady ? "visible" : "hidden",
      }}
    >
      <div
        className="virtual-tbody-content"
        style={{
          transform: `translateY(${paddingTop}px)`,
          willChange: "transform",
        }}
      >
        {virtualRows.map((virtualRow) => {
          const row = rows[virtualRow.index];
          const isClickable = Boolean(
            onRowClick && (isRowClickable == null || isRowClickable(row.original))
          );
          const isFirstVirtualRow = virtualRow.start === 0;
          const rowClassName = [
            getRowClassName?.(row, true),
            isFirstVirtualRow ? "virtual-row-first" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={`${row.id}-group-row`}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className={rowClassName || undefined}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onClick={(event) => {
                if (!onRowClick || !isClickable) return;

                const target = event.target as HTMLElement;
                if (shouldPreventRowClick(target, event.currentTarget)) {
                  return;
                }
                onRowClick(toJS(row.original), event);
              }}
              onKeyDown={
                isClickable
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick!(toJS(row.original), event);
                      }
                    }
                  : undefined
              }
            >
              <div className="virtual-row-cells">
                {renderFastTableVirtualCells({ row, ...cellContext })}
              </div>
              {row.getIsExpanded() && renderSubComponent && (
                <div className="virtual-row-expanded">{renderSubComponent({ row })}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
