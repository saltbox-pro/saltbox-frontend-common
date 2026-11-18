import { useCallback, useState, useSyncExternalStore } from "react";

import { subscribeUserSettings } from "saltbox-common/store/user-settings-store";

import {
  getDrawerMaxWidthPx,
  getDrawerWidthPx,
  setDrawerWidthPx,
} from "../settings/drawer-width-settings";
import type { DrawerPlacement, HorizontalDrawerPlacement } from "../types";

interface UseDrawerResizeOptions {
  drawerId: string;
  width: number | string;
  placement: DrawerPlacement;
  enabled: boolean;
  minWidth: number;
}

type UseDrawerResizeResult = {
  drawerWidth: number | string;
  splitterPlacement: HorizontalDrawerPlacement | null;
  handleResize: (nextWidth: number) => void;
  handleCommit: (nextWidth: number) => void;
};

const subscribeDisabled = () => () => {};

export function useDrawerResize({
  drawerId,
  width,
  placement,
  enabled,
  minWidth,
}: UseDrawerResizeOptions): UseDrawerResizeResult {
  const splitterPlacement =
    enabled && (placement === "left" || placement === "right") ? placement : null;
  const resizeEnabled = splitterPlacement !== null;
  const [draggedWidth, setDraggedWidth] = useState<number | null>(null);

  const storedWidthPx = useSyncExternalStore(
    resizeEnabled ? subscribeUserSettings : subscribeDisabled,
    () => (resizeEnabled ? getDrawerWidthPx(drawerId) : undefined),
    () => undefined
  );

  const clampWidth = useCallback(
    (nextWidth: number) => Math.min(Math.max(nextWidth, minWidth), getDrawerMaxWidthPx()),
    [minWidth]
  );

  const handleResize = useCallback(
    (nextWidth: number) => {
      setDraggedWidth(clampWidth(nextWidth));
    },
    [clampWidth]
  );

  const handleCommit = useCallback(
    (nextWidth: number) => {
      setDrawerWidthPx(drawerId, clampWidth(nextWidth));
      setDraggedWidth(null);
    },
    [clampWidth, drawerId]
  );

  if (!resizeEnabled || typeof width !== "number") {
    return {
      drawerWidth: width,
      splitterPlacement: null,
      handleResize,
      handleCommit,
    };
  }

  const committedWidth = clampWidth(storedWidthPx ?? width);
  const displayWidth = draggedWidth ?? committedWidth;

  return {
    drawerWidth: displayWidth,
    splitterPlacement,
    handleResize,
    handleCommit,
  };
}
