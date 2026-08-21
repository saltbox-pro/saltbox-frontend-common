import { flexRender, type Cell, type Row } from "@tanstack/react-table";
import type { Virtualizer } from "@tanstack/react-virtual";
import { toJS } from "mobx";
import {
  memo,
  useMemo,
  type CSSProperties,
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
  hasResizeColumnSizing: boolean;
  columnSizing: Record<string, number>;
  columnWidths: Record<string, number>;
  actionLinkComponent?: CellActionLinkComponent;
};

function getVirtualCellWidthStyleFromContext<DataType>(
  cell: Cell<DataType, unknown>,
  index: number,
  {
    hasLockedColumnWidths,
    lockedColumnSizes,
    enableColumnResize,
    hasResizeColumnSizing,
    columnSizing,
    columnWidths,
  }: Omit<
    FastTableVirtualCellContext<DataType>,
    "row" | "visibleColumnCount" | "actionLinkComponent"
  >
): CSSProperties {
  if (hasLockedColumnWidths) {
    return getVirtualCellWidthStyle(lockedColumnSizes?.[cell.column.id] ?? cell.column.getSize());
  }

  if (enableColumnResize && hasResizeColumnSizing) {
    return getVirtualCellWidthStyle(columnSizing[cell.column.id] ?? cell.column.getSize());
  }

  const measuredWidth = columnWidths[`col-${index}`];
  if (measuredWidth !== undefined) {
    return getVirtualCellWidthStyle(measuredWidth);
  }

  const declaredWidth = resolveColumnWidth(cell.column);
  return getVirtualCellWidthStyle(typeof declaredWidth === "number" ? declaredWidth : undefined);
}

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
  const cellTitle = isEllipsis
    ? resolveCellTitle(meta?.copyValue?.(row.original) ?? cell.getValue())
    : undefined;

  return (
    <span className="cell-content">
      <span
        className={`cell-content-text ${isEllipsis ? "cell-content-text-ellipsis" : ""}`}
        title={cellTitle}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
  visibleColumnCount: number,
  extraClassName?: string
) {
  const meta = cell.column.columnDef.meta as CellMeta<DataType> | undefined;
  return [
    extraClassName,
    "cell-with-actions",
    meta?.tdClassName ?? "",
    getSortedColumnClassName(cell.column.getIsSorted(), visibleColumnCount),
    meta?.color ? `cell-color-${meta.color}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function renderFastTableVirtualCells<DataType>({
  row,
  visibleColumnCount,
  hasLockedColumnWidths,
  lockedColumnSizes,
  enableColumnResize,
  hasResizeColumnSizing,
  columnSizing,
  columnWidths,
  actionLinkComponent,
}: FastTableVirtualCellContext<DataType>) {
  return row.getVisibleCells().map((cell, index) => (
    <div
      key={cell.id}
      className={getFastTableCellClassName(cell, visibleColumnCount, "virtual-cell")}
      style={getVirtualCellWidthStyleFromContext(cell, index, {
        hasLockedColumnWidths,
        lockedColumnSizes,
        enableColumnResize,
        hasResizeColumnSizing,
        columnSizing,
        columnWidths,
      })}
    >
      {renderFastTableCellContent({ row, cell, actionLinkComponent })}
    </div>
  ));
}

export function renderFastTableTableCells<DataType>({
  row,
  visibleColumnCount,
  actionLinkComponent,
}: Pick<
  FastTableVirtualCellContext<DataType>,
  "row" | "visibleColumnCount" | "actionLinkComponent"
>) {
  return row.getVisibleCells().map((cell) => (
    <td key={cell.id} className={getFastTableCellClassName(cell, visibleColumnCount)}>
      {renderFastTableCellContent({ row, cell, actionLinkComponent })}
    </td>
  ));
}

export function renderFastTableVirtualSpacer({
  colSpan,
  height,
}: {
  colSpan: number;
  height: number;
}) {
  if (colSpan <= 0 || height <= 0) return null;

  return (
    <tr className="virtual-size-spacer" aria-hidden="true">
      <td colSpan={colSpan} style={{ height: formatCssPx(height) }} />
    </tr>
  );
}

type FastTableVirtualRowProps<DataType> = {
  row: Row<DataType>;
  virtualIndex: number;
  offsetInBody: number;
  rowHeight?: number;
  className?: string;
  isClickable: boolean;
  isExpanded: boolean;
  enableDynamicRowHeight: boolean;
  measureElement?: (node: HTMLElement | null) => void;
  cellContext: Omit<FastTableVirtualCellContext<DataType>, "row">;
  onRowClick?: FastTableRowClickHandler<DataType>;
  renderSubComponent?: (props: { row: Row<DataType> }) => ReactElement;
};

function FastTableVirtualRowInner<DataType>({
  row,
  virtualIndex,
  offsetInBody,
  rowHeight,
  className,
  isClickable,
  isExpanded,
  enableDynamicRowHeight,
  measureElement,
  cellContext,
  onRowClick,
  renderSubComponent,
}: FastTableVirtualRowProps<DataType>) {
  return (
    <div
      data-index={virtualIndex}
      ref={enableDynamicRowHeight ? measureElement : undefined}
      className={className}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: rowHeight,
        transform: `translateY(${offsetInBody}px)`,
      }}
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
      {isExpanded && renderSubComponent && (
        <div className="virtual-row-expanded">{renderSubComponent({ row })}</div>
      )}
    </div>
  );
}

const FastTableVirtualRow = memo(FastTableVirtualRowInner, (prev, next) => {
  return (
    prev.row.id === next.row.id &&
    prev.virtualIndex === next.virtualIndex &&
    prev.row.original === next.row.original &&
    prev.offsetInBody === next.offsetInBody &&
    prev.rowHeight === next.rowHeight &&
    prev.className === next.className &&
    prev.isClickable === next.isClickable &&
    prev.isExpanded === next.isExpanded &&
    prev.enableDynamicRowHeight === next.enableDynamicRowHeight &&
    prev.cellContext === next.cellContext &&
    prev.onRowClick === next.onRowClick &&
    prev.renderSubComponent === next.renderSubComponent &&
    prev.measureElement === next.measureElement
  );
}) as typeof FastTableVirtualRowInner;

export type FastTableVirtualBodyProps<DataType> = {
  rows: Array<Row<DataType>>;
  rowVirtualizer: Virtualizer<HTMLElement, Element>;
  headerHeight: number;
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
  estimatedRowHeight: number;
  enableDynamicRowHeight?: boolean;
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
  estimatedRowHeight,
  enableDynamicRowHeight = true,
  onRowClick,
  isRowClickable,
  getRowClassName,
  renderSubComponent,
  actionLinkComponent,
}: FastTableVirtualBodyProps<DataType>): ReactNode {
  const virtualRows = rowVirtualizer.getVirtualItems();
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

  const cellContext = useMemo(
    () => ({
      visibleColumnCount,
      hasLockedColumnWidths,
      lockedColumnSizes,
      enableColumnResize,
      hasResizeColumnSizing,
      columnSizing,
      columnWidths,
      actionLinkComponent,
    }),
    [
      visibleColumnCount,
      hasLockedColumnWidths,
      lockedColumnSizes,
      enableColumnResize,
      hasResizeColumnSizing,
      columnSizing,
      columnWidths,
      actionLinkComponent,
    ]
  );

  return (
    <div
      className="virtual-tbody-container"
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        top: `${headerHeight}px`,
        width: virtualBodyWidth,
      }}
    >
      {virtualRows.map((virtualRow) => {
        const row = rows[virtualRow.index];
        const isClickable = Boolean(
          onRowClick && (isRowClickable == null || isRowClickable(row.original))
        );
        const rowClassName = [
          getRowClassName?.(row, true),
          enableDynamicRowHeight ? undefined : "virtual-row-fixed",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <FastTableVirtualRow
            key={`${row.id}-group-row`}
            row={row}
            virtualIndex={virtualRow.index}
            offsetInBody={virtualRow.start - headerHeight}
            rowHeight={enableDynamicRowHeight ? undefined : estimatedRowHeight}
            className={rowClassName || undefined}
            isClickable={isClickable}
            isExpanded={row.getIsExpanded()}
            enableDynamicRowHeight={enableDynamicRowHeight}
            measureElement={rowVirtualizer.measureElement}
            cellContext={cellContext}
            onRowClick={onRowClick}
            renderSubComponent={renderSubComponent}
          />
        );
      })}
    </div>
  );
}
