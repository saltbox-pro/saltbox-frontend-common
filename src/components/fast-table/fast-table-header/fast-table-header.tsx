import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import {
  flexRender,
  Header,
  SortDirection,
  Table,
} from "@tanstack/react-table";
import "./fast-table-header.css";
import { Tooltip } from "antd";

export type FastTableHeaderProps<DataType> = {
  table: Table<DataType>;
  locale: HeaderLocale;
};

export type HeaderLocale = {
  sortAscending?: string;
  sortDescending?: string;
  clearSort?: string;
};

export function FastTableHeader<DataType>({
  table,
  locale,
}: FastTableHeaderProps<DataType>) {
  const getSortTitle = (header: Header<DataType, unknown>) => {
    if (!header.column.getCanSort()) return undefined;

    const nextOrder = header.column.getNextSortingOrder();
    if (nextOrder === "asc") return locale.sortAscending;
    if (nextOrder === "desc") return locale.sortDescending;
    return locale.clearSort;
  };

  const getHeaderClasses = (header: Header<DataType, unknown>) => {
    return header.column.getCanSort()
      ? "fast-table-header"
      : "fast-table-header-nosort";
  };

  const getSortDirectionClass = (
    header: Header<DataType, unknown>,
    direction: SortDirection
  ) => {
    const sortDirection = header.column.getIsSorted();
    return sortDirection === direction ? "active" : "";
  };

  const getSorterUpClasses = (header: Header<DataType, unknown>) => {
    return `sort-icon sort-icon-up ${getSortDirectionClass(header, "asc")}`;
  };

  const getSorterDownClasses = (header: Header<DataType, unknown>) => {
    return `sort-icon sort-icon-down ${getSortDirectionClass(header, "desc")}`;
  };

  return table.getHeaderGroups().map((headerGroup) => (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => (
        <th
          key={header.id}
          className={(header.column.columnDef.meta as any)?.thClassName}
        >
          {header.isPlaceholder ? null : (
            <div onClick={header.column.getToggleSortingHandler()}>
              <Tooltip
                className={getHeaderClasses(header)}
                title={getSortTitle(header)}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
                {header.column.getCanSort() && (
                  <div className="fast-table-sorter">
                    <CaretUpOutlined className={getSorterUpClasses(header)} />
                    <CaretDownOutlined
                      className={getSorterDownClasses(header)}
                    />
                  </div>
                )}
              </Tooltip>
            </div>
          )}
        </th>
      ))}
    </tr>
  ));
}
