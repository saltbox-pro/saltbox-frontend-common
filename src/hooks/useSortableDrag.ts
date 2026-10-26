import { type DragEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";

export type SortableDropSide = "before" | "after";

export type SortableHandleProps = {
  ref: (node: HTMLElement | null) => void;
  role: "button";
  tabIndex: number;
  draggable: boolean;
  "aria-disabled": boolean;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

export type SortableDropProps = {
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
};

export type SortableItemProps = {
  isEnabled: boolean;
  isDragging: boolean;
  dropSide: SortableDropSide | null;
  handleProps: SortableHandleProps;
  dropProps: SortableDropProps;
};

const KEYBOARD_MOVE_OFFSETS: Partial<Record<string, number>> = {
  ArrowUp: -1,
  ArrowDown: 1,
};

export function useSortableDrag(
  keys: readonly string[],
  onMove: (fromIndex: number, toIndex: number) => void
) {
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const handleNodes = useRef(new Map<string, HTMLElement>());
  const focusAfterMoveKey = useRef<string | null>(null);
  const isEnabled = keys.length > 1;

  useEffect(() => {
    const key = focusAfterMoveKey.current;
    if (!key) return;

    focusAfterMoveKey.current = null;
    handleNodes.current.get(key)?.focus();
  });

  const reset = () => {
    setDraggedKey(null);
    setOverKey(null);
  };

  const getDropSide = (key: string): SortableDropSide | null => {
    if (!draggedKey || draggedKey === key || overKey !== key) return null;

    return keys.indexOf(draggedKey) < keys.indexOf(key) ? "after" : "before";
  };

  const moveByKeyboard = (event: KeyboardEvent<HTMLElement>, key: string) => {
    const offset = event.altKey ? KEYBOARD_MOVE_OFFSETS[event.key] : undefined;
    if (!isEnabled || !offset) return;

    const fromIndex = keys.indexOf(key);
    const toIndex = fromIndex + offset;
    if (toIndex < 0 || toIndex >= keys.length) return;

    event.preventDefault();
    event.stopPropagation();
    focusAfterMoveKey.current = key;
    onMove(fromIndex, toIndex);
  };

  const getHandleProps = (key: string): SortableHandleProps => ({
    ref: (node) => {
      if (node) {
        handleNodes.current.set(key, node);
      } else {
        handleNodes.current.delete(key);
      }
    },
    role: "button",
    tabIndex: isEnabled ? 0 : -1,
    draggable: isEnabled,
    "aria-disabled": !isEnabled,
    onDragStart: (event) => {
      if (!isEnabled) return;
      event.stopPropagation();
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", key);
      setDraggedKey(key);
    },
    onDragEnd: reset,
    onKeyDown: (event) => moveByKeyboard(event, key),
  });

  const getDropProps = (key: string): SortableDropProps => ({
    onDragOver: (event) => {
      if (!draggedKey) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "move";
      setOverKey((current) => (current === key ? current : key));
    },
    onDrop: (event) => {
      if (!draggedKey) return;
      event.preventDefault();
      event.stopPropagation();

      if (draggedKey !== key) {
        onMove(keys.indexOf(draggedKey), keys.indexOf(key));
      }
      reset();
    },
  });

  const getSortableProps = (key: string): SortableItemProps => ({
    isEnabled,
    isDragging: draggedKey === key,
    dropSide: getDropSide(key),
    handleProps: getHandleProps(key),
    dropProps: getDropProps(key),
  });

  return { getSortableProps };
}
