import type { Row } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { type RefObject, useCallback, useLayoutEffect, useRef, useState } from "react";

import { FAST_TABLE_EXPANDED_ROW_CLASS_NAME } from "saltbox-common/constants/dom-selectors";

export const FAST_TABLE_VIRTUAL_DEFAULT_OVERSCAN = 8;

export type FastTableVirtualScrollOptions = {
  useVirtualScroll?: boolean;
  overscan?: number;
  estimatedRowHeight?: number;
  estimatedExpandedRowHeight?: number;
  enableDynamicRowHeight?: boolean;
};

// An expanded row renders as a sibling <tr>, so it counts towards the main row's size.
function measureRowElement(element: Element, entry: ResizeObserverEntry | undefined) {
  const mainHeight =
    entry?.target === element && entry.borderBoxSize?.[0]
      ? entry.borderBoxSize[0].blockSize
      : element.getBoundingClientRect().height;

  const next = element.nextElementSibling;
  const expandedHeight = next?.classList.contains(FAST_TABLE_EXPANDED_ROW_CLASS_NAME)
    ? next.getBoundingClientRect().height
    : 0;

  return Math.round(mainHeight + expandedHeight);
}

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
    if (!enabled) return;

    const thead = tableContainerRef.current?.querySelector("thead");
    if (!thead) return;

    const measure = () => {
      const height = thead.getBoundingClientRect().height;
      setHeaderHeight((prev) => (prev === height ? prev : height));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(thead);

    return () => observer.disconnect();
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
    measureElement: measureRowElement,
    overscan,
    scrollMargin: headerHeight,
  });

  return {
    headerHeight,
    rowVirtualizer,
  };
}
