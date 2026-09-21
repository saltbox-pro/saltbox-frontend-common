import { FastTableToolbarButtons } from "./fast-table-toolbar-buttons";
import type { FastTableToolbarModel } from "./fast-table-toolbar-store";

import "./fast-table-toolbar.css";

export function FastTableInlineToolbar({ model }: { model: FastTableToolbarModel }) {
  return (
    <div className="fast-table-toolbar-inline">
      <FastTableToolbarButtons {...model} />
    </div>
  );
}
