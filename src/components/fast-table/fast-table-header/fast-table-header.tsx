import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  MoreOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
} from "@ant-design/icons";
import { flexRender, Header, SortDirection, Table } from "@tanstack/react-table";
import { Tooltip } from "antd";
import { type MouseEvent, type ReactNode, type TouchEvent, useState } from "react";

import { Dropdown } from "../../antd-wrappers/dropdown";
import type { ColumnMoveDirection } from "../utils/column-layout";
import { getSortedColumnClassName } from "../utils/column-sort";

import "./fast-table-header.css";

export type FastTableHeaderProps<DataType> = {
  table: Table<DataType>;
  locale: HeaderLocale;
  onPrepareColumnResize?: () => void;
  canMoveColumn?: (columnId: string, direction: ColumnMoveDirection) => boolean;
  onMoveColumn?: (columnId: string, direction: ColumnMoveDirection) => void;
};

export type HeaderLocale = {
  sortAscending?: string;
  sortDescending?: string;
  clearSort?: string;
  columnMenu?: string;
  moveColumnToStart?: string;
  moveColumnLeft?: string;
  moveColumnRight?: string;
  moveColumnToEnd?: string;
};

type HeaderCellProps<DataType> = {
  header: Header<DataType, unknown>;
  locale: HeaderLocale;
  visibleColumnCount: number;
  isLastLeafColumn: boolean;
  isResizingColumn: boolean;
  onPrepareColumnResize?: () => void;
  canMoveColumn?: (columnId: string, direction: ColumnMoveDirection) => boolean;
  onMoveColumn?: (columnId: string, direction: ColumnMoveDirection) => void;
};

function FastTableHeaderCell<DataType>({
  header,
  locale,
  visibleColumnCount,
  isLastLeafColumn,
  isResizingColumn,
  onPrepareColumnResize,
  canMoveColumn,
  onMoveColumn,
}: HeaderCellProps<DataType>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuTooltipOpen, setIsMenuTooltipOpen] = useState(false);
  const canSort = header.column.getCanSort();
  const canResize = header.column.getCanResize() && !isLastLeafColumn;
  const headerContent = header.isPlaceholder
    ? null
    : flexRender(header.column.columnDef.header, header.getContext());

  const handleMenuOpenChange = (open: boolean) => {
    setIsMenuOpen(open);
    setIsMenuTooltipOpen(false);
  };

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

  const buildMoveMenuItem = (
    key: string,
    direction: ColumnMoveDirection,
    label: string | undefined,
    icon: ReactNode
  ) => ({
    key,
    icon,
    label,
    disabled: !canMoveColumn?.(header.column.id, direction),
    onClick: () => onMoveColumn?.(header.column.id, direction),
  });

  const moveMenuItems = [
    buildMoveMenuItem(
      "move-to-start",
      "start",
      locale.moveColumnToStart,
      <VerticalRightOutlined />
    ),
    buildMoveMenuItem("move-left", "left", locale.moveColumnLeft, <ArrowLeftOutlined />),
    buildMoveMenuItem("move-right", "right", locale.moveColumnRight, <ArrowRightOutlined />),
    buildMoveMenuItem("move-to-end", "end", locale.moveColumnToEnd, <VerticalLeftOutlined />),
  ];

  const canShowMenu =
    Boolean(onMoveColumn) &&
    !header.isPlaceholder &&
    header.column.getCanHide() &&
    moveMenuItems.some((item) => !item.disabled);

  const titleNode = <span className="fast-table-header-title">{headerContent}</span>;

  const sorterNode = (
    <span className="fast-table-sorter">
      <CaretUpOutlined className={`sort-icon sort-icon-up ${getSortDirectionClass("asc")}`} />
      <CaretDownOutlined className={`sort-icon sort-icon-down ${getSortDirectionClass("desc")}`} />
    </span>
  );

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
      {canSort ? <Tooltip title={getSortTitle()}>{titleNode}</Tooltip> : titleNode}

      {canShowMenu && (
        <span
          role="presentation"
          className="fast-table-header-menu-anchor"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Dropdown
            trigger={["click"]}
            menu={{ items: moveMenuItems }}
            onOpenChange={handleMenuOpenChange}
          >
            <Tooltip
              title={locale.columnMenu}
              open={isMenuTooltipOpen && !isMenuOpen}
              onOpenChange={setIsMenuTooltipOpen}
            >
              <button
                type="button"
                aria-label={locale.columnMenu}
                className={`fast-table-header-menu ${isMenuOpen ? "is-open" : ""}`}
              >
                <MoreOutlined />
              </button>
            </Tooltip>
          </Dropdown>
        </span>
      )}

      {canSort && <Tooltip title={getSortTitle()}>{sorterNode}</Tooltip>}
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
        {headerInner}

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
  canMoveColumn,
  onMoveColumn,
}: FastTableHeaderProps<DataType>) {
  const leafColumns = table.getVisibleLeafColumns();
  const visibleColumnCount = leafColumns.length;
  const lastLeafColumnId = leafColumns[leafColumns.length - 1]?.id;
  const isResizingColumn = Boolean(table.getState().columnSizingInfo.isResizingColumn);

  return table.getHeaderGroups().map((headerGroup) => (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => (
        <FastTableHeaderCell
          key={header.id}
          header={header}
          locale={locale}
          visibleColumnCount={visibleColumnCount}
          isLastLeafColumn={header.column.id === lastLeafColumnId}
          isResizingColumn={isResizingColumn}
          onPrepareColumnResize={onPrepareColumnResize}
          canMoveColumn={canMoveColumn}
          onMoveColumn={onMoveColumn}
        />
      ))}
    </tr>
  ));
}
