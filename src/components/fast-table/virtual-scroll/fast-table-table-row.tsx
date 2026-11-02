import type { Row } from "@tanstack/react-table";
import { toJS } from "mobx";
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from "react";

import type { CellActionLinkComponent } from "../types";
import { shouldPreventRowClick } from "../utils/should-prevent-row-click";

import { renderFastTableTableCells } from "./fast-table-cells";

export const FAST_TABLE_EXPANDED_ROW_CLASS_NAME = "fast-table-expanded-row";

export type FastTableRowClickHandler<DataType> = (
  item: DataType,
  event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
) => void;

type FastTableTableRowProps<DataType> = {
  row: Row<DataType>;
  className?: string;
  isClickable: boolean;
  isExpanded: boolean;
  visibleColumnCount: number;
  // See useRowRenderToken: busts the memo when table state other than column widths changes.
  renderToken: object;
  // Cell content doesn't depend on column widths, so rows skip re-rendering during a resize drag.
  isResizingColumn: boolean;
  actionLinkComponent?: CellActionLinkComponent;
  virtualIndex?: number;
  rowHeight?: number;
  rowRef?: (node: HTMLElement | null) => void;
  onRowClick?: FastTableRowClickHandler<DataType>;
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

function areRowPropsEqual<DataType>(
  prev: FastTableTableRowProps<DataType>,
  next: FastTableTableRowProps<DataType>
) {
  if (prev.isResizingColumn && next.isResizingColumn) return true;

  const keys = Object.keys(next) as Array<keyof FastTableTableRowProps<DataType>>;
  return (
    keys.length === Object.keys(prev).length && keys.every((key) => Object.is(prev[key], next[key]))
  );
}

export const FastTableTableRow = memo(FastTableTableRowInner, areRowPropsEqual) as <DataType>(
  props: FastTableTableRowProps<DataType>
) => ReactElement;
