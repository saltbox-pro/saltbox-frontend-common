import { type DragEvent, useCallback, useRef, useState } from "react";

function isPastHoverMiddle(
  event: DragEvent<HTMLElement>,
  fromIndex: number,
  hoverIndex: number
): boolean {
  const rect = event.currentTarget.getBoundingClientRect();
  const hoverMiddleY = rect.top + rect.height / 2;

  return fromIndex < hoverIndex ? event.clientY > hoverMiddleY : event.clientY < hoverMiddleY;
}

export function useColumnSettingsDrag(onMove: (fromIndex: number, toIndex: number) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [handleIndex, setHandleIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  const updateIndex = useCallback((index: number | null) => {
    dragIndexRef.current = index;
    setDragIndex(index);
    setHandleIndex(index);
  }, []);

  const stopDrag = useCallback(() => {
    dragIndexRef.current = null;
    setDragIndex(null);
    setHandleIndex(null);
  }, []);

  const getRowProps = useCallback(
    (index: number) => ({
      draggable: handleIndex === index,
      onDragStart: (event: DragEvent<HTMLElement>) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
        updateIndex(index);
      },
      onDragOver: (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";

        const fromIndex = dragIndexRef.current;
        if (fromIndex === null || fromIndex === index) return;
        if (!isPastHoverMiddle(event, fromIndex, index)) return;

        onMove(fromIndex, index);
        updateIndex(index);
      },
      onDrop: (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        stopDrag();
      },
      onDragEnd: stopDrag,
    }),
    [handleIndex, onMove, stopDrag, updateIndex]
  );

  const getHandleProps = useCallback(
    (index: number) => ({
      onMouseDown: () => setHandleIndex(index),
      onMouseUp: () => setHandleIndex(null),
    }),
    []
  );

  return { dragIndex, getRowProps, getHandleProps };
}
