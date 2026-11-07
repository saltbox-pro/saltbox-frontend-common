import type { Row } from "@tanstack/react-table";
import { toJS } from "mobx";
import { Fragment, memo, useCallback, useEffect, useRef, type ReactElement } from "react";

import { FAST_TABLE_EXPANDED_ROW_CLASS_NAME } from "saltbox-common/constants/dom-selectors";

import type {
  CellActionLinkComponent,
  FastTableRowClickHandler,
  FastTableRowModifierClickHandler,
} from "../types";
import { shouldPreventRowClick } from "../utils/should-prevent-row-click";

import { renderFastTableTableCells } from "./fast-table-cells";

type FastTableTableRowProps<DataType> = {
  row: Row<DataType>;
  className?: string;
  isClickable: boolean;
  isExpanded: boolean;
  visibleColumnCount: number;
  // Cell content doesn't depend on column widths, so rows skip re-rendering during a resize drag.
  isResizingColumn: boolean;
  actionLinkComponent?: CellActionLinkComponent;
  virtualIndex?: number;
  rowHeight?: number;
  rowRef?: (node: HTMLElement | null) => void;
  onRowClick?: FastTableRowClickHandler<DataType>;
  onRowModifierClick?: FastTableRowModifierClickHandler<DataType>;
  renderSubComponent?: (props: { row: Row<DataType> }) => ReactElement;
};

function FastTableTableRowInner<DataType>({
  row,
  className,
  isClickable,
  isExpanded,
  visibleColumnCount,
  actionLinkComponent,
  virtualIndex,
  rowHeight,
  rowRef,
  onRowClick,
  onRowModifierClick,
  renderSubComponent,
}: FastTableTableRowProps<DataType>) {
  const mainRowRef = useRef<HTMLTableRowElement | null>(null);
  const expandedRowRef = useRef<HTMLTableRowElement | null>(null);

  const setMainRowRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      mainRowRef.current = node;
      rowRef?.(node);
    },
    [rowRef]
  );

  // The virtualizer observes only the main row, so re-measure it when the expanded row resizes.
  useEffect(() => {
    const expandedRow = expandedRowRef.current;
    if (!rowRef || !expandedRow) return;

    const remeasure = () => {
      if (mainRowRef.current) rowRef(mainRowRef.current);
    };
    const observer = new ResizeObserver(remeasure);
    observer.observe(expandedRow);

    return () => {
      observer.disconnect();
      remeasure();
    };
  }, [isExpanded, rowRef]);

  return (
    <Fragment>
      <tr
        data-index={virtualIndex}
        ref={setMainRowRef}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        className={className}
        style={rowHeight !== undefined ? { height: rowHeight } : undefined}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (shouldPreventRowClick(target, event.currentTarget)) {
            return;
          }
          if (onRowModifierClick?.(row, event)) {
            return;
          }
          if (!onRowClick || !isClickable) return;
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
        {renderFastTableTableCells({
          row,
          visibleColumnCount,
          actionLinkComponent,
        })}
      </tr>
      {isExpanded && (
        <tr ref={expandedRowRef} className={FAST_TABLE_EXPANDED_ROW_CLASS_NAME}>
          <td colSpan={row.getVisibleCells().length}>{renderSubComponent?.({ row })}</td>
        </tr>
      )}
    </Fragment>
  );
}

// Rows are frozen only while a column is being dragged; otherwise they render as usual.
function areRowPropsEqual<DataType>(
  prev: FastTableTableRowProps<DataType>,
  next: FastTableTableRowProps<DataType>
) {
  return prev.isResizingColumn && next.isResizingColumn;
}

export const FastTableTableRow = memo(FastTableTableRowInner, areRowPropsEqual) as <DataType>(
  props: FastTableTableRowProps<DataType>
) => ReactElement;
