import { Flex } from "antd";
import type { ReactNode } from "react";

import { CopyToClipboardButton } from "saltbox-common/components/buttons/copy-to-clipboard-button";

import { hasCopyText } from "../helpers/value-actions";

import styles from "./info-descriptions-value.module.css";

interface InfoDescriptionsValueProps {
  children: ReactNode;
  copyText?: string;
  actions?: ReactNode;
}

export function InfoDescriptionsValue({ children, copyText, actions }: InfoDescriptionsValueProps) {
  return (
    <Flex justify="space-between" gap="small" className={styles.root}>
      <div className={styles.value}>{children}</div>
      <Flex gap={2} className={styles.actions}>
        {hasCopyText(copyText) && <CopyToClipboardButton text={copyText} />}
        {actions}
      </Flex>
    </Flex>
  );
}
