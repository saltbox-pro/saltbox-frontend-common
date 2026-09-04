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

export type DeclaredColumnWidth = FillableColumn & {
  width: number | string | undefined;
  minWidth: number | undefined;
  maxWidth: number | undefined;
};

export type DeclaredFillWidth = {
  columnId: string;
  width: string;
};

function parsePercentWidth(width: string): number | undefined {
  const match = /^(\d+(?:\.\d+)?)%$/.exec(width.trim());
  return match ? Number(match[1]) : undefined;
}

export function resolveDeclaredFillWidth(
  columns: DeclaredColumnWidth[]
): DeclaredFillWidth | undefined {
  const hasFixedWidthColumn = columns.some(
    (column) => column.minWidth !== undefined && column.minWidth === column.maxWidth
  );
  if (!hasFixedWidthColumn) return undefined;
  if (columns.some((column) => column.width === undefined)) return undefined;

  const fillColumnId = resolveFillColumnId(columns);
  const fillColumn = columns.find((column) => column.id === fillColumnId);
  if (!fillColumn?.canResize) return undefined;

  let percent = 0;
  let pixels = 0;

  for (const column of columns) {
    if (column.id === fillColumnId) continue;

    if (typeof column.width === "number") {
      pixels += column.width;
      continue;
    }

    const parsed = typeof column.width === "string" ? parsePercentWidth(column.width) : undefined;
    if (parsed === undefined) return undefined;
    percent += parsed;
  }

  const fillPercent = 100 - percent;
  if (fillPercent <= 0) return undefined;

  return {
    columnId: fillColumn.id,
    width: pixels > 0 ? `calc(${fillPercent}% - ${pixels}px)` : `${fillPercent}%`,
  };
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

export function fitColumnSizingToContainer(
  sizing: ColumnSizingState,
  columnIds: string[],
  fillColumnId: string | undefined,
  containerWidth: number,
  getMinWidth: (columnId: string) => number
): { sizes: ColumnSizingState; totalWidth: number } {
  const filled = applyExplicitFillColumnWidths(
    sizing,
    columnIds,
    fillColumnId,
    containerWidth,
    getMinWidth
  );

  if (containerWidth <= 0 || filled.totalWidth <= containerWidth) {
    return filled;
  }

  const shrinkableById = new Map<string, number>();
  let totalShrinkable = 0;

  for (const id of columnIds) {
    const shrinkable = Math.max(0, (filled.sizes[id] ?? 0) - getMinWidth(id));
    shrinkableById.set(id, shrinkable);
    totalShrinkable += shrinkable;
  }

  if (totalShrinkable <= 0) {
    return filled;
  }

  const shrinkRatio = Math.min(1, (filled.totalWidth - containerWidth) / totalShrinkable);
  const sizes: ColumnSizingState = {};
  let totalWidth = 0;

  for (const id of columnIds) {
    const width = (filled.sizes[id] ?? 0) - (shrinkableById.get(id) ?? 0) * shrinkRatio;
    sizes[id] = width;
    totalWidth += width;
  }

  return { sizes, totalWidth };
}
