import { useLayoutEffect } from "react";

import { FastTableToolbarButtons } from "./fast-table-toolbar-buttons";
import { useFastTableToolbarModel, useFastTableToolbarStore } from "./fast-table-toolbar-context";

import "./fast-table-toolbar.css";

export function FastTableToolbar() {
  const store = useFastTableToolbarStore();
  const model = useFastTableToolbarModel();

  useLayoutEffect(() => {
    if (!store) {
      return;
    }
    store.setHasExternalToolbar(true);
    return () => store.setHasExternalToolbar(false);
  }, [store]);

  if (!store || !model) {
    return null;
  }

  return (
    <div className="fast-table-toolbar">
      <FastTableToolbarButtons {...model} />
    </div>
  );
}
