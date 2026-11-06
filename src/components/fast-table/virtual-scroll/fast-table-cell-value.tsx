import { flexRender, type Cell } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { EmptyValueText } from "saltbox-common/components/text/empty-value-text";
import { isEmptyDisplayValue } from "saltbox-common/utils/is-empty-display-value";

import type { CellMeta } from "../types";

type CellRender<DataType> = Cell<DataType, unknown>["column"]["columnDef"]["cell"];

function isPlainRenderFunction<DataType>(
  render: CellRender<DataType>
): render is (context: ReturnType<Cell<DataType, unknown>["getContext"]>) => ReactNode {
  return typeof render === "function" && !render.prototype?.isReactComponent;
}

export function FastTableCellValue<DataType>({ cell }: { cell: Cell<DataType, unknown> }) {
  const render = cell.column.columnDef.cell;
  const context = cell.getContext();

  if (!isPlainRenderFunction(render)) {
    return flexRender(render, context);
  }

  const content = render(context);
  if (!isEmptyDisplayValue(content)) {
    return content;
  }

  const meta = cell.column.columnDef.meta as CellMeta<DataType> | undefined;
  return meta?.emptyValue ?? <EmptyValueText />;
}
