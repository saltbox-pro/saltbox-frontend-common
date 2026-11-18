import { Splitter } from "antd";
import { type PropsWithChildren, useRef } from "react";

import { getDrawerMaxWidthPx } from "../settings/drawer-width-settings";
import type { HorizontalDrawerPlacement } from "../types";

import styles from "./info-drawer-resize-splitter.module.css";

const DRAG_THRESHOLD_PX = 1;

interface InfoDrawerResizeSplitterProps extends PropsWithChildren {
  placement: HorizontalDrawerPlacement;
  width: number;
  minWidth: number;
  onResize: (width: number) => void;
  onCommit: (width: number) => void;
}

const readPanelWidth = (sizes: number[], contentIndex: number): number | null => {
  const nextWidth = sizes[contentIndex];
  if (typeof nextWidth !== "number" || !Number.isFinite(nextWidth)) return null;
  return nextWidth;
};

export function InfoDrawerResizeSplitter({
  placement,
  width,
  minWidth,
  onResize,
  onCommit,
  children,
}: InfoDrawerResizeSplitterProps) {
  const contentIndex = placement === "right" ? 1 : 0;
  const widthAtDragStartRef = useRef<number | null>(null);

  const handleResizeStart = () => {
    widthAtDragStartRef.current = width;
  };

  const handleResize = (sizes: number[]) => {
    const nextWidth = readPanelWidth(sizes, contentIndex);
    if (nextWidth === null) return;
    onResize(nextWidth);
  };

  const handleResizeEnd = (sizes: number[]) => {
    const nextWidth = readPanelWidth(sizes, contentIndex);
    const startWidth = widthAtDragStartRef.current;
    widthAtDragStartRef.current = null;
    if (nextWidth === null || startWidth === null) return;
    if (Math.abs(nextWidth - startWidth) < DRAG_THRESHOLD_PX) return;
    onCommit(nextWidth);
  };

  const spacer = <Splitter.Panel key="spacer" className={styles.spacer} />;
  const content = (
    <Splitter.Panel
      key="content"
      className={styles.content}
      size={width}
      min={minWidth}
      max={getDrawerMaxWidthPx()}
    >
      {children}
    </Splitter.Panel>
  );

  return (
    <div className={`${styles.root} ${styles[placement]}`}>
      <Splitter
        className={styles.splitter}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeEnd={handleResizeEnd}
      >
        {placement === "right" ? [spacer, content] : [content, spacer]}
      </Splitter>
    </div>
  );
}
