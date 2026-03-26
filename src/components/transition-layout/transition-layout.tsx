import { type PropsWithChildren, useRef } from "react";
import { CSSTransition } from "react-transition-group";

import styles from "./transition-layout.module.css";

interface TransitionLayoutProps extends PropsWithChildren {
  in: boolean;
  timeout?: number;
  unmountOnExit?: boolean;
  className?: string;
}

export function TransitionLayout({
  in: inProp,
  timeout = 160,
  unmountOnExit = true,
  className,
  children,
}: TransitionLayoutProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);

  return (
    <CSSTransition
      in={inProp}
      timeout={timeout}
      nodeRef={nodeRef}
      classNames={{
        enter: styles.fadeEnter,
        enterActive: styles.fadeEnterActive,
        exit: styles.fadeExit,
        exitActive: styles.fadeExitActive,
      }}
      mountOnEnter
      unmountOnExit={unmountOnExit}
    >
      <div ref={nodeRef} className={`${styles.fadeWrapper} ${className ?? ""}`}>
        {children}
      </div>
    </CSSTransition>
  );
}
