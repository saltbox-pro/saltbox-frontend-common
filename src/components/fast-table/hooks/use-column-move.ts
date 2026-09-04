import {
  type ColumnLayout,
  type ColumnMoveDirection,
  type ColumnSettingsItem,
  buildColumnLayoutFromItems,
  moveItem,
  resolveColumnMoveIndex,
} from "../utils/column-layout";

export type UseColumnMoveArgs = {
  items: ColumnSettingsItem[];
  onApply: (layout: ColumnLayout) => void;
};

export function useColumnMove({ items, onApply }: UseColumnMoveArgs) {
  const canMoveColumn = (columnId: string, direction: ColumnMoveDirection) =>
    resolveColumnMoveIndex(items, columnId, direction) !== undefined;

  const moveColumn = (columnId: string, direction: ColumnMoveDirection) => {
    const toIndex = resolveColumnMoveIndex(items, columnId, direction);
    if (toIndex === undefined) return;

    const fromIndex = items.findIndex((item) => item.id === columnId);
    onApply(buildColumnLayoutFromItems(moveItem(items, fromIndex, toIndex)));
  };

  return { canMoveColumn, moveColumn };
}
