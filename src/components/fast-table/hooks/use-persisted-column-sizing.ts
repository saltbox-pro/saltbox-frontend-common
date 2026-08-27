import type { ColumnSizingState, OnChangeFn } from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  loadColumnSizing,
  pruneColumnSizing,
  saveColumnSizing,
} from "../utils/persisted-column-sizing";

function readInitialState(tableId?: string): {
  columnSizing: ColumnSizingState;
  hasPersistedSizing: boolean;
} {
  if (!tableId) {
    return { columnSizing: {}, hasPersistedSizing: false };
  }

  const loaded = loadColumnSizing(tableId) ?? {};
  return {
    columnSizing: loaded,
    hasPersistedSizing: Object.keys(loaded).length > 0,
  };
}

export function usePersistedColumnSizing(tableId?: string) {
  const [initial] = useState(() => readInitialState(tableId));
  const [columnSizing, setColumnSizing] = useState(initial.columnSizing);
  const [hasPersistedSizing, setHasPersistedSizing] = useState(initial.hasPersistedSizing);

  const columnSizingRef = useRef(columnSizing);
  columnSizingRef.current = columnSizing;
  const hasPersistedSizingRef = useRef(hasPersistedSizing);
  hasPersistedSizingRef.current = hasPersistedSizing;
  const previousTableIdRef = useRef(tableId);

  useEffect(() => {
    if (previousTableIdRef.current === tableId) return;
    previousTableIdRef.current = tableId;

    const initial = readInitialState(tableId);
    columnSizingRef.current = initial.columnSizing;
    hasPersistedSizingRef.current = initial.hasPersistedSizing;
    setColumnSizing(initial.columnSizing);
    setHasPersistedSizing(initial.hasPersistedSizing);
  }, [tableId]);

  const onColumnSizingChange: OnChangeFn<ColumnSizingState> = useCallback((updaterOrValue) => {
    setColumnSizing((prev) => {
      const next = typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue;
      columnSizingRef.current = next;
      return next;
    });
  }, []);

  const seedColumnSizingFromPixels = useCallback(
    (pixelSizing: ColumnSizingState, replace = false) => {
      const nextSizing = replace ? pixelSizing : { ...columnSizingRef.current, ...pixelSizing };
      columnSizingRef.current = nextSizing;
      setColumnSizing(nextSizing);
    },
    []
  );

  const syncColumnSizingToColumns = useCallback(
    (columnIds: string[]) => {
      const prunedSizing = pruneColumnSizing(columnSizingRef.current, columnIds);
      if (prunedSizing === columnSizingRef.current) return;

      columnSizingRef.current = prunedSizing;
      setColumnSizing(prunedSizing);

      if (Object.keys(prunedSizing).length === 0 && hasPersistedSizingRef.current) {
        hasPersistedSizingRef.current = false;
        setHasPersistedSizing(false);
        if (tableId) {
          saveColumnSizing(tableId, {});
        }
        return;
      }

      if (tableId && hasPersistedSizingRef.current) {
        saveColumnSizing(tableId, prunedSizing);
      }
    },
    [tableId]
  );

  const persistColumnSizing = useCallback(
    (nextSizing: ColumnSizingState, columnIds?: string[]) => {
      if (!tableId) return;

      const sizing = columnIds ? pruneColumnSizing(nextSizing, columnIds) : nextSizing;
      const hasSizing = Object.keys(sizing).length > 0;

      columnSizingRef.current = sizing;
      setColumnSizing(sizing);
      hasPersistedSizingRef.current = hasSizing;
      setHasPersistedSizing(hasSizing);
      saveColumnSizing(tableId, sizing);
    },
    [tableId]
  );

  const resetColumnSizing = useCallback(() => {
    columnSizingRef.current = {};
    setColumnSizing({});
    setHasPersistedSizing(false);
    hasPersistedSizingRef.current = false;

    if (tableId) {
      saveColumnSizing(tableId, {});
    }
  }, [tableId]);

  return {
    columnSizing,
    hasPersistedSizing,
    onColumnSizingChange,
    persistColumnSizing,
    resetColumnSizing,
    syncColumnSizingToColumns,
    seedColumnSizingFromPixels,
  };
}
