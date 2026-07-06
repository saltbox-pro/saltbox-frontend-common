import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { flexRender, Header, SortDirection, Table } from "@tanstack/react-table";
import { Tooltip } from "antd";

import { getColumnWidthStyle } from "../utils/column";

import "./fast-table-header.css";

export type FastTableHeaderProps<DataType> = {
  table: Table<DataType>;
  locale: HeaderLocale;
  columnWidths?: Record<string, number>;
};

export type HeaderLocale = {
  sortAscending?: string;
  sortDescending?: string;
  clearSort?: string;
};

export function FastTableHeader<DataType>({
  table,
  locale,
  columnWidths = {},
}: FastTableHeaderProps<DataType>) {
  type HeaderType = Header<DataType, unknown>;

  const getSortTitle = (header: HeaderType) => {
    if (!header.column.getCanSort()) return undefined;

    const nextOrder = header.column.getNextSortingOrder();
    if (nextOrder === "asc") return locale.sortAscending;
    if (nextOrder === "desc") return locale.sortDescending;
    return locale.clearSort;
  };

  const getThClasses = (header: HeaderType) => {
    const metaClassName =
      (header.column.columnDef.meta as { thClassName?: string })?.thClassName ?? "";
    const sortableClassName = header.column.getCanSort() ? "fast-table-column-has-sorters" : "";
    const sortedClassName = header.column.getIsSorted() ? "fast-table-column-sort" : "";

    return ["fast-table-header-cell", metaClassName, sortableClassName, sortedClassName]
      .filter(Boolean)
      .join(" ");
  };

  const getHeaderClasses = (header: HeaderType) => {
    return header.column.getCanSort() ? "fast-table-header" : "fast-table-header-nosort";
  };

  const getSortDirectionClass = (header: HeaderType, direction: SortDirection) => {
    const sortDirection = header.column.getIsSorted();
    return sortDirection === direction ? "active" : "";
  };

  const getSorterUpClasses = (header: HeaderType) => {
    return `sort-icon sort-icon-up ${getSortDirectionClass(header, "asc")}`;
  };

  const getSorterDownClasses = (header: HeaderType) => {
    return `sort-icon sort-icon-down ${getSortDirectionClass(header, "desc")}`;
  };

  return table.getHeaderGroups().map((headerGroup) => (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header, index) => {
        const { meta } = header.column.columnDef;
        const width = meta?.width ?? columnWidths[`col-${index}`];
        const widthStyle = getColumnWidthStyle(
          width,
          meta && { minWidth: meta.minWidth, maxWidth: meta.maxWidth }
        );

        return (
          <th key={header.id} className={getThClasses(header)} style={widthStyle}>
            {header.isPlaceholder ? null : (
              <div
                onClick={header.column.getToggleSortingHandler()}
                role={header.column.getCanSort() ? "button" : undefined}
                tabIndex={header.column.getCanSort() ? 0 : undefined}
                onKeyDown={
                  header.column.getCanSort()
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          header.column.getToggleSortingHandler()?.(e);
                        }
                      }
                    : undefined
                }
              >
                <Tooltip className={getHeaderClasses(header)} title={getSortTitle(header)}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanSort() && (
                    <div className="fast-table-sorter">
                      <CaretUpOutlined className={getSorterUpClasses(header)} />
                      <CaretDownOutlined className={getSorterDownClasses(header)} />
                    </div>
                  )}
                </Tooltip>
              </div>
            )}
          </th>
        );
      })}
    </tr>
  ));
}
