import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { flexRender, Header, SortDirection, Table } from "@tanstack/react-table";
import { Tooltip } from "antd";
import type { MouseEvent, TouchEvent } from "react";

import { getSortedColumnClassName } from "../utils/column-sort";

import "./fast-table-header.css";

export type FastTableHeaderProps<DataType> = {
  table: Table<DataType>;
  locale: HeaderLocale;
  onPrepareColumnResize?: () => void;
};

export type HeaderLocale = {
  sortAscending?: string;
  sortDescending?: string;
  clearSort?: string;
};

type HeaderCellProps<DataType> = {
  header: Header<DataType, unknown>;
  locale: HeaderLocale;
  visibleColumnCount: number;
  isResizingColumn: boolean;
  onPrepareColumnResize?: () => void;
};

function FastTableHeaderCell<DataType>({
  header,
  locale,
  visibleColumnCount,
  isResizingColumn,
  onPrepareColumnResize,
}: HeaderCellProps<DataType>) {
  const canSort = header.column.getCanSort();
  const canResize = header.column.getCanResize();
  const headerContent = header.isPlaceholder
    ? null
    : flexRender(header.column.columnDef.header, header.getContext());

  const getSortTitle = () => {
    if (!canSort) return undefined;

    const nextOrder = header.column.getNextSortingOrder();
    if (nextOrder === "asc") return locale.sortAscending;
    if (nextOrder === "desc") return locale.sortDescending;
    return locale.clearSort;
  };

  const getThClasses = () => {
    const metaClassName =
      (header.column.columnDef.meta as { thClassName?: string })?.thClassName ?? "";
    const sortableClassName = canSort ? "fast-table-column-has-sorters" : "";
    const sortedClassName = getSortedColumnClassName(
      header.column.getIsSorted(),
      visibleColumnCount
    );
    const resizingClassName = header.column.getIsResizing() ? "fast-table-column-resizing" : "";

    return [
      "fast-table-header-cell",
      metaClassName,
      sortableClassName,
      sortedClassName,
      resizingClassName,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getSortDirectionClass = (direction: SortDirection) => {
    return header.column.getIsSorted() === direction ? "active" : "";
  };

  const headerInner = header.isPlaceholder ? null : (
    <div
      className="fast-table-header"
      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
      role={canSort ? "button" : undefined}
      tabIndex={canSort ? 0 : undefined}
      onKeyDown={
        canSort
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                header.column.getToggleSortingHandler()?.(e);
              }
            }
          : undefined
      }
    >
      <span className="fast-table-header-title">{headerContent}</span>

      {canSort && (
        <span className="fast-table-sorter">
          <CaretUpOutlined className={`sort-icon sort-icon-up ${getSortDirectionClass("asc")}`} />
          <CaretDownOutlined
            className={`sort-icon sort-icon-down ${getSortDirectionClass("desc")}`}
          />
        </span>
      )}
    </div>
  );

  const handleResizeStart = (event: MouseEvent | TouchEvent) => {
    onPrepareColumnResize?.();
    header.getResizeHandler()(event);
  };

  return (
    <th
      className={getThClasses()}
      style={isResizingColumn ? { userSelect: "none" as const } : undefined}
    >
      <div className="fast-table-header-cell-inner">
        {canSort ? <Tooltip title={getSortTitle()}>{headerInner}</Tooltip> : headerInner}

        {canResize && (
          <button
            type="button"
            aria-label={`Resize ${header.column.id} column`}
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            onClick={(e) => e.stopPropagation()}
            className={`fast-table-resize-handle ${header.column.getIsResizing() ? "is-resizing" : ""}`}
          />
        )}
      </div>
    </th>
  );
}

export function FastTableHeader<DataType>({
  table,
  locale,
  onPrepareColumnResize,
}: FastTableHeaderProps<DataType>) {
  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const isResizingColumn = Boolean(table.getState().columnSizingInfo.isResizingColumn);

  return table.getHeaderGroups().map((headerGroup) => (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => (
        <FastTableHeaderCell
          key={header.id}
          header={header}
          locale={locale}
          visibleColumnCount={visibleColumnCount}
          isResizingColumn={isResizingColumn}
          onPrepareColumnResize={onPrepareColumnResize}
        />
      ))}
    </tr>
  ));
}
