import type { SortDirection } from "@tanstack/react-table";

export function getSortedColumnClassName(
  sortState: false | SortDirection,
  visibleColumnCount: number
): string {
  if (visibleColumnCount <= 1) return "";
  return sortState ? "fast-table-column-sort" : "";
}
