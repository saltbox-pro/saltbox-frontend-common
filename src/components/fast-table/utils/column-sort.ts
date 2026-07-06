import type { SortDirection } from "@tanstack/react-table";

export function getSortedColumnClassName(sortState: false | SortDirection): string {
  return sortState ? "fast-table-column-sort" : "";
}
