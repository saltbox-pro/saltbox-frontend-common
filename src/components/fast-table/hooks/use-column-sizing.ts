import type { ColumnSizingState, OnChangeFn } from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ensureUserSettingsLoaded,
  subscribeUserSettings,
} from "saltbox-common/store/user-settings-store";

import { getTableSettings, updateTableSettings } from "../model/table-settings";
import { pruneColumnSizing } from "../utils/column-sizing";

function readStoredState(tableId?: string): {
  columnSizing: ColumnSizingState;
  hasPersistedSizing: boolean;
} {
  const stored = getTableSettings(tableId).columnSizing ?? {};

  return {
    columnSizing: stored,
    hasPersistedSizing: Object.keys(stored).length > 0,
  };
}

export function useColumnSizing(tableId?: string) {
  const [initial] = useState(() => readStoredState(tableId));
  const [columnSizing, setColumnSizing] = useState(initial.columnSizing);
  const [hasPersistedSizing, setHasPersistedSizing] = useState(initial.hasPersistedSizing);

  const columnSizingRef = useRef(columnSizing);
  columnSizingRef.current = columnSizing;
  const hasPersistedSizingRef = useRef(hasPersistedSizing);
  hasPersistedSizingRef.current = hasPersistedSizing;
  const previousTableIdRef = useRef(tableId);
  const hasUnflushedLocalSizingRef = useRef(false);

  const applyStoredState = useCallback((tableIdToRead?: string) => {
    const stored = readStoredState(tableIdToRead);
    columnSizingRef.current = stored.columnSizing;
    hasPersistedSizingRef.current = stored.hasPersistedSizing;
    setColumnSizing(stored.columnSizing);
    setHasPersistedSizing(stored.hasPersistedSizing);
  }, []);

  const persistSizing = useCallback(
    (sizing: ColumnSizingState) => {
      if (!tableId) return;

      hasUnflushedLocalSizingRef.current = false;
      updateTableSettings(tableId, { columnSizing: sizing });
    },
    [tableId]
  );

  useEffect(() => {
    if (previousTableIdRef.current === tableId) return;
    previousTableIdRef.current = tableId;
    hasUnflushedLocalSizingRef.current = false;

    applyStoredState(tableId);
  }, [applyStoredState, tableId]);

  useEffect(() => {
    if (!tableId) return;

    const syncFromStore = () => {
      if (hasUnflushedLocalSizingRef.current) return;
      applyStoredState(tableId);
    };

    const unsubscribe = subscribeUserSettings(syncFromStore);
    ensureUserSettingsLoaded();
    syncFromStore();

    return unsubscribe;
  }, [applyStoredState, tableId]);

  const onColumnSizingChange: OnChangeFn<ColumnSizingState> = useCallback((updaterOrValue) => {
    setColumnSizing((prev) => {
      const next = typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue;
      columnSizingRef.current = next;
      hasUnflushedLocalSizingRef.current = true;
      return next;
    });
  }, []);

  const seedColumnSizingFromPixels = useCallback(
    (pixelSizing: ColumnSizingState, replace = false) => {
      const nextSizing = replace ? pixelSizing : { ...columnSizingRef.current, ...pixelSizing };
      columnSizingRef.current = nextSizing;
      hasUnflushedLocalSizingRef.current = true;
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
        persistSizing({});
        return;
      }

      if (hasPersistedSizingRef.current) {
        persistSizing(prunedSizing);
      }
    },
    [persistSizing]
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
      persistSizing(sizing);
    },
    [persistSizing, tableId]
  );

  const resetColumnSizing = useCallback(() => {
    columnSizingRef.current = {};
    setColumnSizing({});
    setHasPersistedSizing(false);
    hasPersistedSizingRef.current = false;

    persistSizing({});
  }, [persistSizing]);

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
