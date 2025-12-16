import { SortOrder } from "@saltbox/saltbox-core-api-client";
import { SortingState } from "@tanstack/react-table";

export function toBackendSorting(sorting: SortingState): Record<string, SortOrder> {
  const backendSorting = {};
  sorting.forEach((item) => {
    backendSorting[item.id] = item.desc ? SortOrder.NUMBER_MINUS_1 : SortOrder.NUMBER_1;
  });
  return backendSorting;
}
