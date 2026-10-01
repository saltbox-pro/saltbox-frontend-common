import type { SortDirection, SortingState } from "@tanstack/react-table";

export function getSortedColumnClassName(
  sortState: false | SortDirection,
  visibleColumnCount: number
): string {
  if (visibleColumnCount <= 1) return "";
  return sortState ? "fast-table-column-sort" : "";
}

export function getSortingRevisionKey(sorting?: SortingState): string {
  if (!sorting?.length) return "";
  return sorting.map((item) => `${item.id}:${item.desc ? "1" : "0"}`).join("|");
}

export function resolveCellsRevisionKey(
  cellsRevisionKey: string | number | undefined,
  sorting?: SortingState
): string {
  const sortingKey = getSortingRevisionKey(sorting);
  if (cellsRevisionKey == null || cellsRevisionKey === "") {
    return sortingKey;
  }
  return sortingKey ? `${String(cellsRevisionKey)}|${sortingKey}` : String(cellsRevisionKey);
}
