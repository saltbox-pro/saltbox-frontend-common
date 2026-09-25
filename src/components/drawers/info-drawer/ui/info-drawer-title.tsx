import type { ReactNode } from "react";

import { CopyToClipboardButton } from "saltbox-common/components/buttons/copy-to-clipboard-button";
import { SwitchTransitionLayout } from "saltbox-common/components/transition-layout";

import styles from "./info-drawer-title.module.css";

interface InfoDrawerTitleProps {
  activeTransitionKey?: string;
  name?: string;
  label?: string;
  copyable?: boolean;
  extra?: ReactNode;
}

export function InfoDrawerTitle({
  activeTransitionKey,
  name,
  label,
  copyable = true,
  extra,
}: InfoDrawerTitleProps) {
  return (
    <SwitchTransitionLayout activeKey={activeTransitionKey}>
      {() => (
        <div className={styles.titleRow}>
          {!!label && (
            <span className={styles.label}>
              {label}
              {"\u00A0"}
            </span>
          )}
          {!!name && (
            <>
              <span className={styles.name}>{name}</span>
              {!!copyable && (
                <span className={styles.action}>
                  <CopyToClipboardButton text={name} />
                </span>
              )}
              {!!extra && <span className={styles.action}>{extra}</span>}
            </>
          )}
        </div>
      )}
    </SwitchTransitionLayout>
  );
}
