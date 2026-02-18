import { SortingState } from "@tanstack/react-table";

const enum SortOrder {
  Ascending = 1,
  Descending = -1,
}

type BackendSortingItem = SortingState[number] & {
  backendId?: string;
};

export function toBackendSorting(sorting: BackendSortingItem[]): Record<string, SortOrder> {
  const backendSorting: Record<string, SortOrder> = {};
  sorting.forEach((item) => {
    const backendId = item.backendId ?? item.id;
    backendSorting[backendId] = item.desc ? SortOrder.Descending : SortOrder.Ascending;
  });
  return backendSorting;
}
