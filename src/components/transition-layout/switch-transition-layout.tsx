import { type Key, type ReactNode, useRef } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

import styles from "./transition-layout.module.css";

type TransitionTimeout =
  | number
  | {
      appear?: number;
      enter?: number;
      exit?: number;
    };

interface SwitchTransitionLayoutProps {
  activeKey: Key;
  timeout?: TransitionTimeout;
  className?: string;
  onEnter?: () => void;
  children: (activeKey: Key) => ReactNode;
}

export function SwitchTransitionLayout({
  activeKey,
  timeout = 200,
  className,
  onEnter,
  children,
}: SwitchTransitionLayoutProps) {
  const nodeRef = useRef<HTMLDivElement | null>(null);

  return (
    <SwitchTransition>
      <CSSTransition
        appear={false}
        key={activeKey}
        timeout={timeout}
        nodeRef={nodeRef}
        addEndListener={(done) => {
          const node = nodeRef.current;
          if (!node) {
            done();
            return;
          }
          node.addEventListener("transitionend", done, { once: true });
        }}
        classNames={{
          enter: styles.fadeEnter,
          enterActive: styles.fadeEnterActive,
          exit: styles.fadeExit,
          exitActive: styles.fadeExitActive,
        }}
        onEnter={onEnter}
      >
        <div ref={nodeRef} className={`${styles.fadeWrapper} ${className ?? ""}`}>
          {children(activeKey)}
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
}
