import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ensureUserSettingsLoaded,
  subscribeUserSettings,
} from "saltbox-common/store/user-settings-store";

import { getTableSettings, updateTableSettings } from "../model/table-settings";
import {
  type ColumnLayout,
  EMPTY_COLUMN_LAYOUT,
  collectColumnLayoutIds,
  mergeColumnOrder,
  pruneColumnLayout,
  toColumnVisibility,
} from "../utils/column-layout";

function readStoredLayout(tableId?: string): ColumnLayout {
  return getTableSettings(tableId).columnLayout ?? EMPTY_COLUMN_LAYOUT;
}

export type UseColumnLayoutArgs<DataType> = {
  tableId?: string;
  columns: Array<ColumnDef<DataType, unknown>>;
};

export function useColumnLayout<DataType>({ tableId, columns }: UseColumnLayoutArgs<DataType>) {
  const [layout, setLayout] = useState(() => readStoredLayout(tableId));
  const previousTableIdRef = useRef(tableId);

  useEffect(() => {
    if (previousTableIdRef.current === tableId) return;
    previousTableIdRef.current = tableId;

    setLayout(readStoredLayout(tableId));
  }, [tableId]);

  useEffect(() => {
    if (!tableId) return;

    const syncFromStore = () => {
      setLayout(readStoredLayout(tableId));
    };

    const unsubscribe = subscribeUserSettings(syncFromStore);
    ensureUserSettingsLoaded();
    syncFromStore();

    return unsubscribe;
  }, [tableId]);

  const { allColumnIds, fixedColumnIds } = useMemo(
    () => collectColumnLayoutIds(columns),
    [columns]
  );

  const currentLayout = useMemo(
    () => pruneColumnLayout(layout, allColumnIds),
    [allColumnIds, layout]
  );

  const columnOrder = useMemo(
    () => mergeColumnOrder(allColumnIds, fixedColumnIds, currentLayout.order),
    [allColumnIds, currentLayout.order, fixedColumnIds]
  );

  const columnVisibility = useMemo(
    () => toColumnVisibility(currentLayout.hidden),
    [currentLayout.hidden]
  );

  const applyColumnLayout = useCallback(
    (nextLayout: ColumnLayout) => {
      setLayout(nextLayout);

      if (tableId) {
        updateTableSettings(tableId, { columnLayout: nextLayout });
      }
    },
    [tableId]
  );

  return {
    columnOrder,
    columnVisibility,
    applyColumnLayout,
  };
}
