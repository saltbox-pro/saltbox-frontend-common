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
  columnIds: string[];
  onRestoreSorting: (sorting: SortingState) => void;
};

export function usePersistedSorting({
  tableId,
  sorting,
  columnIds,
  onRestoreSorting,
}: UsePersistedSortingArgs) {
  const hasRestoredRef = useRef(false);
  const lastSavedKeyRef = useRef<string | undefined>(undefined);
  const previousTableIdRef = useRef(tableId);
  const onRestoreSortingRef = useRef(onRestoreSorting);
  onRestoreSortingRef.current = onRestoreSorting;

  if (previousTableIdRef.current !== tableId) {
    previousTableIdRef.current = tableId;
    hasRestoredRef.current = false;
    lastSavedKeyRef.current = undefined;
  }

  useEffect(() => {
    if (!tableId || !sorting || hasRestoredRef.current) return;
    if (columnIds.length === 0) return;

    hasRestoredRef.current = true;
    lastSavedKeyRef.current = serializeColumnSorting(sorting);

    const saved = loadColumnSorting(tableId);
    if (!saved) return;

    const restored = pruneColumnSorting(saved, columnIds);
    if (restored.length === 0 || isSameColumnSorting(restored, sorting)) return;

    onRestoreSortingRef.current(restored);
  }, [columnIds, sorting, tableId]);

  useEffect(() => {
    if (!tableId || !sorting || !hasRestoredRef.current) return;

    const key = serializeColumnSorting(sorting);
    if (lastSavedKeyRef.current === key) return;

    lastSavedKeyRef.current = key;
    saveColumnSorting(tableId, sorting);
  }, [sorting, tableId]);
}
