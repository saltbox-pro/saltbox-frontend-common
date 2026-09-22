import { useLayoutEffect, useRef } from "react";

import { useFastTableToolbarStore, useHasExternalToolbar } from "./fast-table-toolbar-context";
import type { FastTableToolbarModel, FastTableToolbarOwner } from "./fast-table-toolbar-store";

export function usePublishFastTableToolbar(
  enabled: boolean,
  model: FastTableToolbarModel
): boolean {
  const store = useFastTableToolbarStore();
  const hasExternalToolbar = useHasExternalToolbar();
  const ownerRef = useRef<FastTableToolbarOwner>(Symbol("fast-table-toolbar"));
  const owner = ownerRef.current;

  useLayoutEffect(() => {
    if (!store || !enabled) {
      return;
    }
    store.publishModel(owner, model);
  }, [store, enabled, model, owner]);

  useLayoutEffect(() => {
    if (!store || !enabled) {
      return;
    }
    return () => store.clearModel(owner);
  }, [store, enabled, owner]);

  return enabled && !hasExternalToolbar;
}
