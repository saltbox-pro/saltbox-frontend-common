import {
  type PointerEvent,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { DRAG_UPDATE_THROTTLE_MS } from "../constants/config";
import {
  applyDragScroll,
  createPendingDragState,
  getScrollButtonsState,
  getScrollStepValue,
  hasExceededDragThreshold,
  isInteractiveElement,
  releasePointerCaptureSafe,
} from "../helpers/horizontal-drag-scroll";
import type { PendingDragState } from "../types/drag-state";

interface DragState {
  isDragging: boolean;
  startX: number;
  scrollLeft: number;
}

interface UseHorizontalDragScrollOptions {
  scrollStep?: number;
}

interface UseHorizontalDragScrollResult {
  containerRef: RefObject<HTMLDivElement>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  isDragging: boolean;
  handlePointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  handlePointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  stopDragging: (event: PointerEvent<HTMLDivElement>) => void;
  handleScroll: () => void;
  scrollByStep: (direction: "left" | "right") => void;
}

export function useHorizontalDragScroll(
  options: UseHorizontalDragScrollOptions = {}
): UseHorizontalDragScrollResult {
  const { scrollStep } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isPointerMovingRef = useRef(false);
  const lastPointerEventRef = useRef<PointerEvent<HTMLDivElement> | null>(null);
  const pendingDragRef = useRef<PendingDragState | null>(null);
  const lastDragUpdateRef = useRef(0);

  const updateScrollButtonsVisibility = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;

    if (element.clientWidth === 0 || element.offsetParent === null) {
      return;
    }

    const { canScrollLeft: left, canScrollRight: right } = getScrollButtonsState(element);

    setCanScrollLeft(left);
    setCanScrollRight(right);
  }, []);

  const throttledUpdateScrollButtonsVisibility = useCallback(() => {
    const now = Date.now();
    if (now - lastDragUpdateRef.current < DRAG_UPDATE_THROTTLE_MS) return;
    lastDragUpdateRef.current = now;
    updateScrollButtonsVisibility();
  }, [updateScrollButtonsVisibility]);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const resizeObserver = new ResizeObserver(updateScrollButtonsVisibility);

    resizeObserver.observe(element);
    updateScrollButtonsVisibility();

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateScrollButtonsVisibility]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const element = containerRef.current;
    if (!element) return;

    const { canScrollLeft: left, canScrollRight: right } = getScrollButtonsState(element);
    if (!left && !right) return;

    const target = event.target as HTMLElement | null;
    const isInteractive = isInteractiveElement(target);

    if (isInteractive) {
      pendingDragRef.current = createPendingDragState(
        event.pointerId,
        event.clientX,
        event.clientY,
        element.scrollLeft
      );
      return;
    }

    event.preventDefault();
    element.setPointerCapture(event.pointerId);

    setDragState({
      isDragging: true,
      startX: event.clientX,
      scrollLeft: element.scrollLeft,
    });
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const element = containerRef.current;
      const pending = pendingDragRef.current;

      if (pending && element && event.pointerId === pending.pointerId) {
        if (hasExceededDragThreshold(pending, event.clientX, event.clientY)) {
          const { canScrollLeft: left, canScrollRight: right } = getScrollButtonsState(element);
          if (!left && !right) {
            pendingDragRef.current = null;
            return;
          }
          event.preventDefault();
          element.setPointerCapture(event.pointerId);
          pendingDragRef.current = null;

          setDragState({
            isDragging: true,
            startX: event.clientX,
            scrollLeft: element.scrollLeft,
          });
          return;
        }
      }

      if (!dragState.isDragging) return;

      lastPointerEventRef.current = event;

      if (isPointerMovingRef.current) return;

      isPointerMovingRef.current = true;

      requestAnimationFrame(() => {
        isPointerMovingRef.current = false;

        const el = containerRef.current;
        const lastEvent = lastPointerEventRef.current;

        if (!el || !lastEvent || !dragState.isDragging) return;

        applyDragScroll(el, dragState.startX, dragState.scrollLeft, lastEvent.clientX);
        throttledUpdateScrollButtonsVisibility();
      });
    },
    [
      dragState.isDragging,
      dragState.scrollLeft,
      dragState.startX,
      throttledUpdateScrollButtonsVisibility,
    ]
  );

  const stopDragging = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      pendingDragRef.current = null;

      if (!dragState.isDragging) return;

      const element = containerRef.current;
      if (element) releasePointerCaptureSafe(element, event.pointerId);

      setDragState((prev) => ({
        ...prev,
        isDragging: false,
      }));
      updateScrollButtonsVisibility();
    },
    [dragState.isDragging, updateScrollButtonsVisibility]
  );

  const scrollByStep = useCallback(
    (direction: "left" | "right") => {
      const element = containerRef.current;
      if (!element) return;

      const { canScrollLeft, canScrollRight } = getScrollButtonsState(element);
      if (!canScrollLeft && !canScrollRight) return;
      if (direction === "left" && !canScrollLeft) return;
      if (direction === "right" && !canScrollRight) return;

      const step = getScrollStepValue(scrollStep, element);
      const delta = direction === "left" ? -step : step;

      element.scrollBy({ left: delta, behavior: "smooth" });
    },
    [scrollStep]
  );

  return {
    containerRef,
    canScrollLeft,
    canScrollRight,
    isDragging: dragState.isDragging,
    handlePointerDown,
    handlePointerMove,
    stopDragging,
    handleScroll: updateScrollButtonsVisibility,
    scrollByStep,
  };
}
