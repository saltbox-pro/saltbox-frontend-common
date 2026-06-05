import { Card, Flex, Typography } from "antd";
import type { ReactNode } from "react";

import { CopyToClipboardButton } from "saltbox-common/components/copy-to-clipboard-button/copy-to-clipboard-button";

import styles from "./info-card.module.css";

export type InfoCardProps = {
  title: string;
  children: ReactNode;
  copyText?: string;
};

export function InfoCard({ title, children, copyText }: InfoCardProps) {
  return (
    <Card hoverable size="small" className={styles.card}>
      <Flex vertical className={styles.cardContent}>
        <Typography.Text type="secondary" className={styles.title}>
          {title}
        </Typography.Text>
        <div className={styles.valueRow}>
          {children}
          {copyText && (
            <span className={styles.copyButton}>
              <CopyToClipboardButton text={copyText} />
            </span>
          )}
        </div>
      </Flex>
    </Card>
  );
}
