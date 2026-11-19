import type { Row } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type RefObject, useCallback, useLayoutEffect, useRef, useState } from "react";

import { measureVirtualRowElement } from "../utils/measure-virtual-row-element";

export const FAST_TABLE_VIRTUAL_DEFAULT_OVERSCAN = 8;

export type FastTableVirtualScrollOptions = {
  useVirtualScroll?: boolean;
  overscan?: number;
  estimatedRowHeight?: number;
  estimatedExpandedRowHeight?: number;
  enableDynamicRowHeight?: boolean;
};

export type UseFastTableVirtualizationOptions<DataType> = {
  enabled: boolean;
  tableContainerRef: RefObject<HTMLElement | null>;
  rows: Array<Row<DataType>>;
  overscan?: number;
  estimatedRowHeight?: number;
  estimatedExpandedRowHeight?: number;
};

export function useFastTableVirtualization<DataType>({
  enabled,
  tableContainerRef,
  rows,
  overscan = FAST_TABLE_VIRTUAL_DEFAULT_OVERSCAN,
  estimatedRowHeight = 45,
  estimatedExpandedRowHeight = estimatedRowHeight * 20,
}: UseFastTableVirtualizationOptions<DataType>) {
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    if (!enabled) {
      setHeaderHeight(0);
      return;
    }

    const container = tableContainerRef.current;
    if (!container) return;

    const table = container.querySelector("table");
    if (!table) return;

    let resizeObserver: ResizeObserver | undefined;
    let observedThead: Element | undefined;

    const measureThead = (thead: Element) => {
      const height = thead.getBoundingClientRect().height;
      setHeaderHeight((prev) => (prev === height ? prev : height));
    };

    const bindThead = () => {
      const thead = table.querySelector("thead");
      if (!thead) return;
      // ResizeObserver owns size updates; MutationObserver only rebinds when <thead> is replaced.
      if (thead === observedThead) return;

      resizeObserver?.disconnect();
      observedThead = thead;
      measureThead(thead);
      resizeObserver = new ResizeObserver(() => measureThead(thead));
      resizeObserver.observe(thead);
    };

    bindThead();

    const mutationObserver = new MutationObserver(() => {
      bindThead();
    });
    mutationObserver.observe(table, { childList: true });

    return () => {
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
    };
  }, [enabled, tableContainerRef]);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const getScrollElement = useCallback(() => tableContainerRef.current, [tableContainerRef]);

  const getItemKey = useCallback((index: number) => rowsRef.current[index]?.id ?? index, []);

  const estimateSize = useCallback(
    (index: number) => {
      const row = rowsRef.current[index];
      return row?.getIsExpanded() ? estimatedExpandedRowHeight : estimatedRowHeight;
    },
    [estimatedExpandedRowHeight, estimatedRowHeight]
  );

  const rowVirtualizer = useVirtualizer({
    enabled: enabled && rows.length > 0,
    count: rows.length,
    getScrollElement,
    estimateSize,
    getItemKey,
    measureElement: measureVirtualRowElement,
    overscan,
    scrollMargin: headerHeight,
  });

  return {
    headerHeight,
    rowVirtualizer,
  };
}
