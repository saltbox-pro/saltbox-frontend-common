import { type Key, type ReactNode, useRef } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

import styles from "./transition-layout.module.css";

interface SwitchTransitionLayoutProps {
  activeKey: Key;
  timeout?: number;
  className?: string;
  children: (activeKey: Key) => ReactNode;
}

export function SwitchTransitionLayout({
  activeKey,
  timeout = 160,
  className,
  children,
}: SwitchTransitionLayoutProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);

  return (
    <SwitchTransition mode="out-in">
      <CSSTransition
        key={activeKey}
        timeout={timeout}
        nodeRef={nodeRef}
        classNames={{
          enter: styles.fadeEnter,
          enterActive: styles.fadeEnterActive,
          exit: styles.fadeExit,
          exitActive: styles.fadeExitActive,
        }}
      >
        <div ref={nodeRef} className={`${styles.fadeWrapper} ${className ?? ""}`}>
          {children(activeKey)}
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
}
