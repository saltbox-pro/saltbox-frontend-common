import type { SortingState } from "@tanstack/react-table";
import { useEffect, useRef } from "react";

import {
  isSameColumnSorting,
  loadColumnSorting,
  pruneColumnSorting,
  saveColumnSorting,
  serializeColumnSorting,
} from "../utils/persisted-column-sorting";

export type UsePersistedSortingArgs = {
  tableId?: string;
  sorting?: SortingState;
  allColumnIds: string[];
  isLoading?: boolean;
  onRestoreSorting: (sorting: SortingState) => void;
};

export function usePersistedSorting({
  tableId,
  sorting,
  allColumnIds,
  isLoading = false,
  onRestoreSorting,
}: UsePersistedSortingArgs) {
  const hasRestoredRef = useRef(false);
  const hasStartedLoadingRef = useRef(false);
  const lastSavedKeyRef = useRef<string | undefined>(undefined);
  const previousTableIdRef = useRef(tableId);
  const onRestoreSortingRef = useRef(onRestoreSorting);
  onRestoreSortingRef.current = onRestoreSorting;

  if (previousTableIdRef.current !== tableId) {
    previousTableIdRef.current = tableId;
    hasRestoredRef.current = false;
    hasStartedLoadingRef.current = false;
    lastSavedKeyRef.current = undefined;
  }

  if (isLoading) {
    hasStartedLoadingRef.current = true;
  }

  useEffect(() => {
    if (!tableId || !sorting || hasRestoredRef.current) return;
    if (allColumnIds.length === 0) return;
    if (isLoading || !hasStartedLoadingRef.current) return;

    hasRestoredRef.current = true;
    lastSavedKeyRef.current = serializeColumnSorting(sorting);

    const saved = loadColumnSorting(tableId);
    if (!saved) return;

    const restored = pruneColumnSorting(saved, allColumnIds);
    if (restored.length === 0 || isSameColumnSorting(restored, sorting)) return;

    onRestoreSortingRef.current(restored);
  }, [allColumnIds, isLoading, sorting, tableId]);

  useEffect(() => {
    if (!tableId || !sorting || !hasRestoredRef.current) return;

    const key = serializeColumnSorting(sorting);
    if (lastSavedKeyRef.current === key) return;

    lastSavedKeyRef.current = key;
    saveColumnSorting(tableId, sorting);
  }, [sorting, tableId]);
}
