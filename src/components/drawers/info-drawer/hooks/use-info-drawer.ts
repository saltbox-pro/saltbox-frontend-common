import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  ANTD_OVERLAY_ROOT_SELECTORS,
  FAST_TABLE_VIRTUAL_BODY_SELECTOR,
} from "../../../../constants/dom-selectors";

export interface UseInfoDrawerOptions<TArg, TId extends string | number> {
  getId: (arg: TArg) => TId;
  drawerId?: string;
  initialOpenedId?: TId | null;
  initialOpenedArg?: TArg | null;
  outsideClickIgnoreSelectors?: string[];
  onOpen?: (arg: TArg) => void | Promise<void>;
  onClose?: () => void;
  onBeforeClose?: () => boolean | Promise<boolean>;
}

export function useInfoDrawer<
  TArg,
  TId extends string | number,
  TRef extends HTMLElement = HTMLElement,
>({
  getId,
  drawerId,
  onOpen,
  onClose,
  onBeforeClose,
  initialOpenedId,
  initialOpenedArg,
  outsideClickIgnoreSelectors,
}: UseInfoDrawerOptions<TArg, TId>) {
  const mainContentRef = useRef<TRef | null>(null);
  const onBeforeCloseRef = useRef(onBeforeClose);
  onBeforeCloseRef.current = onBeforeClose;

  const [openedId, setOpenedId] = useState<TId | null>(initialOpenedId ?? null);
  const [openedArg, setOpenedArg] = useState<TArg | null>(initialOpenedArg ?? null);
  const [isOpened, setIsOpened] = useState(false);

  const activeRowId = useMemo(() => (isOpened ? openedId : null), [isOpened, openedId]);

  const open = useCallback(
    async (arg: TArg) => {
      const id = getId(arg);
      setOpenedId(id);
      setOpenedArg(arg);
      setIsOpened(true);
      await onOpen?.(arg);
    },
    [getId, onOpen]
  );

  const close = useCallback(async () => {
    const allow = (await onBeforeCloseRef.current?.()) ?? true;
    if (!allow) {
      return;
    }

    setIsOpened(false);
    setOpenedId(null);
    setOpenedArg(null);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(
    async (arg: TArg) => {
      const id = getId(arg);
      if (isOpened && openedId === id) {
        await close();
        return;
      }

      if (isOpened && openedId !== id) {
        const allow = (await onBeforeCloseRef.current?.()) ?? true;
        if (!allow) {
          return;
        }
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

      if (outsideClickIgnoreSelectors?.some((selector) => target.closest(selector) != null)) {
        return;
      }

      const mainContentEl = mainContentRef.current;
      const clickedInsideMainContent = !!mainContentEl && mainContentEl.contains(target);
      const clickedInsideVirtualTable =
        mainContentEl
          ?.closest(".fast-table")
          ?.querySelector(FAST_TABLE_VIRTUAL_BODY_SELECTOR)
          ?.contains(target) ?? false;
      const clickedInsideDrawer = drawerId
        ? target.closest(`#sbx-drawer-${drawerId}`) != null
        : target.closest(".ant-drawer") != null;

      if (!clickedInsideMainContent && !clickedInsideVirtualTable && !clickedInsideDrawer) {
        close();
      }
    };

    document.addEventListener("pointerdown", handler, { capture: true });

    return () => {
      document.removeEventListener("pointerdown", handler, { capture: true });
    };
  }, [close, drawerId, isOpened, outsideClickIgnoreSelectors]);

  return useMemo(
    () => ({
      mainContentRef,
      openedId,
      openedArg,
      isOpened,
      activeRowId,
      open,
      close,
      toggle,
    }),
    [activeRowId, close, isOpened, open, openedArg, openedId, toggle]
  );
}
