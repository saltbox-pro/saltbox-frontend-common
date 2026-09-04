import type { Column, ColumnDef, VisibilityState } from "@tanstack/react-table";

import type { CellMeta } from "../types";

export type ColumnLayout = {
  order: string[];
  hidden: string[];
};

export type ColumnSettingsItem = {
  id: string;
  label: string;
  visible: boolean;
};

export const EMPTY_COLUMN_LAYOUT: ColumnLayout = { order: [], hidden: [] };

export function isEmptyColumnLayout(layout: ColumnLayout): boolean {
  return layout.order.length === 0 && layout.hidden.length === 0;
}

export function resolveColumnDefId<TData>(
  columnDef: ColumnDef<TData, unknown>
): string | undefined {
  if (typeof columnDef.id === "string") return columnDef.id;

  if ("accessorKey" in columnDef && typeof columnDef.accessorKey === "string") {
    return columnDef.accessorKey.replace(/\./g, "_");
  }

  return typeof columnDef.header === "string" ? columnDef.header : undefined;
}

export function collectColumnLayoutIds<TData>(columns: Array<ColumnDef<TData, unknown>>): {
  allColumnIds: string[];
  fixedColumnIds: string[];
} {
  const allColumnIds: string[] = [];
  const fixedColumnIds: string[] = [];

  const visit = (columnDefs: Array<ColumnDef<TData, unknown>>) => {
    for (const columnDef of columnDefs) {
      const children = "columns" in columnDef ? columnDef.columns : undefined;
      if (children?.length) {
        visit(children as Array<ColumnDef<TData, unknown>>);
        continue;
      }

      const id = resolveColumnDefId(columnDef);
      if (!id) continue;

      allColumnIds.push(id);
      if (columnDef.enableHiding === false) {
        fixedColumnIds.push(id);
      }
    }
  };

  visit(columns);

  return { allColumnIds, fixedColumnIds };
}

export function mergeColumnOrder(
  allColumnIds: string[],
  fixedColumnIds: Iterable<string>,
  savedOrder: string[]
): string[] {
  const fixed = new Set(fixedColumnIds);
  const movableIds = allColumnIds.filter((id) => !fixed.has(id));
  const movable = new Set(movableIds);

  const placed = new Set<string>();
  const queue: string[] = [];

  for (const id of savedOrder) {
    if (movable.has(id) && !placed.has(id)) {
      placed.add(id);
      queue.push(id);
    }
  }

  for (const id of movableIds) {
    if (!placed.has(id)) {
      queue.push(id);
    }
  }

  let queueIndex = 0;
  return allColumnIds.map((id) => (fixed.has(id) ? id : queue[queueIndex++]));
}

export function pruneColumnLayout(
  layout: ColumnLayout,
  allColumnIds: Iterable<string>
): ColumnLayout {
  const allowed = new Set(allColumnIds);
  const order = layout.order.filter((id) => allowed.has(id));
  const hidden = layout.hidden.filter((id) => allowed.has(id));

  if (order.length === layout.order.length && hidden.length === layout.hidden.length) {
    return layout;
  }

  return { order, hidden };
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return items;
  if (fromIndex < 0 || fromIndex >= items.length) return items;
  if (toIndex < 0 || toIndex >= items.length) return items;

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return next;
}

export function toColumnVisibility(hiddenColumnIds: string[]): VisibilityState {
  const visibility: VisibilityState = {};

  for (const id of hiddenColumnIds) {
    visibility[id] = false;
  }

  return visibility;
}

export function resolveColumnLabel<TData>(column: Column<TData, unknown>): string {
  const meta = column.columnDef.meta as CellMeta | undefined;
  if (meta?.columnTitle) return meta.columnTitle;

  const header = column.columnDef.header;
  return typeof header === "string" && header.length > 0 ? header : column.id;
}

export function buildColumnSettingsItems<TData>(
  leafColumns: Array<Column<TData, unknown>>
): ColumnSettingsItem[] {
  return leafColumns
    .filter((column) => column.getCanHide())
    .map((column) => ({
      id: column.id,
      label: resolveColumnLabel(column),
      visible: column.getIsVisible(),
    }));
}

export function buildColumnLayoutFromItems(items: ColumnSettingsItem[]): ColumnLayout {
  return {
    order: items.map((item) => item.id),
    hidden: items.filter((item) => !item.visible).map((item) => item.id),
  };
}

export type ColumnMoveDirection = "start" | "left" | "right" | "end";

function findVisibleIndex(
  items: ColumnSettingsItem[],
  startIndex: number,
  step: number
): number | undefined {
  for (let index = startIndex; index >= 0 && index < items.length; index += step) {
    if (items[index].visible) return index;
  }

  return undefined;
}

function resolveTargetIndex(
  items: ColumnSettingsItem[],
  fromIndex: number,
  direction: ColumnMoveDirection
): number | undefined {
  switch (direction) {
    case "start":
      return findVisibleIndex(items, 0, 1);
    case "end":
      return findVisibleIndex(items, items.length - 1, -1);
    case "left":
      return findVisibleIndex(items, fromIndex - 1, -1);
    case "right":
      return findVisibleIndex(items, fromIndex + 1, 1);
  }
}

export function resolveColumnMoveIndex(
  items: ColumnSettingsItem[],
  columnId: string,
  direction: ColumnMoveDirection
): number | undefined {
  const fromIndex = items.findIndex((item) => item.id === columnId);
  if (fromIndex === -1) return undefined;

  const toIndex = resolveTargetIndex(items, fromIndex, direction);
  if (toIndex === undefined || toIndex === fromIndex) return undefined;

  return toIndex;
}
