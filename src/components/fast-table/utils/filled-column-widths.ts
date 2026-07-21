import type { ColumnSizingState } from "@tanstack/react-table";

export type FillableColumn = {
  id: string;
  canResize: boolean;
};

export function resolveFillColumnId(columns: FillableColumn[]): string | undefined {
  for (let index = columns.length - 1; index >= 0; index -= 1) {
    if (columns[index].canResize) {
      return columns[index].id;
    }
  }
  return columns[columns.length - 1]?.id;
}

export function applyExplicitFillColumnWidths(
  sizing: ColumnSizingState,
  columnIds: string[],
  fillColumnId: string | undefined,
  containerWidth: number,
  getMinWidth: (columnId: string) => number
): { sizes: ColumnSizingState; totalWidth: number } {
  const sizes: ColumnSizingState = {};
  let totalWidth = 0;

  for (const id of columnIds) {
    const width = sizing[id] ?? 0;
    sizes[id] = width;
    totalWidth += width;
  }

  if (!fillColumnId || containerWidth <= 0 || totalWidth <= 0) {
    return { sizes, totalWidth };
  }

  if (totalWidth >= containerWidth) {
    return { sizes, totalWidth };
  }

  const fillCurrent = sizes[fillColumnId] ?? 0;
  const sumOthers = totalWidth - fillCurrent;
  const minWidth = getMinWidth(fillColumnId);
  const filledWidth = Math.max(minWidth, containerWidth - sumOthers);
  sizes[fillColumnId] = filledWidth;

  return { sizes, totalWidth: sumOthers + filledWidth };
}
