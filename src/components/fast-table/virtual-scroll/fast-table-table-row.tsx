import type { Row } from "@tanstack/react-table";
import { toJS } from "mobx";
import { Fragment, memo, type ReactElement, type ReactNode } from "react";

import type { CellActionLinkComponent } from "../types";
import { shouldPreventRowClick } from "../utils/should-prevent-row-click";

import {
  type FastTableRowClickHandler,
  renderFastTableTableCells,
} from "./fast-table-virtual-body";

type FastTableTableRowProps<DataType> = {
  row: Row<DataType>;
  className?: string;
  isClickable: boolean;
  isExpanded: boolean;
  visibleColumnCount: number;
  columnOrderKey: string;
  actionLinkComponent?: CellActionLinkComponent;
  onRowClick?: FastTableRowClickHandler<DataType>;
  renderSubComponent?: (props: { row: Row<DataType> }) => ReactElement;
};

type FastTableTableRowCellsProps<DataType> = {
  row: Row<DataType>;
  visibleColumnCount: number;
  actionLinkComponent?: CellActionLinkComponent;
};

function FastTableTableRowCellsInner<DataType>({
  row,
  visibleColumnCount,
  actionLinkComponent,
}: FastTableTableRowCellsProps<DataType>): ReactNode {
  return renderFastTableTableCells({
    row,
    visibleColumnCount,
    actionLinkComponent,
  });
}

function canSkipRowCellsRender<DataType>(
  prev: FastTableTableRowCellsProps<DataType>,
  next: FastTableTableRowCellsProps<DataType>
) {
  return (
    prev.row.id === next.row.id &&
    prev.row.original === next.row.original &&
    prev.visibleColumnCount === next.visibleColumnCount &&
    prev.actionLinkComponent === next.actionLinkComponent
  );
}

const FastTableTableRowCells = memo(
  FastTableTableRowCellsInner,
  canSkipRowCellsRender
) as typeof FastTableTableRowCellsInner;

export function FastTableTableRow<DataType>({
  row,
  className,
  isClickable,
  isExpanded,
  visibleColumnCount,
  columnOrderKey,
  actionLinkComponent,
  onRowClick,
  renderSubComponent,
}: FastTableTableRowProps<DataType>) {
  return (
    <Fragment>
      <tr
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        className={className}
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
        <FastTableTableRowCells
          key={columnOrderKey}
          row={row}
          visibleColumnCount={visibleColumnCount}
          actionLinkComponent={actionLinkComponent}
        />
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={row.getVisibleCells().length}>{renderSubComponent?.({ row })}</td>
        </tr>
      )}
    </Fragment>
  );
}
