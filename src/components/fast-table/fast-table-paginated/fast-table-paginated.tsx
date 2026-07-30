import { MoreOutlined } from "@ant-design/icons";
import {
  type ColumnDef,
  type ExpandedState,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button, Empty, Pagination, type PaginationProps, Spin } from "antd";
import { toJS } from "mobx";
import {
  type RefObject,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useStableLoading } from "saltbox-common/utils/table-utils";

import { Dropdown } from "../../antd-wrappers/dropdown";
import { TableErrorBoundary } from "../../module-error-boundary/boundaries/table-error-boundary";
import { FastTableHeader } from "../fast-table-header/fast-table-header";
import { useColumnResizeLayout } from "../hooks/use-column-resize-layout";
import { type FastTableLocaleOverrides, useFastTableLocale } from "../hooks/use-fast-table-locale";
import { useFastTableTokenStyle } from "../hooks/use-fast-table-token-style";
import {
  type FastTableVirtualScrollOptions,
  isFastTableVirtualColumnsReady,
  useFastTableVirtualColumnSizingKey,
  useFastTableVirtualization,
} from "../hooks/use-fast-table-virtualization";
import { usePersistedColumnSizing } from "../hooks/use-persisted-column-sizing";
import { useStableLeafColumnIds } from "../hooks/use-stable-leaf-column-ids";
import type { CellActionLinkComponent, CellMeta } from "../types";
import { applyColumnResizeDefaults } from "../utils/apply-column-resize-defaults";
import {
  buildGroupedRowClassNames,
  type GetRowGroupKey,
} from "../utils/build-grouped-row-class-names";
import {
  formatCssPx,
  getColWidthStyle,
  buildResizeColumnConstraintsById,
  hasAllColumnSizes,
  resolveColumnMinWidth,
  resolveColumnWidth,
} from "../utils/column";
import {
  createClampedColumnSizingChange,
  resolveResizeColumnIds,
} from "../utils/column-sizing-change";
import { shouldPreventRowClick } from "../utils/should-prevent-row-click";
import {
  FastTableVirtualBody,
  renderFastTableSampleRow,
  renderFastTableTableCells,
} from "../virtual-scroll/fast-table-virtual-body";

import "../fast-table-tokens.css";
import "../fast-table-column-resize.css";
import "./fast-table-paginated.css";

export type FastTablePaginatedProps<DataType> = FastTableVirtualScrollOptions & {
  columns: Array<any>;
  data: Array<DataType>;
  total?: number;
  isLoading?: boolean;
  activeRowId?: string | null;
  pagination: PaginationState;
  sorting?: SortingState;
  onLazyLoad: (pagination: PaginationState, sorting: SortingState) => void;
  onRowClick?: (
    item: DataType,
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
  ) => void; // TODO: rename or use separate event handlers
  getRowId?: (originalRow: DataType, index: number, parent?: Row<DataType> | undefined) => string;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  rowSelection?: RowSelectionState;
  locale?: FastTableLocaleOverrides;
  forceExpandAll?: boolean;
  renderSubComponent?: (props: { row: Row<DataType> }) => ReactElement;
  getRowCanExpand?: (row: Row<DataType>) => boolean;
  bodyRef?: RefObject<HTMLTableSectionElement>;
  isRowClickable?: (item: DataType) => boolean;
  actionLinkComponent?: CellActionLinkComponent;
  getRowClassName?: (row: DataType, index: number) => string | undefined;
  getRowGroupKey?: GetRowGroupKey<DataType>;
  tableId: string;
  enableColumnResize?: boolean;
};

function useExpanded({ forceExpandAll }: Pick<FastTablePaginatedProps<unknown>, "forceExpandAll">) {
  const [expanded, setExpanded] = useState<ExpandedState | undefined>(undefined);

  useEffect(() => {
    setExpanded(forceExpandAll || {});
  }, [forceExpandAll]);

  return {
    expanded,
    onExpandedChange: setExpanded,
  };
}

export function FastTablePaginated<DataType>(props: FastTablePaginatedProps<DataType>) {
  return (
    <TableErrorBoundary>
      <FastTablePaginatedContent {...props} />
    </TableErrorBoundary>
  );
}

function FastTablePaginatedContent<DataType>({
  columns,
  data,
  total,
  isLoading = false,
  activeRowId,
  pagination,
  sorting,
  onLazyLoad,
  onRowClick,
  getRowId,
  onRowSelectionChange,
  rowSelection,
  locale,
  useVirtualScroll = false,
  overscan = 20,
  estimatedRowHeight = 45,
  estimatedExpandedRowHeight = estimatedRowHeight * 20,
  forceExpandAll,
  renderSubComponent,
  getRowCanExpand,
  bodyRef,
  isRowClickable,
  actionLinkComponent,
  getRowClassName,
  getRowGroupKey,
  tableId,
  enableColumnResize = true,
}: FastTablePaginatedProps<DataType>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { stableIsLoading, stableData } = useStableLoading(isLoading, data, {
    delay: 0,
  });
  const { onExpandedChange, expanded } = useExpanded({ forceExpandAll });
  const {
    columnSizing,
    hasPersistedSizing,
    onColumnSizingChange,
    persistColumnSizing,
    resetColumnSizing,
    syncColumnSizingToColumns,
    seedColumnSizingFromPixels,
    replaceColumnSizingFromPixels,
  } = usePersistedColumnSizing(enableColumnResize ? tableId : undefined);

  const resizeColumns = useMemo(
    () =>
      applyColumnResizeDefaults(columns as Array<ColumnDef<DataType, unknown>>, enableColumnResize),
    [columns, enableColumnResize]
  );

  const resizeConstraintsById = useMemo(
    () => buildResizeColumnConstraintsById(resizeColumns),
    [resizeColumns]
  );

  const resizeColumnIds = useMemo(() => resolveResizeColumnIds(resizeColumns), [resizeColumns]);

  const handleColumnSizingChange = useMemo(
    () =>
      enableColumnResize
        ? createClampedColumnSizingChange(onColumnSizingChange, resizeColumnIds, (id) =>
            resizeConstraintsById.get(id)
          )
        : onColumnSizingChange,
    [enableColumnResize, onColumnSizingChange, resizeColumnIds, resizeConstraintsById]
  );

  const table = useReactTable({
    columns: resizeColumns,
    data: stableData,
    getRowId,
    getCoreRowModel: getCoreRowModel<DataType>(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowCanExpand: getRowCanExpand,
    onRowSelectionChange,
    onExpandedChange,
    onColumnSizingChange: handleColumnSizingChange,
    onSortingChange: (updaterOrValue) => {
      const updatedSorting =
        typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue;

      const nextSorting =
        updatedSorting?.map((item) => {
          const column = table.getColumn(item.id);
          const columnDef = column?.columnDef;

          const accessorKey =
            columnDef && "accessorKey" in columnDef && typeof columnDef.accessorKey === "string"
              ? columnDef.accessorKey
              : undefined;

          if (accessorKey && accessorKey !== item.id) {
            return { ...item, backendId: accessorKey };
          }

          return item;
        }) ?? updatedSorting;

      onLazyLoad(pagination, nextSorting);
    },
    onPaginationChange: (updaterOrValue) => {
      const nextPagination =
        typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue;
      onLazyLoad(nextPagination, sorting);
    },
    state: {
      pagination,
      sorting,
      rowSelection,
      expanded,
      columnSizing,
    },
    enableSorting: !!sorting,
    enableColumnResizing: enableColumnResize,
    columnResizeMode: "onChange",
    manualSorting: true,
    manualPagination: true,
    rowCount: total,
  });

  const rows = table.getRowModel().rows;
  const leafColumns = table.getVisibleLeafColumns();
  const { leafColumnIds, leafColumnIdsKey } = useStableLeafColumnIds(leafColumns);
  const visibleColumnCount = leafColumnIds.length;
  const isResizingColumn = Boolean(table.getState().columnSizingInfo.isResizingColumn);
  const hasResizeColumnSizing = hasAllColumnSizes(columnSizing, leafColumnIds);

  const columnSizingKey = useFastTableVirtualColumnSizingKey({
    useVirtualScroll,
    columnSizing,
    isResizingColumn,
  });

  const measureColumnWidthsEnabled = useVirtualScroll && !enableColumnResize;
  const { headerHeight, columnWidths, tableScrollWidthRef, rowVirtualizer } =
    useFastTableVirtualization({
      enabled: useVirtualScroll,
      tableContainerRef,
      data: stableData,
      rows,
      columnCount: columns.length,
      columnSizingKey,
      measureColumnWidthsEnabled,
      overscan,
      estimatedRowHeight,
      estimatedExpandedRowHeight,
    });

  const { hasLockedColumnWidths, lockedColumnSizes, lockedColumnsTotalWidth, prepareColumnResize } =
    useColumnResizeLayout({
      enableColumnResize,
      tableContainerRef,
      leafColumns,
      leafColumnIds,
      leafColumnIdsKey,
      columnSizing,
      hasPersistedSizing,
      isResizingColumn,
      resizeConstraintsById,
      onColumnSizingChange: handleColumnSizingChange,
      persistColumnSizing,
      seedColumnSizingFromPixels,
      replaceColumnSizingFromPixels,
      syncColumnSizingToColumns,
    });

  const groupedRowClassNames = useMemo(
    () => (getRowGroupKey ? buildGroupedRowClassNames(stableData, getRowGroupKey) : undefined),
    [getRowGroupKey, stableData]
  );

  const columnCount = table.getHeaderGroups()[0]?.headers.length ?? 0;
  const isVirtualColumnsReady = isFastTableVirtualColumnsReady({
    columnCount,
    columnWidths,
    hasLockedColumnWidths,
    enableColumnResize,
    hasResizeColumnSizing,
  });

  const tableLocale = useFastTableLocale(locale);
  const fastTableTokenStyle = useFastTableTokenStyle();
  const showTableLayoutToolbar = enableColumnResize;

  const tableViewMenuItems = useMemo(
    () => [
      {
        key: "reset-column-widths",
        label: tableLocale.resetColumnWidths,
        disabled: !hasPersistedSizing,
        onClick: resetColumnSizing,
      },
    ],
    [hasPersistedSizing, resetColumnSizing, tableLocale.resetColumnWidths]
  );

  const showTotal: PaginationProps["showTotal"] = (total) => `${tableLocale.total} ${total}`;

  const handlePaginationChange = (page: number, pageSize: number) => {
    table.setPagination({
      pageIndex: page - 1,
      pageSize,
    });
  };

  const getRowClassNames = (row: Row<DataType>, isVirtualRow = false) => {
    const groupClassName = groupedRowClassNames?.[row.index];
    const customClassName = getRowClassName?.(row.original, row.index);
    const activeClassName =
      row.id === activeRowId
        ? isVirtualRow
          ? "virtual-row-active"
          : "fast-table-row-active"
        : undefined;

    const className = [
      isVirtualRow ? "virtual-row" : undefined,
      groupClassName,
      customClassName,
      activeClassName,
    ]
      .filter(Boolean)
      .join(" ");

    return className || undefined;
  };

  const renderColGroup = () => (
    <colgroup>
      {leafColumns.map((column, index) => {
        const meta = column.columnDef.meta as CellMeta<DataType> | undefined;

        if (hasLockedColumnWidths) {
          const size = lockedColumnSizes?.[column.id] ?? column.getSize();
          const explicitMinSize = resizeConstraintsById.get(column.id)?.minSize;
          return (
            <col
              key={column.id}
              style={getColWidthStyle(size, {
                minWidth: explicitMinSize,
                maxWidth: column.columnDef.maxSize ?? meta?.maxWidth,
              })}
            />
          );
        }

        if (enableColumnResize && hasResizeColumnSizing) {
          return (
            <col
              key={column.id}
              style={getColWidthStyle(columnSizing[column.id] ?? column.getSize(), {
                minWidth: resizeConstraintsById.get(column.id)?.minSize,
                maxWidth: column.columnDef.maxSize ?? meta?.maxWidth,
              })}
            />
          );
        }

        return (
          <col
            key={column.id}
            style={getColWidthStyle(
              resolveColumnWidth(
                column,
                useVirtualScroll ? columnWidths[`col-${index}`] : undefined
              ),
              {
                minWidth: resolveColumnMinWidth(meta),
                maxWidth: meta?.maxWidth,
              }
            )}
          />
        );
      })}
    </colgroup>
  );

  const renderTableRows = (rowCount?: number) => {
    const rowsToRender = rowCount === undefined ? rows : rows.slice(0, rowCount);
    return rowsToRender.map((row) => {
      const isClickable = onRowClick && (!isRowClickable || isRowClickable(row.original));
      return (
        <Fragment key={`${row.id}-group-row`}>
          <tr
            key={row.id}
            role={isClickable ? "button" : undefined}
            className={getRowClassNames(row)}
            onClick={(event) => {
              if (!onRowClick || !isClickable) return;

              const target = event.target as HTMLElement;
              if (shouldPreventRowClick(target, event.currentTarget)) {
                return;
              }
              onRowClick(toJS(row.original), event);
            }}
          >
            {renderFastTableTableCells({
              row,
              visibleColumnCount,
              actionLinkComponent,
            })}
          </tr>
          {row.getIsExpanded() && (
            <tr key={`${row.id}-sub-row`}>
              <td colSpan={row.getVisibleCells().length}>{renderSubComponent?.({ row })}</td>
            </tr>
          )}
        </Fragment>
      );
    });
  };

  const renderEmptyState = () => {
    return (
      <tr className="empty-state-row">
        <td colSpan={table.getAllColumns().length}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={tableLocale.empty} />
        </td>
      </tr>
    );
  };

  const renderTableFooter = () => {
    return (
      <div className="fast-table-summary">
        <div className="fast-table-pagination">
          <Pagination
            size="small"
            current={pagination.pageIndex + 1}
            pageSize={pagination.pageSize}
            total={total}
            showTotal={showTotal}
            showSizeChanger
            pageSizeOptions={[10, 50, 100, 1000]}
            defaultPageSize={50}
            showQuickJumper
            onChange={handlePaginationChange}
          />
        </div>
      </div>
    );
  };

  const shouldShowEmpty = !stableIsLoading && rows.length === 0;

  return (
    <div
      className={`fast-table ${shouldShowEmpty ? "empty" : ""} ${
        useVirtualScroll ? "virtual-scroll" : ""
      } ${enableColumnResize ? "has-column-resize" : ""} ${
        isResizingColumn ? "is-column-resizing" : ""
      }`}
      style={fastTableTokenStyle}
    >
      {showTableLayoutToolbar && (
        <div className="fast-table-toolbar">
          <Dropdown menu={{ items: tableViewMenuItems }} trigger={["click"]}>
            <Button
              type="text"
              className="fast-table-toolbar-button"
              icon={<MoreOutlined />}
              aria-label={tableLocale.tableViewMenu}
            />
          </Dropdown>
        </div>
      )}
      <Spin
        wrapperClassName="fast-table-spinner-wrapper"
        className="fast-table-spinner"
        spinning={stableIsLoading}
      >
        <div className="fast-table-wrapper" ref={tableContainerRef}>
          <table
            style={
              lockedColumnsTotalWidth !== undefined
                ? { width: formatCssPx(lockedColumnsTotalWidth) }
                : undefined
            }
          >
            {renderColGroup()}
            <thead>
              <FastTableHeader
                table={table}
                locale={tableLocale}
                onPrepareColumnResize={prepareColumnResize}
              />
            </thead>
            <tbody ref={bodyRef}>
              {shouldShowEmpty && renderEmptyState()}
              {useVirtualScroll
                ? renderFastTableSampleRow({
                    row: rows[0],
                    visibleColumnCount,
                    actionLinkComponent,
                  })
                : renderTableRows()}
            </tbody>
          </table>
          {useVirtualScroll && (
            <FastTableVirtualBody
              rows={rows}
              rowVirtualizer={rowVirtualizer}
              headerHeight={headerHeight}
              isVirtualColumnsReady={isVirtualColumnsReady}
              tableScrollWidthRef={tableScrollWidthRef}
              visibleColumnCount={visibleColumnCount}
              hasLockedColumnWidths={hasLockedColumnWidths}
              lockedColumnSizes={lockedColumnSizes}
              lockedColumnsTotalWidth={lockedColumnsTotalWidth}
              enableColumnResize={enableColumnResize}
              columnSizing={columnSizing}
              columnWidths={columnWidths}
              leafColumnIds={leafColumnIds}
              hasResizeColumnSizing={hasResizeColumnSizing}
              onRowClick={onRowClick}
              isRowClickable={isRowClickable}
              getRowClassName={getRowClassNames}
              renderSubComponent={renderSubComponent}
              actionLinkComponent={actionLinkComponent}
            />
          )}
        </div>
      </Spin>
      {renderTableFooter()}
    </div>
  );
}
