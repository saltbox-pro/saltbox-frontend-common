import { useCallback, useState } from "react";

import { type ColumnSettingsItem, moveItem } from "../utils/column-layout";

export function useColumnSettingsDraft(items: ColumnSettingsItem[]) {
  const [draft, setDraft] = useState(items);

  const toggleColumn = useCallback((columnId: string) => {
    setDraft((prev) =>
      prev.map((item) => (item.id === columnId ? { ...item, visible: !item.visible } : item))
    );
  }, []);

  const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
    setDraft((prev) => moveItem(prev, fromIndex, toIndex));
  }, []);

  return {
    draft,
    hasVisibleColumns: draft.some((item) => item.visible),
    toggleColumn,
    moveColumn,
  };
}
