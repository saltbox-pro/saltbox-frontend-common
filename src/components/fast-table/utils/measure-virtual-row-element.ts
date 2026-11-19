import { FAST_TABLE_EXPANDED_ROW_CLASS_NAME } from "saltbox-common/constants/dom-selectors";

export function measureVirtualRowElement(
  element: Element,
  entry: ResizeObserverEntry | undefined
): number {
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
