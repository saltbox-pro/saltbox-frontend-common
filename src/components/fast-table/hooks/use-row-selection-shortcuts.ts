import type { Table } from "@tanstack/react-table";
import { type RefObject, useCallback, useEffect, useRef } from "react";

import { ROW_INTERACTIVE_SELECTORS } from "saltbox-common/constants/dom-selectors";

import { isSelectionShortcutBlocked } from "../utils/is-selection-shortcut-blocked";
import type { FastTableRowModifierClickHandler } from "../virtual-scroll/fast-table-virtual-body";

export function useRowSelectionShortcuts<DataType>({
  enabled,
  containerRef,
}: {
  enabled: boolean;
  containerRef: RefObject<HTMLElement | null>;
}) {
  const tableRef = useRef<Table<DataType> | null>(null);
  const isTableActiveRef = useRef(false);

  const handleRowModifierClick = useCallback<FastTableRowModifierClickHandler<DataType>>(
    (row, event) => {
      if (!event.ctrlKey && !event.metaKey) {
        return false;
      }
      if (row.getCanSelect()) {
        row.toggleSelected();
      }
      return true;
    },
    []
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const isInsideTable = (target: EventTarget | null) =>
      target instanceof Node && (containerRef.current?.contains(target) ?? false);

    const handlePointerDown = (event: PointerEvent) => {
      isTableActiveRef.current = isInsideTable(event.target);
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.target instanceof Element &&
        isInsideTable(event.target) &&
        event.target.closest(ROW_INTERACTIVE_SELECTORS) == null
      ) {
        event.preventDefault();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const table = tableRef.current;
      if (
        event.key !== "Escape" ||
        table == null ||
        !isTableActiveRef.current ||
        event.defaultPrevented ||
        isSelectionShortcutBlocked(event.target)
      ) {
        return;
      }
      if (Object.keys(table.getState().rowSelection).length > 0) {
        table.setRowSelection({});
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, enabled]);

  return {
    tableRef,
    onRowModifierClick: enabled ? handleRowModifierClick : undefined,
  };
}
