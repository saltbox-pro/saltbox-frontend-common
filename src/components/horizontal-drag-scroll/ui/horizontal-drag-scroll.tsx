import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { PropsWithChildren } from "react";

import { useHorizontalDragScroll } from "../hooks/use-horizontal-drag-scroll";

import styles from "./horizontal-drag-scroll.module.css";

export interface HorizontalDragScrollProps extends PropsWithChildren {
  className?: string;
  containerClassName?: string;
  showArrows?: boolean;
  scrollStep?: number;
}

export function HorizontalDragScroll({
  showArrows = true,
  scrollStep,
  className,
  containerClassName,
  children,
}: HorizontalDragScrollProps) {
  const {
    containerRef,
    canScrollLeft,
    canScrollRight,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    stopDragging,
    handleScroll,
    scrollByStep,
  } = useHorizontalDragScroll({ scrollStep });

  const canScroll = canScrollLeft || canScrollRight;
  const rootClassName = `${styles.horizontalDragScroll} ${className ?? ""}`;
  const containerClasses = `${styles.horizontalDragScrollContainer}
  ${canScroll ? styles.horizontalDragScrollContainerHasScroll : ""}
  ${isDragging ? styles.horizontalDragScrollContainerGrabbing : ""}
  ${containerClassName ?? ""}`;

  const showLeftArrow = showArrows && canScrollLeft;
  const showRightArrow = showArrows && canScrollRight;

  return (
    <div className={rootClassName}>
      {showLeftArrow && (
        <>
          <Button
            className={`${styles.horizontalDragScrollArrowButton} ${styles.horizontalDragScrollArrowLeft}`}
            size="small"
            icon={<LeftOutlined />}
            type="text"
            onClick={() => scrollByStep("left")}
          />
          <span
            className={`${styles.horizontalDragScrollGradient} ${styles.horizontalDragScrollGradientLeft}`}
          />
        </>
      )}
      <div
        ref={containerRef}
        data-horizontal-drag-scroll-container
        className={containerClasses}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerLeave={stopDragging}
      >
        {children}
      </div>
      {showRightArrow && (
        <>
          <Button
            className={`${styles.horizontalDragScrollArrowButton} ${styles.horizontalDragScrollArrowRight}`}
            size="small"
            icon={<RightOutlined />}
            type="text"
            onClick={() => scrollByStep("right")}
          />
          <span
            className={`${styles.horizontalDragScrollGradient} ${styles.horizontalDragScrollGradientRight}`}
          />
        </>
      )}
    </div>
  );
}
