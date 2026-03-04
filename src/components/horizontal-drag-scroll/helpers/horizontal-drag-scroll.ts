import { DRAG_THRESHOLD_PX } from "../constants/config";
import type { PendingDragState } from "../types/drag-state";

export function getScrollButtonsState(element: HTMLElement) {
  const maxScrollLeft = element.scrollWidth - element.clientWidth;

  const canScrollLeft = element.scrollLeft > 0;
  const canScrollRight = element.scrollLeft < maxScrollLeft - 1;

  return { canScrollLeft, canScrollRight };
}

export function isInteractiveElement(target: HTMLElement | null): boolean {
  if (!target) return false;

  return Boolean(
    target.closest("button, a, input, textarea, select, [role='button'], [role='link']")
  );
}

export function createPendingDragState(
  pointerId: number,
  clientX: number,
  clientY: number,
  scrollLeft: number
): PendingDragState {
  return { pointerId, startX: clientX, startY: clientY, scrollLeft };
}

export function hasExceededDragThreshold(
  pending: PendingDragState,
  clientX: number,
  clientY: number
): boolean {
  const deltaX = Math.abs(clientX - pending.startX);
  const deltaY = Math.abs(clientY - pending.startY);
  return deltaX > DRAG_THRESHOLD_PX || deltaY > DRAG_THRESHOLD_PX;
}

export function applyDragScroll(
  element: HTMLElement,
  startX: number,
  scrollLeft: number,
  currentX: number
): void {
  const deltaX = currentX - startX;
  element.scrollLeft = scrollLeft - deltaX;
}

export function getScrollStepValue(scrollStep: number | undefined, element: HTMLElement): number {
  return scrollStep ?? element.clientWidth ?? 200;
}

export function releasePointerCaptureSafe(element: HTMLElement, pointerId: number): void {
  try {
    element.releasePointerCapture(pointerId);
  } catch {
    // ignore if pointer capture already released
  }
}
