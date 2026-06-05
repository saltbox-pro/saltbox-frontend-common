import { Typography } from "antd";
import type { ReactNode } from "react";

import styles from "./info-card.module.css";

export type InfoCardValueProps = {
  children: ReactNode;
};

export function InfoCardValue({ children }: InfoCardValueProps) {
  return (
    <Typography.Text strong className={styles.value}>
      {children}
    </Typography.Text>
  );
}
