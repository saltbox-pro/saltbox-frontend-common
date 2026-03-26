import { Skeleton } from "antd";

import { TransitionLayout } from "saltbox-common/components/transition-layout";

import styles from "./info-drawer-loader.module.css";

interface InfoDrawerLoaderProps {
  loading?: boolean;
}

export function InfoDrawerLoader({ loading }: InfoDrawerLoaderProps) {
  return (
    <TransitionLayout className={styles.skeleton} in={loading}>
      <Skeleton loading active />
    </TransitionLayout>
  );
}
