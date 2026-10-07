import type { Row } from "@tanstack/react-table";
import { toJS } from "mobx";
import { Fragment, type ReactElement } from "react";

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
  actionLinkComponent?: CellActionLinkComponent;
  onRowClick?: FastTableRowClickHandler<DataType>;
  renderSubComponent?: (props: { row: Row<DataType> }) => ReactElement;
};

export function FastTableTableRow<DataType>({
  row,
  className,
  isClickable,
  isExpanded,
  visibleColumnCount,
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
        {renderFastTableTableCells({
          row,
          visibleColumnCount,
          actionLinkComponent,
        })}
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={row.getVisibleCells().length}>{renderSubComponent?.({ row })}</td>
        </tr>
      )}
    </Fragment>
  );
}
