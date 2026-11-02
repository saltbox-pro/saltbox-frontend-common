import type { Table } from "@tanstack/react-table";
import { useRef } from "react";

/**
 * Returns an object that changes whenever anything a row may render from changes,
 * except column widths: row objects keep their identity on selection, visibility or
 * column definition changes, so memoized rows need this token to re-render.
 */
export function useRowRenderToken<DataType>(table: Table<DataType>): object {
  const {
    columnSizing: _columnSizing,
    columnSizingInfo: _columnSizingInfo,
    ...state
  } = table.getState();
  const deps = [table.options.columns, table.options.meta, ...Object.values(state)];

  const cacheRef = useRef({ deps, token: {} });
  const prevDeps = cacheRef.current.deps;
  if (
    deps.length !== prevDeps.length ||
    deps.some((dep, index) => !Object.is(dep, prevDeps[index]))
  ) {
    cacheRef.current = { deps, token: {} };
  }

  return cacheRef.current.token;
}
