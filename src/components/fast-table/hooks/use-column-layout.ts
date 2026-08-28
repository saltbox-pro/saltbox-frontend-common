import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type ColumnLayout,
  EMPTY_COLUMN_LAYOUT,
  collectColumnLayoutIds,
  mergeColumnOrder,
  pruneColumnLayout,
  toColumnVisibility,
} from "../utils/column-layout";
import { loadColumnLayout, saveColumnLayout } from "../utils/persisted-column-layout";

function readInitialLayout(tableId?: string): ColumnLayout {
  if (!tableId) return EMPTY_COLUMN_LAYOUT;
  return loadColumnLayout(tableId) ?? EMPTY_COLUMN_LAYOUT;
}

export type UseColumnLayoutArgs<DataType> = {
  tableId?: string;
  columns: Array<ColumnDef<DataType, unknown>>;
};

export function useColumnLayout<DataType>({ tableId, columns }: UseColumnLayoutArgs<DataType>) {
  const [layout, setLayout] = useState(() => readInitialLayout(tableId));
  const previousTableIdRef = useRef(tableId);

  useEffect(() => {
    if (previousTableIdRef.current === tableId) return;
    previousTableIdRef.current = tableId;

    setLayout(readInitialLayout(tableId));
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
        saveColumnLayout(tableId, nextLayout);
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
