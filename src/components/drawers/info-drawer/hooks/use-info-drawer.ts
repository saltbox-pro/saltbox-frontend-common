import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ANTD_OVERLAY_ROOT_SELECTORS } from "../../../../constants/dom-selectors";

export interface UseInfoDrawerOptions<TArg, TId extends string | number> {
  getId: (arg: TArg) => TId;
  drawerId?: string;
  initialOpenedId?: TId | null;
  onOpen?: (arg: TArg) => void | Promise<void>;
  onClose?: () => void;
  onClear?: () => void;
}

export function useInfoDrawer<
  TArg,
  TId extends string | number,
  TRef extends HTMLElement = HTMLElement,
>({ getId, drawerId, onOpen, onClose, onClear, initialOpenedId }: UseInfoDrawerOptions<TArg, TId>) {
  const mainContentRef = useRef<TRef | null>(null);

  const [openedId, setOpenedId] = useState<TId | null>(initialOpenedId ?? null);
  const [isOpened, setIsOpened] = useState(false);

  const activeRowId = useMemo(() => (isOpened ? openedId : null), [isOpened, openedId]);

  const open = useCallback(
    async (arg: TArg) => {
      const id = getId(arg);
      setOpenedId(id);
      setIsOpened(true);
      await onOpen?.(arg);
    },
    [getId, onOpen]
  );

  const close = useCallback(() => {
    setIsOpened(false);
    onClose?.();
  }, [onClose]);

  const clearData = useCallback(() => {
    setOpenedId(null);
    onClear?.();
  }, [onClear]);

  const toggle = useCallback(
    async (arg: TArg) => {
      const id = getId(arg);
      if (isOpened && openedId === id) {
        close();
        return;
      }
      await open(arg);
    },
    [close, getId, isOpened, open, openedId]
  );

  useEffect(() => {
    if (!isOpened) return;

    const handler = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (ANTD_OVERLAY_ROOT_SELECTORS.some((selector) => target.closest(selector) != null)) {
        return;
      }

      const mainContentEl = mainContentRef.current;
      const clickedInsideMainContent = !!mainContentEl && mainContentEl.contains(target);
      const clickedInsideDrawer = drawerId
        ? target.closest(`#sbx-drawer-${drawerId}`) != null
        : target.closest(".ant-drawer") != null;

      if (!clickedInsideMainContent && !clickedInsideDrawer) {
        close();
      }
    };

    document.addEventListener("pointerdown", handler, { capture: true });

    return () => {
      document.removeEventListener("pointerdown", handler, { capture: true });
    };
  }, [close, drawerId, isOpened]);

  return useMemo(
    () => ({
      mainContentRef,
      openedId,
      isOpened,
      activeRowId,
      open,
      close,
      toggle,
      clearData,
    }),
    [activeRowId, clearData, close, isOpened, open, openedId, toggle]
  );
}
