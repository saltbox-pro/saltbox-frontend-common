import { useLayoutEffect } from "react";

import { useFastTableToolbarStore, useHasExternalToolbar } from "./fast-table-toolbar-context";
import type { FastTableToolbarModel } from "./fast-table-toolbar-store";

export function usePublishFastTableToolbar(
  enabled: boolean,
  model: FastTableToolbarModel
): boolean {
  const store = useFastTableToolbarStore();
  const hasExternalToolbar = useHasExternalToolbar();

  useLayoutEffect(() => {
    if (!store) {
      return;
    }
    store.setModel(enabled ? model : null);
  });

  useLayoutEffect(() => {
    if (!store) {
      return;
    }
    return () => store.setModel(null);
  }, [store]);

  return enabled && !hasExternalToolbar;
}
