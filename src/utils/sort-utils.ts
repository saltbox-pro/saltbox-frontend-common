import { SortingState } from "@tanstack/react-table";

const enum SortOrder {
  Ascending = 1,
  Descending = -1,
}

export function toBackendSorting(sorting: SortingState): Record<string, SortOrder> {
  const backendSorting = {};
  sorting.forEach((item) => {
    backendSorting[item.id] = item.desc ? SortOrder.Descending : SortOrder.Ascending;
  });
  return backendSorting;
}
