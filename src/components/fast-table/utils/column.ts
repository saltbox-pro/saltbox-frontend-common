import type { CSSProperties } from "react";

export function getColumnWidthStyle(
  width: number | string | undefined,
  metaExtras?: { minWidth?: number; maxWidth?: number }
): CSSProperties | undefined {
  const { minWidth: minWidthPx, maxWidth: maxWidthPx } = metaExtras ?? {};

  if (width === undefined && minWidthPx === undefined && maxWidthPx === undefined) return undefined;

  let style: CSSProperties;

  if (width !== undefined) {
    if (typeof width === "number") {
      style = { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` };
    } else {
      style = { width };
    }
  } else {
    style = {};
  }
  if (minWidthPx !== undefined) style.minWidth = `${minWidthPx}px`;
  if (maxWidthPx !== undefined) style.maxWidth = `${maxWidthPx}px`;

  return Object.keys(style).length ? style : undefined;
}
